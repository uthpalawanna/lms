import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const showMismatchHint = confirmPassword.length > 0 && password !== confirmPassword;

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Reset Password</h1>
          <div className="login-error">
            This reset link is missing or malformed. Please request a new one.
          </div>
          <p className="login-register-text" style={{ marginTop: 16 }}>
            <Link to="/forgot-password" className="login-register-link">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (!hasMinLength) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      setMessage(data.message || 'Your password has been reset successfully.');
      setTimeout(() => navigate('/signin', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset your password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Reset Password</h1>

        <div role="alert" aria-live="polite">
          {error && <div className="login-error">{error}</div>}
          {message && (
            <div className="login-error" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
              {message}
              {' '}
              <Link to="/signin" className="login-register-link">Sign in now</Link>
            </div>
          )}
        </div>

        {!message && (
          <>
            <label htmlFor="reset-password" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p style={{ fontSize: 12, margin: '4px 0 12px', color: hasMinLength ? '#059669' : '#9ca3af' }}>
              {hasMinLength ? '✓' : '•'} At least 8 characters
            </p>

            <label htmlFor="reset-confirm-password" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className="login-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                title={showConfirm ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {showMismatchHint && (
              <p style={{ fontSize: 12, margin: '4px 0 12px', color: '#dc2626' }}>Passwords don't match yet</p>
            )}
            {passwordsMatch && (
              <p style={{ fontSize: 12, margin: '4px 0 12px', color: '#059669' }}>✓ Passwords match</p>
            )}

            <button onClick={handleSubmit} disabled={loading} className="login-signin-btn">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </>
        )}

        <p className="login-register-text">
          <Link to="/signin" className="login-register-link">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;