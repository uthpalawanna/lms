import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import './Dashboard.css';
import { API_URL as BASE_URL } from "./api/config";

const API_URL = `${BASE_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 30;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const emailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async () => {
    setError('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (cooldown > 0) return;

    setMessage('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email: trimmedEmail });
      setMessage(data.message || "If an account with that email exists, we've sent a reset link to it.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err.response?.status === 429) {
        setError("You've requested this a few times already — please wait a bit before trying again.");
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading
    ? 'Sending…'
    : cooldown > 0
    ? `Resend in ${cooldown}s`
    : message
    ? 'Resend Link'
    : 'Send Reset Link';

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Forgot Password?</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        <div role="alert" aria-live="polite">
          {error && <div className="login-error">{error}</div>}
          {message && (
            <div className="login-error" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
              {message}
            </div>
          )}
        </div>

        <label htmlFor="forgot-email" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
          Email Address
        </label>
        <input
          id="forgot-email"
          ref={emailInputRef}
          type="email"
          className="login-input"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoComplete="email"
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || cooldown > 0}
          className="login-signin-btn"
        >
          {buttonLabel}
        </button>

        <p className="login-register-text">
          Remembered your password?{' '}
          <Link to="/signin" className="login-register-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;