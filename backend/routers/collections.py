from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import CollectionAlert, Bin
from schemas import CollectionAlertResponse, CollectionAlertCreate, CollectionAlertUpdate
from simulator import empty_bin_record

router = APIRouter(prefix="/api/collections", tags=["Collection Management"])

@router.get("", response_model=List[CollectionAlertResponse])
def get_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CollectionAlert)
    if status:
        query = query.filter(CollectionAlert.status == status)
    alerts = query.order_by(CollectionAlert.created_at.desc()).all()

    # Join bin details for response
    results = []
    for a in alerts:
        b = a.bin
        results.append(CollectionAlertResponse(
            id=a.id,
            bin_id=a.bin_id,
            bin_name=b.name if b else "Unknown Bin",
            bin_code=b.bin_code if b else "",
            location_name=b.location_name if b else "",
            fill_level=b.fill_level if b else 0.0,
            created_at=a.created_at,
            status=a.status,
            severity=a.severity,
            driver_name=a.driver_name,
            notes=a.notes,
            resolved_at=a.resolved_at
        ))
    return results

@router.post("", response_model=CollectionAlertResponse)
def create_manual_alert(data: CollectionAlertCreate, db: Session = Depends(get_db)):
    bin_obj = db.query(Bin).filter(Bin.id == data.bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    alert = CollectionAlert(
        bin_id=data.bin_id,
        severity=data.severity,
        notes=data.notes or "Manual collection request submitted.",
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    return CollectionAlertResponse(
        id=alert.id,
        bin_id=alert.bin_id,
        bin_name=bin_obj.name,
        bin_code=bin_obj.bin_code,
        location_name=bin_obj.location_name,
        fill_level=bin_obj.fill_level,
        created_at=alert.created_at,
        status=alert.status,
        severity=alert.severity,
        driver_name=alert.driver_name,
        notes=alert.notes,
        resolved_at=alert.resolved_at
    )

@router.put("/{alert_id}", response_model=CollectionAlertResponse)
def update_alert(alert_id: int, data: CollectionAlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(CollectionAlert).filter(CollectionAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = data.status
    if data.driver_name:
        alert.driver_name = data.driver_name
    if data.notes:
        alert.notes = data.notes
    
    if data.status == "RESOLVED":
        alert.resolved_at = datetime.utcnow()
        # Also empty the bin
        empty_bin_record(db, alert.bin_id)

    db.commit()
    db.refresh(alert)
    b = alert.bin
    return CollectionAlertResponse(
        id=alert.id,
        bin_id=alert.bin_id,
        bin_name=b.name if b else "",
        bin_code=b.bin_code if b else "",
        location_name=b.location_name if b else "",
        fill_level=b.fill_level if b else 0.0,
        created_at=alert.created_at,
        status=alert.status,
        severity=alert.severity,
        driver_name=alert.driver_name,
        notes=alert.notes,
        resolved_at=alert.resolved_at
    )

@router.post("/dispatch-all")
def dispatch_all_critical(db: Session = Depends(get_db)):
    """Dispatches fleet team for all pending critical alerts."""
    pending = db.query(CollectionAlert).filter(CollectionAlert.status == "PENDING").all()
    count = 0
    driver_pool = ["Truck #1 (Driver Kumar)", "Truck #2 (Driver Sarah)", "EV-Van #4 (Driver Alex)"]
    for i, a in enumerate(pending):
        a.status = "ASSIGNED"
        a.driver_name = driver_pool[i % len(driver_pool)]
        a.notes = (a.notes or "") + " | Auto-dispatched via Fleet Route Optimizer."
        count += 1
    db.commit()
    return {"message": f"Dispatched {count} collection task(s)", "dispatched_count": count}
