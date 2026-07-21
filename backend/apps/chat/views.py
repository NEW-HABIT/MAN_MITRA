"""
ManMitra — Chat REST views
AI chat feature is currently disabled (coming soon).
All endpoints return HTTP 503 with a clear message.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer


_COMING_SOON = {
    "detail": "The AI Companion chat feature is coming soon. Check back later!"
}


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user AI chat sessions.
    Currently disabled — returns 503 on all actions.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatSessionSerializer
    # Prevent any writes while feature is disabled
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def _coming_soon_response(self):
        return Response(_COMING_SOON, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='[Coming Soon] List all chat sessions',
        responses={503: OpenApiResponse(description='Feature not yet available.')}
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return self._coming_soon_response()

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='[Coming Soon] Start a new AI chat session',
        responses={503: OpenApiResponse(description='Feature not yet available.')}
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        return self._coming_soon_response()

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='[Coming Soon] Retrieve a chat session',
        responses={503: OpenApiResponse(description='Feature not yet available.')}
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return self._coming_soon_response()

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='[Coming Soon] Delete a chat session',
        responses={503: OpenApiResponse(description='Feature not yet available.')}
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        return self._coming_soon_response()

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='[Coming Soon] Fetch messages within a session',
        responses={503: OpenApiResponse(description='Feature not yet available.')}
    )
    @action(detail=True, methods=['get'])
    def messages(self, request: Request, pk=None) -> Response:
        return self._coming_soon_response()
