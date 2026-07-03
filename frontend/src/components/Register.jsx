import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onToggleLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register(email, password, role);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Account registered successfully! Logging you in...');
    } else {
      setErrorMsg(result.error || 'Registration failed. Check details or email conflicts.');
    }
  };

  return (
    <div className="auth-card glass-card">
      <div className="auth-header">
        <span className="logo-icon">🔑</span>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to setup your security credentials</p>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            className="form-input"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password (min 6 chars)</label>
          <input
            id="reg-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
          <input
            id="reg-confirm-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-role">Assign Role (for portfolio testing)</label>
          <select
            id="reg-role"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="USER">USER (Access own tasks only)</option>
            <option value="ADMIN">ADMIN (Access all database tasks)</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <span className="auth-link" onClick={onToggleLogin}>
          Sign in here
        </span>
      </div>
    </div>
  );
};

export default Register;
const sampleMockup = null; // metadata placeholder
