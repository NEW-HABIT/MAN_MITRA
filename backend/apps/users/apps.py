"""
ManMitra — Users App Configuration
"""
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users & Authentication'

    def ready(self):
        """Import signal handlers when the app is ready."""
        pass  # Phase 2: import apps.users.signals
