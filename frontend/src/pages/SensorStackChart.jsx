import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function SensorStackChart() {
    const { logout } = useAuth();
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Simulate loading sensor data
        const loadSensorData = async () => {
            try {
                setLoading(true);
                // Mock data - replace with actual API call
                const mockData = [
                    {
                        id: 1,
                        location: "Kathmandu Valley",
                        temperature: 28.5,
                        humidity: 65,
                        windSpeed: 12,
                        airQuality: "Good",
                        lastUpdated: "2024-01-15 14:30:00"
                    },
                    {
                        id: 2,
                        location: "Pokhara",
                        temperature: 32.1,
                        humidity: 58,
                        windSpeed: 8,
                        airQuality: "Moderate",
                        lastUpdated: "2024-01-15 14:25:00"
                    },
                    {
                        id: 3,
                        location: "Chitwan",
                        temperature: 35.2,
                        humidity: 45,
                        windSpeed: 15,
                        airQuality: "Poor",
                        lastUpdated: "2024-01-15 14:20:00"
                    },
                    {
                        id: 4,
                        location: "Biratnagar",
                        temperature: 30.8,
                        humidity: 72,
                        windSpeed: 6,
                        airQuality: "Good",
                        lastUpdated: "2024-01-15 14:15:00"
                    }
                ];

                setTimeout(() => {
                    setSensorData(mockData);
                    setLoading(false);
                }, 1000);
            } catch (err) {
                setError("Failed to load sensor data");
                setLoading(false);
            }
        };

        loadSensorData();
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Loading sensor data...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2 style={{ color: "red" }}>{error}</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontWeight: "bold" }}>Sensor Data Dashboard</h2>
                <button
                    onClick={handleLogout}
                    style={{
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
            </div>

            <div style={{ marginBottom: "2rem" }}>
                <h3>Real-time Sensor Readings</h3>
                <p style={{ color: "#666" }}>
                    Monitor environmental conditions across Nepal's fire monitoring network.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                {sensorData.map((sensor) => (
                    <div
                        key={sensor.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            padding: "1rem",
                            background: "#fff",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        <h4 style={{ marginBottom: "0.5rem", color: "#2563eb" }}>
                            {sensor.location}
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                            <div>
                                <strong>Temperature:</strong> {sensor.temperature}°C
                            </div>
                            <div>
                                <strong>Humidity:</strong> {sensor.humidity}%
                            </div>
                            <div>
                                <strong>Wind Speed:</strong> {sensor.windSpeed} km/h
                            </div>
                            <div>
                                <strong>Air Quality:</strong>
                                <span style={{
                                    color: sensor.airQuality === "Good" ? "green" :
                                        sensor.airQuality === "Moderate" ? "orange" : "red",
                                    fontWeight: "bold"
                                }}>
                                    {sensor.airQuality}
                                </span>
                            </div>
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                            Last updated: {sensor.lastUpdated}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem", background: "#f8f9fa", borderRadius: 8 }}>
                <h3>Chart Placeholder</h3>
                <p style={{ color: "#666" }}>
                    This section will contain interactive charts and graphs showing:
                </p>
                <ul style={{ color: "#666" }}>
                    <li>Temperature trends over time</li>
                    <li>Humidity variations</li>
                    <li>Wind speed patterns</li>
                    <li>Air quality index trends</li>
                    <li>Fire risk correlation with environmental factors</li>
                </ul>
                <p style={{ color: "#666", fontStyle: "italic" }}>
                    Chart integration will be implemented in future updates.
                </p>
            </div>
        </div>
    );
} 