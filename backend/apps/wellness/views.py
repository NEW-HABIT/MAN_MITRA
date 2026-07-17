from datetime import date, timedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import WellnessPlan
from .serializers import WellnessPlanSerializer
from apps.mood.models import MoodLog
from services.ai_wellness_service import AIWellnessService
from core.permissions import IsVerifiedUser


class WellnessPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing personalized daily or weekly wellness routines.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]
    serializer_class = WellnessPlanSerializer
    pagination_class = None

    def get_queryset(self):
        return WellnessPlan.objects.filter(user=self.request.user)

    @extend_schema(
        tags=['Wellness Plans'],
        summary='Retrieve the current active daily and weekly plans',
        responses={200: WellnessPlanSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], url_path='active')
    def active_plans(self, request: Request) -> Response:
        """Fetch the active daily and weekly wellness plans for the user."""
        plans = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Wellness Plans'],
        summary='Generate seed wellness plans based on user onboarding choices',
        description='Triggers creation of default daily tasks based on the stress level and preferences.',
        responses={201: WellnessPlanSerializer(many=True)},
    )
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_plan(self, request: Request) -> Response:
        """
        Creates template-based wellness plans for the user.
        In Phase 4, this triggers LLM calls to tailor routines to mood trends.
        """
        user = request.user
        profile = getattr(user, 'wellness_profile', None)

        # Build profile data
        profile_data = {}
        if profile:
            profile_data = {
                "stress_level": profile.stress_level,
                "primary_goals": profile.primary_goals,
                "wellness_preferences": profile.wellness_preferences,
            }

        # Query recent mood logs (last 7 days)
        seven_days_ago = date.today() - timedelta(days=7)
        recent_logs = MoodLog.objects.filter(user=user, date__gte=seven_days_ago).values('mood_score', 'mood_label')
        recent_moods = list(recent_logs)

        # Call AI generation service
        routine_content = AIWellnessService.generate_routine(profile_data, recent_moods)

        # Archive older active plans of the same type
        self.get_queryset().filter(plan_type=WellnessPlan.PlanType.DAILY, is_active=True).update(is_active=False)

        # Create new daily plan
        daily_plan = WellnessPlan.objects.create(
            user=user,
            plan_type=WellnessPlan.PlanType.DAILY,
            content=routine_content,
            generated_by_ai=True,
            is_active=True
        )

        serializer = self.get_serializer(daily_plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        tags=['Wellness Plans'],
        summary='Toggle completion status of a specific task in the plan',
        request=None,
        responses={200: WellnessPlanSerializer},
    )
    @action(detail=True, methods=['patch'], url_path='toggle-task')
    def toggle_task(self, request: Request, pk=None) -> Response:
        """
        Toggle completion status of a task by its index.
        Request body format: {"task_index": 0, "completed": true}
        """
        plan = self.get_object()
        task_index = request.data.get('task_index')
        completed = request.data.get('completed', False)

        if task_index is None:
            return Response(
                {"error": "task_index is a required payload field."},
                status=status.HTTP_400_BAD_REQUEST
            )

        content = plan.content
        tasks = content.get('tasks', [])

        try:
            task_index = int(task_index)
            if 0 <= task_index < len(tasks):
                tasks[task_index]['completed'] = completed
                plan.content = content
                plan.save(update_fields=['content'])
                return Response(self.get_serializer(plan).data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Index out of bounds."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "task_index must be an integer."}, status=status.HTTP_400_BAD_REQUEST)
