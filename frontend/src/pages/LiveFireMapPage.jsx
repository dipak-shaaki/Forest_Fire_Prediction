import React, { useState } from 'react';
import LiveHotspotsMap from '../components/LiveHotspotsMap';

export default function LiveFireMapPage() {
  const [sensor, setSensor] = useState('MODIS_NRT');
  const [days, setDays] = useState(1);

  return (
    <div>
      <header>
        <h2>Live Fire Hotspots in Nepal</h2>
        <div>
          <label>
            Sensor:
            <select value={sensor} onChange={e => setSensor(e.target.value)}>
              <option value="MODIS_NRT">MODIS</option>
              <option value="VIIRS_SNPP_NRT">VIIRS S-NPP</option>
              <option value="VIIRS_NOAA20_NRT">VIIRS NOAA-20</option>
            </select>
          </label>
          <label>
            Days:
            <select value={days} onChange={e => setDays(e.target.value)}>
              {[1, 2, 7].map(n => <option key={n} value={n}>{n} day{n>1?'s':''}</option>)}
            </select>
          </label>
        </div>
      </header>

      <main style={{ height: '80vh' }}>
        <LiveHotspotsMap sensor={sensor} days={days} />
      </main>
    </div>
  );
}
