// src/components/FireMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import fireIconUrl from '../assets/fire.png'; 

// Custom fire icon
const fireIcon = new L.Icon({
  iconUrl: fireIconUrl,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const mockFireData = [
  { id: 1, lat: 27.7, lng: 85.3, name: "Kathmandu Fire", date: "2025-06-10" },
  { id: 2, lat: 28.2, lng: 84.0, name: "Pokhara Fire", date: "2025-06-15" },
  { id: 3, lat: 26.7, lng: 87.3, name: "Jhapa Fire", date: "2025-06-12" },
];

export default function FireMap() {
  const center = [28.3949, 84.1240]; // Nepal center coordinates
  const [provinceGeoJson, setProvinceGeoJson] = useState(null);

  useEffect(() => {
    fetch('/geojson/nepal-provinces.geojson')
      .then(res => res.json())
      .then(data => setProvinceGeoJson(data))
      .catch(err => console.error('Failed to load GeoJSON:', err));
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

        {mockFireData.map(fire => (
          <Marker
            key={fire.id}
            position={[fire.lat, fire.lng]}
            icon={fireIcon}
          >
            <Popup>
              <strong>{fire.name}</strong><br />
              Date: {fire.date}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
