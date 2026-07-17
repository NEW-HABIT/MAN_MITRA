"""
ManMitra — Custom Exception Handler
Produces consistent, structured error responses across the entire API.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    Throttled,
    NotFound,
)

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context) -> Response | None:
    """
    ManMitra custom exception handler.
    Wraps all DRF errors in a consistent envelope:
    {
        "error": "Human-readable message",
        "detail": <original DRF detail or list of errors>,
        "status_code": 400,
    }
    """
    # Let DRF handle the exception first
    response = exception_handler(exc, context)

    if response is not None:
        view = context.get('view', None)
        view_name = view.__class__.__name__ if view else 'Unknown'

        # Log 5xx errors
        if response.status_code >= 500:
            logger.error(
                f'Server error in {view_name}: {exc}',
                exc_info=True,
            )

        # Normalise the error payload
        original_detail = response.data

        if isinstance(original_detail, dict) and 'detail' in original_detail:
            message = str(original_detail['detail'])
        elif isinstance(original_detail, list):
            message = str(original_detail[0]) if original_detail else 'An error occurred.'
        elif isinstance(original_detail, str):
            message = original_detail
        else:
            message = _get_friendly_message(exc, response.status_code)

        response.data = {
            'error': message,
            'detail': original_detail,
            'status_code': response.status_code,
        }

    return response


def _get_friendly_message(exc, status_code: int) -> str:
    """Map exception types to human-friendly messages."""
    if isinstance(exc, NotAuthenticated):
        return 'Authentication credentials were not provided. Please log in.'
    if isinstance(exc, AuthenticationFailed):
        return 'Invalid authentication credentials.'
    if isinstance(exc, PermissionDenied):
        return 'You do not have permission to perform this action.'
    if isinstance(exc, NotFound) or isinstance(exc, Http404):
        return 'The requested resource was not found.'
    if isinstance(exc, Throttled):
        wait = exc.wait
        return f'Too many requests. Please try again in {int(wait)} seconds.' if wait else 'Too many requests.'
    if status_code == 400:
        return 'Invalid request data. Please check the provided fields.'
    if status_code == 500:
        return 'An internal server error occurred. Our team has been notified.'
    return 'An unexpected error occurred.'
