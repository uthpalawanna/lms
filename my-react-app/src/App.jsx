import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = ({ token, user }) => {
    setToken(token);
    setUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const homeRoute = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/register"
          element={<Register onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isLoggedIn && user?.role === "admin" ? (
              <AdminDashboard token={token} currentUserId={user._id} onLogout={handleLogout} />
            ) : isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={isLoggedIn ? homeRoute : "/signin"} replace />
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? homeRoute : "/signin"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;