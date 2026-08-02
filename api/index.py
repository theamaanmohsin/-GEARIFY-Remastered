"""
Gearify v2 — Flask API Entry Point

This file is the single serverless function entry point for Vercel.
All /api/* requests are routed here via vercel.json rewrites.

CORS setup: allows the Next.js frontend (localhost:3000 in dev, production domain
in prod) to call these endpoints. Vercel co-locates both on the same domain in
production, but CORS is still needed for local dev where they run on different ports.
"""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
load_dotenv()  # loads .env in local dev; Vercel injects env vars natively

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy.orm import joinedload

from api.models import (
    Base, User, Vehicle, ServicePart, ServiceRecord, ServiceLineItem,
    Setting, get_engine, get_session, init_db
)

app = Flask(__name__)

# --- CORS Configuration ---
# In production on Vercel, frontend and API share the same origin so CORS
# is technically unnecessary, but we configure it for local dev compatibility.
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            os.environ.get("FRONTEND_URL", ""),
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})


# ---------------------------------------------------------------------------
# Health Score — pure Python, no external API (spec §8.6)
# Combines: KM since last service, days since last service, flagged issues
# into a 0-100 score. Score bands drive dashboard status colors.
# ---------------------------------------------------------------------------
def calculate_health_score(
    current_km: int,
    km_at_last_service: int | None,
    next_service_km: int | None,
    last_service_date: datetime | None,
    has_flagged_issues: bool = False,
) -> int:
    """
    Returns 0-100.
      80-100 = good    (emerald)
      50-79  = warning (amber)
      0-49   = danger  (rose)

    Formula weights:
      - KM ratio:  40% — how far through the service interval
      - Days ratio: 30% — time-based degradation (180 days = full penalty)
      - Flagged:    30% — mechanic-noted issues
    """
    if km_at_last_service is None or next_service_km is None:
        # No service history at all — treat as unknown/warning
        return 50

    service_interval = max(next_service_km - km_at_last_service, 1)
    km_since = max(current_km - km_at_last_service, 0)
    km_ratio = min(km_since / service_interval, 2.0)  # cap at 200% overdue

    days_ratio = 0.0
    if last_service_date:
        now = datetime.now(timezone.utc)
        if last_service_date.tzinfo is None:
            last_service_date = last_service_date.replace(tzinfo=timezone.utc)
        days_since = (now - last_service_date).days
        days_ratio = min(days_since / 180.0, 2.0)

    flagged_penalty = 1.0 if has_flagged_issues else 0.0

    score = 100 - (km_ratio * 40) - (days_ratio * 30) - (flagged_penalty * 30)
    return max(0, min(100, int(round(score))))


def get_status_from_score(score: int) -> str:
    """Maps health score to status label for frontend color coding."""
    if score >= 80:
        return "good"
    elif score >= 50:
        return "warning"
    else:
        return "danger"


# ---------------------------------------------------------------------------
# Database initialization — creates tables on first request (dev convenience)
# ---------------------------------------------------------------------------
_db_initialized = False

@app.before_request
def ensure_db():
    """Auto-create tables on the first request after a cold start."""
    global _db_initialized
    if not _db_initialized:
        try:
            init_db()
            _db_initialized = True
        except Exception as e:
            app.logger.error(f"DB init failed: {e}")


# ---------------------------------------------------------------------------
# API Routes — Phase 1
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """Verifies the API is running and can connect to the database."""
    try:
        session = get_session()
        session.execute("SELECT 1")  # type: ignore
        session.close()
        return jsonify({"status": "ok", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "database": str(e)}), 500


@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    """
    Returns all vehicles with their latest service record and health score.
    Supports optional search: ?q=<search_term> searches registration_no and make.
    """
    session = get_session()
    try:
        query = session.query(Vehicle).options(
            joinedload(Vehicle.service_records)
        )

        # Search filter (same logic as v1's dashboard search)
        search_term = request.args.get("q", "").strip()
        if search_term:
            like_pattern = f"%{search_term}%"
            query = query.filter(
                (Vehicle.registration_no.ilike(like_pattern)) |
                (Vehicle.make.ilike(like_pattern)) |
                (Vehicle.model.ilike(like_pattern))
            )

        vehicles = query.order_by(Vehicle.created_at.desc()).all()

        result = []
        for v in vehicles:
            data = v.to_dict(include_latest_service=True)

            # Compute health score from latest service
            ls = data.get("latest_service")
            if ls:
                score = calculate_health_score(
                    current_km=v.current_km,
                    km_at_last_service=ls["km_at_service"],
                    next_service_km=ls["next_service_km"],
                    last_service_date=v.service_records[0].created_at if v.service_records else None,
                    has_flagged_issues=bool(v.service_records[0].mechanic_notes) if v.service_records else False,
                )
            else:
                score = 50  # no service history

            data["health_score"] = score
            data["status"] = get_status_from_score(score)
            result.append(data)

        return jsonify({"vehicles": result, "count": len(result)})

    except Exception as e:
        app.logger.error(f"Error fetching vehicles: {e}")
        return jsonify({"error": "Failed to fetch vehicles", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/parts", methods=["GET"])
def list_parts():
    """
    Returns active service parts, optionally filtered by vehicle_type and category.
    Query params: ?vehicle_type=car|motorcycle  &  ?category=engine_oil|air_filter|...
    """
    session = get_session()
    try:
        query = session.query(ServicePart).filter(ServicePart.is_active == True)

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

    except Exception as e:
        return jsonify({"error": "Failed to fetch parts", "detail": str(e)}), 500
    finally:
        session.close()


@app.route("/api/settings/<key>", methods=["GET"])
def get_setting(key):
    """Read a single setting by key."""
    session = get_session()
    try:
        setting = session.query(Setting).filter_by(key=key).first()
        if not setting:
            return jsonify({"error": f"Setting '{key}' not found"}), 404
        return jsonify({"key": setting.key, "value": setting.value})
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Vercel Python runtime expects the Flask `app` object at module level.
# For local dev: `flask --app api/index run -p 5328 --reload`
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5328)
