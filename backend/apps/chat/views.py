"""
ManMitra — Chat REST views
ViewSet for managing user AI chat sessions and retrieving message history.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user AI chat sessions.
    Requires user to be authenticated.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatSessionSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='List all user chat sessions',
        responses={200: ChatSessionSerializer(many=True)}
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Start a new AI chat session',
        responses={201: ChatSessionSerializer}
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Retrieve a chat session',
        responses={200: ChatSessionSerializer}
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Delete a chat session',
        responses={204: None}
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        tags=['AI Companion Chat'],
        summary='Fetch messages within a session',
        responses={200: ChatMessageSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def messages(self, request: Request, pk=None) -> Response:
        session = self.get_object()
        messages = session.messages.all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
