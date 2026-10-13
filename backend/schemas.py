from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

# User Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    department: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Bin Schemas
class BinBase(BaseModel):
    bin_code: str
    name: str
    location_name: str
    latitude: float
    longitude: float
    zone: str = "Academic"
    waste_type: str = "Mixed"
    capacity_liters: float = 120.0
    fill_rate_per_hour: float = 3.0

class BinCreate(BinBase):
    fill_level: Optional[float] = 0.0

class BinUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone: Optional[str] = None
    waste_type: Optional[str] = None
    capacity_liters: Optional[float] = None
    fill_level: Optional[float] = None
    status: Optional[str] = None
    fill_rate_per_hour: Optional[float] = None

class BinResponse(BinBase):
    id: int
    fill_level: float
    temperature: float
    humidity: float
    odor_ppm: float
    battery_level: float
    lid_open: bool
    status: str
    last_emptied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Telemetry History Schema
class TelemetryPoint(BaseModel):
    timestamp: datetime
    fill_level: float
    temperature: float
    humidity: float
    odor_ppm: float
    battery_level: float

    model_config = ConfigDict(from_attributes=True)

# Collection Alert Schemas
class CollectionAlertCreate(BaseModel):
    bin_id: int
    severity: str = "HIGH"
    notes: Optional[str] = None

class CollectionAlertUpdate(BaseModel):
    status: str
    driver_name: Optional[str] = None
    notes: Optional[str] = None

class CollectionAlertResponse(BaseModel):
    id: int
    bin_id: int
    bin_name: Optional[str] = None
    bin_code: Optional[str] = None
    location_name: Optional[str] = None
    fill_level: Optional[float] = None
    created_at: datetime
    status: str
    severity: str
    driver_name: Optional[str] = None
    notes: Optional[str] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Vision Detection Schemas
class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int
    label: str
    confidence: float

class DetectionResult(BaseModel):
    detected_class: str
    confidence: float
    recyclable: bool
    contamination_level: str
    disposal_guide: str
    inference_engine: str
    bounding_boxes: List[BoundingBox] = []
    annotated_image: Optional[str] = None
    is_demo_mode: bool = False

# System Config Schemas
class SystemConfigSchema(BaseModel):
    warning_threshold: float = 70.0
    critical_threshold: float = 90.0
    simulation_speed: float = 1.0
    map_center_lat: float = 12.9716
    map_center_lng: float = 77.5946
    ai_engine_mode: str = "AUTO_HYBRID"

    model_config = ConfigDict(from_attributes=True)

# AI Recommendation Schemas
class RouteStop(BaseModel):
    bin_id: int
    bin_code: str
    name: str
    location_name: str
    fill_level: float
    latitude: float
    longitude: float
    priority: int

class AIRecommendationResponse(BaseModel):
    timestamp: str
    urgent_bins_count: int
    recommended_route: List[RouteStop]
    estimated_distance_km: float
    estimated_fuel_saved_percent: float
    time_critical_advisories: List[str]
    capacity_optimization_tips: List[str]
    source: str

class AIChatQuery(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    response: str
    source: str
