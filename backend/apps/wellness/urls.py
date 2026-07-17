"""
ManMitra — Wellness URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WellnessPlanViewSet

app_name = 'wellness'

router = DefaultRouter()
router.register(r'plans', WellnessPlanViewSet, basename='wellnessplan')

urlpatterns = [
    path('', include(router.urls)),
]
