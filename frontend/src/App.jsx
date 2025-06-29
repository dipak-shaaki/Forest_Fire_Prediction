import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import FireWatchNepal from "./pages/fire-watch-nepal";
import FirePage from './pages/FirePage';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-green-700 text-white p-4 flex justify-between">
        <div className="font-bold text-xl">Nepal Forest Fire Watch</div>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/fire-watch" className="hover:text-red-600">
  Fire Watch
</Link>

          <Link to="/fire-watch-nepal" className="hover:underline">Fire-Watch</Link>
          <Link to="/predict" className="hover:underline">Predict</Link>
          <Link to="/how-it-works" className="hover:underline">How It Works</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path="/fire-watch" element={<FirePage />} />
          <Route path="/fire-watch-nepal" element={<FireWatchNepal />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
  );
}
