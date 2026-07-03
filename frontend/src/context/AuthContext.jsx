import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Checks for an active session (cookie authentication validation) on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.status === 'success' && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Ignored on initialization; user is simply unauthenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      return { success: false, error: err.message || 'Invalid email or password' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { email, password, role });
      if (response.status === 'success') {
        // Automatically attempt login after successful registration
        return await login(email, password);
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error occurred on server:', err);
    } finally {
      setUser(null);
      setLoading(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed inside an AuthProvider');
  }
  return context;
};
