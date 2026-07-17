"""
ManMitra — Chat Serializers
"""
from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for individual chat messages.
    """
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'tokens_used', 'crisis_flagged', 'created_at']
        read_only_fields = ['id', 'tokens_used', 'crisis_flagged', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for chat sessions.
    """
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    message_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'user', 'title', 'is_crisis', 'started_at', 'ended_at', 'message_count']
        read_only_fields = ['id', 'is_crisis', 'started_at', 'ended_at', 'message_count']
