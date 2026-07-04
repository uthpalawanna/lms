import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./Dashboard";

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

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
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
          path="/"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/signin"} replace />
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/signin"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;