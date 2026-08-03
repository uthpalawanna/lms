import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import axios from 'axios';
import './Dashboard.css';
import { API_URL as BASE_URL } from "./api/config";

const API_URL = `${BASE_URL}/api`;

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess?.({ token: data.token, user: data.user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split">
        <div className="login-illustration-panel">
          <svg className="login-illustration-svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="loginIllusBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--navy)" />
                <stop offset="100%" stopColor="var(--navy-light)" />
              </linearGradient>
            </defs>
            <rect width="400" height="500" fill="url(#loginIllusBg)" />
            <circle className="login-illus-float-slow" cx="330" cy="70" r="46" fill="rgba(255,255,255,0.06)" />
            <circle className="login-illus-float-slow login-illus-delay-2" cx="60" cy="430" r="70" fill="rgba(255,255,255,0.05)" />
            <rect x="90" y="330" width="220" height="14" rx="7" fill="rgba(255,255,255,0.12)" />
            <rect x="120" y="356" width="160" height="10" rx="5" fill="rgba(255,255,255,0.08)" />
            <circle className="login-illus-pop" cx="200" cy="220" r="70" fill="var(--primary)" opacity="0.9" />
            <path className="login-illus-check" d="M170 230 l20 20 l45 -50" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect className="login-illus-float login-illus-delay-1" x="130" y="120" width="34" height="34" rx="8" fill="var(--primary-light)" opacity="0.8" />
            <rect className="login-illus-float login-illus-delay-3" x="250" y="150" width="24" height="24" rx="6" fill="var(--accent)" opacity="0.85" />
          </svg>
          <div className="login-illustration-caption">
            <h3>Learning made simple</h3>
            <p>Pick up right where you left off.</p>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-inner">
            <div className="login-pill-toggle login-anim login-anim-1">
              <Link to="/signin" className="login-pill-tab active">Login</Link>
              <Link to="/register" className="login-pill-tab">Register</Link>
            </div>

            <h1 className="login-title login-anim login-anim-2">Hi, Welcome Back!</h1>
            <p className="login-tagline login-anim login-anim-2">Sign in to continue your learning journey.</p>

            {error && <div className="login-error">{error}</div>}

            <label className="login-field-label login-anim login-anim-3">Email Address</label>
            <div className="login-anim login-anim-3">
              <input
                type="email"
                className="login-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <label className="login-field-label login-anim login-anim-4">Password</label>
            <div className="login-password-wrap login-anim login-anim-4">
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <a href="#" className="login-bluehost-link login-anim login-anim-5">Login with Bluehost</a>

            <div className="login-row login-anim login-anim-5">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                Keep me signed in
              </label>
              <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="login-signin-btn login-anim login-anim-6">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="login-register-text login-anim login-anim-6">
              Don't have an account?{' '}
              <Link to="/register" className="login-register-link">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;