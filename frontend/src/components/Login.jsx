import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

// Define client-side validation schema using Zod
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const Login = ({ onToggleRegister }) => {
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize react-hook-form with Zod validation resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');

    const result = await login(data.email, data.password);

    if (result.success) {
      setSuccessMsg('Login successful! Redirecting...');
    } else {
      setApiError(result.error || 'Failed to sign in. Verify credentials.');
    }
  };

  return (
    <div className="auth-card glass-card">
      <div className="auth-header">
        <span className="logo-icon">🛡️</span>
        <h2 className="auth-title">AccessGuard Sign In</h2>
        <p className="auth-subtitle">Log in to manage tasks securely</p>
      </div>

      {apiError && <div className="alert alert-danger">{apiError}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="name@domain.com"
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={`form-input ${errors.password ? 'input-error' : ''}`}
            placeholder="••••••••"
            {...register('password')}
            disabled={isSubmitting}
          />
          {errors.password && (
            <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              <span>Signing In...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <span className="auth-link" onClick={onToggleRegister}>
          Register here
        </span>
      </div>

      {/* Add spin animation keyframes inline */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .input-error {
          border-color: rgba(239, 68, 68, 0.4) !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
