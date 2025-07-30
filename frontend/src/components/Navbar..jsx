
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <nav className="bg-green-700 text-white p-4 flex justify-between items-center shadow-md">
      <div className="font-bold text-xl tracking-wide">Nepal Forest Fire Watch</div>
      <div className="space-x-4 text-sm md:text-base">
                       <Link to="/live-map" className="hover:text-red-400">Live Map</Link>
               <Link to="/predict" className="hover:underline">Predict</Link>
               <Link to="/alerts" className="hover:underline">🚨 Alerts</Link>
               <Link to="/how-it-works" className="hover:underline">How It Works</Link>
               <Link to="/stats" className="hover:underline">Statistics</Link>
               <Link to="/contact" className="hover:underline">Contact</Link>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 cursor-not-allowed">Login / Signup</span>
            <Link 
              to={userRole === 'admin' ? "/admin-dashboard" : "/user-dashboard"} 
              className="hover:underline bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              {userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
            </Link>
          </div>
        ) : (
          <Link to="/login" className="hover:underline">Login / Signup</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;