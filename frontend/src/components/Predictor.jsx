import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WeatherMap = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const Predictor = () => {
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

  const handleLocationSelect = async (latitude, longitude) => {
    setLocation({ lat: latitude, lon: longitude });

    // Get weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=YOUR_API_KEY`;
    const elevationUrl = `https://api.opentopodata.org/v1/test-dataset?locations=${latitude},${longitude}`;

    try {
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      const elevationRes = await fetch(elevationUrl);
      const elevationData = await elevationRes.json();

      const temp = weatherData.main.temp;
      const humidity = weatherData.main.humidity;
      const wind = weatherData.wind.speed;
      const elevation = elevationData.results[0].elevation;

      // Calculate VPD (basic approximation)
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - (humidity / 100));

      setParams(prev => ({
        ...prev,
        temperature: temp.toFixed(2),
        humidity: humidity.toFixed(2),
        wind_speed: wind.toFixed(2),
        elevation: elevation.toFixed(2),
        vpd: vpd.toFixed(3),
      }));
    } catch (err) {
      console.error('Failed to fetch weather or elevation:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    const payload = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      ...Object.fromEntries(
        Object.entries(params).map(([key, val]) => [key, parseFloat(val)])
      )
    };

    try {
      const res = await fetch('http://localhost:8000/api/predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setRisk(data.risk);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  return (
    <div>
      <h2>Forest Fire Risk Predictor</h2>
      <MapContainer center={[28.3949, 84.1240]} zoom={7} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WeatherMap onLocationSelect={handleLocationSelect} />
      </MapContainer>

      <div style={{ marginTop: '20px' }}>
        <h3>Parameters (Auto-filled & Editable)</h3>
        <p><strong>Latitude:</strong> {location.lat}</p>
        <p><strong>Longitude:</strong> {location.lon}</p>

        <label>Temperature (°C): <input name="temperature" value={params.temperature} onChange={handleInputChange} /></label><br />
        <label>Humidity (%): <input name="humidity" value={params.humidity} onChange={handleInputChange} /></label><br />
        <label>Wind Speed (m/s): <input name="wind_speed" value={params.wind_speed} onChange={handleInputChange} /></label><br />
        <label>Precipitation (mm): <input name="precipitation" value={params.precipitation} onChange={handleInputChange} /></label><br />
        <label>Elevation (m): <input name="elevation" value={params.elevation} onChange={handleInputChange} /></label><br />
        <label>VPD: <input name="vpd" value={params.vpd} onChange={handleInputChange} /></label><br />

        <button onClick={handlePredict}> Predict Fire Risk</button>
      </div>

      {risk && <h3 style={{ color: 'red' }}>Fire Risk: {risk}</h3>}
    </div>
  );
};

export default Predictor;
