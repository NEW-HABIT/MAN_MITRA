"""
ManMitra — Django Channels JWT Authentication Middleware
Extracts simplejwt bearer token from query parameters to authenticate WebSocket connections.
Example WebSocket connection string: ws://127.0.0.1:8000/ws/chat/<session_uuid>/?token=<jwt_token>
"""
import urllib.parse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_key: str):
    """
    Asynchronously decode SimpleJWT access token and return associated User instance.
    """
    try:
        # Decode and validate token
        token = AccessToken(token_key)
        user_id = token['user_id']
        # Fetch user
        user = User.objects.get(id=user_id)
        if not user.is_active:
            return AnonymousUser()
        return user
    except Exception:
        # Return anonymous user if token is invalid or expired
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom WebSocket middleware that authenticates users based on JWT.
    """
    async def __call__(self, scope, receive, send):
        # Extract query parameters from connection URL
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = urllib.parse.parse_qs(query_string)
        
        # Get token key from query parameters
        token_key = query_params.get('token', [None])[0]

        if token_key:
            user = await get_user_from_token(token_key)
            scope['user'] = user
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
