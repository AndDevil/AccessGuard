import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Crucial: automatically attach and receive HTTPOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors nicely
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If the backend returned a structured JSON error, extract it
    const apiError = error.response?.data || {
      message: error.message || 'An unexpected client error occurred',
    };
    return Promise.reject(apiError);
  }
);

export default api;
