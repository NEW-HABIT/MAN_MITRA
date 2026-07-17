"""
ManMitra — Journal Admin Configuration
"""
from django.contrib import admin
from .models import JournalEntry


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'sentiment_score', 'created_at']
    list_filter = ['sentiment_score', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'title']
    readonly_fields = ['id', 'decrypted_content_preview', 'sentiment_score', 'created_at', 'updated_at']
    exclude = ['_encrypted_content']
    ordering = ['-created_at']
    list_per_page = 30

    @admin.display(description='Decrypted Content Preview')
    def decrypted_content_preview(self, obj: JournalEntry) -> str:
        content = obj.content
        if len(content) > 100:
            return content[:100] + "..."
        return content
