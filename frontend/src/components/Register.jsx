import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

// Define client-side validation schema using Zod with password match refinement
const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Register = ({ onToggleLogin }) => {
  const { register: registerAuth } = useAuth();
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');

    const result = await registerAuth(data.email, data.password, data.role);

    if (result.success) {
      setSuccessMsg('Account registered successfully! Logging you in...');
    } else {
      setApiError(result.error || 'Registration failed. Check details or email conflicts.');
    }
  };

  return (
    <div className="auth-card glass-card">
      <div className="auth-header">
        <span className="logo-icon">🔑</span>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to setup your security credentials</p>
      </div>

      {apiError && <div className="alert alert-danger">{apiError}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
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
          <label className="form-label" htmlFor="reg-password">Password (min 6 chars)</label>
          <input
            id="reg-password"
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

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
          <input
            id="reg-confirm-password"
            type="password"
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-role">Assign Role (for portfolio testing)</label>
          <select
            id="reg-role"
            className="form-select"
            {...register('role')}
            disabled={isSubmitting}
          >
            <option value="USER">USER (Access own tasks only)</option>
            <option value="ADMIN">ADMIN (Access all database tasks)</option>
          </select>
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
              <span>Creating Account...</span>
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <span className="auth-link" onClick={onToggleLogin}>
          Sign in here
        </span>
      </div>

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

export default Register;
