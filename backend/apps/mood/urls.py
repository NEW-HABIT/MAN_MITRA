"""
ManMitra — Mood App URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodLogViewSet, MoodAnalyticsView

app_name = 'mood'

router = DefaultRouter()
router.register(r'logs', MoodLogViewSet, basename='moodlog')

urlpatterns = [
    # Analytics
    path('analytics/', MoodAnalyticsView.as_view(), name='mood-analytics'),
    
    # Logs CRUD
    path('', include(router.urls)),
]
