from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.wellness.models import WellnessPlan

User = get_user_model()


class WellnessPlansTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@manmitra.ai",
            password="SecurePassword123!",
            full_name="Test User",
            is_verified=True,
        )
        self.login_url = reverse("users:login")
        self.plans_url = reverse("wellness:wellnessplan-list")
        self.generate_url = reverse("wellness:wellnessplan-generate-plan")

    def get_jwt_token(self, user):
        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "SecurePassword123!"},
        )
        return response.data["tokens"]["access"]

    def test_generate_and_toggle_wellness_plan(self):
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Trigger generation of wellness plan template
        gen_response = self.client.post(self.generate_url)
        self.assertEqual(gen_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tasks", gen_response.data["content"])
        self.assertTrue(len(gen_response.data["content"]["tasks"]) > 0)
        
        plan_id = gen_response.data["id"]
        
        # Verify first task is uncompleted
        self.assertFalse(gen_response.data["content"]["tasks"][0]["completed"])
        
        # Toggle task at index 0 to completed=True
        toggle_url = reverse("wellness:wellnessplan-toggle-task", kwargs={"pk": plan_id})
        toggle_response = self.client.patch(toggle_url, {"task_index": 0, "completed": True})
        
        self.assertEqual(toggle_response.status_code, status.HTTP_200_OK)
        self.assertTrue(toggle_response.data["content"]["tasks"][0]["completed"])
