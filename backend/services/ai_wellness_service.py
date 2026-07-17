"""
ManMitra — AI Service Extensions (Phase 4)
Adds structured AI generation of personalized wellness plans based on user profiles,
stress levels, goals, and recent mood trends.
"""
import os
import json
import logging
from django.conf import settings
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIWellnessService:
    PLAN_SYSTEM_INSTRUCTION = (
        "You are the ManMitra AI Wellness Coordinator.\n"
        "Your task is to generate a personalized daily wellness routine for the user in JSON format.\n"
        "You must respond with raw JSON ONLY. No markdown wrapping, no ```json formatting. Just the JSON object.\n\n"
        "JSON SCHEMA:\n"
        "{\n"
        "  \"tasks\": [\n"
        "    {\n"
        "      \"time\": \"HH:MM\",\n"
        "      \"title\": \"Name of exercise/action\",\n"
        "      \"duration_mins\": 10,\n"
        "      \"completed\": false\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Guidelines for activities:\n"
        "- Suggest 3-5 daily activities tailored to the user's goals, stress level, and recent mood.\n"
        "- Activities should focus on mindfulness, sleep hygiene, gentle movement, CBT-based journaling, and breathing exercises.\n"
        "- All tasks must contain time (24h format), title (be descriptive but concise, e.g., '10-Minute Deep Breathing'), duration_mins, and completed: false."
    )

    @classmethod
    def generate_routine(cls, profile_data: dict, recent_moods: list) -> dict:
        """
        Generates a tailored routine using Gemini 1.5 Flash.
        Falls back to a dynamic local template engine if the API key is missing.
        """
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
        if not api_key:
            return cls._get_simulated_wellness_plan(profile_data, recent_moods)

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=cls.PLAN_SYSTEM_INSTRUCTION
            )

            # Build detailed prompt
            prompt = (
                f"Generate a daily routine for a user with the following details:\n"
                f"- Stress Level: {profile_data.get('stress_level', 5)}/10\n"
                f"- Goals: {', '.join(profile_data.get('primary_goals', []))}\n"
                f"- Preferences: {', '.join(profile_data.get('wellness_preferences', []))}\n"
            )

            if recent_moods:
                avg_mood = sum(m['mood_score'] for m in recent_moods) / len(recent_moods)
                labels = [m['mood_label'] for m in recent_moods]
                prompt += (
                    f"- Recent Mood Trend: Average score of {avg_mood:.1f}/10 over the last 7 days.\n"
                    f"- Frequent feelings: {', '.join(set(labels))}\n"
                )
            else:
                prompt += "- Recent Mood Trend: No recent entries logged yet.\n"

            response = model.generate_content(prompt)
            clean_text = response.text.strip()
            
            # Clean possible markdown block indicators if Gemini ignores instruction
            if clean_text.startswith("```"):
                clean_text = clean_text.split("```")[1]
                if clean_text.startswith("json"):
                    clean_text = clean_text[4:]
            clean_text = clean_text.strip()

            routine = json.loads(clean_text)
            if "tasks" in routine and isinstance(routine["tasks"], list):
                return routine
            else:
                raise ValueError("JSON returned does not contain a tasks array.")

        except Exception as e:
            logger.error(f"Gemini routine generation failed: {e}")
            return cls._get_simulated_wellness_plan(profile_data, recent_moods)

    @classmethod
    def _get_simulated_wellness_plan(cls, profile_data: dict, recent_moods: list) -> dict:
        """
        Generates dynamic routines based on inputs when LLM is unavailable.
        """
        stress = profile_data.get('stress_level', 5)
        goals = profile_data.get('primary_goals', [])
        prefs = profile_data.get('wellness_preferences', [])

        tasks = [
            {"time": "08:00", "title": "5-Minute Grounding Breathing Exercise", "duration_mins": 5, "completed": False}
        ]

        # Heavy stress
        if stress >= 7:
            tasks.append({"time": "12:00", "title": "Midday Progressive Muscle Relaxation", "duration_mins": 10, "completed": False})
            tasks.append({"time": "18:00", "title": "CBT Thought Record Reflection", "duration_mins": 15, "completed": False})
        else:
            tasks.append({"time": "15:00", "title": "Desk Stretch & Walk Break", "duration_mins": 8, "completed": False})

        # Match goals
        if "better sleep" in goals or "sleep" in prefs:
            tasks.append({"time": "22:00", "title": "Sleep Hygiene Wind-down (No Screens)", "duration_mins": 20, "completed": False})
        else:
            tasks.append({"time": "21:30", "title": "Evening Gratitude Review", "duration_mins": 10, "completed": False})

        if "journaling" in prefs:
            tasks.append({"time": "20:00", "title": "Journal Reflection on Daily Win", "duration_mins": 15, "completed": False})

        # Sort tasks chronologically
        tasks = sorted(tasks, key=lambda x: x["time"])
        return {"tasks": tasks}
