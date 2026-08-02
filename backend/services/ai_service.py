"""
ManMitra — AI Engine Service
Handles prompts, session memory, API payload formulation, and response generation for Hugging Face Cloud API and Google Gemini.
Includes fallback mocks for developers without API keys.
"""
import os
import logging
from django.conf import settings
from google import genai
from google.genai import types
from huggingface_hub import InferenceClient

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
        "4. If the user indicates extreme immediate distress or self-harm, be gentle, step out of chat advice immediately, and encourage them to connect with a trusted person or lifeline."
    )

    _initialized = False
    _gemini_client = None
    _hf_client = None
    _hf_model = "Qwen/Qwen2.5-7B-Instruct"

    @classmethod
    def _init_clients(cls):
        """Configure AI providers (Hugging Face / Gemini)."""
        if cls._initialized:
            return

        # Check Hugging Face token
        hf_token = (
            getattr(settings, 'HF_TOKEN', '') or 
            os.environ.get('HF_TOKEN', '') or 
            os.environ.get('HUGGINGFACE_API_KEY', '')
        )
        if hf_token:
            try:
                cls._hf_client = InferenceClient(token=hf_token)
                logger.info("Hugging Face Cloud API client initialized successfully.")
            except Exception as e:
                logger.error(f"Error configuring Hugging Face client: {e}")

        # Check Gemini API key
        gemini_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
        if gemini_key:
            try:
                cls._gemini_client = genai.Client(api_key=gemini_key)
                logger.info("Google Gemini SDK initialized successfully.")
            except Exception as e:
                logger.error(f"Error configuring Gemini SDK: {e}")

        cls._initialized = True

    @classmethod
    def generate_response(cls, session_messages: list, user_profile: dict = None) -> str:
        """
        Generate a complete AI response.
        session_messages format: [{"role": "user"|"assistant", "content": "text"}]
        """
        cls._init_clients()

        # Determine System Prompt
        system_prompt = cls.SYSTEM_INSTRUCTION
        if user_profile:
            system_prompt += (
                f"\n\nUser Context:\n"
                f"- Name: {user_profile.get('full_name', 'User')}\n"
                f"- Stress Level: {user_profile.get('stress_level', 5)}/10\n"
                f"- Goals: {', '.join(user_profile.get('primary_goals', []))}\n"
                f"- Preferences: {', '.join(user_profile.get('wellness_preferences', []))}"
            )

        # 1. Try Hugging Face Cloud API if client is present
        if cls._hf_client:
            try:
                return cls._generate_hf_response(session_messages, system_prompt)
            except Exception as e:
                logger.error(f"Hugging Face API generation failed: {e}")

        # 2. Try Gemini API if client is present
        if cls._gemini_client:
            try:
                return cls._generate_gemini_response(session_messages, system_prompt)
            except Exception as e:
                logger.error(f"Gemini API generation failed: {e}")

        # 3. Fallback simulated response
        return cls._get_simulated_fallback(session_messages)

    @classmethod
    def _generate_hf_response(cls, session_messages: list, system_prompt: str) -> str:
        """Calls Hugging Face Cloud Serverless Chat API via InferenceClient."""
        messages = [{"role": "system", "content": system_prompt}]
        for msg in session_messages:
            role = "user" if msg['role'] == "user" else "assistant"
            messages.append({"role": role, "content": msg['content']})

        response = cls._hf_client.chat.completions.create(
            model=cls._hf_model,
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content

    @classmethod
    def _generate_gemini_response(cls, session_messages: list, system_prompt: str) -> str:
        """Calls Google Gemini SDK."""
        contents = []
        for msg in session_messages:
            role = 'user' if msg['role'] == 'user' else 'model'
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg['content'])]
                )
            )

        response = cls._gemini_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        return response.text

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
