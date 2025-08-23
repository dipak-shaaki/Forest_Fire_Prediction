# Nepal Forest Fire Risk API

This API predicts wildfire risk based on geographic and weather parameters.

## Requirements

- Python 3.9+
- FastAPI, Uvicorn, Requests, Pandas, Joblib, Random forest

## Run

```bash
uvicorn main:app --reload

def test_predict_fire():
    response = client.get("/predict-fire", params={
        "lat": 27.5,
        "lon": 84.3,
        "date": "2025-07-01"
    })
    assert response.status_code == 200
    assert "fire_occurred" in response.json()


├── requirements.txt
├── README.md
├── model/
│ └── catboost_final_model.pkl
├── utils/
│ └── enrich.py
└── venv/ (optional, ignored in git)

fastapi

uvicorn

pandas

requests

joblib



https://firms.modaps.eosdis.nasa.gov/mapserver/wms-info/
__for api key nasa hotspot live map



pip install --upgrade pyjwt
