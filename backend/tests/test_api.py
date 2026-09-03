from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import ShelterDesign

client = TestClient(app)

def test_root_endpoint():
    """Test API root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "ThermaShelter" in response.json()["message"]

def test_get_materials():
    """Test /api/materials endpoint."""
    response = client.get("/api/materials")
    assert response.status_code == 200
    materials = response.json()
    assert len(materials) >= 10
    assert any(m["id"] == "brick" for m in materials)

def test_get_locations():
    """Test /api/locations endpoint."""
    response = client.get("/api/locations")
    assert response.status_code == 200
    locations = response.json()
    assert len(locations) >= 5
    assert any(loc["id"] == "leh" for loc in locations)

def test_get_climate():
    """Test /api/climate/leh endpoint."""
    response = client.get("/api/climate/leh")
    assert response.status_code == 200
    climate = response.json()
    assert climate["location_id"] == "leh"
    assert len(climate["hourly_data"]) == 24

def test_simulate_endpoint():
    """Test /api/simulate endpoint with valid request."""
    design = ShelterDesign().model_dump()
    payload = {
        "location_id": "leh",
        "design": design,
        "simulation_days": 1
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "hourly" in data
    assert "summary" in data
    assert len(data["hourly"]) == 24
    assert data["summary"]["comfort_hours"] >= 0

def test_optimize_endpoint():
    """Test /api/optimize endpoint."""
    payload = {
        "location_id": "leh",
        "purpose": "agricultural",
        "min_area": 20.0,
        "max_area": 30.0,
        "max_budget": 150000.0,
        "priority": "comfort"
    }
    response = client.post("/api/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_design" in data
    assert "top_designs" in data
    assert len(data["top_designs"]) == 5
    assert len(data["recommended_design"]["why_explanation"]) > 0
