# tests/test_main.py

from fastapi.testclient import TestClient
import sys
import os

# Ensure the backend folder is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app  # Now this works

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "API is running!"

def test_predict_fire():
    response = client.get("/predict-fire", params={
        "lat": 27.5,
        "lon": 84.3,
        "date": "2025-07-01"
    })
    assert response.status_code == 200
    assert "fire_occurred" in response.json()
