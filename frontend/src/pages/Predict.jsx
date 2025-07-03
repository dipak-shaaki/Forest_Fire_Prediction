
import { React,useState, useEffect } from 'react';
import Map from '../components/Map';
import FireStats from '../components/FireStats';
import { fetchFiresForNepal } from '../utils/FetchFires'; 
function Prediction() {
   const [fireStats, setFireStats] = useState({
    dailyFires: 0,
    monthlyFires: 0,
    totalFires: 0
  });

useEffect(() => {
  async function loadData() {
    const fires = await fetchFiresForNepal();
    console.log("FIRMS fires:", fires);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const daily = fires.filter(f => f.acq_date === todayStr);

    const monthly = fires.filter(f => {
      const fireDate = new Date(f.acq_date);
      return (
        fireDate.getMonth() === today.getMonth() &&
        fireDate.getFullYear() === today.getFullYear()
      );
    });

    setFireStats({
      dailyFires: daily.length,
      monthlyFires: monthly.length,
      totalFires: fires.length,
    });
  }

  loadData();
}, []);



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
