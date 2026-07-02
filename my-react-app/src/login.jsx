import { useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5000/api/auth/login";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend sent back an error message (e.g. "Invalid email or password")
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success — data.token and data.user are available here
      onLoginSuccess?.(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Hi, Welcome Back!</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username or Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginBottom: "0.85rem" }}>
              {error}
            </p>
          )}

          <a href="#" className="provider-link">
            Login with Bluehost
          </a>

          <div className="options-row">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>

            <a href="#" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="register-section">
            <span>Don't have an account?</span>
            <a href="#">Register Now</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;