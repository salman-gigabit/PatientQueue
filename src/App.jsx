import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./api/auth";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./style.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Verify token with backend
        const response = await getCurrentUser();
        const user = response.data;
        
        // Update localStorage with fresh user data
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        
        setIsLoggedIn(true);
        setUserRole(user?.role || null);
      } catch {
        // Token invalid or expired, clear auth
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth);
    
    // Also listen for custom logout event (for same-tab logout)
    const handleLogout = () => {
      checkAuth();
    };
    window.addEventListener("logout", handleLogout);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  return (
    <Router>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div>Loading...</div>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                userRole === "admin" ? (
                  <AdminHome />
                ) : (
                  <UserHome />
                )
              ) : (
                <Navigate to="/signup" replace />
              )
            }
          />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/" replace /> : <Signup />}
          />
        </Routes>
      )}
    </Router>
  );
}
