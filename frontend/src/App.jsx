import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-green-700 text-white p-4 flex justify-between">
        <div className="font-bold text-xl">Nepal Forest Fire Watch</div>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/predict" className="hover:underline">Predict</Link>
          <Link to="/how-it-works" className="hover:underline">How It Works</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
  );
}
