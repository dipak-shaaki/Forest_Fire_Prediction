
import React from 'react';
import Map from '../components/Map';
import FireStats from '../components/FireStats';

function Prediction() {
  // Mock fire data (replace with API data later)
const fireStats = {
 dailyFires: 7,
 monthlyFires: 129,
 totalFires: 1489,
};
  return (

    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Fire Prediction & Live Map</h1>
      <p className="mb-6 text-gray-600">
        Explore real-time fire locations and AI-driven predictions across Nepal.
      </p>

     {/* 🔥 Fire Statistics Cards */}
      <FireStats stats={fireStats} />
      
      {/* 🔥 Map Showing Fires */}
      <Map />

      {/* 🚧 Placeholder: Future prediction charts, filters, AI forecast */}
      <div className="mt-10 text-gray-400 italic">
        More predictive analytics coming soon...
      </div>
    </div>
  );
}

export default Prediction;
