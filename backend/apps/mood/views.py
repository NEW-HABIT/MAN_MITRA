"""
ManMitra — Mood App Views
Endpoints for logging daily mood, editing logs, and viewing mood analytics.
"""
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import MoodLog
from .serializers import (
    MoodLogSerializer,
    MoodLogCreateSerializer,
    MoodLogUpdateSerializer,
    MoodAnalyticsSerializer,
)
from services.analytics_service import MoodAnalyticsService
from core.permissions import IsVerifiedUser


class MoodLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user mood logs.
    Only allows users to view and modify their own logs.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]
    pagination_class = None

    def get_queryset(self):
        return MoodLog.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return MoodLogCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MoodLogUpdateSerializer
        return MoodLogSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=['Mood Tracking'],
        summary='List all mood logs for the authenticated user',
        responses={200: MoodLogSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Mood Tracking'],
        summary='Create a new daily mood log entry',
        request=MoodLogCreateSerializer,
        responses={201: MoodLogSerializer},
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full details of the created log
        full_serializer = MoodLogSerializer(serializer.instance, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @extend_schema(
        tags=['Mood Tracking'],
        summary='Retrieve details of a specific mood log',
        responses={200: MoodLogSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Mood Tracking'],
        summary='Update a mood log note or score',
        request=MoodLogUpdateSerializer,
        responses={200: MoodLogSerializer},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['Mood Tracking'],
        summary='Partially update a mood log note or score',
        request=MoodLogUpdateSerializer,
        responses={200: MoodLogSerializer},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        tags=['Mood Tracking'],
        summary='Delete a mood log entry',
        responses={204: OpenApiResponse(description='Mood log deleted successfully.')},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class MoodAnalyticsView(APIView):
    """
    GET /api/mood/analytics/
    Fetch aggregated analytics, trends (7d/30d), and streaks for the user's dashboard.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]

    @extend_schema(
        tags=['Mood Tracking'],
        summary='Fetch mood analytics and trends for dashboard',
        responses={200: MoodAnalyticsSerializer},
    )
    def get(self, request: Request) -> Response:
        analytics_data = MoodAnalyticsService.get_analytics(request.user)
        serializer = MoodAnalyticsSerializer(analytics_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
