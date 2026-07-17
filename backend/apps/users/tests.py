from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AdminDashboardTests(APITestCase):
    def setUp(self):
        # Create standard user
        self.user = User.objects.create_user(
            email="user@manmitra.ai",
            password="SecurePassword123!",
            full_name="Standard User",
            is_verified=True,
            role="user"
        )
        # Create admin user
        self.admin = User.objects.create_user(
            email="admin_user@manmitra.ai",
            password="SecurePassword123!",
            full_name="Admin User",
            is_verified=True,
            role="admin"
        )
        self.login_url = reverse("users:login")
        self.dashboard_url = reverse("users:admin-dashboard")

    def get_jwt_token(self, user):
        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "SecurePassword123!"},
        )
        return response.data["tokens"]["access"]

    def test_admin_dashboard_access_allowed_for_admin(self):
        token = self.get_jwt_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_users", response.data)
        self.assertIn("total_therapists", response.data)
        self.assertIn("total_admins", response.data)
        self.assertIn("avg_stress_level", response.data)
        self.assertEqual(response.data["total_admins"], 1)
        self.assertEqual(response.data["total_users"], 1)

    def test_admin_dashboard_access_denied_for_regular_user(self):
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
