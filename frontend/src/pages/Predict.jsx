// src/pages/Predict.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API_KEYS from '../config/apiKeys';

/* ---------- helper: click -> lat/lon marker ---------- */
function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onSelect(lat, lng);
    },
  });
  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

/* ---------- field definitions ---------- */
const fieldList = [
  { key: 'temperature',  label: 'Temperature (°C)' },
  { key: 'humidity',     label: 'Humidity (%)' },
  { key: 'wind_speed',   label: 'Wind Speed (m/s)' },
  { key: 'precipitation',label: 'Precipitation (mm)' },
  { key: 'elevation',    label: 'Elevation (m)' },
  { key: 'vpd',          label: 'VPD' },
];

const WEATHER_KEY = API_KEYS.OPEN_WEATHER_MAP;

/* ====================================== */
/* main component                         */
export default function Predict() {
  const [location, setLocation]   = useState(null);
  const [params,   setParams]     = useState(Object.fromEntries(fieldList.map(f => [f.key, ''])));
  const [loadingData, setLoadingData] = useState(false);
  const [predicting,  setPredicting]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState('');

  /* -------- live fetch on map click -------- */
  const handleMapClick = async (lat, lon) => {
    setLocation({ lat, lon });
    setResult(null);
    setError('');
    setLoadingData(true);
    try {
      /* Weather */
      const wURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`;
      const { data: w } = await axios.get(wURL);
      const { temp, humidity } = w.main;
      const wind   = w.wind.speed;
      const precip = w.rain?.['1h'] || 0;

      /* Elevation */
      const eURL = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
      const { data: e } = await axios.get(eURL);
      const elevation = e.results[0].elevation;

      /* VPD */
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - humidity / 100);

      setParams({
        temperature:   temp.toFixed(2),
        humidity:      humidity.toFixed(2),
        wind_speed:    wind.toFixed(2),
        precipitation: precip.toFixed(2),
        elevation:     elevation.toFixed(2),
        vpd:           vpd.toFixed(3),
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live data.');
    } finally {
      setLoadingData(false);
    }
  };

  /* ---------- manual input change ---------- */
  const handleInput = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- prediction request ---------- */
  const handlePredict = async () => {
    if (!location) {
      setError('Select a location on the map first.');
      return;
    }
    setPredicting(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        latitude:  +location.lat,
        longitude: +location.lon,
        ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, parseFloat(v)])),
      };
      const { data } = await axios.post('http://127.0.0.1:8000/predict-manual', payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Prediction failed.');
    } finally {
      setPredicting(false);
    }
  };

  /* ---------- reset all to initial ---------- */
  const resetAll = () => {
    setLocation(null);
    setParams(Object.fromEntries(fieldList.map(f => [f.key, ''])));
    setResult(null);
    setError('');
  };

  /* ---------- render ---------- */
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Wildfire Risk Prediction</h2>

      {/* Map */}
      <MapContainer
        center={[28.3949, 84.1240]}
        zoom={7}
        style={{ height: 400, width: '100%', marginTop: 16 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker onSelect={handleMapClick} />
      </MapContainer>

      {/* two-column panel */}
      {location && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          {/* Manual panel */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3>Manual Parameters</h3>
            {fieldList.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: '.9rem' }}>{label}:</label>
                <input
                  name={key}
                  type="number"
                  step="any"
                  value={params[key]}
                  onChange={handleInput}
                  style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4 }}
                />
              </div>
            ))}
            <button
              onClick={handlePredict}
              disabled={predicting}
              style={{
                marginTop: 12, padding: '8px 16px',
                background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 4, cursor: 'pointer'
              }}
            >
              {predicting ? 'Predicting…' : 'Predict Fire Risk'}
            </button>
          </div>

          {/* Auto summary */}
          <div style={{ flex: 1 }}>
            <h3>Auto‑filled Data from Map</h3>
            <p><strong>Location:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
            {loadingData
              ? <p>Loading live data…</p>
              : (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {fieldList.map(({ key, label }) => (
                    <li key={key}><strong>{label}:</strong> {params[key]}</li>
                  ))}
                </ul>
              )}
            <p style={{ fontSize: '.8rem', color: '#666' }}>
              Values fetched automatically. You may adjust them on the left.
            </p>
          </div>
        </div>
      )}

      {/* result + reset button */}
      {result && (
        <div
          style={{
            marginTop: '2rem',
            padding: 16,
            border: '1px solid #ccc',
            borderRadius: 6,
            background: '#fafafa'
          }}
        >
          <h3>Prediction Result</h3>
          <p>
            <strong>Risk level:</strong>{' '}
            <span style={{
              color: result.risk_level === 'High'
                ? 'darkred' : result.risk_level === 'Moderate'
                ? 'orange' : 'green',
              fontWeight: 'bold'
            }}>
              {result.risk_level}
            </span>
          </p>
          <p><strong>Model probability:</strong> {result.probability}</p>
          <p style={{ marginTop: 8 }}><strong>Explanation:</strong> {result.explanation}</p>

          {/* reset button */}
          <button
            onClick={resetAll}
            style={{
              marginTop: 16,
              padding: '8px 14px',
              background: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Predict another location
          </button>
        </div>
      )}

      {error && <p style={{ marginTop: 16, color: 'red' }}>Error: {error}</p>}

      {/* overlay spinner */}
      {predicting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', zIndex: 9999
        }}>
          <div style={{
            width: 48, height: 48, border: '6px solid #fff',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: 12, fontSize: '1.1rem' }}>Analyzing environmental data…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
