
import React from 'react';

export default function FireSidebar({ filter, setFilter }) {
  return (
    <div className="w-full md:w-72 p-4 bg-white border-r h-full shadow-lg z-10">
      <h2 className="text-xl font-semibold mb-4">Filter Fires</h2>

      <div className="mb-4">
        <label className="block font-medium">Confidence Level</label>
        <select
          value={filter.confidence}
          onChange={(e) => setFilter({ ...filter, confidence: e.target.value })}
          className="mt-1 p-2 border w-full rounded"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="nominal">Nominal</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium">Time Range</label>
        <select
          value={filter.range}
          onChange={(e) => setFilter({ ...filter, range: e.target.value })}
          className="mt-1 p-2 border w-full rounded"
        >
          <option value="24h">Last 24 hours</option>
          <option value="72h">Last 72 hours</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium">Sensor Type</label>
        <select
          value={filter.sensor}
          onChange={(e) => setFilter({ ...filter, sensor: e.target.value })}
          className="mt-1 p-2 border w-full rounded"
        >
          <option value="modis">MODIS</option>
          <option value="viirs">VIIRS</option>
        </select>
      </div>
    </div>
  );
}
