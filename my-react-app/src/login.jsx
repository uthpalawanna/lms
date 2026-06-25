import { useState } from "react";
import "./index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    alert(`Login Successful!\nEmail: ${email}`);
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

          <button type="submit" className="signin-btn">
            Sign In
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
