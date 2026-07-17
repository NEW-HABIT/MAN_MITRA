"""
ManMitra — Wellness Plan Serializers
"""
from rest_framework import serializers
from .models import WellnessPlan


class WellnessPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for managing active and archived wellness plans.
    """
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = WellnessPlan
        fields = [
            'id', 'user', 'plan_type', 'content', 'generated_by_ai',
            'week_start', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'generated_by_ai', 'created_at', 'updated_at']

    def validate_content(self, value):
        if not isinstance(value, dict) or 'tasks' not in value:
            raise serializers.ValidationError(
                "Content must be a JSON object containing a 'tasks' array."
            )
        return value
