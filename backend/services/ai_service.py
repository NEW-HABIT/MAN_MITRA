"""
ManMitra — AI Engine Service
Handles prompts, session memory, API payload formulation, and streaming support for Google Gemini.
Includes fallback mocks for developers without API keys.
"""
import os
import logging
from django.conf import settings
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIService:
    # ── Empathetic Persona Prompt ──────────────────────────────────────────
    SYSTEM_INSTRUCTION = (
        "You are ManMitra, an empathetic, validating, and supportive AI mental wellness companion.\n"
        "Your mission is to help users manage daily emotional challenges, stress, sleep patterns, and guide them in positive reflection.\n\n"
        "STRICT SYSTEM GUARDRAILS:\n"
        "1. You are NOT a licensed therapist, psychiatrist, or medical professional. Never diagnose mental illnesses or prescribe medication.\n"
        "2. If the user asks for diagnoses or prescription suggestions, state clearly and warmly that you cannot diagnose or prescribe, and suggest they seek guidance from a licensed health professional.\n"
        "3. Keep your tone empathetic, comforting, validating, non-judgmental, and practical. Keep responses concise and focused on wellness exercises (mindfulness, CBT reflection, breathing, journaling).\n"
        "4. If the user indicates extreme immediate distress or self-harm, be gentle, step out of chat advice immediately, and encourage them to connect with a trusted person or lifeline. (Note: A separate system-level gateway checks for keywords, but you must remain supportive and safe)."
    )

    _initialized = False

    @classmethod
    def _init_gemini(cls):
        """Configure Gemini SDK key."""
        if cls._initialized:
            return
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
        if api_key:
            try:
                genai.configure(api_key=api_key)
                cls._initialized = True
                logger.info("Google Gemini SDK initialized successfully.")
            except Exception as e:
                logger.error(f"Error configuring Gemini SDK: {e}")
        else:
            logger.warning("GEMINI_API_KEY is not set. AIService will run in simulated fallback mode.")

    @classmethod
    def generate_response(cls, session_messages: list, user_profile: dict = None) -> str:
        """
        Generate a complete AI response.
        session_messages format: [{"role": "user"|"assistant", "content": "text"}]
        """
        cls._init_gemini()

        if not cls._initialized:
            return cls._get_simulated_fallback(session_messages)

        try:
            # Build conversation contents list for Gemini API
            contents = []
            
            # Add user context/wellness preference as standard instruction context if profile is provided
            system_prompt = cls.SYSTEM_INSTRUCTION
            if user_profile:
                system_prompt += (
                    f"\n\nUser Context:\n"
                    f"- Name: {user_profile.get('full_name', 'User')}\n"
                    f"- Stress Level: {user_profile.get('stress_level', 5)}/10\n"
                    f"- Goals: {', '.join(user_profile.get('primary_goals', []))}\n"
                    f"- Preferences: {', '.join(user_profile.get('wellness_preferences', []))}"
                )

            # Use Gemini 1.5 Flash for mental wellness chat
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_prompt
            )

            # Map roles to Gemini expectations ('user', 'model')
            for msg in session_messages:
                role = 'user' if msg['role'] == 'user' else 'model'
                contents.append({
                    'role': role,
                    'parts': [msg['content']]
                })

            response = model.generate_content(contents)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API generation failed: {e}")
            return cls._get_simulated_fallback(session_messages)

    @classmethod
    def _get_simulated_fallback(cls, session_messages: list) -> str:
        """Simulates response templates if no key is configured or API fails."""
        last_message = session_messages[-1]['content'].lower() if session_messages else ""

        if "anxious" in last_message or "panic" in last_message or "worry" in last_message:
            return (
                "I hear how overwhelming that feels right now. Let's take a slow breath together. "
                "Breathe in for 4 seconds... hold for 4... and breathe out for 4. "
                "Would you like to try a quick grounding exercise or list out what's on your mind?"
            )
        if "sleep" in last_message or "tired" in last_message or "insomnia" in last_message:
            return (
                "I understand how frustrating it is when sleep feels out of reach. "
                "Try placing a warm hand on your chest and focus purely on its gentle rise and fall. "
                "We can also discuss building a relaxing evening wind-down routine if you'd like."
            )
        if "sad" in last_message or "lonely" in last_message or "depressed" in last_message:
            return (
                "I'm really sorry you are feeling this way right now, but please know you're not alone. "
                "Your feelings are completely valid. "
                "Would you like to take a moment to write down one small thing you can control right now?"
            )
        
        # General response
        return (
            "I'm here for you. Tell me more about what you're experiencing, "
            "and we can explore some mindful strategies to navigate through it together."
        )
