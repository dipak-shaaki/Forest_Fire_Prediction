import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API_KEYS from '../config/apiKeys';

// 🔗 Fire data API
const FIRE_CSV_URL = (key, sensor = 'MODIS_NRT', days = 1) =>
  `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/${sensor}/NPL/${days}`;

// 🔥 Fire dots layer
function FireMarkers({ fires }) {
  const map = useMap();

  useEffect(() => {
    const layerGroup = L.layerGroup();

    fires.forEach(fire => {
      const lat = parseFloat(fire.latitude);
      const lon = parseFloat(fire.longitude);

      const marker = L.circleMarker([lat, lon], {
        radius: 4,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.8,
        weight: 0,
        pane: 'markerPane',
      });

      marker.bindPopup(`
        <strong>Acq Date:</strong> ${fire.acq_date} <br />
        <strong>Confidence:</strong> ${fire.confidence} <br />
        <strong>Bright T:</strong> ${fire.bright_t} °C
      `);

      marker.addTo(layerGroup);
    });

    layerGroup.addTo(map);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [fires, map]);

  return null;
}

// 🌐 Nepal Border from Global Boundaries
function NepalBorderLayer() {
  const [nepalGeoJSON, setNepalGeoJSON] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/NPL.geo.json')
      .then(res => res.json())
      .then(data => setNepalGeoJSON(data))
      .catch(err => console.error('Failed to load Nepal border', err));
  }, []);

  if (!nepalGeoJSON) return null;

  return (
<GeoJSON
  data={nepalGeoJSON}
  style={{
    color: '#FFD700',        // bright gold/yellow
    weight: 3,               // thicker line
    opacity: 1,            // clear, not washed out
    fillOpacity: 0,          // no fill
  }}
/>
  );
}

// Main Map Component
export default function LiveHotspotsMap({ sensor = 'MODIS_NRT', days = 1 }) {
  const [fires, setFires] = useState([]);

  useEffect(() => {
    const url = FIRE_CSV_URL(API_KEYS.FIRMS_MAP_KEY, sensor, days);
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const parts = line.split(',');
          return Object.fromEntries(parts.map((p, i) => [headers[i], p]));
        });
        setFires(data);
      })
      .catch(err => console.error('CSV fetch failed', err));
  }, [sensor, days]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[28.4, 84.1]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* 🗺️ Satellite Basemap */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Earthstar Geographics"
        />

        {/* 🇳🇵 Nepal Border Overlay */}
        <NepalBorderLayer />

        {/* 🔥 Fire Points */}
        <FireMarkers fires={fires} />
      </MapContainer>

      {/* 📍 Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'white',
        padding: '6px 10px',
        borderRadius: '5px',
        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
        fontSize: '14px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: 10,
            height: 10,
            backgroundColor: 'red',
            borderRadius: '50%',
          }} />
          <span>Active Fire Point</span>
        </div>
      </div>
    </div>
  );
}