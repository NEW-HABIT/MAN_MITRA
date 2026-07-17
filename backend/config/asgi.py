"""
ManMitra — ASGI Configuration
Configures ProtocolTypeRouter for routing both HTTP (via standard ASGI)
and WebSockets (via JWT Auth Middleware + URL Routing).
"""
import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

# Import Channels components after django.setup()
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from apps.chat.middleware import JWTAuthMiddleware
from apps.chat.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    # HTTP requests handled by standard Django ASGI
    "http": get_asgi_application(),

    # WebSocket requests handled by custom JWT middleware + routing
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
