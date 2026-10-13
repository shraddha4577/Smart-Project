from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="user")  # 'admin' or 'user'
    department = Column(String(100), default="Campus Member")
    created_at = Column(DateTime, default=datetime.utcnow)

class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    zone = Column(String(50), default="Academic")
    waste_type = Column(String(50), default="Mixed")
    capacity_liters = Column(Float, default=120.0)
    fill_level = Column(Float, default=0.0)  # Percentage 0-100
    temperature = Column(Float, default=26.5)  # Celsius
    humidity = Column(Float, default=55.0)  # Percentage
    odor_ppm = Column(Float, default=12.0)  # PPM
    battery_level = Column(Float, default=95.0)  # Percentage
    lid_open = Column(Boolean, default=False)
    status = Column(String(20), default="NORMAL")  # NORMAL, WARNING, CRITICAL, MAINTENANCE
    fill_rate_per_hour = Column(Float, default=3.2)  # % / hour
    last_emptied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    telemetry = relationship("TelemetryHistory", back_populates="bin", cascade="all, delete-orphan")
    alerts = relationship("CollectionAlert", back_populates="bin", cascade="all, delete-orphan")

class TelemetryHistory(Base):
    __tablename__ = "telemetry_history"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    fill_level = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    odor_ppm = Column(Float, nullable=False)
    battery_level = Column(Float, nullable=False)

    bin = relationship("Bin", back_populates="telemetry")

class CollectionAlert(Base):
    __tablename__ = "collection_alerts"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(30), default="PENDING")  # PENDING, ASSIGNED, IN_PROGRESS, RESOLVED
    severity = Column(String(20), default="HIGH")  # HIGH, CRITICAL
    driver_name = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    bin = relationship("Bin", back_populates="alerts")

class WasteDetectionLog(Base):
    __tablename__ = "waste_detections"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    detected_class = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    recyclable = Column(Boolean, default=True)
    contamination_level = Column(String(20), default="LOW")
    disposal_guide = Column(Text, nullable=True)
    inference_engine = Column(String(100), default="OpenCV & Heuristic AI")
    bounding_boxes_json = Column(Text, nullable=True)
    annotated_image = Column(Text, nullable=True)  # Base64 string

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, default=1)
    warning_threshold = Column(Float, default=70.0)
    critical_threshold = Column(Float, default=90.0)
    simulation_speed = Column(Float, default=1.0)
    map_center_lat = Column(Float, default=12.9716)
    map_center_lng = Column(Float, default=77.5946)
    ai_engine_mode = Column(String(50), default="AUTO_HYBRID")
