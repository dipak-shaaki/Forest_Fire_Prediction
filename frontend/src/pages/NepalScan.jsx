import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function NepalScan() {
  const { logout } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [creatingAlerts, setCreatingAlerts] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [error, setError] = useState("");

  const handleScan = async () => {
    setScanning(true);
    setError("");
    setScanResults(null);
    setSelectedDistricts([]);

    try {
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.post(
        "http://localhost:8000/scan-nepal",
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setScanResults(data);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.response?.data?.detail || "Failed to run scan");
    } finally {
      setScanning(false);
    }
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistricts(prev => {
      const exists = prev.find(d => d.district === district.district);
      if (exists) {
        return prev.filter(d => d.district !== district.district);
      } else {
        return [...prev, district];
      }
    });
  };

  const handleCreateAlerts = async () => {
    if (selectedDistricts.length === 0) {
      setError("Please select at least one district");
      return;
    }

    setCreatingAlerts(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const alerts = selectedDistricts.map(district => ({
        title: `🔥 Fire Alert: ${district.district}`,
        message: `High fire risk detected in ${district.district} district.`,
        district: district.district,
        latitude: district.latitude,
        longitude: district.longitude,
        risk_level: district.fire_risk,
        probability: district.probability,
        weather_data: district.weather_data,
        precautions: `⚠️ High fire risk in ${district.district}. Please avoid open flames, smoking, and any activities that could spark a fire. Monitor local weather conditions and follow emergency instructions.`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }));

      const { data } = await axios.post(
        "http://localhost:8000/alerts/bulk",
        alerts,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAlertMessage(`Successfully created ${data.created_alerts.length} alerts!`);
      setSelectedDistricts([]);
      
      // Clear message after 5 seconds
      setTimeout(() => setAlertMessage(""), 5000);
    } catch (err) {
      console.error("Create alerts error:", err);
      setError(err.response?.data?.detail || "Failed to create alerts");
    } finally {
      setCreatingAlerts(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High": return "#dc2626";
      case "Moderate": return "#f59e0b";
      case "Low": return "#10b981";
      default: return "#6b7280";
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-800">🔥 Nepal Fire Risk Scan</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Full Nepal Fire Risk Assessment</h2>
        <p className="text-gray-600 mb-4">
          Run a comprehensive scan of all Nepal districts to identify high-risk fire areas. 
          This will analyze weather conditions, elevation, and historical data to predict fire risk.
        </p>
        
        <button
          onClick={handleScan}
          disabled={scanning}
          className={`px-6 py-3 rounded-lg font-semibold ${
            scanning 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700"
          } text-white`}
        >
          {scanning ? "🔍 Scanning Nepal..." : "🚀 Run Full Nepal Scan"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {alertMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {alertMessage}
        </div>
      )}

      {scanResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Districts */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🔥 High Risk Districts</h3>
            <p className="text-gray-600 mb-4">
              Found {scanResults.high_risk_districts.length} districts with moderate to high fire risk
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scanResults.high_risk_districts.map((district, index) => (
                <div
                  key={district.district}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDistricts.find(d => d.district === district.district)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{district.district}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span 
                          className="px-2 py-1 rounded text-sm font-medium text-white"
                          style={{ backgroundColor: getRiskColor(district.fire_risk) }}
                        >
                          {district.fire_risk} Risk
                        </span>
                        <span className="text-sm text-gray-600">
                          {(district.probability * 100).toFixed(1)}% probability
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div>🌡️ {district.weather_data.temperature}°C</div>
                        <div>💧 {district.weather_data.humidity}% humidity</div>
                        <div>💨 {district.weather_data.wind_speed} km/h wind</div>
                        <div>🌧️ {district.weather_data.precipitation} mm rain</div>
                      </div>
                    </div>
                    <div className="text-2xl">
                      {selectedDistricts.find(d => d.district === district.district) ? "✅" : "⬜"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDistricts.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleCreateAlerts}
                  disabled={creatingAlerts}
                  className={`w-full px-4 py-3 rounded-lg font-semibold ${
                    creatingAlerts 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {creatingAlerts 
                    ? "Creating Alerts..." 
                    : `🚨 Create Alerts for ${selectedDistricts.length} Districts`
                  }
                </button>
              </div>
            )}
          </div>

          {/* Map View */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🗺️ Risk Map</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={[28.4, 84.1]}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {scanResults.high_risk_districts.map((district) => (
                  <Marker
                    key={district.district}
                    position={[district.latitude, district.longitude]}
                  >
                    <Popup>
                      <div>
                        <h4 className="font-semibold">{district.district}</h4>
                        <p className="text-sm">
                          <span 
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: getRiskColor(district.fire_risk) }}
                          >
                            {district.fire_risk} Risk
                          </span>
                        </p>
                        <p className="text-sm mt-2">
                          {(district.probability * 100).toFixed(1)}% fire probability
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          🌡️ {district.weather_data.temperature}°C | 
                          💧 {district.weather_data.humidity}% | 
                          💨 {district.weather_data.wind_speed} km/h
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Scan Statistics */}
      {scanResults && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">📊 Scan Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {scanResults.total_districts_scanned}
              </div>
              <div className="text-sm text-gray-600">Total Districts Scanned</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {scanResults.high_risk_districts.filter(d => d.fire_risk === "High").length}
              </div>
              <div className="text-sm text-gray-600">High Risk Districts</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {scanResults.high_risk_districts.filter(d => d.fire_risk === "Moderate").length}
              </div>
              <div className="text-sm text-gray-600">Moderate Risk Districts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {scanResults.all_results.filter(d => d.fire_risk === "Low").length}
              </div>
              <div className="text-sm text-gray-600">Low Risk Districts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 