"""
Gearify v2 — Database Seeder

Seeds the Postgres database with:
  1. Tables (create_all)
  2. Settings (admin registration key, default currency)
  3. Pakistan-market parts catalog (engine oils, filters, bike consumables)
  4. Demo vehicles (migrated from v1 cars.json)
  5. Demo users (admin + mechanic with hashed passwords)
  6. Demo service records (sample data for dashboard testing)

Run: python -m api.seed
Or:  cd project_root && python api/seed.py
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure the project root is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
load_dotenv()

from werkzeug.security import generate_password_hash
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker

from api.models import (
    Base, User, Vehicle, ServicePart, ServiceRecord, ServiceLineItem,
    Setting, get_engine
)


def seed():
    engine = get_engine()
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("🔧 Gearify v2 — Database Seeder")
    print("=" * 50)

    # ------------------------------------------------------------------
    # 1. Settings
    # ------------------------------------------------------------------
    existing_settings = session.query(Setting).count()
    if existing_settings == 0:
        settings = [
            Setting(key="admin_key", value="GearifyAPMS"),       # matches v1
            Setting(key="default_currency", value="PKR"),
        ]
        session.add_all(settings)
        session.commit()
        print("✅ Settings seeded (admin_key, default_currency)")
    else:
        print("⏭️  Settings already exist, skipping")

    # ------------------------------------------------------------------
    # 2. Pakistan-Market Parts Catalog
    # ------------------------------------------------------------------
    existing_parts = session.query(ServicePart).count()
    if existing_parts == 0:
        parts = [
            # ── Engine Oil: Car / LCV ──
            ServicePart(name="Shell Helix HX7 (10W-40)", brand="Shell", category="engine_oil", vehicle_type_scope="car", unit_price=4500, currency="PKR"),
            ServicePart(name="Shell Helix HX8 (5W-40)", brand="Shell", category="engine_oil", vehicle_type_scope="car", unit_price=5800, currency="PKR"),
            ServicePart(name="Castrol GTX (20W-50)", brand="Castrol", category="engine_oil", vehicle_type_scope="car", unit_price=4200, currency="PKR"),
            ServicePart(name="Castrol Magnatec (5W-30)", brand="Castrol", category="engine_oil", vehicle_type_scope="car", unit_price=5800, currency="PKR"),
            ServicePart(name="Total Quartz 7000 (10W-40)", brand="Total", category="engine_oil", vehicle_type_scope="car", unit_price=4800, currency="PKR"),
            ServicePart(name="ZIC X7 (5W-30)", brand="ZIC", category="engine_oil", vehicle_type_scope="car", unit_price=5200, currency="PKR"),
            ServicePart(name="ZIC X9 (5W-40)", brand="ZIC", category="engine_oil", vehicle_type_scope="car", unit_price=6200, currency="PKR"),
            ServicePart(name="Mobil Super (15W-40)", brand="Mobil", category="engine_oil", vehicle_type_scope="car", unit_price=4000, currency="PKR"),
            ServicePart(name="PSO Lubricant (20W-50)", brand="PSO", category="engine_oil", vehicle_type_scope="car", unit_price=3200, currency="PKR"),
            ServicePart(name="Habib Hi-Point (20W-50)", brand="Habib", category="engine_oil", vehicle_type_scope="car", unit_price=2800, currency="PKR"),
            ServicePart(name="Caltex Havoline (20W-50)", brand="Caltex", category="engine_oil", vehicle_type_scope="car", unit_price=3800, currency="PKR"),

            # ── Engine Oil: Motorcycle (4-stroke) ──
            ServicePart(name="Shell Advance AX5 (15W-40)", brand="Shell", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=850, currency="PKR"),
            ServicePart(name="Shell Advance AX7 (10W-40)", brand="Shell", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=1200, currency="PKR"),
            ServicePart(name="Castrol Power1 (10W-40)", brand="Castrol", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=950, currency="PKR"),
            ServicePart(name="Castrol Active (20W-40)", brand="Castrol", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=700, currency="PKR"),
            ServicePart(name="Total Hi-Perf (15W-50)", brand="Total", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=800, currency="PKR"),
            ServicePart(name="ZIC M5 (10W-40)", brand="ZIC", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=750, currency="PKR"),
            ServicePart(name="ZIC M7 (10W-40)", brand="ZIC", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=900, currency="PKR"),
            ServicePart(name="PSO Bike Oil (20W-40)", brand="PSO", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=500, currency="PKR"),
            ServicePart(name="Blue Silver (20W-50)", brand="Blue Silver", category="engine_oil", vehicle_type_scope="motorcycle", unit_price=400, currency="PKR"),

            # ── Oil Filters ──
            ServicePart(name="Fram PH3614", brand="Fram", category="oil_filter", vehicle_type_scope="car", unit_price=1200, currency="PKR"),
            ServicePart(name="Bosch Premium Oil Filter", brand="Bosch", category="oil_filter", vehicle_type_scope="car", unit_price=1500, currency="PKR"),
            ServicePart(name="Mann Filter W712", brand="Mann", category="oil_filter", vehicle_type_scope="car", unit_price=1800, currency="PKR"),
            ServicePart(name="ISO Standard Filter", brand="ISO", category="oil_filter", vehicle_type_scope="all", unit_price=600, currency="PKR"),
            ServicePart(name="DFC Economy Filter", brand="DFC", category="oil_filter", vehicle_type_scope="all", unit_price=500, currency="PKR"),
            ServicePart(name="Guard Standard Filter", brand="Guard", category="oil_filter", vehicle_type_scope="all", unit_price=850, currency="PKR"),
            ServicePart(name="Vic C-110 (Japan)", brand="Vic", category="oil_filter", vehicle_type_scope="car", unit_price=1500, currency="PKR"),
            ServicePart(name="Leppon Performance Filter", brand="Leppon", category="oil_filter", vehicle_type_scope="car", unit_price=1100, currency="PKR"),

            # ── Air Filters ──
            ServicePart(name="Bosch Premium Air Filter", brand="Bosch", category="air_filter", vehicle_type_scope="car", unit_price=2200, currency="PKR"),
            ServicePart(name="Mann Filter C Series", brand="Mann", category="air_filter", vehicle_type_scope="car", unit_price=2500, currency="PKR"),
            ServicePart(name="K&N Performance Air Filter", brand="K&N", category="air_filter", vehicle_type_scope="car", unit_price=4500, currency="PKR"),
            ServicePart(name="Generic Air Filter (Local)", brand="Local", category="air_filter", vehicle_type_scope="all", unit_price=800, currency="PKR"),
            ServicePart(name="Leppon Premium Air Filter", brand="Leppon", category="air_filter", vehicle_type_scope="car", unit_price=1800, currency="PKR"),
            ServicePart(name="Wix High-Flow Air Filter", brand="Wix", category="air_filter", vehicle_type_scope="car", unit_price=2500, currency="PKR"),
            ServicePart(name="Guard Autozone Air Filter", brand="Guard", category="air_filter", vehicle_type_scope="car", unit_price=1200, currency="PKR"),

            # ── Bike-Specific Consumables ──
            ServicePart(name="Chain Lube — Motul C2", brand="Motul", category="chain_lube", vehicle_type_scope="motorcycle", unit_price=1500, currency="PKR"),
            ServicePart(name="Chain Lube — WD-40 Specialist", brand="WD-40", category="chain_lube", vehicle_type_scope="motorcycle", unit_price=1200, currency="PKR"),
            ServicePart(name="Brake Pad Set — Front (Standard)", brand="Generic", category="brake_pad", vehicle_type_scope="motorcycle", unit_price=600, currency="PKR"),
            ServicePart(name="Brake Pad Set — Front (Heavy Duty)", brand="EBC", category="brake_pad", vehicle_type_scope="motorcycle", unit_price=1200, currency="PKR"),
            ServicePart(name="Brake Pad Set — Rear (Standard)", brand="Generic", category="brake_pad", vehicle_type_scope="motorcycle", unit_price=500, currency="PKR"),
            ServicePart(name="NGK Spark Plug — C7HSA", brand="NGK", category="spark_plug", vehicle_type_scope="motorcycle", unit_price=350, currency="PKR"),
            ServicePart(name="NGK Spark Plug — CR7HSA (Iridium)", brand="NGK", category="spark_plug", vehicle_type_scope="motorcycle", unit_price=850, currency="PKR"),
            ServicePart(name="NGK Spark Plug — DPR8EA-9", brand="NGK", category="spark_plug", vehicle_type_scope="motorcycle", unit_price=450, currency="PKR"),
        ]
        session.add_all(parts)
        session.commit()
        print(f"✅ Parts catalog seeded ({len(parts)} items)")
    else:
        print(f"⏭️  Parts already exist ({existing_parts} items), skipping")

    # ------------------------------------------------------------------
    # 3. Demo Users
    # ------------------------------------------------------------------
    existing_users = session.query(User).count()
    if existing_users == 0:
        users = [
            User(
                name="Admin Amaan",
                email="admin@gearify.pk",
                password_hash=generate_password_hash("admin123"),
                role="admin",
            ),
            User(
                name="Mechanic Hamid",
                email="hamid@gearify.pk",
                password_hash=generate_password_hash("mech123"),
                role="mechanic",
            ),
            User(
                name="Mechanic Ali",
                email="ali@gearify.pk",
                password_hash=generate_password_hash("mech456"),
                role="mechanic",
            ),
        ]
        session.add_all(users)
        session.commit()
        print("✅ Demo users seeded (admin@gearify.pk / admin123, hamid@gearify.pk / mech123)")
    else:
        print(f"⏭️  Users already exist ({existing_users}), skipping")

    # ------------------------------------------------------------------
    # 4. Demo Vehicles (migrated from v1 cars.json + added bikes)
    # ------------------------------------------------------------------
    existing_vehicles = session.query(Vehicle).count()
    if existing_vehicles == 0:
        vehicles = [
            Vehicle(registration_no="APS-2342", make="Honda", model="Accord", year=2019, vehicle_type="car", current_km=49556, owner_name="Amjad Khan"),
            Vehicle(registration_no="LEE-2233", make="KIA", model="Sportage", year=2020, vehicle_type="car", current_km=8500, owner_name="Nalain Butt"),
            Vehicle(registration_no="DFG-2345", make="Toyota", model="Yaris", year=2020, vehicle_type="car", current_km=142000, owner_name="Ali Raza"),
            Vehicle(registration_no="LEU-786", make="BMW", model="M5 CS", year=2021, vehicle_type="car", current_km=7200, owner_name="Zeyan Ahmed"),
            Vehicle(registration_no="LM-334", make="Toyota", model="Corolla", year=2021, vehicle_type="car", current_km=18500, owner_name="Saba Fatima"),
            Vehicle(registration_no="LM-356", make="Toyota", model="Corolla", year=2021, vehicle_type="car", current_km=16200, owner_name="Imran Shah"),
            Vehicle(registration_no="MS-234", make="Mercedes", model="CLS-63", year=2021, vehicle_type="car", current_km=21000, owner_name="Mahenur"),
            Vehicle(registration_no="EDS-3241", make="DFSK", model="Glory", year=2020, vehicle_type="lcv", current_km=237000, owner_name="Hamza Ali"),
            Vehicle(registration_no="DFG-2344", make="Mazda", model="RX8", year=2003, vehicle_type="car", current_km=252000, owner_name="Ahmad"),
            Vehicle(registration_no="ERF-5670", make="MG", model="ZX", year=2020, vehicle_type="car", current_km=62000, owner_name="Hamid"),
            # Motorcycles — Pakistan market bikes
            Vehicle(registration_no="LHR-7070", make="Honda", model="CD70", year=2024, vehicle_type="motorcycle", current_km=12000, owner_name="Faisal"),
            Vehicle(registration_no="ISB-1250", make="Honda", model="CG125", year=2023, vehicle_type="motorcycle", current_km=28000, owner_name="Bilal"),
            Vehicle(registration_no="KHI-1500", make="Honda", model="CB150F", year=2024, vehicle_type="motorcycle", current_km=8500, owner_name="Usman"),
            Vehicle(registration_no="LHR-1252", make="Yamaha", model="YBR125", year=2023, vehicle_type="motorcycle", current_km=35000, owner_name="Tariq"),
            Vehicle(registration_no="FSD-1100", make="Suzuki", model="GD110S", year=2022, vehicle_type="motorcycle", current_km=42000, owner_name="Waseem"),
        ]
        session.add_all(vehicles)
        session.commit()
        print(f"✅ Demo vehicles seeded ({len(vehicles)} vehicles)")
    else:
        print(f"⏭️  Vehicles already exist ({existing_vehicles}), skipping")

    # ------------------------------------------------------------------
    # 5. Demo Service Records
    # ------------------------------------------------------------------
    existing_records = session.query(ServiceRecord).count()
    if existing_records == 0:
        # Get references
        admin = session.query(User).filter_by(email="admin@gearify.pk").first()
        mechanic = session.query(User).filter_by(email="hamid@gearify.pk").first()
        if admin and mechanic:
            v_accord = session.query(Vehicle).filter_by(registration_no="APS-2342").first()
            v_yaris = session.query(Vehicle).filter_by(registration_no="DFG-2345").first()
            v_cd70 = session.query(Vehicle).filter_by(registration_no="LHR-7070").first()
            v_corolla = session.query(Vehicle).filter_by(registration_no="LM-334").first()
            v_sportage = session.query(Vehicle).filter_by(registration_no="LEE-2233").first()
            v_cls = session.query(Vehicle).filter_by(registration_no="MS-234").first()
            v_ybr = session.query(Vehicle).filter_by(registration_no="LHR-1252").first()

            now = datetime.now(timezone.utc)
            records_data = [
                # Honda Accord — serviced 2 months ago
                {
                    "vehicle": v_accord,
                    "mechanic": mechanic,
                    "km": 42000,
                    "next_km": 57000,
                    "total": 8000,
                    "date": now - timedelta(days=60),
                    "parts": [
                        ("Shell Helix HX7 (10W-40)", 4500),
                        ("Leppon Premium Air Filter", 1800),
                        ("Vic C-110 (Japan)", 1500),
                    ],
                },
                # Toyota Yaris — serviced 5 months ago, nearly overdue
                {
                    "vehicle": v_yaris,
                    "mechanic": admin,
                    "km": 135000,
                    "next_km": 150000,
                    "total": 9200,
                    "date": now - timedelta(days=150),
                    "parts": [
                        ("ZIC X7 (5W-30)", 5200),
                        ("Wix High-Flow Air Filter", 2500),
                        ("Vic C-110 (Japan)", 1500),
                    ],
                },
                # Honda CD70 — serviced last week, healthy
                {
                    "vehicle": v_cd70,
                    "mechanic": mechanic,
                    "km": 11500,
                    "next_km": 14500,
                    "total": 1250,
                    "date": now - timedelta(days=7),
                    "parts": [
                        ("Shell Advance AX5 (15W-40)", 850),
                        ("Blue Silver (20W-50)", 400),
                    ],
                },
                # Toyota Corolla — overdue (serviced 7 months ago)
                {
                    "vehicle": v_corolla,
                    "mechanic": admin,
                    "km": 5000,
                    "next_km": 20000,
                    "total": 8800,
                    "date": now - timedelta(days=210),
                    "parts": [
                        ("ZIC X7 (5W-30)", 5200),
                        ("Wix High-Flow Air Filter", 2500),
                        ("Leppon Performance Filter", 1100),
                    ],
                },
                # KIA Sportage — serviced 1 month ago
                {
                    "vehicle": v_sportage,
                    "mechanic": mechanic,
                    "km": 6000,
                    "next_km": 21000,
                    "total": 7150,
                    "date": now - timedelta(days=30),
                    "parts": [
                        ("Caltex Havoline (20W-50)", 3800),
                        ("Guard Autozone Air Filter", 1200),
                        ("Guard Standard Filter", 850),
                    ],
                },
                # Mercedes CLS — just serviced
                {
                    "vehicle": v_cls,
                    "mechanic": admin,
                    "km": 20000,
                    "next_km": 35000,
                    "total": 10500,
                    "date": now - timedelta(days=3),
                    "parts": [
                        ("Castrol Magnatec (5W-30)", 5800),
                        ("K&N Performance Air Filter", 4500),
                    ],
                    "notes": None,
                },
                # Yamaha YBR125 — overdue, needs attention
                {
                    "vehicle": v_ybr,
                    "mechanic": mechanic,
                    "km": 32000,
                    "next_km": 35000,
                    "total": 2200,
                    "date": now - timedelta(days=120),
                    "parts": [
                        ("Castrol Power1 (10W-40)", 950),
                        ("NGK Spark Plug — C7HSA", 350),
                        ("Chain Lube — Motul C2", 1500),
                    ],
                    "notes": "Chain stretched, needs replacement at next visit",
                },
            ]

            for rd in records_data:
                if not rd["vehicle"]:
                    continue
                record = ServiceRecord(
                    vehicle_id=rd["vehicle"].id,
                    mechanic_id=rd["mechanic"].id,
                    labor_cost=0,
                    total_cost=rd["total"],
                    currency="PKR",
                    km_at_service=rd["km"],
                    next_service_km=rd["next_km"],
                    mechanic_notes=rd.get("notes"),
                    created_at=rd["date"],
                )
                session.add(record)
                session.flush()  # get record.id

                # pyrefly: ignore [not-iterable]
                for part_name, price in rd["parts"]:
                    part_obj = session.query(ServicePart).filter_by(name=part_name).first()
                    line = ServiceLineItem(
                        service_record_id=record.id,
                        service_part_id=part_obj.id if part_obj else None,
                        part_name_snapshot=part_name,
                        unit_price_snapshot=price,
                        quantity=1,
                        subtotal=price,
                    )
                    session.add(line)

            session.commit()
            print(f"✅ Demo service records seeded ({len(records_data)} records)")
    else:
        print(f"⏭️  Service records already exist ({existing_records}), skipping")

    session.close()
    print("=" * 50)
    print("🏁 Seeding complete!")


if __name__ == "__main__":
    seed()
