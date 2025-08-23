import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AlertsManagement() {
  const { logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAlert, setEditingAlert] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.get("http://localhost:8000/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(data);
    } catch (err) {
      console.error("Fetch alerts error:", err);
      setError("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:8000/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error("Delete alert error:", err);
      setError("Failed to delete alert");
    }
  };

  const handleUpdateAlert = async (alertId, updatedData) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`http://localhost:8000/alerts/${alertId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAlerts(alerts.map(alert =>
        alert.id === alertId ? { ...alert, ...updatedData } : alert
      ));
      setEditingAlert(null);
    } catch (err) {
      console.error("Update alert error:", err);
      setError("Failed to update alert");
    }
  };

  const handleCreateAlert = async (alertData) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("http://localhost:8000/alerts", alertData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Alert created!");
      fetchAlerts(); // refresh list
    } catch (err) {
      toast.error("Failed to create alert");
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

  const handleLogout = () => {
    logout();
  };

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
        <h1 className="text-3xl font-bold text-red-800">🚨 Fire Alerts Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showMap ? "📋 Show List" : "🗺️ Show Map"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
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

              {alerts.map((alert) => (
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
                      <p className="text-xs text-gray-500">
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
          <h2 className="text-xl font-semibold mb-4">📋 All Alerts</h2>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚨</div>
              <p className="text-gray-600">No alerts found. Run a Nepal scan to create alerts.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {editingAlert?.id === alert.id ? (
                    /* Edit Mode */
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingAlert.title}
                            onChange={(e) => setEditingAlert({
                              ...editingAlert,
                              title: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={editingAlert.status}
                            onChange={(e) => setEditingAlert({
                              ...editingAlert,
                              status: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precautions
                        </label>
                        <textarea
                          value={editingAlert.precautions}
                          onChange={(e) => setEditingAlert({
                            ...editingAlert,
                            precautions: e.target.value
                          })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateAlert(alert.id, editingAlert)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingAlert(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
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

                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <h4 className="font-medium text-sm mb-2">⚠️ Precautions:</h4>
                        <p className="text-sm text-gray-600">{alert.precautions}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>🌡️ {alert.weather_data?.temperature}°C</div>
                        <div>💧 {alert.weather_data?.humidity}%</div>
                        <div>💨 {alert.weather_data?.wind_speed} km/h</div>
                        <div>📊 {(alert.probability * 100).toFixed(1)}% risk</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(alert.created_at)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingAlert(alert)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}