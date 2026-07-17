import json
import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken
from config.asgi import application
from apps.chat.models import ChatSession, ChatMessage
from apps.emergency.models import CrisisReport

User = get_user_model()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_websocket_connection_unauthenticated():
    """
    Unauthenticated connections should be closed with code 4003.
    """
    communicator = WebsocketCommunicator(
        application, 
        "/ws/chat/12345678-1234-1234-1234-123456789012/"
    )
    connected, subprotocol = await communicator.connect()
    assert not connected
    assert subprotocol == 4003
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_websocket_chat_and_crisis_guardrail():
    """
    Test standard AI chat messages and immediate crisis guardrail interceptions.
    """
    # ── Setup User ──────────────────────────────────────────────────────────
    user = await database_sync_create_user(
        email="chatuser@manmitra.ai",
        password="SecurePassword123!",
        full_name="Chat User",
        is_verified=True
    )

    # Generate SimpleJWT Access Token
    access_token = AccessToken.for_user(user)
    token_str = str(access_token)

    # ── Setup Session ────────────────────────────────────────────────────────
    session = await database_sync_create_session(user, "Chat Test Session")

    # Connect to consumer with token in query string
    url = f"/ws/chat/{session.id}/?token={token_str}"
    communicator = WebsocketCommunicator(application, url)
    connected, subprotocol = await communicator.connect()
    
    assert connected
    
    # Receive connection welcome header
    response = await communicator.receive_json_from()
    assert response["type"] == "connection_established"

    # ── Test Case 1: Standard AI Chat Message ────────────────────────────────
    await communicator.send_json_to({"message": "I feel slightly stressed today."})
    
    # Receive status typing indicator
    typing_status = await communicator.receive_json_from()
    assert typing_status["type"] == "status"
    assert typing_status["status"] == "typing"

    # Receive final AI assistant response
    ai_response = await communicator.receive_json_from()
    assert ai_response["type"] == "chat_message"
    assert ai_response["role"] == "assistant"
    assert "breath" in ai_response["message"].lower() or "mind" in ai_response["message"].lower() or "experience" in ai_response["message"].lower()

    # ── Test Case 2: Crisis Interception ─────────────────────────────────────
    # Send a prompt triggering self-harm keywords
    await communicator.send_json_to({"message": "I want to end my life, it is too hard."})
    
    # The consumer must intercept locally and return the emergency resources list immediately
    crisis_response = await communicator.receive_json_from()
    assert crisis_response["type"] == "crisis_alert"
    assert "988" in str(crisis_response["resources"])
    assert "1800-599-0019" in str(crisis_response["resources"])

    # ── Verify DB entries saved correctly ────────────────────────────────────
    # Verify flagged message
    flagged_msg_exists = await database_sync_check_msg_flagged(session)
    assert flagged_msg_exists

    # Verify session marked as crisis session
    session_is_crisis = await database_sync_check_session_crisis(session.id)
    assert session_is_crisis

    # Verify CrisisReport logged
    report_exists = await database_sync_check_report_exists(user)
    assert report_exists

    # Disconnect
    await communicator.disconnect()


# ── Database Sync Helper Wrappers for Async Tests ───────────────────────────

@pytest.mark.django_db
def database_sync_create_user(email, password, full_name, is_verified):
    from channels.db import database_sync_to_async
    return database_sync_to_async(User.objects.create_user)(
        email=email,
        password=password,
        full_name=full_name,
        is_verified=is_verified
    )

@pytest.mark.django_db
def database_sync_create_session(user, title):
    from channels.db import database_sync_to_async
    return database_sync_to_async(ChatSession.objects.create)(
        user=user,
        title=title
    )

@pytest.mark.django_db
def database_sync_check_msg_flagged(session):
    from channels.db import database_sync_to_async
    def check():
        return ChatMessage.objects.filter(session=session, crisis_flagged=True).exists()
    return database_sync_to_async(check)()

@pytest.mark.django_db
def database_sync_check_session_crisis(session_id):
    from channels.db import database_sync_to_async
    def check():
        return ChatSession.objects.get(id=session_id).is_crisis
    return database_sync_to_async(check)()

@pytest.mark.django_db
def database_sync_check_report_exists(user):
    from channels.db import database_sync_to_async
    def check():
        return CrisisReport.objects.filter(user=user).exists()
    return database_sync_to_async(check)()
