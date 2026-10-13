from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Bin, TelemetryHistory, CollectionAlert
from schemas import BinResponse
from simulator import simulation_tick, empty_bin_record, spike_bin_fill, init_default_data

router = APIRouter(prefix="/api/simulation", tags=["IoT Simulation"])

@router.post("/tick")
def trigger_tick(multiplier: float = Query(1.0, ge=0.1, le=10.0), db: Session = Depends(get_db)):
    """Advances telemetry simulation by 1 tick (simulates ~10 mins)."""
    simulation_tick(db, multiplier=multiplier)
    bins = db.query(Bin).all()
    return {
        "message": f"Simulation advanced with multiplier {multiplier}x",
        "bins_updated": len(bins),
        "critical_bins": sum(1 for b in bins if b.status == "CRITICAL"),
        "warning_bins": sum(1 for b in bins if b.status == "WARNING")
    }

@router.post("/empty/{bin_id}", response_model=BinResponse)
def empty_bin(bin_id: int, db: Session = Depends(get_db)):
    """Empties bin, clears alerts, resets odor."""
    updated = empty_bin_record(db, bin_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Bin not found")
    return updated

@router.post("/spike/{bin_id}", response_model=BinResponse)
def spike_bin(bin_id: int, target_fill: float = Query(..., ge=0.0, le=100.0), db: Session = Depends(get_db)):
    """Spikes or overrides bin fill level for demonstration."""
    updated = spike_bin_fill(db, bin_id, target_fill)
    if not updated:
        raise HTTPException(status_code=404, detail="Bin not found")
    return updated

@router.post("/reset")
def reset_simulation(db: Session = Depends(get_db)):
    """Wipes and re-initializes all sample data."""
    db.query(TelemetryHistory).delete()
    db.query(CollectionAlert).delete()
    db.query(Bin).delete()
    db.commit()
    init_default_data(db)
    return {"message": "Campus bins and telemetry re-seeded to default demo state"}
