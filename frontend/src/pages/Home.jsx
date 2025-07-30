import AlertBanner from "./AlertBanner";

function Home() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
       <AlertBanner />
      <h1 className="text-4xl font-bold mb-4 text-green-800">Welcome to ForestFire Watch Nepal 🌲🔥</h1>
      <p className="text-lg text-gray-700">
        This platform tracks and visualizes forest fire activity across Nepal using satellite data, weather overlays, and historical trends.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-xl font-semibold text-orange-600">Live Fire Map</h2>
          <p>View real-time fire incidents and hotspots overlaid on Nepal's map.</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-xl font-semibold text-indigo-600">Statistics</h2>
          <p>Explore yearly trends, seasonal peaks, and province-wise analysis.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
