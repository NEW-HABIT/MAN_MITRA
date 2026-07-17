"""
ManMitra — Root URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# ─────────────────────────────────────────────
# Admin Site Customisation
# ─────────────────────────────────────────────
admin.site.site_header = 'ManMitra Admin'
admin.site.site_title = 'ManMitra Administration'
admin.site.index_title = 'Welcome to ManMitra Admin Panel'

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # ── API v1 ───────────────────────────────
    path('api/auth/', include('apps.users.urls', namespace='users')),
    path('api/mood/', include('apps.mood.urls', namespace='mood')),
    path('api/journal/', include('apps.journal.urls', namespace='journal')),
    path('api/wellness/', include('apps.wellness.urls', namespace='wellness')),
    path('api/chat/', include('apps.chat.urls', namespace='chat')),

    # ── API Documentation ────────────────────
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ── Allauth (social auth callbacks) ──────
    path('accounts/', include('allauth.urls')),
]

# ── Serve media in development ─────────────────
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug Toolbar
    try:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass
