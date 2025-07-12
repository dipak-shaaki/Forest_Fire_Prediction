import React, { useEffect, useState } from 'react';
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from '../config/adminApi';

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ title: '', description: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [editedAlert, setEditedAlert] = useState({});

  // Fetch alerts on page load
  useEffect(() => {
    fetchAlerts()
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error('Failed to fetch alerts:', err));
  }, []);

  // Create new alert
  const handleCreate = async () => {
    if (!newAlert.title || !newAlert.description) return alert("All fields required");
    try {
      const res = await createAlert(newAlert);
      setAlerts([...alerts, res.data]);
      setNewAlert({ title: '', description: '' });
    } catch (err) {
      console.error('Create failed:', err);
      alert("Create failed");
    }
  };

  // Delete alert
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert("Delete failed");
    }
  };

  // Start editing an alert
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedAlert({ ...alerts[index] });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedAlert({});
  };

  // Save alert update
  const handleSave = async (id) => {
    try {
      const res = await updateAlert(id, {
        title: editedAlert.title,
        description: editedAlert.description,
      });
      const updated = [...alerts];
      updated[editIndex] = res.data;
      setAlerts(updated);
      setEditIndex(null);
      setEditedAlert({});
    } catch (err) {
      console.error('Update failed:', err);
      alert("Update failed");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontWeight: 'bold' }}>Admin Dashboard – Fire Alerts</h2>

      {/* Create new alert */}
      <div style={{ marginBottom: '2rem' }}>
        <h4>Create New Alert</h4>
        <input
          type="text"
          placeholder="Title"
          value={newAlert.title}
          onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newAlert.description}
          onChange={(e) =>
            setNewAlert({ ...newAlert, description: e.target.value })
          }
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleCreate}>Create Alert</button>
      </div>

      <hr />

      {/* List existing alerts */}
      <h3>Existing Alerts</h3>
      {alerts.length === 0 ? (
        <p>No alerts found.</p>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={alert.id}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            {editIndex === index ? (
              <>
                <input
                  value={editedAlert.title}
                  onChange={(e) =>
                    setEditedAlert({ ...editedAlert, title: e.target.value })
                  }
                  style={{ marginBottom: '0.5rem' }}
                />
                <br />
                <input
                  value={editedAlert.description}
                  onChange={(e) =>
                    setEditedAlert({
                      ...editedAlert,
                      description: e.target.value,
                    })
                  }
                />
                <br />
                <button onClick={() => handleSave(alert.id)}>Save</button>{' '}
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{alert.title}</strong>
                <p>{alert.description}</p>
                <button onClick={() => handleEdit(index)}>Edit</button>{' '}
                <button onClick={() => handleDelete(alert.id)}>Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
    
  );
}
