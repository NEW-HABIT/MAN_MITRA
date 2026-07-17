"""
ManMitra — Wellness Admin Configuration
"""
from django.contrib import admin
from .models import WellnessPlan


@admin.register(WellnessPlan)
class WellnessPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan_type', 'generated_by_ai', 'is_active', 'created_at']
    list_filter = ['plan_type', 'generated_by_ai', 'is_active', 'created_at']
    search_fields = ['user__email', 'user__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    list_per_page = 30
