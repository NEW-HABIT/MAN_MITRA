"""
ManMitra — Journal URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JournalEntryViewSet

app_name = 'journal'

router = DefaultRouter()
router.register(r'entries', JournalEntryViewSet, basename='journalentry')

urlpatterns = [
    path('', include(router.urls)),
]
