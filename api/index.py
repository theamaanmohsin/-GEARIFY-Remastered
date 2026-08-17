"""
GEARIFY-Remastered — Flask API Serverless Core

Entry point for Vercel functions (`vercel.json` rewrites `/api/*` to `api/index.py`).
Implements Phase 1, Phase 2, and Phase 3 API endpoints.
"""

import os
from datetime import datetime, timezone, timedelta
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request, make_response, send_from_directory, send_file
# pyrefly: ignore [missing-import]
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import joinedload
# pyrefly: ignore [missing-import]
from sqlalchemy import func

from api.models import (
    Base, User, Vehicle, ServicePart, ServiceRecord, ServiceLineItem,
    Setting, get_engine, get_session, init_db
)
from api.auth import (
    hash_password, verify_password, dummy_verify_password, validate_password_strength,
    create_token, decode_token, get_current_user_payload, require_auth, require_role,
    generate_secure_token, hash_token, secure_compare, auth_rate_limiter, get_client_ip,
    rate_limit
)
from api.validators import (
    sanitize_text, sanitize_search_query, validate_email_address,
    validate_registration_no, validate_integer_range, validate_image_file
)

app = Flask(__name__)

# CORS Setup
# pyrefly: ignore
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            os.environ.get("FRONTEND_URL", ""),
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
    }
})

# Initialize and verify database tables on cold start
try:
    init_db()
except Exception as e:
    print(f"Warning on init_db: {e}")


# ---------------------------------------------------------------------------
# Health Score Calculation (pure Python)
# ---------------------------------------------------------------------------
def calculate_health_score(
    current_km: int,
    km_at_last_service: int | None,
    next_service_km: int | None,
    last_service_date: datetime | None,
    has_flagged_issues: bool = False,
) -> int:
    if km_at_last_service is None or next_service_km is None:
        return 50

    service_interval = max(next_service_km - km_at_last_service, 1)
    km_since = max(current_km - km_at_last_service, 0)
    km_ratio = min(km_since / service_interval, 2.0)

    days_ratio = 0.0
    if last_service_date:
        now = datetime.now(timezone.utc)
        if last_service_date.tzinfo is None:
            last_service_date = last_service_date.replace(tzinfo=timezone.utc)
        # Guard against negative values if the server's clock is skewed ahead of
        # the recorded service date (future timestamps would otherwise inflate
        # the health score computation with a negative time decay).
        days_since = max((now - last_service_date).days, 0)
        days_ratio = min(days_since / 180.0, 2.0)

    flagged_penalty = 1.0 if has_flagged_issues else 0.0

    score = 100 - (km_ratio * 40) - (days_ratio * 30) - (flagged_penalty * 30)
    return max(0, min(100, round(score)))


def get_status_from_score(score: int) -> str:
    if score >= 80:
        return "good"
    elif score >= 50:
        return "warning"
    else:
        return "danger"


def safe_int(value) -> int:
    """Coerces a DB aggregation result to a plain int without raising.

    SQLAlchemy aggregation rows (sum/count labels) can be ``None``, ``Decimal``,
    ``float``, or ``str`` depending on the backend (SQLite vs Postgres). This
    helper normalises any of them to ``int`` and falls back to ``0`` on failure
    so analytics and KPI endpoints never crash on type edge cases.
    """
    if value is None:
        return 0
    if isinstance(value, bool):
        return int(value)
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


_default_settings = [
    Setting(key="admin_key", value="GearifyAPMS"),
    Setting(key="default_currency", value="PKR"),
]


def seed_default_settings(session) -> None:
    """Creates default admin_key / default_currency settings if they are missing.

    Defensive cold-start guard so registration (which reads admin_key) and
    receipt generation (which reads default_currency) never hit a settings table
    that was created without its seed rows (e.g. fresh DB or partial migration).
    """
    try:
        for default in _default_settings:
            exists = (
                session.query(Setting).filter_by(key=default.key).first()
            )
            if not exists:
                session.add(Setting(key=default.key, value=default.value))
        session.commit()
    except Exception as e:
        session.rollback()
        app.logger.warning(f"Default settings seeding skipped: {e}")


_db_initialized = False

@app.before_request
def ensure_db():
    global _db_initialized
    if not _db_initialized:
        try:
            init_db()
            _db_initialized = True
        except Exception as e:
            app.logger.error(f"DB init failed: {e}")
            return

        # Cold-start settings seeding — safe to run repeatedly.
        try:
            session = get_session()
            try:
                seed_default_settings(session)
            finally:
                session.close()
        except Exception as e:
            app.logger.warning(f"Settings seed error: {e}")


