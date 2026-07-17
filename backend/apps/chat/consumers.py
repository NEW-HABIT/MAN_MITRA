"""
ManMitra — AI Chat WebSocket Consumer
Manages WebSocket connections, user authentication checks, real-time AI response streaming,
session database saves, and immediate safety/crisis keyword interceptions.
"""
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from .models import ChatSession, ChatMessage
from apps.emergency.models import CrisisReport
from services.ai_service import AIService
from services.crisis_service import CrisisDetectionService


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    Consumer handling real-time AI mental wellness chats.
    Restricts access to authenticated & email-verified users.
    Implements immediate local crisis keyword filtering.
    """

    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())

        # ── 1. Secure Access Check ──────────────────────────────────────────
        # Connection must be authenticated and email-verified
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4003)  # Forbidden / Unauthenticated
            return
        
        if not getattr(self.user, 'is_verified', False):
            await self.close(code=4003)  # Forbidden / Unverified email
            return

        self.session_id = self.scope['url_route']['kwargs']['session_uuid']
        
        # Verify the chat session belongs to this user
        self.chat_session = await self.get_chat_session(self.session_id)
        if not self.chat_session:
            await self.close(code=4004)  # Session not found or access denied
            return

        # Accept connection
        await self.accept()

        # Send welcome session header
        await self.send_json({
            "type": "connection_established",
            "message": f"Connected to wellness session: {self.chat_session.title}"
        })

    async def receive_json(self, content):
        """
        Triggered when client sends a message.
        Format: {"message": "Hello ManMitra"}
        """
        user_message = content.get('message', '').strip()
        if not user_message:
            return

        # ── 2. Heuristic Crisis Interception ───────────────────────────────
        if CrisisDetectionService.contains_crisis_keywords(user_message):
            # Save flagged message in DB
            await self.save_message(self.chat_session, 'user', user_message, crisis_flagged=True)
            # Mark session as crisis session
            await self.mark_session_crisis(self.chat_session)
            
            # Formulate resources payload
            payload = CrisisDetectionService.get_emergency_payload()
            
            # File a Crisis Report in database for admin oversight
            await self.create_crisis_report(self.chat_session, [user_message], payload)

            # Transmit emergency instructions over WebSocket
            await self.send_json(payload)
            return

        # ── 3. Standard Wellness Conversation Flow ─────────────────────────
        # Save user message to database
        await self.save_message(self.chat_session, 'user', user_message)

        # Retrieve short-term context memory (last 20 messages of session)
        history = await self.get_conversation_history(self.chat_session)
        user_profile = await self.get_user_wellness_profile(self.user)

        # Send typing / waiting indicator
        await self.send_json({"type": "status", "status": "typing"})

        # Call Gemini AI Generation Service
        # (Runs synchronously; runs database_sync_to_async to prevent blocking ASGI event loop)
        ai_response = await database_sync_to_async(AIService.generate_response)(
            history, 
            user_profile=user_profile
        )

        # Save AI response in DB
        await self.save_message(self.chat_session, 'assistant', ai_response)

        # Transmit AI message to user
        await self.send_json({
            "type": "chat_message",
            "role": "assistant",
            "message": ai_response,
            "timestamp": timezone.now().isoformat()
        })

    # ── Database Helpers (database_sync_to_async wrappers) ────────────────
    
    @database_sync_to_async
    def get_chat_session(self, session_id):
        try:
            return ChatSession.objects.get(id=session_id, user=self.user)
        except (ChatSession.DoesNotExist, ValueError):
            return None

    @database_sync_to_async
    def save_message(self, session, role, content, crisis_flagged=False):
        return ChatMessage.objects.create(
            session=session,
            role=role,
            content=content,
            crisis_flagged=crisis_flagged
        )

    @database_sync_to_async
    def mark_session_crisis(self, session):
        session.is_crisis = True
        session.save(update_fields=['is_crisis'])

    @database_sync_to_async
    def create_crisis_report(self, session, trigger_phrases, resources_payload):
        return CrisisReport.objects.create(
            user=self.user,
            session=session,
            trigger_keywords=trigger_phrases,
            severity=CrisisReport.Severity.HIGH,
            resources_shown=resources_payload,
            resolved=False
        )

    @database_sync_to_async
    def get_user_wellness_profile(self, user):
        profile = getattr(user, 'wellness_profile', None)
        if not profile:
            return None
        return {
            "stress_level": profile.stress_level,
            "primary_goals": profile.primary_goals,
            "wellness_preferences": profile.wellness_preferences
        }

    @database_sync_to_async
    def get_conversation_history(self, session):
        # Fetch last 20 messages in ascending order
        messages = session.messages.order_by('created_at')[:20]
        return [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
