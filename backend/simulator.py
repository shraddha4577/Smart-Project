import math
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import User, Bin, TelemetryHistory, CollectionAlert, SystemConfig

DEFAULT_BINS = [
    {
        "bin_code": "BIN-CAMPUS-01",
        "name": "Academic Complex Plaza",
        "location_name": "Block A Central Courtyard",
        "latitude": 12.9722,
        "longitude": 77.5938,
        "zone": "Academic",
        "waste_type": "Mixed",
        "capacity_liters": 120.0,
        "fill_level": 82.5,
        "temperature": 28.4,
        "humidity": 58.0,
        "odor_ppm": 18.2,
        "battery_level": 92.0,
        "lid_open": False,
        "fill_rate_per_hour": 3.5,
    },
    {
        "bin_code": "BIN-CAMPUS-02",
        "name": "Central Cafeteria & Food Court",
        "location_name": "South Cafeteria Dining Exit",
        "latitude": 12.9710,
        "longitude": 77.5942,
        "zone": "Cafeteria",
        "waste_type": "Organic",
        "capacity_liters": 150.0,
        "fill_level": 94.5,
        "temperature": 31.8,
        "humidity": 72.0,
        "odor_ppm": 38.5,
        "battery_level": 88.0,
        "lid_open": False,
        "fill_rate_per_hour": 5.8,
    },
    {
        "bin_code": "BIN-CAMPUS-03",
        "name": "Engineering Tech Labs",
        "location_name": "Robotics & Hardware Annex",
        "latitude": 12.9735,
        "longitude": 77.5955,
        "zone": "Research Park",
        "waste_type": "E-Waste",
        "capacity_liters": 100.0,
        "fill_level": 42.0,
        "temperature": 24.1,
        "humidity": 48.0,
        "odor_ppm": 6.0,
        "battery_level": 98.0,
        "lid_open": False,
        "fill_rate_per_hour": 1.2,
    },
    {
        "bin_code": "BIN-CAMPUS-04",
        "name": "Central Library Quad",
        "location_name": "Library East Portico",
        "latitude": 12.9708,
        "longitude": 77.5925,
        "zone": "Academic",
        "waste_type": "Paper",
        "capacity_liters": 120.0,
        "fill_level": 28.0,
        "temperature": 23.5,
        "humidity": 50.0,
        "odor_ppm": 4.5,
        "battery_level": 94.0,
        "lid_open": False,
        "fill_rate_per_hour": 1.8,
    },
    {
        "bin_code": "BIN-CAMPUS-05",
        "name": "Student Hostel Complex",
        "location_name": "Hostel Block 3 Entrance",
        "latitude": 12.9695,
        "longitude": 77.5960,
        "zone": "Hostel",
        "waste_type": "Plastic",
        "capacity_liters": 140.0,
        "fill_level": 88.0,
        "temperature": 29.2,
        "humidity": 62.0,
        "odor_ppm": 14.8,
        "battery_level": 85.0,
        "lid_open": True,
        "fill_rate_per_hour": 4.2,
    },
    {
        "bin_code": "BIN-CAMPUS-06",
        "name": "Sports Arena & Track",
        "location_name": "Grandstand North Gate",
        "latitude": 12.9740,
        "longitude": 77.5920,
        "zone": "Sports Arena",
        "waste_type": "Mixed",
        "capacity_liters": 120.0,
        "fill_level": 35.0,
        "temperature": 27.0,
        "humidity": 55.0,
        "odor_ppm": 8.0,
        "battery_level": 91.0,
        "lid_open": False,
        "fill_rate_per_hour": 2.4,
    },
    {
        "bin_code": "BIN-CAMPUS-07",
        "name": "Administrative Tower Lawn",
        "location_name": "Main Reception Fountain",
        "latitude": 12.9715,
        "longitude": 77.5950,
        "zone": "Admin Block",
        "waste_type": "Mixed",
        "capacity_liters": 100.0,
        "fill_level": 64.0,
        "temperature": 25.8,
        "humidity": 52.0,
        "odor_ppm": 9.2,
        "battery_level": 96.0,
        "lid_open": False,
        "fill_rate_per_hour": 2.1,
    },
    {
        "bin_code": "BIN-CAMPUS-08",
        "name": "Innovation Center Courtyard",
        "location_name": "Startup Incubator Lawn",
        "latitude": 12.9728,
        "longitude": 77.5965,
        "zone": "Research Park",
        "waste_type": "Glass & Metal",
        "capacity_liters": 120.0,
        "fill_level": 74.0,
        "temperature": 26.5,
        "humidity": 54.0,
        "odor_ppm": 11.0,
        "battery_level": 89.0,
        "lid_open": False,
        "fill_rate_per_hour": 2.8,
    },
]

