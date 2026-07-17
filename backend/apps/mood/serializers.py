"""
ManMitra — Mood Serializers
"""
from rest_framework import serializers
from .models import MoodLog


class MoodLogSerializer(serializers.ModelSerializer):
    """Full mood log — for list and detail views."""
    mood_emoji = serializers.ReadOnlyField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = MoodLog
        fields = [
            'id', 'user', 'mood_score', 'mood_label', 'mood_emoji',
            'note', 'ai_insight', 'date', 'logged_at', 'updated_at',
        ]
        read_only_fields = ['id', 'mood_emoji', 'ai_insight', 'date', 'logged_at', 'updated_at']

    def validate_mood_score(self, value: int) -> int:
        if not (1 <= value <= 10):
            raise serializers.ValidationError('Mood score must be between 1 and 10.')
        return value


class MoodLogCreateSerializer(serializers.ModelSerializer):
    """Slim serializer for creating a mood log entry."""
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = MoodLog
        fields = ['user', 'mood_score', 'mood_label', 'note']

    def validate_mood_score(self, value: int) -> int:
        if not (1 <= value <= 10):
            raise serializers.ValidationError('Mood score must be between 1 and 10.')
        return value


class MoodLogUpdateSerializer(serializers.ModelSerializer):
    """Partial update — only allow note and label changes."""
    class Meta:
        model = MoodLog
        fields = ['mood_score', 'mood_label', 'note']


# ─────────────────────────────────────────────────────────────────────────────
# Analytics Serializers
# ─────────────────────────────────────────────────────────────────────────────

class DailyMoodPointSerializer(serializers.Serializer):
    """A single data point in the mood trend chart."""
    date = serializers.DateField()
    avg_score = serializers.FloatField()
    dominant_label = serializers.CharField()
    entry_count = serializers.IntegerField()


class MoodDistributionSerializer(serializers.Serializer):
    """Mood label frequency distribution."""
    label = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()


class MoodAnalyticsSerializer(serializers.Serializer):
    """Complete analytics payload for the dashboard."""
    # Averages
    avg_score_7d = serializers.FloatField(allow_null=True)
    avg_score_30d = serializers.FloatField(allow_null=True)
    avg_score_all_time = serializers.FloatField(allow_null=True)

    # Trend data (for line chart)
    trend_7d = DailyMoodPointSerializer(many=True)
    trend_30d = DailyMoodPointSerializer(many=True)

    # Distribution (for pie/donut chart)
    label_distribution = MoodDistributionSerializer(many=True)

    # Streak
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()

    # Best / worst
    best_day = serializers.DateField(allow_null=True)
    worst_day = serializers.DateField(allow_null=True)

    # Total entries
    total_entries = serializers.IntegerField()
