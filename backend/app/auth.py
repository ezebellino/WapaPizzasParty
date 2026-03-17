import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any


AUTH_SECRET = os.getenv('WAPA_AUTH_SECRET', 'change-this-secret-in-production')
HASH_ITERATIONS = 120_000


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip('=')


def _b64decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: str | None = None) -> str:
    normalized_salt = salt or os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        normalized_salt.encode('utf-8'),
        HASH_ITERATIONS,
    )
    return f'{normalized_salt}${hashed.hex()}'


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, current_hash = stored_hash.split('$', 1)
    except ValueError:
        return False

    candidate = hash_password(password, salt=salt).split('$', 1)[1]
    return hmac.compare_digest(candidate, current_hash)


def create_access_token(payload: dict[str, Any], expires_in_seconds: int = 60 * 60 * 12) -> str:
    body = {
        **payload,
        'exp': int(time.time()) + expires_in_seconds,
    }
    encoded_body = _b64encode(json.dumps(body, separators=(',', ':')).encode('utf-8'))
    signature = hmac.new(
        AUTH_SECRET.encode('utf-8'),
        encoded_body.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()
    return f'{encoded_body}.{signature}'


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        encoded_body, signature = token.split('.', 1)
    except ValueError as error:
        raise ValueError('Formato de token invalido.') from error

    expected_signature = hmac.new(
        AUTH_SECRET.encode('utf-8'),
        encoded_body.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError('Firma de token invalida.')

    payload = json.loads(_b64decode(encoded_body).decode('utf-8'))
    if payload.get('exp', 0) < int(time.time()):
        raise ValueError('Token expirado.')

    return payload
