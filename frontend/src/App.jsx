import { Routes, Route, BrowserRouter } from "react-router-dom";
import 'leaflet/dist/leaflet.css';

import Home from "./pages/Home";
import Predict from "./pages/Predict";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import FirePage from './pages/FirePage';
import Navbar from "./components/Navbar.";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      
<Navbar/>
        <main className="max-w-5xl mx-auto mt-4 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fire-watch" element={<FirePage />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      
    </div>
  );
}
