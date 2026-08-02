"""
ManMitra — AI Chat WebSocket Consumer
Handles real-time WebSocket connections, crisis detection guardrails,
session tracking, and AI response generation via AIService.
"""
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from apps.chat.models import ChatSession, ChatMessage
from apps.emergency.models import CrisisReport
from services.crisis_service import CrisisDetectionService
from services.ai_service import AIService

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for AI Companion mental wellness chat sessions.
    Supports real-time messaging, emergency crisis guardrails, and AI responses.
    """

    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())

        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4003)
            return

        # Extract session_id or session_uuid from URL kwargs
        url_kwargs = self.scope.get('url_route', {}).get('kwargs', {})
        self.session_id = url_kwargs.get('session_id') or url_kwargs.get('session_uuid')

        # Get or create active session
        self.session = await self._get_or_create_session(self.user, self.session_id)
        if not self.session:
            await self.close(code=4004)
            return

        await self.accept()
        await self.send_json({
            "type": "connection_established",
            "session_id": str(self.session.id)
        })

    async def receive_json(self, content):
        user_message_text = content.get('message', '').strip()
        if not user_message_text:
            return

        # ── Step 1: Crisis Safety Guardrail Check ───────────────
        if CrisisDetectionService.contains_crisis_keywords(user_message_text):
            # Log crisis event and notify frontend immediately
            emergency_payload = CrisisDetectionService.get_emergency_payload()
            await self._handle_crisis_trigger(user_message_text, emergency_payload)
            await self.send_json(emergency_payload)
            return

        # ── Step 2: Standard AI Chat Processing ──────────────────
        # Send typing indicator status
        await self.send_json({"type": "status", "status": "typing"})

        # Save user message
        await self._save_message(self.session, 'user', user_message_text)

        # Update session title dynamically based on topic if it's the first message
        new_title = await self._update_session_title_if_default(self.session, user_message_text)
        if new_title:
            await self.send_json({
                "type": "session_updated",
                "session_id": str(self.session.id),
                "title": new_title
            })

        # Get session history and user context
        history = await self._get_session_history(self.session)
        user_profile = await self._get_user_profile(self.user)

        # Generate AI Response (Hugging Face / Gemini / Fallback)
        ai_response_text = await database_sync_to_async(AIService.generate_response)(history, user_profile)

        # Save assistant response message
        await self._save_message(self.session, 'assistant', ai_response_text)

        # Send response back to user
        await self.send_json({
            "type": "chat_message",
            "role": "assistant",
            "message": ai_response_text
        })

    # ── Async DB Helpers ───────────────────────────────────────────

    @database_sync_to_async
    def _update_session_title_if_default(self, session, user_message_text):
        default_titles = ["New Conversation", "New AI Conversation"]
        if session.title in default_titles or session.messages.filter(role='user').count() <= 1:
            clean = user_message_text.strip()
            words = clean.split()
            if len(words) > 5:
                title = " ".join(words[:5]).capitalize() + "..."
            else:
                title = clean.capitalize()
            
            session.title = title[:45]
            session.save(update_fields=['title'])
            return session.title
        return None


    @database_sync_to_async
    def _get_or_create_session(self, user, session_id):
        try:
            if session_id:
                return ChatSession.objects.get(id=session_id, user=user)
            return ChatSession.objects.create(user=user, title="New AI Conversation")
        except Exception as e:
            logger.error(f"Error fetching/creating chat session: {e}")
            return None

    @database_sync_to_async
    def _save_message(self, session, role, content, crisis_flagged=False):
        return ChatMessage.objects.create(
            session=session,
            role=role,
            content=content,
            crisis_flagged=crisis_flagged
        )

    @database_sync_to_async
    def _handle_crisis_trigger(self, user_message_text, emergency_payload):
        # Save flagged user message
        ChatMessage.objects.create(
            session=self.session,
            role='user',
            content=user_message_text,
            crisis_flagged=True
        )

        # Mark session as crisis session
        self.session.is_crisis = True
        self.session.save(update_fields=['is_crisis'])

        # Create crisis report entry
        CrisisReport.objects.create(
            user=self.user,
            session=self.session,
            trigger_keywords=[user_message_text],
            severity=CrisisReport.Severity.HIGH,
            resources_shown=emergency_payload.get("resources", {})
        )

    @database_sync_to_async
    def _get_session_history(self, session, max_messages=10):
        messages = session.messages.order_by('-created_at')[:max_messages]
        # Return in chronological order
        return [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(messages)
        ]

    @database_sync_to_async
    def _get_user_profile(self, user):
        try:
            profile = getattr(user, 'profile', None)
            if profile:
                return {
                    "full_name": user.full_name or user.email,
                    "stress_level": getattr(profile, 'baseline_stress', 5),
                    "primary_goals": getattr(profile, 'primary_goals', []),
                    "wellness_preferences": getattr(profile, 'wellness_preferences', [])
                }
        except Exception:
            pass
        return {"full_name": user.full_name or user.email}
