"""
ManMitra — Chat views
Endpoints for creating, listing, and retrieving user chat sessions and message histories.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from core.permissions import IsVerifiedUser


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user AI chat sessions.
    Allows listing history, starting new chats, and reviewing message streams.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]
    serializer_class = ChatSessionSerializer
    pagination_class = None

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Trigger default name generator e.g. "Conversation 1"
        count = self.get_queryset().count() + 1
        serializer.save(
            user=self.request.user,
            title=f"Wellness Session #{count}"
        )

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='List all chat sessions for the authenticated user',
        responses={200: ChatSessionSerializer(many=True)}
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Start a new AI chat session',
        request=None,
        responses={201: ChatSessionSerializer}
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Retrieve status of a chat session',
        responses={200: ChatSessionSerializer}
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Delete a chat session and all its messages',
        responses={204: OpenApiResponse(description='Session deleted successfully.')}
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Fetch all messages within a specific chat session',
        responses={200: ChatMessageSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def messages(self, request: Request, pk=None) -> Response:
        """Get message history for the session in chronological order."""
        session = self.get_object()
        messages = session.messages.order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
