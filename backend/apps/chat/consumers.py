"""
ManMitra — AI Chat WebSocket Consumer
AI chat feature is currently disabled (coming soon).
WebSocket connections are accepted and immediately receive a "coming soon" notice.
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    Stub consumer — AI chat via LLM is not yet enabled.
    Accepts the WebSocket, sends a service-unavailable notice, then closes.
    """

    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())

        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4003)
            return

        await self.accept()
        await self.send_json({
            "type": "service_unavailable",
            "message": (
                "The AI Companion chat feature is coming soon. "
                "We are working hard to bring you a safe and supportive experience."
            )
        })
        await self.close(code=1000)

    async def receive_json(self, content):
        # No-op — connection is closed on connect
        pass
