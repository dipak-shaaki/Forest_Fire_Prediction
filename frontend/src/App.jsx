import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "leaflet/dist/leaflet.css";

import Navbar from "./components/Navbar.";
import Footer from "./components/Footer";
import RequireAdmin from "./components/RequireAdmin";

import Home from "./pages/Home";
import Predict from "./pages/Predict";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import LiveFireMapPage from "./pages/LiveFireMapPage";
import FireStatsPage from "./pages/FireStatsPage";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import OTPVerification from "./pages/OTPVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SensorStackChart from "./pages/SensorStackChart";
import ReportFire from "./pages/ReportFire";
import NepalScan from "./pages/NepalScan";
import AlertsManagement from "./pages/AlertsManagement";
import Alerts from "./pages/Alerts";

// Protected Route component to prevent logged-in users from accessing login
const ProtectedLoginRoute = ({ children }) => {
    const { isAuthenticated, userRole } = useAuth();

    if (isAuthenticated) {
        // Redirect to appropriate dashboard
        if (userRole === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        } else {
            return <Navigate to="/user-dashboard" replace />;
        }
    }

    return children;
};

// Protected Route component for authenticated users only
const RequireAuth = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function AppContent() {
    return (
        <div className="App">
            <Navbar />
            <main className="min-h-screen">
                <Routes>
                    {/* public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/live-map" element={<LiveFireMapPage />} />
                    <Route path="/predict" element={<Predict />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/stats" element={<FireStatsPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={
                        <ProtectedLoginRoute>
                            <Login />
                        </ProtectedLoginRoute>
                    } />
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/report-fire" element={<RequireAuth><ReportFire /></RequireAuth>} />

                    {/* auth routes */}
                    <Route
                        path="/admin-dashboard"
                        element={
                            <RequireAdmin>
                                <AdminDashboard />
                            </RequireAdmin>
                        }
                    />
                    <Route path="/sensor-stack-chart" element={<RequireAdmin><SensorStackChart /></RequireAdmin>} />
                    <Route path="/nepal-scan" element={<RequireAdmin><NepalScan /></RequireAdmin>} />
                    <Route path="/alerts-management" element={<RequireAdmin><AlertsManagement /></RequireAdmin>} />
                    <Route path="/alerts" element={<Alerts />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
