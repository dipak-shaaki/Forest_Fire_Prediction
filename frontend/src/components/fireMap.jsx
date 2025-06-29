// src/components/FireMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import fireIconUrl from '../assets/fire.png';

// Custom fire icon
const fireIcon = new L.Icon({
  iconUrl: fireIconUrl,
  iconSize: [15, 15],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function FireMap() {
  const center = [28.3949, 84.1240]; // Nepal center coordinates
  const [provinceGeoJson, setProvinceGeoJson] = useState(null);
  const [fireData, setFireData] = useState([]);

  // Load province boundaries
  useEffect(() => {
    fetch('/geojson/nepal-provinces.geojson')
      .then(res => res.json())
      .then(data => setProvinceGeoJson(data))
      .catch(err => console.error('Failed to load GeoJSON:', err));
  }, []);

  // Load live fire data from backend API (you can use FIRMS proxy or your server)
  useEffect(() => {
    fetch('https://your-api.onrender.com/fires') // Replace with actual Render backend URL
      .then(res => res.json())
      .then(data => setFireData(data.fires || []))
      .catch(err => console.error('Failed to fetch fire data:', err));
  }, []);

  const onEachProvince = (feature, layer) => {
    const name = feature.properties?.name || 'Unknown Province';
    layer.bindPopup(`<strong>${name}</strong>`);
  };

  return (
    <div className="h-[600px] rounded-xl overflow-hidden shadow-lg border">
      <MapContainer center={center} zoom={7} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {provinceGeoJson && (
          <GeoJSON
            data={provinceGeoJson}
            onEachFeature={onEachProvince}
            style={{ color: "#ff6600", weight: 1.5 }}
          />
        )}

        {fireData.map((fire, index) => (
          <Marker
            key={index}
            position={[fire.latitude, fire.longitude]}
            icon={fireIcon}
          >
            <Popup>
              <div className="text-sm leading-snug">
                <strong>Fire Detected</strong><br />
                Brightness: {fire.brightness}<br />
                Confidence: {fire.confidence}<br />
                Date: {fire.acq_date}<br />
                Time: {fire.acq_time}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
