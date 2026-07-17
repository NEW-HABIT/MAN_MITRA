"""
ManMitra — Custom DRF Permissions
Role-Based Access Control (RBAC) for the ManMitra platform.
"""
from rest_framework.permissions import BasePermission


class IsVerifiedUser(BasePermission):
    """
    Allows access only to authenticated users who have verified their email.
    Use this on any endpoint that requires a fully onboarded user.
    """
    message = 'Your email address has not been verified. Please check your inbox.'

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_verified
        )


class IsAdminRole(BasePermission):
    """
    Allows access only to users with the 'admin' role.
    Note: This is the ManMitra platform admin, distinct from Django's is_staff.
    """
    message = 'This action requires administrator privileges.'

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsTherapistRole(BasePermission):
    """
    Allows access only to users with the 'therapist' role.
    """
    message = 'This action requires therapist credentials.'

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'therapist'
        )


class IsAdminOrTherapist(BasePermission):
    """
    Allows access to both 'admin' and 'therapist' roles.
    Useful for endpoints that clinical staff share with admins.
    """
    message = 'This action requires therapist or administrator privileges.'

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'therapist')
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: allow only the object owner or an admin.
    The view's model must have a 'user' FK attribute.
    """
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj) -> bool:
        if request.user and request.user.role == 'admin':
            return True
        owner = getattr(obj, 'user', None)
        return owner == request.user
