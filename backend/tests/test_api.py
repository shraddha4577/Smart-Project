import os
import sys
import io
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
import numpy as np

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_smart_waste.db"

from main import app
from database import Base, engine, SessionLocal
from simulator import init_default_data

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    init_default_data(db)
    db.close()
    yield
    # Teardown
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_smart_waste.db"):
        try:
            os.remove("./test_smart_waste.db")
        except Exception:
            pass

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login_admin():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    assert data["username"] == "admin"

def test_auth_login_student():
    response = client.post("/api/auth/login", json={"username": "student", "password": "user123"})
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "user"

def test_auth_login_failure():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401

def test_get_bins_count():
    response = client.get("/api/bins")
    assert response.status_code == 200
    bins = response.json()
    assert len(bins) >= 8

def test_get_bin_detail():
    response = client.get("/api/bins/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "fill_level" in data
    assert "temperature" in data

def test_bin_telemetry_history():
    response = client.get("/api/bins/1/history?limit=10")
    assert response.status_code == 200
    history = response.json()
    assert len(history) > 0
    assert "fill_level" in history[0]

def test_simulation_tick():
    response = client.post("/api/simulation/tick?multiplier=1.0")
    assert response.status_code == 200
    data = response.json()
    assert "bins_updated" in data
    assert data["bins_updated"] >= 8

def test_empty_bin():
    response = client.post("/api/simulation/empty/1")
    assert response.status_code == 200
    data = response.json()
    assert data["fill_level"] == 0.0
    assert data["status"] == "NORMAL"

def test_spike_bin_fill():
    response = client.post("/api/simulation/spike/1?target_fill=95.0")
    assert response.status_code == 200
    data = response.json()
    assert data["fill_level"] == 95.0
    assert data["status"] == "CRITICAL"

def test_vision_classification():
    # Create synthetic test image (e.g. green circle on white background simulating organic waste)
    img = Image.new("RGB", (300, 300), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    draw.ellipse((50, 50, 250, 250), fill=(40, 180, 50))
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    response = client.post(
        "/api/vision/classify",
        files={"file": ("test_organic.jpg", img_byte_arr, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "detected_class" in data
    assert "confidence" in data
    assert "bounding_boxes" in data
    assert "annotated_image" in data
    # Verify demo mode flag is reported honestly
    assert "is_demo_mode" in data

def test_ai_recommendations():
    response = client.get("/api/ai/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert "recommended_route" in data
    assert "estimated_fuel_saved_percent" in data
    assert "time_critical_advisories" in data
    assert "source" in data

def test_ai_chat_assistant():
    response = client.post("/api/ai/chat", json={"message": "Where can I dispose plastic bottles?"})
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "source" in data
    assert "plastic" in data["response"].lower() or "bin" in data["response"].lower()

def test_collections_and_dispatch():
    # Fetch alerts
    response = client.get("/api/collections")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)

    # Dispatch all
    disp_resp = client.post("/api/collections/dispatch-all")
    assert disp_resp.status_code == 200
    assert "dispatched_count" in disp_resp.json()

def test_reports_stats():
    response = client.get("/api/reports/dashboard-stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_bins"] >= 8
    assert "campus_sustainability_score" in stats

def test_reports_csv():
    response = client.get("/api/reports/export-csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "Bin Code" in response.text

def test_settings_get_and_update():
    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    cfg = get_res.json()
    assert cfg["warning_threshold"] == 70.0

    put_res = client.put("/api/settings", json={
        "warning_threshold": 65.0,
        "critical_threshold": 88.0,
        "simulation_speed": 1.5,
        "map_center_lat": 12.9716,
        "map_center_lng": 77.5946,
        "ai_engine_mode": "AUTO_HYBRID"
    })
    assert put_res.status_code == 200
    assert put_res.json()["warning_threshold"] == 65.0
