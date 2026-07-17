"""
ManMitra — Emergency Admin Configuration
"""
from django.contrib import admin
from django.utils import timezone
from .models import CrisisReport


@admin.register(CrisisReport)
class CrisisReportAdmin(admin.ModelAdmin):
    list_display = ['user', 'severity', 'resolved', 'flagged_at', 'resolved_at']
    list_filter = ['severity', 'resolved', 'flagged_at']
    search_fields = ['user__email', 'user__full_name', 'trigger_keywords']
    readonly_fields = ['id', 'user', 'session', 'trigger_keywords', 'resources_shown', 'flagged_at', 'resolved_at']
    actions = ['mark_resolved']
    list_per_page = 30

    @admin.action(description='Mark selected reports as resolved')
    def mark_resolved(self, request, queryset):
        queryset.update(resolved=True, resolved_at=timezone.now())
        self.message_user(request, "Incident reports have been marked resolved.")
