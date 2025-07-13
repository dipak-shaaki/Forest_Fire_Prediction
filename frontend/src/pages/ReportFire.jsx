import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationSelector({ onSelect }) {
  const [marker, setMarker] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);
      onSelect(lat, lng);
    },
  });

  return marker ? (
    <Marker position={marker}>
      <Popup>Selected Fire Location</Popup>
    </Marker>
  ) : null;
}

export default function ReportFire() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    province: "",
    district: "",
    location_details: "",
    fire_date: "",
    description: "",
    lat: null,
    lon: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setLocation = (lat, lon) => {
    setForm({ ...form, lat, lon });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:8000/reports/", form);
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit fire report.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Report a Wildfire</h2>

      {submitted ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ Thank you! Your report has been submitted.
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            <input name="name" value={form.name} onChange={update} placeholder="Your Name" />
            <input name="email" value={form.email} onChange={update} placeholder="Email Address" />
            <input name="province" value={form.province} onChange={update} placeholder="Province" />
            <input name="district" value={form.district} onChange={update} placeholder="District" />
            <input
              name="location_details"
              value={form.location_details}
              onChange={update}
              placeholder="Exact location / landmark"
            />
            <input
              name="fire_date"
              type="date"
              value={form.fire_date}
              onChange={update}
              placeholder="Date of Fire"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              placeholder="Describe what you saw..."
              rows={4}
            />
          </div>

          <h4 style={{ marginTop: 20 }}>Optional: Select Location on Map</h4>
          <MapContainer
            center={[28.4, 84.1]}
            zoom={7}
            style={{ height: 300, marginBottom: 20 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationSelector onSelect={setLocation} />
          </MapContainer>

          <button
            onClick={handleSubmit}
            style={{
              background: "#1e40af",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Submit Report
          </button>

          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        </>
      )}
    </div>
  );
}
