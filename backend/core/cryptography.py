"""
ManMitra — Cryptography Utilities
Provides secure encryption and decryption for sensitive user data (like journal entries) at rest.
"""
import base64
import hashlib
from django.conf import settings
from cryptography.fernet import Fernet


def _get_fernet() -> Fernet:
    """
    Derive a 32-byte Fernet key deterministically from Django's SECRET_KEY.
    Ensures that the encryption key is consistent as long as SECRET_KEY is unchanged.
    """
    key_material = settings.SECRET_KEY.encode('utf-8')
    # Hash the secret key to get a deterministic 32-byte key
    derived_key = hashlib.sha256(key_material).digest()
    base64_key = base64.urlsafe_b64encode(derived_key)
    return Fernet(base64_key)


def encrypt_text(plain_text: str) -> str:
    """Encrypt plain text to an encrypted base64 string."""
    if not plain_text:
        return ""
    fernet = _get_fernet()
    encrypted_bytes = fernet.encrypt(plain_text.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')


def decrypt_text(encrypted_text: str) -> str:
    """Decrypt an encrypted base64 string to plain text."""
    if not encrypted_text:
        return ""
    try:
        fernet = _get_fernet()
        decrypted_bytes = fernet.decrypt(encrypted_text.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception:
        # Fallback in case of corruption or key change (should log warning in production)
        return "[Decryption Error: Key mismatch or corrupted data]"
