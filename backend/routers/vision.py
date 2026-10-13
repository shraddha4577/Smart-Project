import json
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import WasteDetectionLog
from schemas import DetectionResult
from ai_vision import analyze_waste_image

router = APIRouter(prefix="/api/vision", tags=["AI Waste Vision"])

@router.post("/classify", response_model=DetectionResult)
async def classify_waste_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts waste image upload, runs OpenCV / YOLO object detection and classification,
    and returns bounding boxes, recyclable classification, and demo mode indicator.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image uploaded")
    
    try:
        result = analyze_waste_image(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")

    # Log detection in database
    log_entry = WasteDetectionLog(
        detected_class=result["detected_class"],
        confidence=result["confidence"],
        recyclable=result["recyclable"],
        contamination_level=result["contamination_level"],
        disposal_guide=result["disposal_guide"],
        inference_engine=result["inference_engine"],
        bounding_boxes_json=json.dumps(result["bounding_boxes"]),
        annotated_image=result["annotated_image"]
    )
    db.add(log_entry)
    db.commit()

    return result

@router.get("/history")
def get_detection_history(limit: int = 10, db: Session = Depends(get_db)):
    logs = db.query(WasteDetectionLog).order_by(WasteDetectionLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "detected_class": log.detected_class,
            "confidence": log.confidence,
            "recyclable": log.recyclable,
            "contamination_level": log.contamination_level,
            "disposal_guide": log.disposal_guide,
            "inference_engine": log.inference_engine,
            "bounding_boxes": json.loads(log.bounding_boxes_json) if log.bounding_boxes_json else [],
            "annotated_image": log.annotated_image
        }
        for log in logs
    ]
