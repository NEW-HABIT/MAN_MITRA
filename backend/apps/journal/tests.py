from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.journal.models import JournalEntry
from core.cryptography import encrypt_text, decrypt_text

User = get_user_model()


class JournalTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@manmitra.ai",
            password="SecurePassword123!",
            full_name="Test User",
            is_verified=True,
        )
        self.login_url = reverse("users:login")
        self.journal_url = reverse("journal:journalentry-list")

    def get_jwt_token(self, user):
        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "SecurePassword123!"},
        )
        return response.data["tokens"]["access"]

    def test_create_and_retrieve_encrypted_journal(self):
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Post plain content
        payload = {
            "title": "Feeling Reflected",
            "content": "This is a private journal entry containing sensitive information."
        }
        response = self.client.post(self.journal_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Feeling Reflected")
        self.assertEqual(response.data["content"], "This is a private journal entry containing sensitive information.")

        # Ensure database contains encrypted field directly
        db_entry = JournalEntry.objects.get(id=response.data["id"])
        self.assertNotEqual(db_entry._encrypted_content, payload["content"])
        self.assertTrue(db_entry._encrypted_content.startswith("gAAAAA")) # Standard Fernet base64 prefix
        
        # Test read endpoint decrypts transparently
        detail_url = reverse("journal:journalentry-detail", kwargs={"pk": db_entry.id})
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["content"], payload["content"])
