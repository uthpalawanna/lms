import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 8) {
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

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div className="login-error" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
            {message}
          </div>
        )}

        <input
          type="password"
          className="login-input"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <input
          type="password"
          className="login-input"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoComplete="new-password"
        />

        <button onClick={handleSubmit} disabled={loading} className="login-signin-btn">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="login-register-text">
          <Link to="/signin" className="login-register-link">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
