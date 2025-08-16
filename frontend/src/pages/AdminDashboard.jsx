import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../config/adminApi";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [view, setView] = useState("alerts");

  // Alerts
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ title: "", message: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editedAlert, setEditedAlert] = useState({});

  // Messages
  const [messages, setMessages] = useState([]);
  const [replyingId, setReplyingId] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  // Reports
  const [reports, setReports] = useState([]);

  // Fire Risk Scan State
  const [scanLoading, setScanLoading] = useState(false);
  const [highRiskDistricts, setHighRiskDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [alertReasons, setAlertReasons] = useState({});
  const [scanError, setScanError] = useState("");
  const [bulkAlertLoading, setBulkAlertLoading] = useState(false);
  const [bulkAlertResult, setBulkAlertResult] = useState(null);

  useEffect(() => {
    loadAlerts();
    loadMessages();
    loadReports();
  }, []);

  const loadAlerts = () =>
    fetchAlerts()
      .then((res) => setAlerts(res.data))
      .catch(console.error);

  const loadMessages = () =>
    axios
      .get("http://localhost:8000/messages")
      .then((res) => setMessages(res.data))
      .catch(console.error);

  const loadReports = () =>
    axios
      .get("http://localhost:8000/reports")
      .then((res) => setReports(res.data))
      .catch(console.error);

  // Alert CRUD
  const handleCreate = async () => {
    if (!newAlert.forest || !newAlert.district || !newAlert.message)
      return alert("Forest name, district, and message are required");

    // Create alert data with proper structure
    const alertData = {
      title: `🔥 Forest Fire Alert: ${newAlert.forest}`,
      message: newAlert.message,
      forest: newAlert.forest,
      district: newAlert.district,
      province: newAlert.province || "Unknown",
      location_details: newAlert.location_details || "Nepal",
      latitude: newAlert.latitude || 0,
      longitude: newAlert.longitude || 0,
      risk_level: newAlert.risk_level || "Moderate",
      weather_data: {
        temperature: newAlert.temperature || 25,
        humidity: newAlert.humidity || 60,
        wind_speed: 10,
        precipitation: 0
      },
      duration_days: newAlert.duration_days || 3
    };

    try {
      const res = await createAlert(alertData);
      setAlerts([...alerts, res.data]);
      setNewAlert({ title: "", message: "" });
      alert("Forest fire alert created successfully!");
    } catch (error) {
      console.error("Create alert error:", error);
      alert("Failed to create alert. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const startEdit = (i) => {
    setEditIndex(i);
    setEditedAlert({ ...alerts[i] });
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditedAlert({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await updateAlert(id, {
        title: editedAlert.title,
        message: editedAlert.message,
      });
      const updated = [...alerts];
      updated[editIndex] = res.data;
      setAlerts(updated);
      cancelEdit();
    } catch {
      alert("Update failed");
    }
  };

  // Reply to user messages
  const sendReply = async (email) => {
    if (!replySubject || !replyBody) return alert("Fill subject & body");
    try {
      await axios.post(
        "http://localhost:8000/admin/reply",
        {
          to_email: email,
          subject: replySubject,
          message: replyBody,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      alert("Reply sent");
      setReplyingId(null);
      setReplySubject("");
      setReplyBody("");
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  // Update report resolution status
  const handleResolve = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/reports/${id}/resolve`, {
        resolved: newStatus,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, resolved: newStatus } : r))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update report status.");
    }
  };

  // Run full Nepal scan
  const handleScan = async () => {
    setScanLoading(true);
    setScanError("");
    setHighRiskDistricts([]);
    setSelectedDistricts([]);
    setAlertReasons({});
    try {
      const { data } = await axios.post(
        "http://localhost:8000/scan-nepal",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      setHighRiskDistricts(data.high_risk_districts || []);
    } catch (err) {
      setScanError("Scan failed. See console for details.");
      console.error(err);
    }
    setScanLoading(false);
  };

  // Select/deselect districts
  const toggleDistrict = (district) => {
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district]
    );
  };

  // Set reason for a district
  const handleReasonChange = (district, reason) => {
    setAlertReasons((prev) => ({ ...prev, [district]: reason }));
  };

  // Submit selected districts as alerts
  const handleBulkAlert = async () => {
    setBulkAlertLoading(true);
    setBulkAlertResult(null);
    const alerts = highRiskDistricts
      .filter((d) => selectedDistricts.includes(d.district))
      .map((d) => ({
        title: `🔥 Forest Fire Alert: ${d.district}`,
        message: `High forest fire risk detected in ${d.district} forest region.`,
        district: d.district,
        latitude: d.latitude,
        longitude: d.longitude,
        risk_level: d.fire_risk,
        probability: d.probability,
        weather_data: d.weather_data || d.details,
        precautions: `🌲 FOREST FIRE ALERT: ${d.district} (${d.province}) - ${d.location_details}

⚠️ CRITICAL PRECAUTIONS:
• Avoid any open flames, smoking, or burning activities
• Do not light campfires or use fireworks in forest areas
• Report any smoke or fire immediately to emergency services
• Stay away from forest areas during high-risk periods
• Monitor local weather conditions and wind patterns
• Follow evacuation orders if issued

🚨 EMERGENCY CONTACTS:
• Forest Department: 1001
• Fire Brigade: 101
• Police: 100

This alert is based on current weather conditions including temperature, humidity, wind speed, and precipitation patterns that indicate high forest fire risk.`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        reason: alertReasons[d.district] || "High forest fire risk detected based on weather conditions."
      }));
    try {
      const { data } = await axios.post(
        "http://localhost:8000/alerts/bulk",
        alerts,
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      setBulkAlertResult(data.created_alerts);
      setSelectedDistricts([]);
      setAlertReasons({});
      loadAlerts();
    } catch (err) {
      alert("Failed to create alerts. See console.");
      console.error(err);
    }
    setBulkAlertLoading(false);
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontWeight: "bold" }}>
        Admin Dashboard
        <button
          onClick={handleLogout}
          style={{
            float: "right",
            background: "#e11d48",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </h2>

      {/* View Tabs */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setView("alerts")}
          style={{
            marginRight: 8,
            padding: "6px 12px",
            background: view === "alerts" ? "#2563eb" : "#e5e7eb",
            color: view === "alerts" ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Alerts
        </button>
        <button
          onClick={() => setView("messages")}
          style={{
            marginRight: 8,
            padding: "6px 12px",
            background: view === "messages" ? "#2563eb" : "#e5e7eb",
            color: view === "messages" ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          User Messages
        </button>
        <button
          onClick={() => setView("reports")}
          style={{
            padding: "6px 12px",
            background: view === "reports" ? "#2563eb" : "#e5e7eb",
            color: view === "reports" ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Fire Reports
        </button>
      </div>

      {/* Fire Risk Scan & Alert Creation */}
      <div style={{ marginBottom: 32, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Fire Risk Management</h3>
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          <button onClick={handleScan} disabled={scanLoading} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {scanLoading ? "Scanning Forests..." : "🌲 Scan Nepal Forests"}
          </button>
          <a href="/alerts-management" style={{ padding: "8px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", textDecoration: "none" }}>
            🚨 Manage Alerts
          </a>
          <a href="/alerts" style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", textDecoration: "none" }}>
            👁️ View Public Alerts
          </a>
        </div>
        {scanError && <div style={{ color: "red" }}>{scanError}</div>}
        {highRiskDistricts.length > 0 && (
          <div>
            <p><strong>🌲 Forest Fire Risk Assessment Complete:</strong> High-risk forest areas detected. Select which forest regions to create alerts for and add specific reasons.</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Forest Name</th>
                  <th>District</th>
                  <th>Location</th>
                  <th>Temp (°C)</th>
                  <th>Humidity (%)</th>
                  <th>Risk Level</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {highRiskDistricts.map((d) => (
                  <tr key={d.forest || d.district} style={{ borderBottom: "1px solid #eee" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDistricts.includes(d.forest || d.district)}
                        onChange={() => toggleDistrict(d.forest || d.district)}
                      />
                    </td>
                    <td><strong>{d.forest || d.district}</strong></td>
                    <td><strong>{d.district}</strong></td>
                    <td>
                      <div style={{ fontSize: "12px" }}>
                        <div><strong>{d.province}</strong></div>
                        <div style={{ color: "#666" }}>{d.location_details}</div>
                        <div style={{ color: "#888", fontSize: "10px" }}>
                          📍 {d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}
                        </div>
                      </div>
                    </td>
                    <td>{d.weather_data?.temperature || d.details?.temperature}</td>
                    <td>{d.weather_data?.humidity || d.details?.humidity}</td>
                    <td>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        color: "white",
                        backgroundColor: d.fire_risk === "High" ? "#dc2626" : d.fire_risk === "Moderate" ? "#f59e0b" : "#10b981"
                      }}>
                        {d.fire_risk}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Reason for alert"
                        value={alertReasons[d.forest || d.district] || ""}
                        onChange={(e) => handleReasonChange(d.forest || d.district, e.target.value)}
                        style={{ width: 180 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleBulkAlert}
              disabled={bulkAlertLoading || selectedDistricts.length === 0}
              style={{ marginTop: 12, padding: "8px 16px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
            >
              {bulkAlertLoading ? "Publishing Forest Alerts..." : `🌲 Publish ${selectedDistricts.length} Forest Fire Alert(s)`}
            </button>
            {bulkAlertResult && (
              <div style={{ color: "green", marginTop: 8 }}>
                🌲 {bulkAlertResult.length} forest fire alert(s) published successfully!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alerts Panel */}
      {view === "alerts" && (
        <>
          <div style={{ marginBottom: "2rem" }}>
            <h4>Create Manual Alert</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <input
                placeholder="Forest Name (e.g., Chitwan National Park)"
                value={newAlert.forest || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, forest: e.target.value })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                placeholder="District (e.g., Chitwan)"
                value={newAlert.district || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, district: e.target.value })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                placeholder="Province (e.g., Bagmati)"
                value={newAlert.province || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, province: e.target.value })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                placeholder="Location Details"
                value={newAlert.location_details || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, location_details: e.target.value })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={newAlert.latitude || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, latitude: parseFloat(e.target.value) || 0 })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={newAlert.longitude || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, longitude: parseFloat(e.target.value) || 0 })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Temperature (°C)"
                value={newAlert.temperature || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, temperature: parseFloat(e.target.value) || 0 })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Humidity (%)"
                value={newAlert.humidity || ""}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, humidity: parseFloat(e.target.value) || 0 })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <select
                value={newAlert.risk_level || "Moderate"}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, risk_level: e.target.value })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              >
                <option value="Low">Low Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="High">High Risk</option>
              </select>
              <input
                type="number"
                min="1"
                max="30"
                placeholder="Duration (days)"
                value={newAlert.duration_days || 3}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, duration_days: parseInt(e.target.value) || 3 })
                }
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
            </div>
            <textarea
              placeholder="Alert Message/Precautions (e.g., High fire risk due to dry conditions. Avoid open flames, report any smoke immediately.)"
              value={newAlert.message || ""}
              onChange={(e) =>
                setNewAlert({ ...newAlert, message: e.target.value })
              }
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd", minHeight: "80px" }}
            />
            <button
              onClick={handleCreate}
              style={{ marginTop: "8px", padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              🚨 Create Forest Fire Alert
            </button>
          </div>

          <hr />
          <h3>Existing Alerts</h3>
          {alerts.length === 0 ? (
            <p>No alerts yet.</p>
          ) : (
            alerts.map((alert, i) => (
              <div
                key={alert.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              >
                {editIndex === i ? (
                  <>
                    <input
                      value={editedAlert.title}
                      onChange={(e) =>
                        setEditedAlert({
                          ...editedAlert,
                          title: e.target.value,
                        })
                      }
                      style={{ marginBottom: 6 }}
                    />
                    <br />
                    <input
                      value={editedAlert.message}
                      onChange={(e) =>
                        setEditedAlert({
                          ...editedAlert,
                          message: e.target.value,
                        })
                      }
                      style={{ marginBottom: 6, width: "70%" }}
                    />
                    <br />
                    <button onClick={() => saveEdit(alert.id)}>Save</button>{" "}
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "16px", color: "#dc2626" }}>{alert.title}</strong>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                          {alert.forest && <span>🌲 <strong>Forest:</strong> {alert.forest} | </span>}
                          {alert.district && <span>📍 <strong>District:</strong> {alert.district} | </span>}
                          {alert.province && <span>🏛️ <strong>Province:</strong> {alert.province} | </span>}
                          {alert.risk_level && (
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "10px",
                              color: "white",
                              backgroundColor: alert.risk_level === "High" ? "#dc2626" : alert.risk_level === "Moderate" ? "#f59e0b" : "#10b981"
                            }}>
                              {alert.risk_level} Risk
                            </span>
                          )}
                        </div>
                        {alert.latitude && alert.longitude && (
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                            📍 Coordinates: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </div>
                        )}
                        {alert.weather_data && (
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                            🌡️ Temp: {alert.weather_data.temperature}°C | 💧 Humidity: {alert.weather_data.humidity}%
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => startEdit(i)}
                          style={{ padding: "4px 8px", background: "#2563eb", color: "white", border: "none", borderRadius: "3px", fontSize: "12px", marginRight: "4px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          style={{ padding: "4px 8px", background: "#dc2626", color: "white", border: "none", borderRadius: "3px", fontSize: "12px" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p style={{ marginTop: "8px", lineHeight: "1.4" }}>{alert.message}</p>
                  </>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* User Messages Panel */}
      {view === "messages" && (
        <>
          <h3>User Messages</h3>
          {messages.length === 0 ? (
            <p>No user messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  background: "#f3f4f6",
                }}
              >
                <p>
                  <strong>{msg.name}</strong> ({msg.email})
                </p>
                <p>
                  <strong>Subject:</strong> {msg.subject}
                </p>
                <p>{msg.message}</p>

                {replyingId === msg.id ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    <input
                      placeholder="Reply Subject"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      style={{ width: "100%", marginBottom: 6 }}
                    />
                    <textarea
                      placeholder="Reply Message"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      style={{ width: "100%", height: 100, marginBottom: 6 }}
                    />
                    <button onClick={() => sendReply(msg.email)}>
                      Send Reply
                    </button>{" "}
                    <button onClick={() => setReplyingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setReplyingId(msg.id)}>Reply</button>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* Fire Reports Panel */}
      {view === "reports" && (
        <>
          <h3>Submitted Wildfire Reports</h3>
          {reports.length === 0 ? (
            <p>No reports submitted yet.</p>
          ) : (
            <ul>
              {reports.map((r) => (
                <li
                  key={r.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    backgroundColor: r.resolved ? "#e5e7eb" : "#fff7ed",
                    opacity: r.resolved ? 0.6 : 1,
                  }}
                >
                  <strong>{r.name}</strong> reported on{" "}
                  <strong>{r.fire_date}</strong>
                  <br />
                  <strong>Email:</strong> {r.email}
                  <br />
                  <strong>Province:</strong> {r.province},{" "}
                  <strong>District:</strong> {r.district}
                  <br />
                  <strong>Location:</strong> {r.location_details}
                  <br />
                  <strong>Description:</strong> {r.description}
                  <br />
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color: r.resolved ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {r.resolved ? "Resolved" : "Pending"}
                  </span>
                  <br />
                  <button
                    onClick={() => handleResolve(r.id, !r.resolved)}
                    style={{
                      marginTop: 6,
                      backgroundColor: r.resolved ? "#d97706" : "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    {r.resolved ? "Mark Unresolved" : "Mark Resolved"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
