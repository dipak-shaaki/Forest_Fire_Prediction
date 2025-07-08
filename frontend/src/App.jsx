import { Routes, Route, BrowserRouter } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import LiveFireMapPage from "./pages/LiveFireMapPage";
import Navbar from "./components/Navbar.";
import LiveHotspotsMap from "./components/LiveHotspotsMap";
import FireStatsPage from "./pages/FireStatsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      
<Navbar/>
        <main className="max-w-5xl mx-auto mt-4 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live-map" element={<LiveFireMapPage />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
             <Route path="/stats" element={<FireStatsPage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      
    </div>
  );
}
