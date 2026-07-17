"""
ManMitra — Analytics Service
Handles calculations for mood logs: averages, trends, distribution, and streaks.
"""
from datetime import date, timedelta
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from apps.mood.models import MoodLog


class MoodAnalyticsService:
    @staticmethod
    def calculate_streak(user) -> tuple[int, int]:
        """
        Calculate current and longest consecutive daily check-in streaks for a user.
        Returns (current_streak, longest_streak).
        """
        logs = (
            MoodLog.objects.filter(user=user)
            .values("date")
            .distinct()
            .order_by("-date")
        )
        dates = [log["date"] for log in logs]

        if not dates:
            return 0, 0

        # Calculate current streak
        today = date.today()
        yesterday = today - timedelta(days=1)
        current_streak = 0

        # The streak can start today or yesterday
        if dates[0] == today:
            current_streak = 1
            expected_date = today - timedelta(days=1)
            for d in dates[1:]:
                if d == expected_date:
                    current_streak += 1
                    expected_date -= timedelta(days=1)
                else:
                    break
        elif dates[0] == yesterday:
            current_streak = 1
            expected_date = yesterday - timedelta(days=1)
            for d in dates[1:]:
                if d == expected_date:
                    current_streak += 1
                    expected_date -= timedelta(days=1)
                else:
                    break
        else:
            current_streak = 0

        # Calculate longest streak
        # Sort dates in ascending order
        asc_dates = sorted(dates)
        longest_streak = 0
        temp_streak = 0
        expected_date = None

        for d in asc_dates:
            if expected_date is None:
                temp_streak = 1
                expected_date = d + timedelta(days=1)
            elif d == expected_date:
                temp_streak += 1
                expected_date += timedelta(days=1)
            elif d > expected_date:
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
                temp_streak = 1
                expected_date = d + timedelta(days=1)

        if temp_streak > longest_streak:
            longest_streak = temp_streak

        return current_streak, longest_streak

    @staticmethod
    def get_analytics(user) -> dict:
        """
        Fetch and build mood analytics for the user.
        """
        today = date.today()
        seven_days_ago = today - timedelta(days=7)
        thirty_days_ago = today - timedelta(days=30)

        # Base queryset
        user_logs = MoodLog.objects.filter(user=user)
        total_entries = user_logs.count()

        if total_entries == 0:
            return {
                "avg_score_7d": None,
                "avg_score_30d": None,
                "avg_score_all_time": None,
                "trend_7d": [],
                "trend_30d": [],
                "label_distribution": [],
                "current_streak": 0,
                "longest_streak": 0,
                "best_day": None,
                "worst_day": None,
                "total_entries": 0,
            }

        # Averages
        avg_7d = user_logs.filter(date__gte=seven_days_ago).aggregate(
            Avg("mood_score")
        )["mood_score__avg"]
        avg_30d = user_logs.filter(date__gte=thirty_days_ago).aggregate(
            Avg("mood_score")
        )["mood_score__avg"]
        avg_all = user_logs.aggregate(Avg("mood_score"))["mood_score__avg"]

        # Formatter helper for trend data points
        def get_trend_data(start_date):
            trends = (
                user_logs.filter(date__gte=start_date)
                .values("date")
                .annotate(avg_score=Avg("mood_score"), entry_count=Count("id"))
                .order_by("date")
            )

            trend_list = []
            for t in trends:
                # Find dominant label for that day
                dominant = (
                    user_logs.filter(user=user, date=t["date"])
                    .values("mood_label")
                    .annotate(count=Count("id"))
                    .order_by("-count")
                    .first()
                )
                dominant_label = dominant["mood_label"] if dominant else "neutral"

                trend_list.append(
                    {
                        "date": t["date"],
                        "avg_score": round(t["avg_score"], 2),
                        "dominant_label": dominant_label,
                        "entry_count": t["entry_count"],
                    }
                )
            return trend_list

        trend_7d = get_trend_data(seven_days_ago)
        trend_30d = get_trend_data(thirty_days_ago)

        # Distribution
        dist = (
            user_logs.values("mood_label")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        label_distribution = []
        for d in dist:
            count = d["count"]
            percentage = round((count / total_entries) * 100, 2)
            label_distribution.append(
                {
                    "label": d["mood_label"],
                    "count": count,
                    "percentage": percentage,
                }
            )

        # Best / Worst Day by mood score
        daily_averages = (
            user_logs.values("date")
            .annotate(avg_score=Avg("mood_score"))
            .order_by("-avg_score")
        )
        best_day = daily_averages.first()["date"] if daily_averages else None
        worst_day = daily_averages.last()["date"] if daily_averages else None

        # Streaks
        current_streak, longest_streak = MoodAnalyticsService.calculate_streak(
            user
        )

        return {
            "avg_score_7d": round(avg_7d, 2) if avg_7d else None,
            "avg_score_30d": round(avg_30d, 2) if avg_30d else None,
            "avg_score_all_time": round(avg_all, 2) if avg_all else None,
            "trend_7d": trend_7d,
            "trend_30d": trend_30d,
            "label_distribution": label_distribution,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "best_day": best_day,
            "worst_day": worst_day,
            "total_entries": total_entries,
        }