def determine_status(fill_level: float, warning_th: float = 70.0, critical_th: float = 90.0) -> str:
    if fill_level >= critical_th:
        return "CRITICAL"
    elif fill_level >= warning_th:
        return "WARNING"
    return "NORMAL"

def init_default_data(db: Session):
    # 1. System Config
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig(
            id=1,
            warning_threshold=70.0,
            critical_threshold=90.0,
            simulation_speed=1.0,
            map_center_lat=12.9716,
            map_center_lng=77.5946,
            ai_engine_mode="AUTO_HYBRID"
        )
        db.add(config)
        db.commit()

    # 2. Users (Admin and User)
    if db.query(User).count() == 0:
        admin_user = User(
            username="admin",
            password="admin123",  # College demo clear credentials
            full_name="Dr. Evelyn Reed",
            role="admin",
            department="Facilities & Environmental Services"
        )
        student_user = User(
            username="student",
            password="user123",  # College demo clear credentials
            full_name="Alex Rivera",
            role="user",
            department="Campus Green Council / CS Dept"
        )
        db.add_all([admin_user, student_user])
        db.commit()

    # 3. Bins & Initial Telemetry
    if db.query(Bin).count() == 0:
        now = datetime.utcnow()
        for b_data in DEFAULT_BINS:
            status = determine_status(b_data["fill_level"], config.warning_threshold, config.critical_threshold)
            bin_obj = Bin(
                bin_code=b_data["bin_code"],
                name=b_data["name"],
                location_name=b_data["location_name"],
                latitude=b_data["latitude"],
                longitude=b_data["longitude"],
                zone=b_data["zone"],
                waste_type=b_data["waste_type"],
                capacity_liters=b_data["capacity_liters"],
                fill_level=b_data["fill_level"],
                temperature=b_data["temperature"],
                humidity=b_data["humidity"],
                odor_ppm=b_data["odor_ppm"],
                battery_level=b_data["battery_level"],
                lid_open=b_data["lid_open"],
                status=status,
                fill_rate_per_hour=b_data["fill_rate_per_hour"],
                last_emptied_at=now - timedelta(hours=random.randint(6, 24)),
                updated_at=now
            )
            db.add(bin_obj)
            db.flush()

            # Seed 24 historical points for telemetry charts
            base_fill = max(10.0, b_data["fill_level"] - 45.0)
            for i in range(24, 0, -1):
                hist_time = now - timedelta(hours=i)
                # Gradual filling curve with slight noise
                curve_fraction = (24 - i) / 24.0
                hist_fill = min(100.0, base_fill + (b_data["fill_level"] - base_fill) * curve_fraction + random.uniform(-1.5, 1.5))
                hist_temp = b_data["temperature"] + random.uniform(-2.0, 2.0)
                hist_hum = b_data["humidity"] + random.uniform(-4.0, 4.0)
                hist_odor = max(2.0, (hist_fill / 100.0) * 35.0 + random.uniform(-2.0, 2.0))
                hist_batt = min(100.0, b_data["battery_level"] + (i * 0.04))

                hist_entry = TelemetryHistory(
                    bin_id=bin_obj.id,
                    timestamp=hist_time,
                    fill_level=round(hist_fill, 1),
                    temperature=round(hist_temp, 1),
                    humidity=round(hist_hum, 1),
                    odor_ppm=round(hist_odor, 1),
                    battery_level=round(hist_batt, 1)
                )
                db.add(hist_entry)

            # Generate alert if critical
            if status == "CRITICAL":
                alert = CollectionAlert(
                    bin_id=bin_obj.id,
                    created_at=now - timedelta(minutes=45),
                    status="PENDING",
                    severity="CRITICAL",
                    notes="Automated trigger: Fill level crossed 90% threshold in high-traffic food court.",
                    driver_name=None
                )
                db.add(alert)
            elif status == "WARNING":
                alert = CollectionAlert(
                    bin_id=bin_obj.id,
                    created_at=now - timedelta(minutes=90),
                    status="ASSIGNED",
                    severity="HIGH",
                    notes="Approaching capacity. Pre-routed for afternoon collection batch.",
                    driver_name="Driver Raj (Truck #3)"
                )
                db.add(alert)

        db.commit()

