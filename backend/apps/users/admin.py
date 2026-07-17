"""
ManMitra — Users Admin Configuration
Rich admin panel for user and wellness profile management.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import User, WellnessProfile


class WellnessProfileInline(admin.StackedInline):
    model = WellnessProfile
    can_delete = False
    verbose_name_plural = 'Wellness Profile'
    fk_name = 'user'
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Sleep', {'fields': ('sleep_schedule',)}),
        ('Wellness Data', {'fields': ('stress_level', 'primary_goals', 'wellness_preferences')}),
        ('Onboarding', {'fields': ('onboarding_done',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for ManMitra User model."""

    inlines = [WellnessProfileInline]

    # ── List View ────────────────────────────────────────────────────────────
    list_display = [
        'email', 'full_name', 'role_badge', 'is_verified_badge',
        'is_active', 'created_at',
    ]
    list_filter = ['role', 'is_verified', 'is_active', 'gender', 'created_at']
    search_fields = ['email', 'full_name', 'occupation']
    ordering = ['-created_at']
    list_per_page = 30

    # ── Detail View ──────────────────────────────────────────────────────────
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login']

    fieldsets = (
        (_('Identity'), {
            'fields': ('id', 'email', 'full_name', 'avatar')
        }),
        (_('Demographics'), {
            'fields': ('date_of_birth', 'gender', 'occupation'),
            'classes': ('collapse',),
        }),
        (_('Platform Role & Status'), {
            'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser'),
        }),
        (_('Permissions'), {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        (_('Timestamps'), {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )

    # ── Custom Display Methods ───────────────────────────────────────────────
    @admin.display(description='Role')
    def role_badge(self, obj: User) -> str:
        colors = {
            'user': '#4CAF50',
            'therapist': '#2196F3',
            'admin': '#FF5722',
        }
        color = colors.get(obj.role, '#9E9E9E')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:12px;font-size:11px;">{}</span>',
            color,
            obj.get_role_display(),
        )

    @admin.display(description='Verified', boolean=False)
    def is_verified_badge(self, obj: User) -> str:
        if obj.is_verified:
            return format_html('<span style="color:green;font-weight:bold;">✓ Verified</span>')
        return format_html('<span style="color:orange;">✗ Pending</span>')


@admin.register(WellnessProfile)
class WellnessProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'stress_level', 'onboarding_done', 'updated_at']
    list_filter = ['onboarding_done', 'stress_level']
    search_fields = ['user__email', 'user__full_name']
    readonly_fields = ['id', 'user', 'created_at', 'updated_at']
    list_per_page = 30
