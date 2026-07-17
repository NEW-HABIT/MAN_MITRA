"""
ManMitra — Chat Routing
Maps WebSocket connection URLs to the ChatConsumer.
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Match ws://domain/ws/chat/<session_uuid>/
    re_path(r'^ws/chat/(?P<session_uuid>[0-9a-f-]+)/$', consumers.ChatConsumer.as_asgi()),
]
