import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [filterStatus, setFilterStatus] = useState("active");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/public/alerts");
      setAlerts(data);
    } catch (err) {
      console.error("Fetch alerts error:", err);
      setError("Failed to fetch alerts");
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#10b981";
      case "expired": return "#6b7280";
      case "cancelled": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus === "all") return true;
    return alert.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-800">🚨 Fire Alerts</h1>
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="active">Active Alerts</option>
            <option value="all">All Alerts</option>
            <option value="expired">Expired Alerts</option>
            <option value="cancelled">Cancelled Alerts</option>
          </select>
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showMap ? "📋 Show List" : "🗺️ Show Map"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-lg rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
          <div className="text-sm text-gray-600">Total Alerts</div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {alerts.filter(a => a.status === "active").length}
          </div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {alerts.filter(a => a.risk_level === "High").length}
          </div>
          <div className="text-sm text-gray-600">High Risk Alerts</div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {alerts.filter(a => a.risk_level === "Moderate").length}
          </div>
          <div className="text-sm text-gray-600">Moderate Risk Alerts</div>
        </div>
      </div>

      {showMap ? (
        /* Map View */
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🗺️ Alerts Map</h2>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[28.4, 84.1]}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {filteredAlerts.map((alert) => (
                <Marker
                  key={alert.id}
                  position={[alert.latitude, alert.longitude]}
                >
                  <Popup>
                    <div className="max-w-xs">
                      <h4 className="font-semibold text-lg">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{alert.district}</p>
                      <div className="flex gap-2 mb-2">
                        <span
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: getRiskColor(alert.risk_level) }}
                        >
                          {alert.risk_level} Risk
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: getStatusColor(alert.status) }}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="bg-yellow-50 p-2 rounded text-xs">
                        <strong>⚠️ Precautions:</strong> {alert.precautions}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {formatDate(alert.created_at)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            📋 {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Alerts
          </h2>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚨</div>
              <p className="text-gray-600">
                {filterStatus === "active"
                  ? "No active alerts at the moment. Stay safe!"
                  : `No ${filterStatus} alerts found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.district}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="px-2 py-1 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: getRiskColor(alert.risk_level) }}
                      >
                        {alert.risk_level} Risk
                      </span>
                      <span
                        className="px-2 py-1 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: getStatusColor(alert.status) }}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{alert.message}</p>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                    <h4 className="font-medium text-sm mb-2">⚠️ Safety Precautions:</h4>
                    <p className="text-sm text-gray-700">{alert.precautions}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>🌡️ {alert.weather_data?.temperature}°C</div>
                    <div>💧 {alert.weather_data?.humidity}% humidity</div>
                    <div>💨 {alert.weather_data?.wind_speed} km/h wind</div>
                    <div>📊 {(alert.probability * 100).toFixed(1)}% fire risk</div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {formatDate(alert.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🛡️ Fire Safety Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">During High Fire Risk:</h4>
            <ul className="space-y-1">
              <li>• Avoid open flames and smoking</li>
              <li>• Don't burn waste or agricultural debris</li>
              <li>• Keep fire extinguishers ready</li>
              <li>• Monitor local weather conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Emergency Contacts:</h4>
            <ul className="space-y-1">
              <li>• Fire Department: 101</li>
              <li>• Police: 100</li>
              <li>• Emergency: 112</li>
              <li>• Forest Department: 01-4XXXXXX</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 