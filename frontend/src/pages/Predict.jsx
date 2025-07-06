// src/pages/Predict.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API_KEYS from '../config/apiKeys';

const API_KEY = API_KEYS.OPEN_WEATHER_MAP;

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onSelect(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}

function Predict() {
  const [location, setLocation] = useState(null);
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

  const handleMapClick = async (lat, lon) => {
    setLocation({ lat, lon });
    setLoading(true);
    try {
      const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      const weatherRes = await axios.get(weatherURL);
      const weather = weatherRes.data;

      const temp = weather.main.temp;
      const humidity = weather.main.humidity;
      const wind = weather.wind.speed;
      const precipitation = weather.rain?.['1h'] || 0;

      const elevationRes = await axios.get(
        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
      );
      const elevation = elevationRes.data.results[0].elevation;

      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      const vpd = svp * (1 - humidity / 100);

      setParams({
        temperature: temp.toFixed(2),
        humidity: humidity.toFixed(2),
        wind_speed: wind.toFixed(2),
        precipitation: precipitation.toFixed(2),
        elevation: elevation.toFixed(2),
        vpd: vpd.toFixed(3),
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    if (!location) {
      alert("Please select a location on the map.");
      return;
    }

    const payload = {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, parseFloat(v)])
      ),
    };

    try {
      const res = await axios.post('http://127.0.0.1:8000/predict-manual', payload);
      const result = res.data;
      setRisk(result.fire_occurred === 1 ? 'High' : 'Low');
    } catch (err) {
      console.error('Prediction failed:', err);
      alert('Prediction request failed.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Wildfire Risk Prediction</h2>

      <MapContainer center={[28.3949, 84.1240]} zoom={7} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />
        <LocationMarker onSelect={handleMapClick} />
      </MapContainer>

      {location && (
        <div style={{ marginTop: '20px' }}>
          <h3>Selected Location: ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})</h3>

          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div>
              <h4>Weather & Environmental Parameters</h4>
              {['temperature', 'humidity', 'wind_speed', 'precipitation', 'elevation', 'vpd'].map((key) => (
                <div key={key}>
                  <label style={{ marginRight: '10px' }}>
                    {key.replace('_', ' ').toUpperCase()}:
                  </label>
                  <input
                    type="number"
                    step="any"
                    name={key}
                    value={params[key]}
                    onChange={handleInputChange}
                    style={{ marginBottom: '10px' }}
                  />
                </div>
              ))}
              <button onClick={handlePredict} style={{ marginTop: '10px' }}>
                Predict Fire Risk
              </button>

              {risk && (
                <p style={{ marginTop: '15px', color: risk === 'High' ? 'red' : 'green', fontWeight: 'bold' }}>
                  Fire Risk: {risk}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Predict;
