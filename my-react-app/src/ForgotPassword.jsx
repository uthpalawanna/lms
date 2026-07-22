import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setMessage(data.message || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Forgot Password?</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div className="login-error" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
            {message}
          </div>
        )}

        <input
          type="email"
          className="login-input"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoComplete="email"
        />

        <button onClick={handleSubmit} disabled={loading} className="login-signin-btn">
          {loading ? 'Sending...' : 'Send Reset Link'}
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
