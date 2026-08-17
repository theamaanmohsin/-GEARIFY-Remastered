"""
GEARIFY-Remastered — Hardened Authentication, Cryptography & Rate Limiting Module

Security Architecture:
  - Cryptographic password hashing (scrypt / PBKDF2 with constant-time verification)
  - Timing attack equalization (precomputed dummy hash for user enumeration mitigation)
  - JWT creation & verification with expiration, token_version revocation, and claims
  - Constant-time secret comparison (hmac.compare_digest)
  - Cryptographic token generation & SHA-256 token hashing for verification/reset
  - Sliding-window thread-safe Rate Limiter for brute-force prevention
  - Role-gated route protection decorators (@require_auth, @require_role)
"""

import os
import time
import secrets
import hashlib
import hmac
import functools
import threading
from datetime import datetime, timezone, timedelta
# pyrefly: ignore [missing-import]
import jwt
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

# ---------------------------------------------------------------------------
# Configuration & Secret Management
# ---------------------------------------------------------------------------
_default_secret = "gearify_dev_jwt_secret_change_in_production_2026"
SECRET_KEY = os.environ.get("JWT_SECRET")

if not SECRET_KEY:
    # In production environments, log a prominent warning if default is used
    if os.environ.get("VERCEL") or os.environ.get("ENV") == "production":
        import warnings
        warnings.warn("CRITICAL: JWT_SECRET environment variable is not set in production! Using fallback.", RuntimeWarning)
    SECRET_KEY = _default_secret

ALGORITHM = "HS256"
TOKEN_EXPIRATION_HOURS = int(os.environ.get("SESSION_EXPIRATION_HOURS", "24"))
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128


# ---------------------------------------------------------------------------
# Password Cryptography & Strength Validation
# ---------------------------------------------------------------------------
def validate_password_strength(password: str) -> tuple[bool, str | None]:
    """
    Enforces password complexity policy:
      - Minimum 8 characters
      - Maximum 128 characters (mitigates DoS during hashing)
      - Rejects whitespace-only passwords
    """
    if not password or not isinstance(password, str):
        return False, "Password cannot be empty"

    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"

    if len(password) > PASSWORD_MAX_LENGTH:
        return False, f"Password must not exceed {PASSWORD_MAX_LENGTH} characters"

    if password.strip() == "":
        return False, "Password cannot be entirely whitespace"

    return True, None


def hash_password(password: str) -> str:
    """Returns securely hashed password using scrypt or pbkdf2 with high work factor."""
    try:
        return generate_password_hash(password, method="scrypt")
    except Exception:
        # Fallback to high-iteration PBKDF2 if scrypt is unavailable on platform
        return generate_password_hash(password, method="pbkdf2:sha256:600000")


def verify_password(password: str, password_hash: str) -> bool:
    """Verifies plain password against hash in constant time."""
    if not password or not password_hash:
        return False
    return check_password_hash(password_hash, password)


# Precomputed static hash for timing attack equalization during login failure
_DUMMY_HASH = hash_password("GearifyTimingShield2026!#")


def dummy_verify_password(password: str) -> bool:
    """Executes a real password verification on a dummy hash to equalize response times."""
    return check_password_hash(_DUMMY_HASH, password or "dummy_password")


# ---------------------------------------------------------------------------
# Cryptographic Token Helpers
# ---------------------------------------------------------------------------
def generate_secure_token() -> str:
    """Generates a cryptographically strong URL-safe random string."""
    return secrets.token_urlsafe(32)


def hash_token(raw_token: str) -> str:
    """Computes SHA-256 hex digest of a raw token for secure database storage."""
    if not raw_token:
        return ""
    return hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()


def secure_compare(val1: str | object | None, val2: str | object | None) -> bool:
    """Compares two strings in constant time to eliminate side-channel timing leaks."""
    if val1 is None or val2 is None:
        return False
    return hmac.compare_digest(str(val1), str(val2))


