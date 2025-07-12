import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import Navbar from "./components/Navbar.";
import RequireAdmin from "./components/RequireAdmin";

import Home from "./pages/Home";
import Predict from "./pages/Predict";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import LiveFireMapPage from "./pages/LiveFireMapPage";
import FireStatsPage from "./pages/FireStatsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto mt-4 px-4">
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/live-map" element={<LiveFireMapPage />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/stats" element={<FireStatsPage />} />
          <Route path="/contact" element={<Contact />} />

          {/* auth routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin-dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
