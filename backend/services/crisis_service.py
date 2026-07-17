"""
ManMitra — Crisis Detection Service
Zero-miss local heuristics + LLM classifier helper to detect crisis keywords
(suicide, self-harm, self-destruction) and trigger emergency protocols immediately.
"""
import re


class CrisisDetectionService:
    # ── Crisis Keyword Patterns ─────────────────────────────────────────────
    # Matches words indicating self-harm, suicide, or severe immediate danger.
    CRISIS_PATTERNS = [
        r'\bsuicid(e|al)\b',
        r'\bkill\s+myself\b',
        r'\bend\s+my\s+life\b',
        r'\bself-harm\b',
        r'\bharm\s+myself\b',
        r'\bcut\s+myself\b',
        r'\bwish\s+i\s+was\s+dead\b',
        r'\bbetter\s+off\s+dead\b',
        r'\bwant\s+to\s+die\b',
        r'\bjumping\s+off\b',
        r'\bhanging\s+myself\b',
        r'\boverdos(e|ing)\b',
    ]

    @classmethod
    def contains_crisis_keywords(cls, text: str) -> bool:
        """
        Scans input text against local crisis heuristics.
        Zero-latency checkpoint.
        """
        if not text:
            return False
        clean_text = text.lower().strip()
        for pattern in cls.CRISIS_PATTERNS:
            if re.search(pattern, clean_text):
                return True
        return False

    @staticmethod
    def get_emergency_payload() -> dict:
        """
        Standard payload returned when a crisis is triggered.
        Provides immediate help hotlines and triggers frontend alert modals.
        """
        return {
            "type": "crisis_alert",
            "message": (
                "It sounds like you might be going through a very difficult time. "
                "Please know that you do not have to carry this alone. "
                "We want to connect you with people who can help support you right now. "
                "ManMitra is an AI and cannot act as a crisis response service."
            ),
            "resources": {
                "hotlines": [
                    {"name": "National Crisis Lifeline (US)", "number": "988", "text": "Text 988", "availability": "24/7"},
                    {"name": "Kiran Mental Health Helpline (India)", "number": "1800-599-0019", "text": "Call", "availability": "24/7"},
                    {"name": "Crisis Text Line", "number": "741741", "text": "Text HOME to 741741", "availability": "24/7"}
                ],
                "instructions": "If you are in immediate danger of hurting yourself, please call your local emergency services (like 911 or 112) or go to the nearest hospital."
            }
        }