@app.after_request
def add_no_cache_headers(response):
    """Ensure dynamic API JSON responses are not cached, while allowing QR and static images to be cached."""
    if request.path.startswith("/api/") and not request.path.endswith("/qr"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


# ---------------------------------------------------------------------------
# Health & Status
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    try:
        session = get_session()
        session.execute(func.now())
        session.close()
        return jsonify({"status": "ok", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "database": str(e)}), 500


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------
def set_auth_cookie(response, token: str):
    """Sets secure, HttpOnly, SameSite=Lax authentication cookie."""
    is_secure = request.is_secure or os.environ.get("VERCEL") == "1" or os.environ.get("ENV") == "production"
    response.set_cookie(
        "gearify_token",
        token,
        path="/",
        httponly=True,
        samesite="Lax",
        secure=is_secure,
        max_age=86400,
    )
    return response


# ---------------------------------------------------------------------------
# Auth Endpoints (Hardened & Rate-Limited)
# ---------------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
@rate_limit(limit=10, window_seconds=900, key_prefix="register")
def register_user():
    """
    Registers a new user (mechanic or admin).
    - Enforces password complexity (min 8 chars, non-whitespace).
    - If role == 'admin', validates secret_key using constant-time comparison.
    - Generates 24-hour expiring email verification token.
    """
    data = request.get_json() or {}
    raw_email = data.get("email", "")
    name = sanitize_text(data.get("name", ""), max_length=100)
    password = data.get("password", "")
    role = data.get("role", "mechanic").lower()
    secret_key = data.get("secret_key", "").strip()

    valid_email, email_error, email = validate_email_address(raw_email)
    if not valid_email:
        return jsonify({"error": email_error}), 400

    if not name or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if role not in ["mechanic", "admin"]:
        return jsonify({"error": "Invalid role. Must be 'mechanic' or 'admin'"}), 400

    # Password complexity check
    valid_password, password_error = validate_password_strength(password)
    if not valid_password:
        return jsonify({"error": password_error}), 400

    session = get_session()
    try:
        # If admin registration, check secret key with constant-time comparison
        if role == "admin":
            admin_setting = session.query(Setting).filter_by(key="admin_key").first()
            current_admin_key = str(admin_setting.value) if admin_setting else "GearifyAPMS"
            if not secure_compare(secret_key, current_admin_key):
                return jsonify({"error": "Invalid Admin Security Key. Access Denied."}), 403

        # Check existing user
        existing = session.query(User).filter_by(email=email).first()
        if existing:
            return jsonify({"error": "An account with this email already exists"}), 400

        # Generate email verification token (24-hour expiration)
        raw_verify_token = generate_secure_token()
        verify_token_hash = hash_token(raw_verify_token)
        verify_expires = datetime.now(timezone.utc) + timedelta(hours=24)

        # Admin accounts are pre-verified; mechanics receive verification token
        is_verified = (role == "admin")

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            is_verified=is_verified,
            verification_token_hash=verify_token_hash if not is_verified else None,
            verification_token_expires_at=verify_expires if not is_verified else None,
            failed_login_attempts=0,
            locked_until=None,
            token_version=1,
        )
        session.add(user)
        session.commit()

        user_id = int(getattr(user, "id"))
        user_email = str(getattr(user, "email"))
        user_role = str(getattr(user, "role"))
        user_name = str(getattr(user, "name"))
        token_ver = int(getattr(user, "token_version", 1))

        token = create_token(
            user_id=user_id,
            email=user_email,
            role=user_role,
            name=user_name,
            token_version=token_ver,
            is_verified=is_verified,
        )

        res_data = {
            "message": "Registration successful",
            "user": user.to_dict(),
            "token": token,
        }
        # In dev or unverified state, return verification link payload
        if not is_verified:
            res_data["verification_token"] = raw_verify_token

        res = jsonify(res_data)
        set_auth_cookie(res, token)
        return res, 201

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Registration failed", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/auth/login", methods=["POST"])
def login_user():
    """
    Authenticates user with email and password.
    - Protected by IP & Email sliding window rate limiter.
    - Account-level lockout after 5 consecutive failed attempts.
    - Constant-time dummy hash equalization to mitigate user enumeration timing attacks.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    ip = get_client_ip()
    ip_key = f"login:ip:{ip}"
    email_key = f"login:email:{email}"

    # Check IP rate limit (5 attempts per 15 minutes)
    allowed, retry_after = auth_rate_limiter.check(ip_key, limit=5, window_seconds=900)
    if not allowed:
        res = jsonify({
            "error": "Too Many Requests",
            "detail": f"Too many failed attempts. Please wait {retry_after} seconds before trying again.",
            "retry_after": retry_after,
        })
        res.headers["Retry-After"] = str(retry_after)
        return res, 429

    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()

        # Non-existent user timing equalization
        if not user:
            dummy_verify_password(password)
            auth_rate_limiter.record(ip_key)
            return jsonify({"error": "Invalid email or password"}), 401

        # Check account-level lockout
        now = datetime.now(timezone.utc)
        locked_until = getattr(user, "locked_until", None)
        if locked_until:
            if locked_until.tzinfo is None:
                locked_until = locked_until.replace(tzinfo=timezone.utc)
            if locked_until > now:
                lockout_remaining = max(1, int((locked_until - now).total_seconds()))
                res = jsonify({
                    "error": "Account Locked",
                    "detail": f"Account is temporarily locked due to multiple failed login attempts. Try again in {lockout_remaining} seconds.",
                    "retry_after": lockout_remaining,
                })
                res.headers["Retry-After"] = str(lockout_remaining)
                return res, 429

        # Verify password in constant time
        if not verify_password(password, str(user.password_hash)):
            # Increment failed attempts
            current_failures = int(getattr(user, "failed_login_attempts", 0) or 0) + 1
            setattr(user, "failed_login_attempts", current_failures)
            auth_rate_limiter.record(ip_key)
            auth_rate_limiter.record(email_key)

            if current_failures >= 5:
                lock_duration = timedelta(minutes=15)
                setattr(user, "locked_until", now + lock_duration)
                session.commit()
                res = jsonify({
                    "error": "Account Locked",
                    "detail": "Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.",
                    "retry_after": 900,
                })
                res.headers["Retry-After"] = "900"
                return res, 429

            session.commit()
            return jsonify({"error": "Invalid email or password"}), 401

        # Successful login: reset failed counters and unlock
        setattr(user, "failed_login_attempts", 0)
        setattr(user, "locked_until", None)
        session.commit()

        # Reset rate limiter
        auth_rate_limiter.reset(ip_key)
        auth_rate_limiter.reset(email_key)

        user_id = int(getattr(user, "id"))
        user_email = str(getattr(user, "email"))
        user_role = str(getattr(user, "role"))
        user_name = str(getattr(user, "name"))
        token_ver = int(getattr(user, "token_version", 1))
        is_verified = bool(getattr(user, "is_verified", False))

        token = create_token(
            user_id=user_id,
            email=user_email,
            role=user_role,
            name=user_name,
            token_version=token_ver,
            is_verified=is_verified,
        )

        res = jsonify({"message": "Login successful", "user": user.to_dict(), "token": token})
        set_auth_cookie(res, token)
        return res

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Login failed", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/auth/verify-email", methods=["POST", "GET"])
def verify_email():
    """
    Verifies a user's email address using a cryptographic single-use token.
    Accepts JSON body `{"token": "..."}` or query parameter `?token=...`.
    """
    raw_token = ""
    if request.method == "GET":
        raw_token = request.args.get("token", "").strip()
    else:
        data = request.get_json() or {}
        raw_token = data.get("token", "").strip()

    if not raw_token:
        return jsonify({"error": "Verification token is required"}), 400

    token_hash = hash_token(raw_token)
    session = get_session()
    try:
        user = session.query(User).filter_by(verification_token_hash=token_hash).first()
        now = datetime.now(timezone.utc)

        if not user:
            return jsonify({"error": "Invalid or expired email verification token"}), 400

        expires_at = getattr(user, "verification_token_expires_at", None)
        if not expires_at:
            return jsonify({"error": "Invalid or expired email verification token"}), 400

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            return jsonify({"error": "Email verification token has expired. Please request a new one."}), 400

        # Mark verified and clear verification tokens
        setattr(user, "is_verified", True)
        setattr(user, "verification_token_hash", None)
        setattr(user, "verification_token_expires_at", None)
        session.commit()

        # Issue refreshed token with is_verified=True
        refreshed_token = create_token(
            user_id=int(getattr(user, "id")),
            email=str(getattr(user, "email")),
            role=str(getattr(user, "role")),
            name=str(getattr(user, "name")),
            token_version=int(getattr(user, "token_version", 1)),
            is_verified=True,
        )

        res = jsonify({
            "message": "Email address verified successfully!",
            "user": user.to_dict(),
            "token": refreshed_token,
        })
        set_auth_cookie(res, refreshed_token)
        return res

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Email verification failed", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/auth/resend-verification", methods=["POST"])
@rate_limit(limit=3, window_seconds=900, key_prefix="resend_verify")
def resend_verification():
    """
    Generates and sends a new 24-hour email verification token.
    Always returns uniform message to prevent email enumeration.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    # Fallback to logged-in user if no email is provided in body
    if not email:
        user_payload = get_current_user_payload()
        if user_payload:
            email = user_payload.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email address is required"}), 400

    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        raw_token = None

        if user and not getattr(user, "is_verified", False):
            raw_token = generate_secure_token()
            setattr(user, "verification_token_hash", hash_token(raw_token))
            setattr(user, "verification_token_expires_at", datetime.now(timezone.utc) + timedelta(hours=24))
            session.commit()

        res_data = {"message": "If an unverified account exists with that email, a new verification link has been generated."}
        if raw_token:
            res_data["verification_token"] = raw_token

        return jsonify(res_data)

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to resend verification", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/auth/forgot-password", methods=["POST"])
@rate_limit(limit=3, window_seconds=900, key_prefix="forgot_pw")
def forgot_password():
    """
    Initiates password reset flow.
    Generates a cryptographically strong, single-use reset token valid for 15 minutes.
    Always returns uniform response to mitigate email enumeration.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email address is required"}), 400

    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        raw_reset_token = None

        if user:
            raw_reset_token = generate_secure_token()
            token_hash = hash_token(raw_reset_token)
            setattr(user, "reset_token_hash", token_hash)
            setattr(user, "reset_token_expires_at", datetime.now(timezone.utc) + timedelta(minutes=15))
            session.commit()

        res_data = {
            "message": "If an account with that email exists, a password reset link has been generated and expires in 15 minutes."
        }
        # In development/local mode, provide the token for verification
        if raw_reset_token:
            res_data["reset_token"] = raw_reset_token

        return jsonify(res_data)

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Password reset request failed", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/auth/reset-password", methods=["POST"])
@rate_limit(limit=5, window_seconds=900, key_prefix="reset_pw")
def reset_password():
    """
    Completes password reset using a single-use token.
    - Validates token hash and 15-minute expiration window.
    - Enforces password complexity.
    - Updates password hash.
    - Invalidates the reset token immediately (single use).
    - Increments token_version to invalidate all existing sessions.
    """
    data = request.get_json() or {}
    raw_token = data.get("token", "").strip()
    new_password = data.get("new_password", "")

    if not raw_token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    valid_password, password_error = validate_password_strength(new_password)
    if not valid_password:
        return jsonify({"error": password_error}), 400

    token_hash = hash_token(raw_token)
    session = get_session()
    try:
        user = session.query(User).filter_by(reset_token_hash=token_hash).first()
        now = datetime.now(timezone.utc)

        if not user:
            return jsonify({"error": "Invalid or expired password reset token"}), 400

        expires_at = getattr(user, "reset_token_expires_at", None)
        if not expires_at:
            return jsonify({"error": "Invalid or expired password reset token"}), 400

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            return jsonify({"error": "Password reset token has expired. Please request a new link."}), 400

        # Update password with strong scrypt hash
        setattr(user, "password_hash", hash_password(new_password))
        # Clear reset token (single use)
        setattr(user, "reset_token_hash", None)
        setattr(user, "reset_token_expires_at", None)
        # Invalidate all prior active JWT sessions
        setattr(user, "token_version", int(getattr(user, "token_version", 1) or 1) + 1)
        # Clear any lockouts / failed attempts
        setattr(user, "failed_login_attempts", 0)
        setattr(user, "locked_until", None)
        session.commit()

        return jsonify({
            "message": "Password reset successfully. All previous sessions have been logged out. Please sign in with your new password."
        })

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Password reset failed", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def get_current_user():
    payload = getattr(request, "user", {})
    return jsonify({"user": payload})


@app.route("/api/auth/logout", methods=["POST"])
def logout_user():
    res = jsonify({"message": "Logged out successfully"})
    is_secure = request.is_secure or os.environ.get("VERCEL") == "1" or os.environ.get("ENV") == "production"
    res.set_cookie("gearify_token", "", path="/", expires=0, httponly=True, samesite="Lax", secure=is_secure)
    return res


# ---------------------------------------------------------------------------
# Vehicles Endpoints
# ---------------------------------------------------------------------------
@app.route("/api/vehicles", methods=["GET"])
@require_auth
@rate_limit(limit=60, window_seconds=60, key_prefix="vehicles_list")
def list_vehicles():
    session = get_session()
    try:
        query = session.query(Vehicle).options(joinedload(Vehicle.service_records))

        search_term = sanitize_search_query(request.args.get("q", ""))
        if search_term:
            like_pattern = f"%{search_term}%"
            query = query.filter(
                (Vehicle.registration_no.ilike(like_pattern)) |
                (Vehicle.make.ilike(like_pattern)) |
                (Vehicle.model.ilike(like_pattern)) |
                (Vehicle.owner_name.ilike(like_pattern))
            )

        vehicles = query.order_by(Vehicle.created_at.desc()).all()

        result = []
        for v in vehicles:
            data = v.to_dict(include_latest_service=True)
            ls = data.get("latest_service")
            if ls and isinstance(ls, dict):
                score = calculate_health_score(
                    current_km=int(getattr(v, "current_km", 0)),
                    km_at_last_service=int(ls.get("km_at_service", 0)),
                    next_service_km=int(ls.get("next_service_km", 0)),
                    last_service_date=v.service_records[0].created_at if v.service_records else None,
                    has_flagged_issues=bool(v.service_records[0].mechanic_notes) if v.service_records else False,
                )
            else:
                score = 50

            data["health_score"] = score
            data["status"] = get_status_from_score(score)
            result.append(data)

        return jsonify({"vehicles": result, "count": len(result)})

    finally:
        session.close()


@app.route("/api/vehicles", methods=["POST"])
@require_auth
@rate_limit(limit=20, window_seconds=60, key_prefix="vehicle_create")
def create_vehicle():
    data = request.get_json() or {}
    raw_reg = data.get("registration_no", "")
    make = sanitize_text(data.get("make", ""), max_length=100)
    model = sanitize_text(data.get("model", ""), max_length=100)
    vehicle_type = data.get("vehicle_type", "car").lower()
    owner_name = sanitize_text(data.get("owner_name", ""), max_length=150) or None
    owner_phone = sanitize_text(data.get("owner_phone", ""), max_length=20) or None
    vin = sanitize_text(data.get("vin", ""), max_length=17).upper() or None

    valid_reg, reg_error, reg_no = validate_registration_no(raw_reg)
    if not valid_reg:
        return jsonify({"error": reg_error}), 400

    valid_year, year_error, year_val = validate_integer_range(data.get("year"), "Year", 1900, 2030)
    if not valid_year:
        return jsonify({"error": year_error}), 400

    valid_km, km_error, km_val = validate_integer_range(data.get("current_km", 0), "Current KM", 0, 2000000, default=0)
    if not valid_km:
        return jsonify({"error": km_error}), 400

    session = get_session()
    try:
        existing = session.query(Vehicle).filter_by(registration_no=reg_no).first()
        if existing:
            return jsonify({"error": f"Vehicle with plate {reg_no} already exists", "vehicle": existing.to_dict()}), 400

        vehicle = Vehicle(
            registration_no=reg_no,
            make=make,
            model=model,
            year=year_val,
            current_km=km_val,
            vehicle_type=vehicle_type,
            owner_name=owner_name,
            owner_phone=owner_phone,
            vin=vin,
        )
        session.add(vehicle)
        session.commit()

        return jsonify({"message": "Vehicle created successfully", "vehicle": vehicle.to_dict()}), 201

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to create vehicle", "detail": str(e)}), 500
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Services Endpoints — **Every part category is optional/nullable**
# ---------------------------------------------------------------------------
@app.route("/api/services", methods=["POST"])
@require_auth
@rate_limit(limit=20, window_seconds=60, key_prefix="service_create")
def create_service():
    """
    Creates a new service entry.
    Each part category (engine oil, air filter, oil filter, bike consumables) is optional!
    Calculates cost only from selected parts + labor_cost.
    Computes predictive next_service_km (+15,000 for cars, +3,000 for motorcycles).
    """
    data = request.get_json() or {}
    raw_reg = data.get("registration_no", "")
    make = sanitize_text(data.get("make", ""), max_length=100)
    model = sanitize_text(data.get("model", ""), max_length=100)
    year = data.get("year")
    
    valid_reg, reg_error, reg_no = validate_registration_no(raw_reg)
    if not valid_reg:
        return jsonify({"error": reg_error}), 400

    valid_km, km_error, km_at_service = validate_integer_range(data.get("current_km"), "Current odometer KM", 0, 2000000)
    if not valid_km:
        return jsonify({"error": km_error}), 400

    _, _, labor_cost = validate_integer_range(data.get("labor_cost", 0), "Labor cost", 0, 10000000, default=0)
    vehicle_type = data.get("vehicle_type", "car").lower()
    mechanic_notes = sanitize_text(data.get("notes", ""), max_length=2000) or None
    
    raw_part_ids = data.get("part_ids", [])
    selected_part_ids = []
    if isinstance(raw_part_ids, list):
        for pid in raw_part_ids:
            try:
                selected_part_ids.append(int(pid))
            except (ValueError, TypeError):
                pass

    user_payload = request.user  # type: ignore
    mechanic_id = user_payload.get("user_id", 1)

    if not reg_no:
        return jsonify({"error": "Registration number is required"}), 400

    session = get_session()
    try:
        # Get or create vehicle (ported from v1's auto-creation in maintenance route)
        vehicle = session.query(Vehicle).filter_by(registration_no=reg_no).first()
        if not vehicle:
            if not make or not model or not year:
                return jsonify({"error": "Make, model, and year required for new vehicle"}), 400
            try:
                year_val = int(year)
            except (ValueError, TypeError):
                return jsonify({"error": "Year must be a valid number"}), 400

            vehicle = Vehicle(
                registration_no=reg_no,
                make=make,
                model=model,
                year=year_val,
                current_km=int(km_at_service),
                vehicle_type=vehicle_type,
            )
            session.add(vehicle)
            session.flush()
        else:
            # Update vehicle odometer reading
            v_curr_km = int(getattr(vehicle, "current_km", 0))
            setattr(vehicle, "current_km", max(v_curr_km, km_at_service))

        # Predictive service calculation: +15,000 for car/lcv, +3,000 for motorcycle
        interval = 3000 if getattr(vehicle, "vehicle_type") == "motorcycle" else 15000
        next_service_km = km_at_service + interval

        # Calculate line items and total cost (only for selected parts!)
        total_cost = labor_cost
        line_items = []

        if selected_part_ids:
            parts = session.query(ServicePart).filter(ServicePart.id.in_(selected_part_ids)).all()
            # Dictionary lookup so duplicate part IDs (e.g. a part wrongly sent
            # twice) still resolve to the same part and are priced/listed once,
            # keeping line items and the grand total accurate.
            parts_map = {getattr(part, "id"): part for part in parts}
            seen_ids = set()
            for pid in selected_part_ids:
                part = parts_map.get(pid)
                if part is None or part.id in seen_ids:
                    continue
                seen_ids.add(part.id)
                cost = part.unit_price
                total_cost += cost
                line_items.append(
                    ServiceLineItem(
                        service_part_id=part.id,
                        part_name_snapshot=part.name,
                        unit_price_snapshot=cost,
                        quantity=1,
                        subtotal=cost,
                    )
                )

        # Get shop currency setting
        curr_setting = session.query(Setting).filter_by(key="default_currency").first()
        currency = curr_setting.value if curr_setting else "PKR"

        service_record = ServiceRecord(
            vehicle_id=vehicle.id,
            mechanic_id=mechanic_id,
            labor_cost=labor_cost,
            total_cost=total_cost,
            currency=currency,
            km_at_service=int(km_at_service),
            next_service_km=next_service_km,
            mechanic_notes=mechanic_notes,
            line_items=line_items,
        )

        session.add(service_record)
        session.commit()

        # Build response receipt object
        receipt = {
            "id": service_record.id,
            "date": service_record.created_at.strftime("%Y-%m-%d"),
            "mechanic_name": user_payload.get("name", "Mechanic"),
            "reg_no": vehicle.registration_no,
            "car": f"{vehicle.make} {vehicle.model} ({vehicle.year})",
            "vehicle_type": vehicle.vehicle_type,
            "km_at_service": service_record.km_at_service,
            "next_service_km": service_record.next_service_km,
            "parts": [
                {"name": li.part_name_snapshot, "price": li.unit_price_snapshot}
                for li in service_record.line_items
            ],
            "labor_cost": labor_cost,
            "total_cost": total_cost,
            "currency": currency,
        }

        return jsonify({"message": "Service entry created successfully", "receipt": receipt}), 201

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to create service entry", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/services/history", methods=["GET"])
@require_auth
@rate_limit(limit=60, window_seconds=60, key_prefix="services_history")
def get_service_history():
    """
    Searchable service history table.
    Supports query parameters: ?q=search_term
    """
    user_payload = request.user  # type: ignore
    user_id = user_payload.get("user_id", 1)
    role = user_payload.get("role", "mechanic")

    session = get_session()
    try:
        query = session.query(ServiceRecord).options(
            joinedload(ServiceRecord.vehicle),
            joinedload(ServiceRecord.mechanic),
            joinedload(ServiceRecord.line_items),
        )

        if role != "admin":
            query = query.filter(ServiceRecord.mechanic_id == user_id)

        search_term = request.args.get("q", "").strip()
        if search_term:
            like_pattern = f"%{search_term}%"
            query = query.join(Vehicle).filter(
                (Vehicle.registration_no.ilike(like_pattern)) |
                (Vehicle.make.ilike(like_pattern)) |
                (Vehicle.model.ilike(like_pattern))
            )

        records = query.order_by(ServiceRecord.created_at.desc()).all()

        results = []
        for r in records:
            results.append({
                "id": r.id,
                "date": r.created_at.strftime("%Y-%m-%d"),
                "reg_no": r.vehicle.registration_no if r.vehicle else "N/A",
                "car": f"{r.vehicle.make} {r.vehicle.model} ({r.vehicle.year})" if r.vehicle else "Unknown",
                "mechanic_name": r.mechanic.name if r.mechanic else "Mechanic",
                "total_cost": r.total_cost,
                "currency": r.currency,
                "km_at_service": r.km_at_service,
                "next_service_km": r.next_service_km,
                "items_count": len(getattr(r, "line_items", [])),
            })

        return jsonify({"history": results, "count": len(results)})

    finally:
        session.close()


@app.route("/api/services/<int:service_id>", methods=["GET"])
@require_auth
@rate_limit(limit=60, window_seconds=60, key_prefix="service_receipt")
def get_service_receipt(service_id):
    """Single receipt view by ID."""
    user_payload = request.user  # type: ignore
    user_id = user_payload.get("user_id", 1)
    role = user_payload.get("role", "mechanic")

    session = get_session()
    try:
        record = session.query(ServiceRecord).options(
            joinedload(ServiceRecord.vehicle),
            joinedload(ServiceRecord.mechanic),
            joinedload(ServiceRecord.line_items),
        ).filter_by(id=service_id).first()

        if not record:
            return jsonify({"error": "Service record not found"}), 404
            
        if record.mechanic_id != user_id and role != "admin":
            return jsonify({"error": "Forbidden: You do not have permission to view this record"}), 403

        receipt = {
            "id": record.id,
            "date": record.created_at.strftime("%Y-%m-%d %H:%M"),
            "mechanic_name": record.mechanic.name if record.mechanic else "Mechanic",
            "reg_no": record.vehicle.registration_no if record.vehicle else "N/A",
            "car": f"{record.vehicle.make} {record.vehicle.model} ({record.vehicle.year})" if record.vehicle else "",
            "vehicle_type": record.vehicle.vehicle_type if record.vehicle else "car",
            "km_at_service": record.km_at_service,
            "next_service_km": record.next_service_km,
            "parts": [
                {"name": li.part_name_snapshot, "price": li.unit_price_snapshot}
                for li in record.line_items
            ],
            "labor_cost": record.labor_cost,
            "total_cost": record.total_cost,
            "currency": record.currency,
            "notes": record.mechanic_notes,
        }

        return jsonify({"receipt": receipt})

    finally:
        session.close()


@app.route("/api/services/<int:service_id>", methods=["DELETE"])
@require_role("admin")
def delete_service_record(service_id):
    """Admin-only deletion of service record."""
    session = get_session()
    try:
        record = session.query(ServiceRecord).filter_by(id=service_id).first()
        if not record:
            return jsonify({"error": "Record not found"}), 404

        session.delete(record)
        session.commit()
        return jsonify({"message": "Service record deleted successfully"})
    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to delete record", "detail": str(e)}), 500
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Parts Pricing & Inventory Endpoints (Admin console)
# ---------------------------------------------------------------------------
@app.route("/api/parts", methods=["GET"])
@require_auth
def list_parts():
    session = get_session()
    try:
        query = session.query(ServicePart)
        vehicle_type = request.args.get("vehicle_type")
        if vehicle_type:
            query = query.filter(
                (ServicePart.vehicle_type_scope == vehicle_type) |
                (ServicePart.vehicle_type_scope == "all")
            )

        category = request.args.get("category")
        if category:
            query = query.filter(ServicePart.category == category)

        parts = query.order_by(ServicePart.category, ServicePart.name).all()
        return jsonify({"parts": [p.to_dict() for p in parts], "count": len(parts)})

    finally:
        session.close()


@app.route("/api/parts/<int:part_id>", methods=["PUT"])
@require_role("admin")
def update_part_price(part_id):
    """
    Admin item-level price update. Opens one part and updates its price alone.
    """
    data = request.get_json() or {}
    new_price = data.get("unit_price")

    if new_price is None:
        return jsonify({"error": "Valid positive unit_price is required"}), 400

    # Validate a coercible positive integer price, catching malformed strings
    # (e.g. "abc") that previously raised an unhandled ValueError -> 500.
    try:
        new_price_int = int(float(new_price))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid positive unit_price is required"}), 400

    if new_price_int < 0:
        return jsonify({"error": "Valid positive unit_price is required"}), 400

    session = get_session()
    try:
        part = session.query(ServicePart).filter_by(id=part_id).first()
        if not part:
            return jsonify({"error": "Part not found"}), 404

        setattr(part, "unit_price", new_price_int)
        if "name" in data:
            setattr(part, "name", data["name"])
        if "brand" in data:
            setattr(part, "brand", data["brand"])

        session.commit()
        return jsonify({"message": "Part updated successfully", "part": part.to_dict()})

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to update part", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/parts", methods=["POST"])
@require_role("admin")
def add_new_part():
    """Admin adds a new catalog item."""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    brand = data.get("brand", "").strip()
    category = data.get("category", "").strip()
    unit_price = data.get("unit_price")
    vehicle_type_scope = data.get("vehicle_type_scope", "all")

    if not name or not brand or not category or unit_price is None:
        return jsonify({"error": "Name, brand, category, and unit_price are required"}), 400

    session = get_session()
    try:
        curr_setting = session.query(Setting).filter_by(key="default_currency").first()
        currency = curr_setting.value if curr_setting else "PKR"

        part = ServicePart(
            name=name,
            brand=brand,
            category=category,
            vehicle_type_scope=vehicle_type_scope,
            unit_price=int(unit_price),
            currency=currency,
        )
        session.add(part)
        session.commit()

        return jsonify({"message": "Part created successfully", "part": part.to_dict()}), 201

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to add part", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/parts/<int:part_id>", methods=["DELETE"])
@require_role("admin")
def delete_part(part_id):
    """Soft delete part item."""
    session = get_session()
    try:
        part = session.query(ServicePart).filter_by(id=part_id).first()
        if not part:
            return jsonify({"error": "Part not found"}), 404

        setattr(part, "is_active", False)
        session.commit()
        return jsonify({"message": "Part deleted (deactivated) successfully"})

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to delete part", "detail": str(e)}), 500
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Admin User Management & Settings
# ---------------------------------------------------------------------------
@app.route("/api/users", methods=["GET"])
@require_role("admin")
def list_users():
    session = get_session()
    try:
        users = session.query(User).order_by(User.created_at.desc()).all()
        return jsonify({"users": [u.to_dict() for u in users], "count": len(users)})
    finally:
        session.close()


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@require_role("admin")
def delete_user(user_id):
    """Deletes user account (cannot delete self — ported from v1)."""
    current_user = request.user  # type: ignore
    current_user_id = int(current_user.get("user_id", 0))
    if current_user_id == int(user_id):
        return jsonify({"error": "Self-deletion prohibited", "detail": "You cannot delete your own admin account"}), 400

    session = get_session()
    try:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Reassign any service records authored by this mechanic to the executing admin so FK constraints do not fail
        session.query(ServiceRecord).filter_by(mechanic_id=user_id).update({"mechanic_id": current_user_id})

        user_email = str(getattr(user, "email", f"User #{user_id}"))
        session.delete(user)
        session.commit()
        return jsonify({"message": f"User {user_email} deleted successfully"})

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to delete user", "detail": str(e)}), 500
    finally:
        session.close()


SENSITIVE_SETTINGS = {"admin_key", "jwt_secret", "encryption_key"}


@app.route("/api/settings/<key>", methods=["GET"])
@require_auth
def get_setting(key):
    # Protect sensitive settings — requires admin role
    if key in SENSITIVE_SETTINGS:
        user_payload = get_current_user_payload()
        if not user_payload:
            return jsonify({"error": "Unauthorized", "detail": "Valid authentication token required"}), 401
        if user_payload.get("role") != "admin":
            return jsonify({"error": "Forbidden", "detail": "Sensitive setting requires admin role"}), 403

    session = get_session()
    try:
        setting = session.query(Setting).filter_by(key=key).first()
        if not setting:
            return jsonify({"error": f"Setting '{key}' not found"}), 404
        return jsonify({"key": setting.key, "value": setting.value})
    finally:
        session.close()


@app.route("/api/settings/<key>", methods=["PUT", "POST"])
@require_role("admin")
def update_setting(key):
    """Admin updates system setting (e.g. admin secret key or currency)."""
    data = request.get_json() or {}
    new_value = str(data.get("value", "")).strip()

    if not new_value:
        return jsonify({"error": "Setting value cannot be empty"}), 400

    session = get_session()
    try:
        setting = session.query(Setting).filter_by(key=key).first()
        if not setting:
            setting = Setting(key=key, value=new_value)
            session.add(setting)
        else:
            setattr(setting, "value", new_value)

        session.commit()
        return jsonify({"message": f"Setting '{key}' updated successfully", "key": key, "value": new_value})

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Failed to update setting", "detail": str(e)}), 500
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Analytics Endpoint — §8.7 (admin-only, SQL aggregation)
# ---------------------------------------------------------------------------
@app.route("/api/analytics", methods=["GET"])
@require_role("admin")
def get_analytics():
    """
    Aggregate queries for revenue, service count, top parts, and per-mechanic stats.
    All aggregation happens in the database — no pulling every row into Python.
    """
    session = get_session()
    try:
        # pyrefly: ignore [missing-import]
        from sqlalchemy import extract

        # Monthly revenue trend (last 12 months)
        monthly_revenue = (
            session.query(
                extract("year", ServiceRecord.created_at).label("year"),
                extract("month", ServiceRecord.created_at).label("month"),
                func.sum(ServiceRecord.total_cost).label("revenue"),
                func.count(ServiceRecord.id).label("services"),
            )
            .group_by("year", "month")
            .order_by("year", "month")
            .all()
        )

        month_names = [
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ]

        revenue_trend = [
            {
                "month": month_names[safe_int(r.month)] if 1 <= safe_int(r.month) <= 12 else str(r.month or ""),
                "year": safe_int(r.year) if r.year is not None else 2026,
                "revenue": safe_int(r.revenue),
                "services": safe_int(r.services),
            }
            for r in monthly_revenue
        ]

        # Top replaced parts by usage count
        top_parts = (
            session.query(
                ServiceLineItem.part_name_snapshot,
                func.count(ServiceLineItem.id).label("count"),
                func.sum(ServiceLineItem.subtotal).label("revenue"),
            )
            .group_by(ServiceLineItem.part_name_snapshot)
            .order_by(func.count(ServiceLineItem.id).desc())
            .limit(10)
            .all()
        )

        parts_data = [
            {
                "name": str(p[0]),
                "count": safe_int(p[1]),
                "revenue": safe_int(p[2]),
            }
            for p in top_parts
        ]

        # Per-mechanic stats
        mechanic_stats = (
            session.query(
                User.name,
                func.count(ServiceRecord.id).label("services"),
                func.sum(ServiceRecord.total_cost).label("revenue"),
            )
            .join(ServiceRecord, ServiceRecord.mechanic_id == User.id)
            .group_by(User.name)
            .all()
        )

        mechanics = [
            {
                "name": m.name,
                "services": safe_int(m.services),
                "revenue": safe_int(m.revenue),
            }
            for m in mechanic_stats
        ]

        # Summary KPIs
        total_revenue = session.query(func.sum(ServiceRecord.total_cost)).scalar() or 0
        total_services = session.query(func.count(ServiceRecord.id)).scalar() or 0
        total_vehicles = session.query(func.count(Vehicle.id)).scalar() or 0

        # Most replaced item
        most_replaced = parts_data[0] if parts_data else None

        # Get currency
        curr_setting = session.query(Setting).filter_by(key="default_currency").first()
        currency = curr_setting.value if curr_setting else "PKR"

        return jsonify({
            "revenue_trend": revenue_trend,
            "top_parts": parts_data,
            "mechanic_stats": mechanics,
            "summary": {
                "total_revenue": safe_int(total_revenue),
                "total_services": safe_int(total_services),
                "total_vehicles": safe_int(total_vehicles),
                "avg_per_service": int(total_revenue / total_services) if total_services else 0,
                "most_replaced": most_replaced,
                "currency": currency,
            },
        })

    finally:
        session.close()


def get_public_base_url() -> str:
    """
    Dynamically and reliably resolves the public frontend base URL:
      1. Explicit FRONTEND_URL env var if configured
      2. Vercel deployment automatic env vars (VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL)
      3. Incoming request Host / X-Forwarded-Host headers (matches active domain/subdomain)
      4. Default fallback to http://localhost:3000
    """
    # 1. User-configured FRONTEND_URL
    explicit = os.environ.get("FRONTEND_URL")
    if explicit and explicit.strip():
        url = explicit.strip().rstrip("/")
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"
        return url

    # 2. Vercel deployment automatic env vars
    vercel_prod = os.environ.get("VERCEL_PROJECT_PRODUCTION_URL")
    if vercel_prod and vercel_prod.strip():
        return f"https://{vercel_prod.strip().rstrip('/')}"

    vercel_url = os.environ.get("VERCEL_URL")
    if vercel_url and vercel_url.strip():
        return f"https://{vercel_url.strip().rstrip('/')}"

    # 3. Dynamic header detection from incoming HTTP request
    try:
        forwarded_host = request.headers.get("x-forwarded-host") or request.headers.get("host")
        if forwarded_host:
            forwarded_proto = request.headers.get("x-forwarded-proto") or ("https" if request.is_secure else "http")
            # In local development Next.js proxy rewrite from 3000 -> 5328
            if ":5328" in forwarded_host:
                forwarded_host = forwarded_host.replace(":5328", ":3000")
            return f"{forwarded_proto}://{forwarded_host.rstrip('/')}"
    except Exception:
        pass

    return "http://localhost:3000"


# ---------------------------------------------------------------------------
# QR Vehicle Passport — §8.1 (server-side QR generation)
# ---------------------------------------------------------------------------
@app.route("/api/vehicles/<path:reg_no>/qr", methods=["GET"])
@rate_limit(limit=30, window_seconds=60, key_prefix="qr_gen")
def generate_vehicle_qr(reg_no):
    """
    Generates a QR code image encoding the public tracking URL for this vehicle.
    Returns a clean PNG image response with proper cache headers.
    """
    import urllib.parse
    display_reg = urllib.parse.unquote(reg_no).strip().upper()

    try:
        # pyrefly: ignore [missing-import, missing-type-stubs]
        import qrcode  # type: ignore
        from io import BytesIO

        base_url = get_public_base_url()
        tracking_url = f"{base_url}/track/{urllib.parse.quote(display_reg)}"

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(tracking_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#1e1b4b", back_color="white")

        buf = BytesIO()
        img.save(buf)
        buf.seek(0)

        response = send_file(
            buf,
            mimetype="image/png",
            as_attachment=False,
            download_name=f"qr-{display_reg}.png",
        )
        response.headers["Cache-Control"] = "public, max-age=86400, s-maxage=86400"
        return response

    except ImportError:
        return jsonify({"error": "qrcode library not installed. Run: pip install qrcode[pil]"}), 500
    except Exception as e:
        return jsonify({"error": "QR generation failed", "detail": str(e)}), 500


# ---------------------------------------------------------------------------
# Public Vehicle Tracking Data — §8.1 / §8.6 (no auth required)
# ---------------------------------------------------------------------------
@app.route("/api/track/<path:reg_no>", methods=["GET"])
@rate_limit(limit=60, window_seconds=60, key_prefix="track_public")
def get_vehicle_passport(reg_no):
    """
    Public read-only endpoint for QR passport pages.
    Returns vehicle info, health score, and full service history.
    No authentication required — customer scanning QR has no account.
    """
    session = get_session()
    try:
        vehicle = session.query(Vehicle).options(
            joinedload(Vehicle.service_records).joinedload(ServiceRecord.line_items)
        ).filter_by(registration_no=reg_no.strip().upper()).first()

        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        data = vehicle.to_dict(include_latest_service=True)
        ls = data.get("latest_service")
        if ls and isinstance(ls, dict):
            score = calculate_health_score(
                current_km=int(getattr(vehicle, "current_km", 0)),
                km_at_last_service=int(ls.get("km_at_service", 0)),
                next_service_km=int(ls.get("next_service_km", 0)),
                last_service_date=vehicle.service_records[0].created_at if vehicle.service_records else None,
                has_flagged_issues=bool(vehicle.service_records[0].mechanic_notes) if vehicle.service_records else False,
            )
        else:
            score = 50

        # Build history list
        history = []
        for r in vehicle.service_records:
            history.append({
                "id": r.id,
                "date": r.created_at.strftime("%Y-%m-%d"),
                "km_at_service": r.km_at_service,
                "next_service_km": r.next_service_km,
                "total_cost": r.total_cost,
                "currency": r.currency,
                "parts": [li.part_name_snapshot for li in r.line_items] if hasattr(r, 'line_items') else [],
            })

        return jsonify({
            "vehicle": {
                "registration_no": vehicle.registration_no,
                "make": vehicle.make,
                "model": vehicle.model,
                "year": vehicle.year,
                "vehicle_type": vehicle.vehicle_type,
                "current_km": vehicle.current_km,
                "owner_name": vehicle.owner_name,
                "health_score": score,
                "status": get_status_from_score(score),
            },
            "history": history,
        })

    finally:
        session.close()


# ---------------------------------------------------------------------------
# VIN Auto-Decode — §8.2 (free NHTSA vPIC API)
# ---------------------------------------------------------------------------
@app.route("/api/vin-decode", methods=["POST"])
@require_auth
@rate_limit(limit=15, window_seconds=60, key_prefix="vin_decode")
def vin_decode():
    """
    Optional VIN lookup using the free NHTSA vPIC API.
    Pakistan vehicles often lack US-format VINs, so this is a convenience
    helper, not a requirement. Mechanic can always type make/model/year manually.
    """
    # type: ignore
    import requests

    data = request.get_json() or {}
    vin = data.get("vin", "").strip().upper()

    if not vin or len(vin) < 11:
        return jsonify({"error": "A valid VIN (at least 11 characters) is required"}), 400

    try:
        nhtsa_url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json"
        resp = requests.get(nhtsa_url, timeout=10)
        resp.raise_for_status()
        results = resp.json().get("Results", [])

        # Extract key fields from NHTSA response
        decoded = {}
        field_map = {
            "Make": "make",
            "Model": "model",
            "Model Year": "year",
            "Vehicle Type": "vehicle_type_raw",
            "Engine Number of Cylinders": "cylinders",
            "Displacement (L)": "engine_displacement",
            "Fuel Type - Primary": "fuel_type",
        }

        for item in results:
            variable = item.get("Variable", "")
            value = item.get("Value")
            if variable in field_map and value and value.strip():
                decoded[field_map[variable]] = value.strip()

        # Map NHTSA vehicle type to our enum
        raw_type = decoded.get("vehicle_type_raw", "").lower()
        if "motorcycle" in raw_type:
            decoded["vehicle_type"] = "motorcycle"
        elif "truck" in raw_type or "van" in raw_type or "bus" in raw_type:
            decoded["vehicle_type"] = "lcv"
        else:
            decoded["vehicle_type"] = "car"

        return jsonify({"decoded": decoded, "vin": vin})

    except requests.RequestException as e:
        return jsonify({"error": "NHTSA API request failed", "detail": str(e)}), 502


# ---------------------------------------------------------------------------
# Registration Plate OCR — §8.3 (pytesseract, open-source Tesseract)
# ---------------------------------------------------------------------------
@app.route("/api/ocr/plate", methods=["POST"])
@require_auth
@rate_limit(limit=10, window_seconds=60, key_prefix="ocr_plate")
def ocr_plate():
    """
    Accepts an image file (camera capture or upload), runs Tesseract OCR,
    and returns the extracted text as a suggestion. The mechanic must confirm
    before saving — OCR output is never auto-committed.

    Requires Tesseract engine installed on the system.
    Works in local dev; may need a custom runtime for Vercel serverless.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send as 'image' form field."}), 400

    image_file = request.files["image"]

    try:
        # pyrefly: ignore [missing-import]
        import pytesseract
        # pyrefly: ignore [missing-import]
        from PIL import Image

        img = Image.open(image_file.stream)

        # Convert to grayscale for better OCR accuracy on plate text
        img = img.convert("L")

        # Extract text — Pakistani plates typically have alphanumeric chars
        ocr_result = pytesseract.image_to_string(
            img,
            config="--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
        )
        extracted = str(ocr_result).strip()

        # Clean up common OCR artifacts
        cleaned = extracted.replace("\n", " ").replace("  ", " ").strip().upper()

        return jsonify({
            "extracted_text": cleaned,
            "confidence_note": "OCR suggestion — please verify before saving.",
        })

    except ImportError:
        return jsonify({
            "error": "pytesseract is not installed. Run: pip install pytesseract Pillow",
            "detail": "Also requires Tesseract engine: https://github.com/tesseract-ocr/tesseract",
        }), 500
    except Exception as e:
        return jsonify({"error": "OCR processing failed", "detail": str(e)}), 500


