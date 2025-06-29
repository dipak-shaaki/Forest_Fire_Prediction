
import React, { useState } from 'react';
import FireMap from '../components/FireMap.jsx';
import FireSidebar from '../components/FireSidebar';

export default function FirePage() {
  const [filter, setFilter] = useState({
    confidence: '',
    range: '24h',
    sensor: 'viirs',
  });

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <FireSidebar filter={filter} setFilter={setFilter} />
      <div className="flex-grow h-full">
        <FireMap filter={filter} />
      </div>
    </div>
  );
}
