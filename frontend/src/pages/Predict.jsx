// src/pages/Predict.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Predict.css'; // optional CSS for styling

const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
};

const Predict = () => {
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [params, setParams] = useState({
    temperature: '',
    humidity: '',
    wind_speed: '',
    precipitation: '',
    elevation: '',
    vpd: '',
  });
  const [risk, setRisk] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEnvironmentalData = async (lat, lon) => {
    try {
      // Weather API
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=YOUR_OPENWEATHER_API_KEY`
      );
      const weather = await weatherRes.json();

      // Elevation API (You can replace this with your own endpoint if needed)
      const elevationRes = await fetch(
        `https://api.opentopodata.org/v1/test-dataset?locations=${lat},${lon}`
      );
      const elevation = await elevationRes.json();

      const temp = weather.main.temp;
      const humidity = weather.main.humidity;
      const windSpeed = weather.wind.speed;
      const elev = elevation.results[0].elevation;

      // VPD (approximate)
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - humidity / 100);

      setParams((prev) => ({
        ...prev,
        temperature: temp.toFixed(2),
        humidity: humidity.toFixed(2),
        wind_speed: windSpeed.toFixed(2),
        elevation: elev.toFixed(2),
        vpd: vpd.toFixed(3),
      }));
    } catch (error) {
      console.error('Data fetch error:', error);
    }
  };

  const handleLocationSelect = (lat, lon) => {
    setLocation({ lat, lon });
    fetchEnvironmentalData(lat, lon);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    const payload = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      temperature: parseFloat(params.temperature),
      humidity: parseFloat(params.humidity),
      wind_speed: parseFloat(params.wind_speed),
      precipitation: parseFloat(params.precipitation),
      elevation: parseFloat(params.elevation),
      vpd: parseFloat(params.vpd),
    };

    try {
      const response = await fetch('http://localhost:8000/api/predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setRisk(data.risk);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predict-page">
      <h2>🔥 Forest Fire Risk Prediction</h2>

      <MapContainer center={[28.3949, 84.1240]} zoom={7} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector onSelect={handleLocationSelect} />
      </MapContainer>

      <div className="form-section">
        <h3>Location: {location.lat}, {location.lon}</h3>

        <label>Temperature (°C): <input name="temperature" value={params.temperature} onChange={handleInputChange} /></label>
        <label>Humidity (%): <input name="humidity" value={params.humidity} onChange={handleInputChange} /></label>
        <label>Wind Speed (m/s): <input name="wind_speed" value={params.wind_speed} onChange={handleInputChange} /></label>
        <label>Precipitation (mm): <input name="precipitation" value={params.precipitation} onChange={handleInputChange} /></label>
        <label>Elevation (m): <input name="elevation" value={params.elevation} onChange={handleInputChange} /></label>
        <label>VPD: <input name="vpd" value={params.vpd} onChange={handleInputChange} /></label>

        <button onClick={handlePredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict'}
        </button>

        {risk && <div className="result">🔥 Fire Risk: <strong>{risk}</strong></div>}
      </div>
    </div>
  );
};

export default Predict;
