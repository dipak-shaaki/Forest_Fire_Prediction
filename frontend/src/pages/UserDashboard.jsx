import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertBanner from "./AlertBanner";

export default function UserDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <AlertBanner />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-green-800">Welcome to Your Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
            <p className="mb-6 text-gray-700">Access wildfire prediction, reporting, and alerts for Nepal.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/live-fire-map" className="bg-white shadow p-4 rounded hover:bg-blue-50">
                    <h2 className="text-xl font-semibold text-orange-600">Live Fire Map</h2>
                    <p>View real-time fire incidents and hotspots.</p>
                </Link>
                <Link to="/predict" className="bg-white shadow p-4 rounded hover:bg-blue-50">
                    <h2 className="text-xl font-semibold text-indigo-600">Predict Fire Risk</h2>
                    <p>Check fire risk for your location.</p>
                </Link>
                <Link to="/report-fire" className="bg-white shadow p-4 rounded hover:bg-blue-50">
                    <h2 className="text-xl font-semibold text-red-600">Report a Fire</h2>
                    <p>Submit a wildfire report for admin review.</p>
                </Link>
                <Link to="/contact" className="bg-white shadow p-4 rounded hover:bg-blue-50">
                    <h2 className="text-xl font-semibold text-green-600">Contact & Support</h2>
                    <p>Get in touch or send feedback.</p>
                </Link>
            </div>
        </div>
    );
} 