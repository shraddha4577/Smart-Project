from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Bin, TelemetryHistory, SystemConfig
from schemas import BinResponse, BinCreate, BinUpdate, TelemetryPoint
from simulator import determine_status

router = APIRouter(prefix="/api/bins", tags=["Bins"])

@router.get("", response_model=List[BinResponse])
def get_all_bins(
    zone: Optional[str] = None,
    waste_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Bin)
    if zone:
        query = query.filter(Bin.zone == zone)
    if waste_type:
        query = query.filter(Bin.waste_type == waste_type)
    if status:
        query = query.filter(Bin.status == status)
    return query.order_by(Bin.id).all()

@router.get("/{bin_id}", response_model=BinResponse)
def get_bin(bin_id: int, db: Session = Depends(get_db)):
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    return bin_obj

@router.post("", response_model=BinResponse)
def create_bin(bin_data: BinCreate, db: Session = Depends(get_db)):
    existing = db.query(Bin).filter(Bin.bin_code == bin_data.bin_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bin code already exists")
    
    config = db.query(SystemConfig).first()
    warning_th = config.warning_threshold if config else 70.0
    critical_th = config.critical_threshold if config else 90.0

    fill = bin_data.fill_level or 0.0
    bin_status = determine_status(fill, warning_th, critical_th)

    new_bin = Bin(
        bin_code=bin_data.bin_code,
        name=bin_data.name,
        location_name=bin_data.location_name,
        latitude=bin_data.latitude,
        longitude=bin_data.longitude,
        zone=bin_data.zone,
        waste_type=bin_data.waste_type,
        capacity_liters=bin_data.capacity_liters,
        fill_level=fill,
        status=bin_status,
        fill_rate_per_hour=bin_data.fill_rate_per_hour,
        last_emptied_at=datetime.utcnow()
    )
    db.add(new_bin)
    db.commit()
    db.refresh(new_bin)
    return new_bin

@router.put("/{bin_id}", response_model=BinResponse)
def update_bin(bin_id: int, update_data: BinUpdate, db: Session = Depends(get_db)):
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    config = db.query(SystemConfig).first()
    warning_th = config.warning_threshold if config else 70.0
    critical_th = config.critical_threshold if config else 90.0

    for key, val in update_data.model_dump(exclude_unset=True).items():
        setattr(bin_obj, key, val)

    if update_data.fill_level is not None:
        bin_obj.status = determine_status(bin_obj.fill_level, warning_th, critical_th)

    bin_obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bin_obj)
    return bin_obj

@router.delete("/{bin_id}")
def delete_bin(bin_id: int, db: Session = Depends(get_db)):
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    db.delete(bin_obj)
    db.commit()
    return {"message": f"Bin {bin_obj.bin_code} deleted successfully"}

@router.get("/{bin_id}/history", response_model=List[TelemetryPoint])
def get_bin_telemetry_history(
    bin_id: int,
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db)
):
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    history = db.query(TelemetryHistory).filter(
        TelemetryHistory.bin_id == bin_id
    ).order_by(TelemetryHistory.timestamp.asc()).limit(limit).all()
    return history
