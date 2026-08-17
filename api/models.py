"""
GEARIFY-Remastered — SQLAlchemy ORM Models

Migrated from v1's JSON flat files (users.json, cars.json, prices.json,
history.json, settings.json) to normalized Postgres tables.

Key design decisions:
  - ServiceLineItem is a join table (not JSON-in-a-column) so we can query
    part usage across services for analytics.
  - ServicePart stores a `vehicle_type_scope` so bike-specific oils don't
    appear in car service dropdowns (and vice versa).
  - unit_price_snapshot on line items freezes the price at the time of service,
    since admin can update part prices at any time.
"""

from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey,
    CheckConstraint, create_engine
)
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        String(20),
        CheckConstraint("role IN ('mechanic', 'admin')"),
        nullable=False,
        default="mechanic",
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    service_records = relationship("ServiceRecord", back_populates="mechanic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    registration_no = Column(String(20), unique=True, nullable=False, index=True)
    make = Column(String(100), nullable=False)       # v1 called this "company"
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    vehicle_type = Column(
        String(20),
        CheckConstraint("vehicle_type IN ('car', 'lcv', 'motorcycle')"),
        nullable=False,
        default="car",
    )
    current_km = Column(Integer, nullable=False, default=0)
    vin = Column(String(17), nullable=True)           # Phase 3 — VIN auto-decode
    owner_name = Column(String(150), nullable=True)
    owner_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    service_records = relationship(
        "ServiceRecord", back_populates="vehicle", order_by="desc(ServiceRecord.created_at)"
    )

    def to_dict(self, include_latest_service=False):
        data = {
            "id": self.id,
            "registration_no": self.registration_no,
            "make": self.make,
            "model": self.model,
            "year": self.year,
            "vehicle_type": self.vehicle_type,
            "current_km": self.current_km,
            "vin": self.vin,
            "owner_name": self.owner_name,
            "owner_phone": self.owner_phone,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_latest_service and self.service_records:
            latest = self.service_records[0]  # already ordered desc
            data["latest_service"] = {
                "id": latest.id,
                "km_at_service": latest.km_at_service,
                "next_service_km": latest.next_service_km,
                "total_cost": latest.total_cost,
                "currency": latest.currency,
                "created_at": latest.created_at.isoformat() if latest.created_at else None,
            }
        else:
            data["latest_service"] = None
        return data


class ServicePart(Base):
    """
    Replaces v1's prices.json. Each row is one purchasable part/consumable.
    Admin can add, edit price, or soft-delete any individual item.
    """
    __tablename__ = "service_parts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)           # e.g. "Shell Helix HX7 (10W-40)"
    brand = Column(String(100), nullable=False)          # e.g. "Shell"
    category = Column(
        String(30),
        CheckConstraint(
            "category IN ('engine_oil', 'air_filter', 'oil_filter', "
            "'chain_lube', 'brake_pad', 'spark_plug')"
        ),
        nullable=False,
    )
    vehicle_type_scope = Column(
        String(20),
        CheckConstraint("vehicle_type_scope IN ('car', 'motorcycle', 'all')"),
        nullable=False,
        default="all",
    )
    unit_price = Column(Integer, nullable=False)         # stored in smallest whole unit
    currency = Column(String(3), nullable=False, default="PKR")
    is_active = Column(Boolean, nullable=False, default=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "category": self.category,
            "vehicle_type_scope": self.vehicle_type_scope,
            "unit_price": self.unit_price,
            "currency": self.currency,
            "is_active": self.is_active,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ServiceRecord(Base):
    """
    One service visit. Line items (parts used) are in ServiceLineItem.
    Ported from v1's history.json entries.
    """
    __tablename__ = "service_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    mechanic_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    labor_cost = Column(Integer, nullable=False, default=0)
    total_cost = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="PKR")
    km_at_service = Column(Integer, nullable=False)
    # Predictive maintenance: v1 formula is current_km + 15000
    # Bikes use a shorter interval: current_km + 3000
    next_service_km = Column(Integer, nullable=False)
    mechanic_notes = Column(Text, nullable=True)         # Phase 3 — health score input
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = relationship("Vehicle", back_populates="service_records")
    mechanic = relationship("User", back_populates="service_records")
    line_items = relationship("ServiceLineItem", back_populates="service_record", cascade="all, delete-orphan")
    photos = relationship("ServicePhoto", back_populates="service_record", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "mechanic_id": self.mechanic_id,
            "labor_cost": self.labor_cost,
            "total_cost": self.total_cost,
            "currency": self.currency,
            "km_at_service": self.km_at_service,
            "next_service_km": self.next_service_km,
            "mechanic_notes": self.mechanic_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "line_items": [li.to_dict() for li in self.line_items],
        }


class ServiceLineItem(Base):
    """
    One part used in a service. Snapshots name + price at time of service
    so the receipt stays accurate even if admin updates prices later.
    """
    __tablename__ = "service_line_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_record_id = Column(Integer, ForeignKey("service_records.id"), nullable=False)
    service_part_id = Column(Integer, ForeignKey("service_parts.id"), nullable=True)
    part_name_snapshot = Column(String(200), nullable=False)
    unit_price_snapshot = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Integer, nullable=False)

    # Relationships
    service_record = relationship("ServiceRecord", back_populates="line_items")

    def to_dict(self):
        return {
            "id": self.id,
            "service_part_id": self.service_part_id,
            "part_name_snapshot": self.part_name_snapshot,
            "unit_price_snapshot": self.unit_price_snapshot,
            "quantity": self.quantity,
            "subtotal": self.subtotal,
        }


class ServicePhoto(Base):
    """Phase 3 — before/after photo attachments on a service record."""
    __tablename__ = "service_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_record_id = Column(Integer, ForeignKey("service_records.id"), nullable=False)
    photo_url = Column(String(500), nullable=False)
    photo_type = Column(
        String(10),
        CheckConstraint("photo_type IN ('before', 'after')"),
        nullable=False,
    )
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    service_record = relationship("ServiceRecord", back_populates="photos")


class Setting(Base):
    """Key-value config store. Replaces v1's settings.json."""
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)


# ---------------------------------------------------------------------------
# Engine & Session factory — configured for serverless (Vercel cold starts)
# ---------------------------------------------------------------------------
import os

def get_engine():
    """
    Creates a SQLAlchemy engine tuned for serverless (Vercel cold starts):
      - Handles Postgres / Neon connection pooling
      - Auto-routes SQLite to /tmp on Vercel read-only filesystem
    """
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
            database_url = "sqlite:////tmp/gearify.db"
        else:
            database_url = "sqlite:///gearify.db"

    # Fix postgres:// -> postgresql:// for SQLAlchemy 2.0
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    if database_url.startswith("sqlite"):
        return create_engine(database_url, connect_args={"check_same_thread": False})

    return create_engine(
        database_url,
        pool_size=1,
        max_overflow=0,
        pool_pre_ping=True,
        pool_recycle=300,
    )

def get_session():
    """Creates a new SQLAlchemy session bound to the serverless-safe engine."""
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()

def init_db():
    """Creates all tables if they don't exist and auto-seeds initial data. Safe to call on cold start."""
    engine = get_engine()
    Base.metadata.create_all(engine)

    try:
        Session = sessionmaker(bind=engine)
        session = Session()
        # If no users or settings exist in the database, auto-seed defaults
        if session.query(User).count() == 0 or session.query(Setting).count() == 0:
            from api.seed import seed
            seed()
        session.close()
    except Exception as e:
        print(f"Database auto-seed notice: {e}")

    return engine
