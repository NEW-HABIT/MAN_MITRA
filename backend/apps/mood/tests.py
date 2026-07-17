from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.mood.models import MoodLog
from services.analytics_service import MoodAnalyticsService

User = get_user_model()


class MoodLogsTests(APITestCase):
    def setUp(self):
        # Create verified user
        self.user = User.objects.create_user(
            email="testuser@manmitra.ai",
            password="SecurePassword123!",
            full_name="Test User",
            is_verified=True,
        )
        # Create unverified user
        self.unverified_user = User.objects.create_user(
            email="unverified@manmitra.ai",
            password="SecurePassword123!",
            full_name="Unverified User",
            is_verified=False,
        )
        self.login_url = reverse("users:login")
        self.logs_url = reverse("mood:moodlog-list")
        self.analytics_url = reverse("mood:mood-analytics")

    def get_jwt_token(self, user):
        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "SecurePassword123!"},
        )
        return response.data["tokens"]["access"]

    def test_create_mood_log_authenticated_verified(self):
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        payload = {"mood_score": 8, "mood_label": "happy", "note": "Great day!"}
        response = self.client.post(self.logs_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["mood_score"], 8)
        self.assertEqual(response.data["mood_label"], "happy")
        self.assertEqual(response.data["note"], "Great day!")
        self.assertEqual(MoodLog.objects.filter(user=self.user).count(), 1)

    def test_create_mood_log_unverified_denied(self):
        # Access denied because unverified user cannot log in (returns 403)
        response = self.client.post(
            self.login_url,
            {
                "email": self.unverified_user.email,
                "password": "SecurePassword123!",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mood_analytics_generation(self):
        # Create logs spanning last 3 days
        MoodLog.objects.create(
            user=self.user,
            mood_score=7,
            mood_label="calm",
            date=date.today() - timedelta(days=2),
        )
        MoodLog.objects.create(
            user=self.user,
            mood_score=8,
            mood_label="happy",
            date=date.today() - timedelta(days=1),
        )
        MoodLog.objects.create(
            user=self.user,
            mood_score=9,
            mood_label="excited",
            date=date.today(),
        )

        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.analytics_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_entries"], 3)
        self.assertEqual(response.data["avg_score_7d"], 8.0)
        self.assertEqual(response.data["current_streak"], 3)
