"""
ManMitra — AI Engine Service
Handles prompts, session memory, API payload formulation, and response generation for Hugging Face Cloud API and Google Gemini.
Includes fallback mocks for developers without API keys.
"""
import os
import json
import logging
from django.conf import settings
from google import genai
from google.genai import types
from huggingface_hub import InferenceClient

logger = logging.getLogger(__name__)


class AIService:
    # ── Soft-Spoken & Kind Friend Persona Prompt ──────────────────────────
    SYSTEM_INSTRUCTION = (
        "You are ManMitra, a deeply warm, soft-spoken, kind, and compassionate friend and wellness companion.\n"
        "Your role is to be a comforting, gentle presence for the user — like a true friend who listens with infinite empathy, warmth, and care.\n\n"
        "FRIENDLY & SOFT-SPOKEN PERSONA GUIDELINES:\n"
        "1. TONE & VOICE: Always speak in a soft, gentle, comforting, and deeply caring tone. Use warm, natural language like a loving best friend ('I'm right here with you...', 'Take a gentle breath...', 'Thank you for sharing that with me').\n"
        "2. EMPATHY & VALIDATION: Always validate the user's feelings first with deep warmth. Make them feel heard, safe, accepted, and never judged.\n"
        "3. GENTLE GUIDANCE: Offer gentle wellness suggestions (like soft breathing, mindful grounding, or quiet reflection) as friendly invitations, never commands.\n"
        "4. BOUNDARIES: You are a supportive friend and wellness companion, not a doctor or therapist. If asked for medical advice, gently and warmly encourage seeking support from a professional.\n"
        "5. CRISIS CARE: If the user expresses extreme distress, self-harm, or severe crisis, respond with utmost gentleness, warmth, and love, while encouraging them to reach out to a trusted loved one or support line."
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
                f"- Name: {user_profile.get('full_name', 'Friend')}\n"
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
            temperature=0.75
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
        """Simulates soft-spoken, warm friend-style response templates if API is unreachable."""
        last_message = session_messages[-1]['content'].lower() if session_messages else ""

        if "anxious" in last_message or "panic" in last_message or "worry" in last_message or "scared" in last_message:
            return (
                "I hear how heavy and overwhelming everything feels right now, my friend. "
                "Please take a slow, gentle breath with me... Breathe in softly... and let it all out. "
                "You are safe right now, and I'm right here by your side. "
                "Would you like to just sit quietly for a moment, or talk through what's resting on your mind?"
            )
        if "sleep" in last_message or "tired" in last_message or "insomnia" in last_message or "night" in last_message:
            return (
                "I know how tiring it is when your mind won't let you rest peacefully. "
                "Place a warm hand over your heart, close your eyes softly, and just feel your gentle breathing. "
                "You don't have to carry tomorrow's worries tonight. I'm right here if you want to share anything before you sleep."
            )
        if "sad" in last_message or "lonely" in last_message or "depressed" in last_message or "cry" in last_message:
            return (
                "I'm so sorry you're carrying this pain today. Please know that your feelings are completely valid, "
                "and you don't have to walk through this alone. I'm right here with you, listening with all my heart. "
                "Take all the time you need... What is feeling the heaviest for you right now?"
            )

        # General warm friend response
        return (
            "Thank you so much for opening up to me. I'm right here listening, "
            "and I care deeply about how you're feeling today. "
            "Tell me more about what's going on, and we can gently walk through it together."
        )

    # ── Client Wellness Analysis ──────────────────────────────────────────
    ANALYSIS_SYSTEM_PROMPT = (
        "You are a clinical wellness analysis assistant for the ManMitra mental health platform.\n"
        "You will receive structured data about a patient's interactions including mood logs, "
        "chat history, journal sentiment, clinical assessments (PHQ-9, GAD-7), crisis incidents, "
        "and wellness plan adherence.\n\n"
        "IMPORTANT DISCLAIMERS:\n"
        "- You are providing an AI-ASSISTED analysis summary, NOT a clinical diagnosis.\n"
        "- This is meant to help clinicians quickly review patient status.\n\n"
        "Based on ALL the data provided, you MUST respond with ONLY valid JSON (no markdown, no extra text) "
        "in exactly this structure:\n"
        "{\n"
        '  "overall_condition": "<one of: Critical | Needs Attention | Improving | Stable | Good>",\n'
        '  "risk_level": "<one of: High | Medium | Low>",\n'
        '  "confidence_score": <integer 0-100>,\n'
        '  "key_concerns": ["<concern 1>", "<concern 2>", ...],\n'
        '  "positive_indicators": ["<positive 1>", "<positive 2>", ...],\n'
        '  "detailed_summary": "<2-4 sentence clinical narrative summarizing the patient state>",\n'
        '  "recommended_actions": ["<action 1>", "<action 2>", ...]\n'
        "}\n\n"
        "Guidelines for your analysis:\n"
        "- If mood scores are consistently low (<=3) or trending downward, flag concern.\n"
        "- If PHQ-9 severity is 'Moderate' or worse, flag depression risk.\n"
        "- If GAD-7 severity is 'Moderate' or worse, flag anxiety risk.\n"
        "- If there are unresolved crisis reports, increase risk level.\n"
        "- If mood is improving, journal sentiment is positive, and wellness adherence is high, note positive progress.\n"
        "- Be specific in concerns and actions, referencing actual data values.\n"
    )

    @classmethod
    def generate_client_analysis(cls, client_data: dict) -> dict:
        """
        Generate a structured AI wellness analysis from aggregated client interaction data.
        Returns a dict with overall_condition, risk_level, concerns, positives, summary, actions.
        """
        cls._init_clients()

        # Build the data prompt
        data_prompt = cls._build_analysis_data_prompt(client_data)

        # Try HF first, then Gemini, then fallback
        if cls._hf_client:
            try:
                return cls._generate_hf_analysis(data_prompt)
            except Exception as e:
                logger.error(f"HF analysis generation failed: {e}")

        if cls._gemini_client:
            try:
                return cls._generate_gemini_analysis(data_prompt)
            except Exception as e:
                logger.error(f"Gemini analysis generation failed: {e}")

        # Fallback: rule-based analysis
        return cls._get_fallback_analysis(client_data)

    @classmethod
    def _build_analysis_data_prompt(cls, data: dict) -> str:
        """Builds a structured text prompt from aggregated client data."""
        lines = [f"=== PATIENT WELLNESS DATA FOR: {data.get('client_name', 'Unknown')} ===\n"]

        # Mood data
        mood = data.get('mood', {})
        lines.append(f"MOOD LOGS ({mood.get('total_entries', 0)} entries, last 30 days):")
        lines.append(f"  Average Score: {mood.get('avg_score', 'N/A')}/10")
        lines.append(f"  Score Trend: {mood.get('trend', 'N/A')}")
        lines.append(f"  Dominant Moods: {', '.join(mood.get('dominant_labels', []))}")
        recent = mood.get('recent_scores', [])
        if recent:
            lines.append(f"  Recent Scores (newest first): {', '.join(str(s) for s in recent)}")

        # Chat data
        chat = data.get('chat', {})
        lines.append(f"\nCHAT SESSIONS ({chat.get('total_sessions', 0)} total):")
        lines.append(f"  Crisis-Flagged Sessions: {chat.get('crisis_sessions', 0)}")
        lines.append(f"  Crisis-Flagged Messages: {chat.get('crisis_messages', 0)}")
        recent_msgs = chat.get('recent_user_messages', [])
        if recent_msgs:
            lines.append(f"  Recent User Messages (last 10):")
            for msg in recent_msgs[:10]:
                lines.append(f"    - \"{msg}\"")

        # Journal data
        journal = data.get('journal', {})
        lines.append(f"\nJOURNAL ENTRIES ({journal.get('total_entries', 0)} total):")
        lines.append(f"  Average Sentiment Score: {journal.get('avg_sentiment', 'N/A')} (scale: -1.0 to 1.0)")
        lines.append(f"  Recent Sentiments: {journal.get('recent_sentiments', [])}")

        # Assessment data
        assessments = data.get('assessments', {})
        lines.append(f"\nCLINICAL ASSESSMENTS:")
        for atype in ['PHQ9', 'GAD7', 'STRESS', 'SLEEP']:
            a = assessments.get(atype)
            if a:
                lines.append(f"  {atype}: Score {a['score']}/{a['max_score']} — Severity: {a['severity']}")
            else:
                lines.append(f"  {atype}: Not taken")

        # Crisis data
        crisis = data.get('crisis', {})
        lines.append(f"\nCRISIS REPORTS ({crisis.get('total', 0)} total):")
        lines.append(f"  Unresolved: {crisis.get('unresolved', 0)}")
        lines.append(f"  Severity Breakdown: {crisis.get('severity_breakdown', {})}")

        # Wellness plan data
        wellness = data.get('wellness', {})
        lines.append(f"\nWELLNESS PLAN:")
        lines.append(f"  Has Active Plan: {wellness.get('has_active_plan', False)}")
        lines.append(f"  Task Completion Rate: {wellness.get('completion_rate', 'N/A')}%")

        # Care notes
        lines.append(f"\nDOCTOR'S CARE NOTES:")
        lines.append(f"  {data.get('care_notes', 'No notes recorded.')}")

        # Stress level
        lines.append(f"\nSELF-REPORTED STRESS LEVEL: {data.get('stress_level', 'N/A')}/10")

        return "\n".join(lines)

    @classmethod
    def _generate_hf_analysis(cls, data_prompt: str) -> dict:
        """Calls HF model for structured client analysis."""
        messages = [
            {"role": "system", "content": cls.ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this patient's data and respond with ONLY valid JSON:\n\n{data_prompt}"},
        ]

        response = cls._hf_client.chat.completions.create(
            model=cls._hf_model,
            messages=messages,
            max_tokens=800,
            temperature=0.3,
        )
        raw = response.choices[0].message.content.strip()

        # Extract JSON from the response (handle markdown code blocks)
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()

        return json.loads(raw)

    @classmethod
    def _generate_gemini_analysis(cls, data_prompt: str) -> dict:
        """Calls Gemini for structured client analysis."""
        contents = [
            types.Content(
                role='user',
                parts=[types.Part(text=f"Analyze this patient's data and respond with ONLY valid JSON:\n\n{data_prompt}")]
            )
        ]

        response = cls._gemini_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=cls.ANALYSIS_SYSTEM_PROMPT,
            )
        )
        raw = response.text.strip()

        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()

        return json.loads(raw)

    @classmethod
    def _get_fallback_analysis(cls, client_data: dict) -> dict:
        """Rule-based fallback analysis when no AI API is available."""
        risk_score = 0  # 0-100, higher = worse
        concerns = []
        positives = []
        actions = []

        client_name = client_data.get('client_name', 'Patient')

        # ── Mood analysis ───────────────────────────────────────────────────
        mood = client_data.get('mood', {})
        avg_score = mood.get('avg_score', 5)
        trend = mood.get('trend', 'stable')
        dominant = mood.get('dominant_labels', [])

        if avg_score is not None and avg_score <= 3:
            risk_score += 25
            concerns.append(f"Very low average mood score ({avg_score}/10) over recent period.")
            actions.append("Schedule urgent check-in session to assess emotional state.")
        elif avg_score is not None and avg_score <= 5:
            risk_score += 12
            concerns.append(f"Below-average mood score ({avg_score}/10) indicating possible distress.")
        elif avg_score is not None and avg_score >= 7:
            positives.append(f"Healthy average mood score ({avg_score}/10).")

        if trend == 'declining':
            risk_score += 10
            concerns.append("Mood scores show a declining trend.")
        elif trend == 'improving':
            positives.append("Mood scores are trending upward — positive trajectory.")

        negative_moods = {'sad', 'anxious', 'angry', 'overwhelmed', 'frustrated'}
        dominant_neg = [m for m in dominant if m in negative_moods]
        if len(dominant_neg) >= 2:
            risk_score += 10
            concerns.append(f"Frequently experiencing negative emotions: {', '.join(dominant_neg)}.")

        positive_moods = {'happy', 'calm', 'grateful', 'hopeful', 'excited'}
        dominant_pos = [m for m in dominant if m in positive_moods]
        if dominant_pos:
            positives.append(f"Experiencing positive emotions: {', '.join(dominant_pos)}.")

        # ── Assessment analysis ─────────────────────────────────────────────
        assessments = client_data.get('assessments', {})
        phq9 = assessments.get('PHQ9')
        gad7 = assessments.get('GAD7')

        if phq9:
            sev = phq9.get('severity', '').lower()
            if 'severe' in sev:
                risk_score += 25
                concerns.append(f"PHQ-9 indicates severe depression (score: {phq9['score']}/{phq9['max_score']}).")
                actions.append("Review depression treatment plan — consider medication adjustment.")
            elif 'moderate' in sev:
                risk_score += 15
                concerns.append(f"PHQ-9 indicates moderate depression (score: {phq9['score']}/{phq9['max_score']}).")
            elif 'minimal' in sev or 'none' in sev:
                positives.append(f"PHQ-9 shows minimal depression indicators ({phq9['score']}/{phq9['max_score']}).")

        if gad7:
            sev = gad7.get('severity', '').lower()
            if 'severe' in sev:
                risk_score += 20
                concerns.append(f"GAD-7 indicates severe anxiety (score: {gad7['score']}/{gad7['max_score']}).")
                actions.append("Consider anxiety-focused CBT exercises and relaxation techniques.")
            elif 'moderate' in sev:
                risk_score += 12
                concerns.append(f"GAD-7 indicates moderate anxiety (score: {gad7['score']}/{gad7['max_score']}).")
            elif 'minimal' in sev or 'none' in sev:
                positives.append(f"GAD-7 shows minimal anxiety indicators ({gad7['score']}/{gad7['max_score']}).")

        # ── Crisis analysis ─────────────────────────────────────────────────
        crisis = client_data.get('crisis', {})
        total_crisis = crisis.get('total', 0)
        unresolved = crisis.get('unresolved', 0)

        if unresolved > 0:
            risk_score += 20
            concerns.append(f"{unresolved} unresolved crisis report(s) require immediate attention.")
            actions.append("Review and resolve outstanding crisis reports urgently.")
        if total_crisis > 3:
            risk_score += 10
            concerns.append(f"History of {total_crisis} crisis incidents — pattern warrants monitoring.")

        # ── Journal sentiment ───────────────────────────────────────────────
        journal = client_data.get('journal', {})
        avg_sentiment = journal.get('avg_sentiment')
        if avg_sentiment is not None:
            if avg_sentiment < -0.3:
                risk_score += 10
                concerns.append(f"Journal sentiment is predominantly negative (avg: {avg_sentiment:.2f}).")
            elif avg_sentiment > 0.3:
                positives.append(f"Journal entries show positive sentiment (avg: {avg_sentiment:.2f}).")

        total_journals = journal.get('total_entries', 0)
        if total_journals >= 5:
            positives.append(f"Active journaling habit ({total_journals} entries) — good self-reflection.")

        # ── Wellness plan adherence ─────────────────────────────────────────
        wellness = client_data.get('wellness', {})
        completion = wellness.get('completion_rate', 0)
        if completion >= 70:
            positives.append(f"Strong wellness plan adherence ({completion}% completion).")
        elif completion < 30 and wellness.get('has_active_plan', False):
            risk_score += 5
            concerns.append(f"Low wellness plan adherence ({completion}% completion).")
            actions.append("Simplify wellness plan tasks to improve engagement.")

        # ── Stress level ────────────────────────────────────────────────────
        stress = client_data.get('stress_level', 5)
        if stress >= 8:
            risk_score += 10
            concerns.append(f"High self-reported stress level ({stress}/10).")
        elif stress <= 3:
            positives.append(f"Low self-reported stress level ({stress}/10).")

        # ── Determine final classification ──────────────────────────────────
        risk_score = min(risk_score, 100)

        if risk_score >= 60:
            overall = "Critical"
            risk_level = "High"
        elif risk_score >= 40:
            overall = "Needs Attention"
            risk_level = "Medium"
        elif risk_score >= 20:
            if trend == 'improving':
                overall = "Improving"
            else:
                overall = "Stable"
            risk_level = "Low"
        else:
            overall = "Good"
            risk_level = "Low"

        if not concerns:
            concerns.append("No significant concerns identified at this time.")
        if not positives:
            positives.append("Patient is actively engaging with the platform.")
        if not actions:
            actions.append("Continue monitoring and maintain current treatment approach.")

        # Build narrative summary
        summary = (
            f"{client_name}'s overall wellness status is assessed as '{overall}' "
            f"with a risk score of {risk_score}/100. "
        )
        if risk_score >= 40:
            summary += (
                f"Key areas of concern include {concerns[0].lower()} "
                f"Immediate clinical review is recommended."
            )
        else:
            summary += (
                f"The patient shows {len(positives)} positive indicator(s) "
                f"and is generally progressing well with their wellness journey."
            )

        return {
            "overall_condition": overall,
            "risk_level": risk_level,
            "confidence_score": min(55 + mood.get('total_entries', 0) * 2 + total_journals, 85),
            "key_concerns": concerns,
            "positive_indicators": positives,
            "detailed_summary": summary,
            "recommended_actions": actions,
        }

