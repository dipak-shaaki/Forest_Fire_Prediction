
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Map() {
  const fires = [
    { lat: 27.70, lng: 84.02, place: 'Chitwan' },
    { lat: 28.20, lng: 83.99, place: 'Pokhara' },
  ];

  return (
    <div className="w-full h-[500px] mt-6 rounded shadow">
      <MapContainer center={[28.3949, 84.1240]} zoom={7} scrollWheelZoom={true} className="w-full h-full rounded">
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fires.map((fire, idx) => (
          <Marker key={idx} position={[fire.lat, fire.lng]}>
            <Popup>
              <strong>🔥 Fire Detected</strong><br />
              {fire.place}<br />
              ({fire.lat}, {fire.lng})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