def simulation_tick(db: Session, multiplier: float = 1.0):
    """Advances sensor telemetry with physics & environment jitter."""
    config = db.query(SystemConfig).first()
    warning_th = config.warning_threshold if config else 70.0
    critical_th = config.critical_threshold if config else 90.0

    bins = db.query(Bin).all()
    now = datetime.utcnow()

    for b in bins:
        # Increase fill level based on fill rate and multiplier
        # 1 tick simulates roughly 10 minutes of waste accumulation
        fill_delta = (b.fill_rate_per_hour / 6.0) * multiplier * random.uniform(0.7, 1.3)
        new_fill = min(100.0, round(b.fill_level + fill_delta, 1))

        # Sensor micro-jitter
        temp_delta = random.uniform(-0.3, 0.4)
        new_temp = round(max(20.0, min(45.0, b.temperature + temp_delta)), 1)

        hum_delta = random.uniform(-0.8, 0.8)
        new_hum = round(max(30.0, min(90.0, b.humidity + hum_delta)), 1)

        # Odor increases if organic/mixed waste is high & warm
        decomposition_factor = (new_fill / 100.0) * (1.3 if b.waste_type in ["Organic", "Mixed"] else 0.7)
        new_odor = round(max(2.0, 5.0 + (decomposition_factor * 35.0) + random.uniform(-1.0, 1.0)), 1)

        # Battery slow drain
        new_batt = round(max(5.0, b.battery_level - (0.005 * multiplier)), 1)

        # Status update
        new_status = determine_status(new_fill, warning_th, critical_th)

        b.fill_level = new_fill
        b.temperature = new_temp
        b.humidity = new_hum
        b.odor_ppm = new_odor
        b.battery_level = new_batt
        b.status = new_status
        b.updated_at = now

        # Add to telemetry history
        hist = TelemetryHistory(
            bin_id=b.id,
            timestamp=now,
            fill_level=new_fill,
            temperature=new_temp,
            humidity=new_hum,
            odor_ppm=new_odor,
            battery_level=new_batt
        )
        db.add(hist)

        # Automatically create alert if critical and no pending alert exists
        if new_status == "CRITICAL":
            existing = db.query(CollectionAlert).filter(
                CollectionAlert.bin_id == b.id,
                CollectionAlert.status.in_(["PENDING", "ASSIGNED", "IN_PROGRESS"])
            ).first()
            if not existing:
                new_alert = CollectionAlert(
                    bin_id=b.id,
                    created_at=now,
                    status="PENDING",
                    severity="CRITICAL",
                    notes=f"Auto-alert: Fill reached {new_fill}% at {b.location_name}",
                    driver_name=None
                )
                db.add(new_alert)

    db.commit()

def empty_bin_record(db: Session, bin_id: int):
    """Simulates truck emptying a smart bin."""
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        return None
    now = datetime.utcnow()
    b.fill_level = 0.0
    b.odor_ppm = round(random.uniform(2.5, 4.5), 1)
    b.status = "NORMAL"
    b.lid_open = False
    b.last_emptied_at = now
    b.updated_at = now

    # Resolve pending alerts
    alerts = db.query(CollectionAlert).filter(
        CollectionAlert.bin_id == bin_id,
        CollectionAlert.status.in_(["PENDING", "ASSIGNED", "IN_PROGRESS"])
    ).all()
    for al in alerts:
        al.status = "RESOLVED"
        al.resolved_at = now
        al.notes = (al.notes or "") + f" | Bin emptied successfully at {now.strftime('%H:%M:%S')}."

    # Record reset in telemetry
    hist = TelemetryHistory(
        bin_id=b.id,
        timestamp=now,
        fill_level=0.0,
        temperature=b.temperature,
        humidity=b.humidity,
        odor_ppm=b.odor_ppm,
        battery_level=b.battery_level
    )
    db.add(hist)
    db.commit()
    db.refresh(b)
    return b

def spike_bin_fill(db: Session, bin_id: int, target_fill: float):
    """Sets a specific fill level for college demonstration."""
    b = db.query(Bin).filter(Bin.id == bin_id).first()
    if not b:
        return None
    config = db.query(SystemConfig).first()
    warning_th = config.warning_threshold if config else 70.0
    critical_th = config.critical_threshold if config else 90.0

    b.fill_level = min(100.0, max(0.0, target_fill))
    b.status = determine_status(b.fill_level, warning_th, critical_th)
    b.updated_at = datetime.utcnow()

    if b.status == "CRITICAL":
        existing = db.query(CollectionAlert).filter(
            CollectionAlert.bin_id == b.id,
            CollectionAlert.status.in_(["PENDING", "ASSIGNED", "IN_PROGRESS"])
        ).first()
        if not existing:
            new_alert = CollectionAlert(
                bin_id=b.id,
                created_at=datetime.utcnow(),
                status="PENDING",
                severity="CRITICAL",
                notes=f"Demo override: Bin spiked to {b.fill_level}% fill.",
                driver_name=None
            )
            db.add(new_alert)

    db.commit()
    db.refresh(b)
    return b
