from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import SystemConfig
from schemas import SystemConfigSchema

router = APIRouter(prefix="/api/settings", tags=["System Settings"])

@router.get("", response_model=SystemConfigSchema)
def get_system_settings(db: Session = Depends(get_db)):
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
        db.refresh(config)
    return config

@router.put("", response_model=SystemConfigSchema)
def update_system_settings(data: SystemConfigSchema, db: Session = Depends(get_db)):
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig(id=1)
        db.add(config)
    
    config.warning_threshold = data.warning_threshold
    config.critical_threshold = data.critical_threshold
    config.simulation_speed = data.simulation_speed
    config.map_center_lat = data.map_center_lat
    config.map_center_lng = data.map_center_lng
    config.ai_engine_mode = data.ai_engine_mode

    db.commit()
    db.refresh(config)
    return config
