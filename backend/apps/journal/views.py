"""
ManMitra — Journal Views
Endpoints for writing, editing, listing, and retrieving private encrypted journals.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import JournalEntry
from .serializers import JournalEntrySerializer, JournalEntryDetailSerializer
from core.permissions import IsVerifiedUser


class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing secure private journal entries.
    All entry contents are encrypted at rest.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = JournalEntry.objects.filter(user=user)
        
        # Optional filter by mood_tag
        mood_tag_id = self.request.query_params.get('mood_tag')
        if mood_tag_id:
            queryset = queryset.filter(mood_tag_id=mood_tag_id)
            
        # Optional filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        return queryset

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return JournalEntryDetailSerializer
        return JournalEntrySerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=['Journaling'],
        summary='List all journal entries for the authenticated user',
        description='Allows filtering by start_date, end_date (YYYY-MM-DD), and mood_tag UUID.',
        responses={200: JournalEntryDetailSerializer(many=True)},
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Journaling'],
        summary='Create a new private encrypted journal entry',
        request=JournalEntrySerializer,
        responses={201: JournalEntryDetailSerializer},
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full details including decrypted content
        detail_serializer = JournalEntryDetailSerializer(serializer.instance, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @extend_schema(
        tags=['Journaling'],
        summary='Retrieve a decrypted journal entry details',
        responses={200: JournalEntryDetailSerializer},
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Journaling'],
        summary='Update a journal entry',
        request=JournalEntrySerializer,
        responses={200: JournalEntryDetailSerializer},
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        detail_serializer = JournalEntryDetailSerializer(instance, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Journaling'],
        summary='Partially update a journal entry',
        request=JournalEntrySerializer,
        responses={200: JournalEntryDetailSerializer},
    )
    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        return self.update(request, *args, partial=True, **kwargs)

    @extend_schema(
        tags=['Journaling'],
        summary='Delete a journal entry',
        responses={204: OpenApiResponse(description='Journal entry deleted successfully.')},
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        return super().destroy(request, *args, **kwargs)
