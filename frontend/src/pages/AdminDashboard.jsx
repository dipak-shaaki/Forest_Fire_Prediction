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
    if (!newAlert.title || !newAlert.message)
      return alert("All fields required");
    try {
      const res = await createAlert(newAlert);
      setAlerts([...alerts, res.data]);
      setNewAlert({ title: "", message: "" });
    } catch {
      alert("Create failed");
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
        "http://localhost:8000/admin/scan-nepal",
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
        district: d.district,
        location: d.location,
        risk: d.risk,
        details: d.details,
        reason: alertReasons[d.district] || "High fire risk detected."
      }));
    try {
      const { data } = await axios.post(
        "http://localhost:8000/admin/alerts/bulk",
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
        <h3>Full Nepal Fire Risk Scan</h3>
        <button onClick={handleScan} disabled={scanLoading} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", marginBottom: 12 }}>
          {scanLoading ? "Scanning..." : "Run Full Scan"}
        </button>
        {scanError && <div style={{ color: "red" }}>{scanError}</div>}
        {highRiskDistricts.length > 0 && (
          <div>
            <p>High-risk districts detected: Select which to alert and add reasons.</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th></th>
                  <th>District</th>
                  <th>Temp (°C)</th>
                  <th>Humidity (%)</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {highRiskDistricts.map((d) => (
                  <tr key={d.district} style={{ borderBottom: "1px solid #eee" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDistricts.includes(d.district)}
                        onChange={() => toggleDistrict(d.district)}
                      />
                    </td>
                    <td>{d.district}</td>
                    <td>{d.details.temperature}</td>
                    <td>{d.details.humidity}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Reason for alert"
                        value={alertReasons[d.district] || ""}
                        onChange={(e) => handleReasonChange(d.district, e.target.value)}
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
              {bulkAlertLoading ? "Publishing..." : `Publish ${selectedDistricts.length} Alert(s)`}
            </button>
            {bulkAlertResult && (
              <div style={{ color: "green", marginTop: 8 }}>
                {bulkAlertResult.length} alert(s) published!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alerts Panel */}
      {view === "alerts" && (
        <>
          <div style={{ marginBottom: "2rem" }}>
            <h4>Create New Alert</h4>
            <input
              placeholder="Title"
              value={newAlert.title}
              onChange={(e) =>
                setNewAlert({ ...newAlert, title: e.target.value })
              }
              style={{ marginRight: 10 }}
            />
            <input
              placeholder="Message"
              value={newAlert.message}
              onChange={(e) =>
                setNewAlert({ ...newAlert, message: e.target.value })
              }
              style={{ marginRight: 10 }}
            />
            <button onClick={handleCreate}>Create Alert</button>
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
                    <strong>{alert.title}</strong>
                    <p>{alert.message}</p>
                    <button onClick={() => startEdit(i)}>Edit</button>{" "}
                    <button onClick={() => handleDelete(alert.id)}>Delete</button>
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
