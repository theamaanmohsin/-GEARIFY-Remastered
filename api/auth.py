"""
GEARIFY-Remastered — Authentication & Authorization Module

Handles:
  - Password hashing (werkzeug.security)
  - JWT creation & verification (PyJWT)
  - Role-gated route protection decorators (@require_auth, @require_role)
"""

import os
import functools
from datetime import datetime, timezone, timedelta
# pyrefly: ignore [missing-import]
import jwt
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from api.models import get_session, User

SECRET_KEY = os.environ.get("JWT_SECRET", "gearify_super_secret_jwt_key_2026")
ALGORITHM = "HS256"
TOKEN_EXPIRATION_HOURS = 24


def hash_password(password: str) -> str:
    """Returns bcrypt-backed password hash."""
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verifies plain password against hash."""
    return check_password_hash(password_hash, password)


def create_token(user_id: int, email: str, role: str, name: str) -> str:
    """Generates a signed JWT with user claims."""
    expiration = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "name": name,
        "exp": expiration,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """Decodes and validates a JWT token. Returns payload dict or None if invalid.

    Gracefully handles malformed, tampered, and expired tokens so callers never
    see an unhandled exception — every failure simply resolves to ``None``.
    """
    if not token or not isinstance(token, str):
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token is well-formed but past its exp — treat as logged out.
        return None
    except jwt.InvalidSignatureError:
        # Signing key mismatch / tampered token.
        return None
    except (jwt.DecodeError, jwt.InvalidAlgorithmError, jwt.InvalidTokenError):
        # Malformed base64 payload, wrong algorithm, or otherwise unparseable.
        return None
    except Exception:
        # Any other unexpected decoding failure must never crash a request.
        return None


def get_current_user_payload() -> dict | None:
    """Extracts JWT token from Authorization header or cookie."""
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif "gearify_token" in request.cookies:
        token = request.cookies.get("gearify_token")

    if not token:
        return None

    return decode_token(token)


def require_auth(f):
    """Decorator requiring a valid logged-in user."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user_payload = get_current_user_payload()
        if not user_payload:
            return jsonify({"error": "Unauthorized", "detail": "Valid authentication token required"}), 401
        request.user = user_payload  # type: ignore
        return f(*args, **kwargs)
    return decorated_function


def require_role(required_role: str):
    """Decorator requiring a specific user role ('admin' or 'mechanic')."""
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            user_payload = get_current_user_payload()
            if not user_payload:
                return jsonify({"error": "Unauthorized", "detail": "Valid authentication token required"}), 401
            if user_payload.get("role") != required_role:
                return jsonify({"error": "Forbidden", "detail": f"Requires {required_role} role"}), 403
            request.user = user_payload  # type: ignore
            return f(*args, **kwargs)
        return decorated_function
    return decorator
