import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../config/adminApi";

export default function AdminDashboard() {
  /* ---------------- state ---------------- */
  const [view, setView] = useState("alerts"); // 'alerts' | 'messages'

  // alerts
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ title: "", message: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editedAlert, setEditedAlert] = useState({});

  // user messages
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("adminToken");

  /* ---------------- load on mount ---------------- */
  useEffect(() => {
    loadAlerts();
    loadMessages();
  }, []);

  const loadAlerts = () =>
    fetchAlerts().then((res) => setAlerts(res.data)).catch(console.error);

  const loadMessages = () =>
    axios
      .get("http://localhost:8000/messages")
      .then((res) => setMessages(res.data))
      .catch(console.error);

  /* ---------------- alert CRUD handlers ---------------- */
  const handleCreate = async () => {
    if (!newAlert.title || !newAlert.message)
      return alert("All fields required");
    try {
      const res = await createAlert(newAlert); // token added via interceptor
      setAlerts([...alerts, res.data]);
      setNewAlert({ title: "", message: "" });
    } catch (err) {
      console.error("Create failed:", err);
      alert("Create failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
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
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed.");
    }
  };

  /* ---------------- logout ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin-login";
  };

  /* ---------------- UI ---------------- */
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

      {/* simple tab selector */}
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
      </div>

      {/* ============ ALERTS PANEL ============ */}
      {view === "alerts" && (
        <>
          {/* create */}
          <div style={{ marginBottom: "2rem" }}>
            <h4>Create New Alert</h4>
            <input
              type="text"
              placeholder="Title"
              value={newAlert.title}
              onChange={(e) =>
                setNewAlert({ ...newAlert, title: e.target.value })
              }
              style={{ marginRight: 10 }}
            />
            <input
              type="text"
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

          {/* list */}
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
                    <button onClick={() => handleDelete(alert.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ============ MESSAGES PANEL ============ */}
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
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