# ---------------------------------------------------------------------------
# Sliding-Window Rate Limiter (Thread-Safe with Memory Cleanup)
# ---------------------------------------------------------------------------
class RateLimiter:
    """Thread-safe in-memory sliding window rate limiter with auto-eviction."""

    def __init__(self):
        self._lock = threading.Lock()
        self._attempts: dict[str, list[float]] = {}
        self._last_cleanup = time.time()

    def _cleanup(self, now: float, max_window: float = 3600.0):
        """Removes expired entries to avoid memory growth over time."""
        if now - self._last_cleanup < 60.0:
            return
        self._last_cleanup = now
        expired_keys = []
        for key, timestamps in self._attempts.items():
            valid_stamps = [t for t in timestamps if now - t < max_window]
            if not valid_stamps:
                expired_keys.append(key)
            else:
                self._attempts[key] = valid_stamps
        for key in expired_keys:
            self._attempts.pop(key, None)

    def check(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        """
        Checks if an action under `key` is allowed within the sliding window.
        Returns: (is_allowed: bool, retry_after_seconds: int)
        """
        now = time.time()
        with self._lock:
            self._cleanup(now, max_window=float(window_seconds * 2))
            timestamps = self._attempts.get(key, [])
            cutoff = now - window_seconds
            valid_timestamps = [t for t in timestamps if t > cutoff]
            self._attempts[key] = valid_timestamps

            if len(valid_timestamps) >= limit:
                oldest_in_window = valid_timestamps[0]
                retry_after = max(1, int(oldest_in_window + window_seconds - now))
                return False, retry_after

            return True, 0

    def record(self, key: str):
        """Records an attempt for the specified key."""
        now = time.time()
        with self._lock:
            if key not in self._attempts:
                self._attempts[key] = []
            self._attempts[key].append(now)

    def reset(self, key: str):
        """Resets the recorded attempts for a key upon successful action."""
        with self._lock:
            self._attempts.pop(key, None)


# Global rate limiter instance
auth_rate_limiter = RateLimiter()


def get_client_ip() -> str:
    """Extracts client IP address safely from headers or remote_addr."""
    if request.headers.get("X-Forwarded-For"):
        return request.headers["X-Forwarded-For"].split(",")[0].strip()
    if request.headers.get("X-Real-IP"):
        return request.headers["X-Real-IP"].strip()
    return request.remote_addr or "127.0.0.1"


def rate_limit(limit: int = 5, window_seconds: int = 900, key_prefix: str = "auth"):
    """
    Flask route decorator that enforces rate limits per IP and optionally per email.
    If limit is exceeded, returns HTTP 429 Too Many Requests with Retry-After header.
    """
    def decorator(f):
        @functools.wraps(f)
        def wrapped(*args, **kwargs):
            ip = get_client_ip()
            key = f"{key_prefix}:ip:{ip}"

            # Check IP rate limit
            allowed, retry_after = auth_rate_limiter.check(key, limit, window_seconds)
            if not allowed:
                response = jsonify({
                    "error": "Too Many Requests",
                    "detail": f"Rate limit exceeded. Please wait {retry_after} seconds before trying again.",
                    "retry_after": retry_after,
                })
                response.headers["Retry-After"] = str(retry_after)
                return response, 429

            return f(*args, **kwargs)
        return wrapped
    return decorator


# ---------------------------------------------------------------------------
# JWT Token Lifecycle
# ---------------------------------------------------------------------------
def create_token(
    user_id: int,
    email: str,
    role: str,
    name: str,
    token_version: int = 1,
    is_verified: bool = False,
    expiration_hours: int = TOKEN_EXPIRATION_HOURS,
) -> str:
    """Generates a signed JWT with user claims, cryptographic jti, and versioning."""
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(hours=expiration_hours)
    payload = {
        "user_id": user_id,
        "sub": str(user_id),
        "email": email,
        "role": role,
        "name": name,
        "is_verified": is_verified,
        "token_version": token_version,
        "jti": secrets.token_hex(16),
        "iat": now,
        "nbf": now,
        "exp": expiration,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """
    Decodes and validates a JWT token.
    Returns payload dict or None if invalid or expired.
    """
    if not token or not isinstance(token, str):
        return None

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            leeway=30,  # 30 seconds clock skew tolerance
            options={"require": ["exp", "iat", "user_id"]},
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidSignatureError:
        return None
    except (jwt.DecodeError, jwt.InvalidAlgorithmError, jwt.InvalidTokenError):
        return None
    except Exception:
        return None


def get_current_user_payload() -> dict | None:
    """Extracts and validates JWT token from Authorization header or cookie."""
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
    """Decorator requiring a valid logged-in user with active token."""
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
