import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

const API_URL = "http://localhost:5000/api/auth/register";

function Register({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      onLoginSuccess?.(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <div className="login-pill-toggle">
          <Link to="/signin" className="login-pill-tab">
            Login
          </Link>
          <Link to="/register" className="login-pill-tab active">
            Register
          </Link>
        </div>

        <h1 className="login-title">Create Your Account</h1>
        <p className="login-tagline">Sign up to start your learning journey.</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="login-field-label">First Name</label>
          <input
            type="text"
            className="login-input"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />

          <label className="login-field-label">Last Name</label>
          <input
            type="text"
            className="login-input"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />

          <label className="login-field-label">Username</label>
          <input
            type="text"
            className="login-input"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label className="login-field-label">Email Address</label>
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="login-field-label">Password</label>
          <input
            type="password"
            className="login-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <label className="login-field-label">Confirm Password</label>
          <input
            type="password"
            className="login-input"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button type="submit" className="login-signin-btn" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="login-register-text">
            Already have an account?{" "}
            <Link to="/signin" className="login-register-link">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;