# ---------------------------------------------------------------------------
# Before/After Photo Log — §8.4 (file upload + DB URL storage)
# ---------------------------------------------------------------------------
@app.route("/api/services/<int:service_id>/photos", methods=["POST"])
@require_auth
@rate_limit(limit=10, window_seconds=60, key_prefix="photo_upload")
def upload_service_photo(service_id):
    """
    Uploads a before/after photo for a service record.
    Stores the file locally (dev) or to object storage (prod).
    Database stores only the URL, not the image bytes.
    """
    from api.models import ServicePhoto

    if "photo" not in request.files:
        return jsonify({"error": "No photo file provided. Send as 'photo' form field."}), 400

    photo_file = request.files["photo"]
    valid_img, img_error, safe_name = validate_image_file(photo_file)
    if not valid_img:
        return jsonify({"error": f"Invalid photo upload: {img_error}"}), 400

    photo_type = request.form.get("photo_type", "before")
    if photo_type not in ("before", "after"):
        return jsonify({"error": "photo_type must be 'before' or 'after'"}), 400

    session = get_session()
    try:
        record = session.query(ServiceRecord).filter_by(id=service_id).first()
        if not record:
            return jsonify({"error": "Service record not found"}), 404
            
        user_payload = request.user  # type: ignore
        user_id = user_payload.get("user_id", 1)
        role = user_payload.get("role", "mechanic")
        if record.mechanic_id != user_id and role != "admin":
            return jsonify({"error": "Forbidden: Cannot upload photos to another user's record"}), 403

        # Save file locally for development; production should use Vercel Blob / S3
        upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "photos")
        os.makedirs(upload_dir, exist_ok=True)

        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        safe_filename = f"service_{service_id}_{photo_type}_{timestamp}.jpg"
        filepath = os.path.join(upload_dir, safe_filename)
        photo_file.save(filepath)

        # Store relative URL in database
        photo_url = f"/uploads/photos/{safe_filename}"

        photo = ServicePhoto(
            service_record_id=service_id,
            photo_url=photo_url,
            photo_type=photo_type,
        )
        session.add(photo)
        session.commit()

        return jsonify({
            "message": "Photo uploaded successfully",
            "photo": {
                "id": photo.id,
                "url": photo_url,
                "type": photo_type,
            },
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({"error": "Photo upload failed", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/services/<int:service_id>/photos", methods=["GET"])
@require_auth
def get_service_photos(service_id):
    """Returns all photos attached to a service record."""
    from api.models import ServicePhoto

    user_payload = request.user  # type: ignore
    user_id = user_payload.get("user_id", 1)
    role = user_payload.get("role", "mechanic")

    session = get_session()
    try:
        record = session.query(ServiceRecord).filter_by(id=service_id).first()
        if not record:
            return jsonify({"error": "Service record not found"}), 404
            
        if record.mechanic_id != user_id and role != "admin":
            return jsonify({"error": "Forbidden: Cannot view photos for another user's record"}), 403

        photos = session.query(ServicePhoto).filter_by(
            service_record_id=service_id
        ).order_by(ServicePhoto.uploaded_at).all()

        return jsonify({
            "photos": [
                {
                    "id": p.id,
                    "url": p.photo_url,
                    "type": p.photo_type,
                    "uploaded_at": p.uploaded_at.isoformat() if p.uploaded_at else None,
                }
                for p in photos
            ],
        })
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Static photo serving — §8.4
# Serves uploaded vehicle photos stored under <project_root>/uploads/photos.
# In local dev, Next.js rewrites /uploads/* to this Flask server; in production
# on Vercel, a path like this should be backed by object storage instead, but
# this keeps receipt photo attachment working in both environments.
# ---------------------------------------------------------------------------
@app.route("/uploads/photos/<path:filename>", methods=["GET"])
@require_auth
def serve_service_photo(filename):
    """Serves an uploaded service photo file from the local photos directory."""
    from api.models import ServicePhoto
    
    user_payload = request.user  # type: ignore
    user_id = user_payload.get("user_id", 1)
    role = user_payload.get("role", "mechanic")
    
    session = get_session()
    try:
        photo_url = f"/uploads/photos/{filename}"
        photo = session.query(ServicePhoto).filter_by(photo_url=photo_url).first()
        if photo:
            record = session.query(ServiceRecord).filter_by(id=photo.service_record_id).first()
            if record and record.mechanic_id != user_id and role != "admin":
                return jsonify({"error": "Forbidden: You do not have permission to view this photo"}), 403
    finally:
        session.close()

    upload_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "photos"
    )
    return send_from_directory(upload_dir, filename)


if __name__ == "__main__":
    app.run(debug=True, port=5328)

