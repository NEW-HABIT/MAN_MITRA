"""
ManMitra — Mood Admin Configuration
"""
from django.contrib import admin
from .models import MoodLog


@admin.register(MoodLog)
class MoodLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'mood_score', 'mood_label', 'date', 'logged_at']
    list_filter = ['mood_label', 'mood_score', 'date']
    search_fields = ['user__email', 'user__full_name', 'note']
    readonly_fields = ['id', 'logged_at', 'updated_at']
    ordering = ['-logged_at']
    list_per_page = 30
