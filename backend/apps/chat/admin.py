"""
ManMitra — Chat Admin Configuration
"""
from django.contrib import admin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['role', 'content', 'crisis_flagged', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_crisis', 'started_at', 'ended_at']
    list_filter = ['is_crisis', 'started_at', 'ended_at']
    search_fields = ['user__email', 'user__full_name', 'title']
    readonly_fields = ['id', 'started_at']
    inlines = [ChatMessageInline]
    list_per_page = 30


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session', 'role', 'crisis_flagged', 'created_at']
    list_filter = ['role', 'crisis_flagged', 'created_at']
    search_fields = ['session__user__email', 'content']
    readonly_fields = ['id', 'session', 'role', 'content', 'crisis_flagged', 'created_at']
    list_per_page = 30
