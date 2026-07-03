import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Crucial: automatically attach and receive HTTPOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

let logoutCallback = () => {};

/**
 * Register a callback to trigger user state clears (logout) in React
 * when refresh tokens expire (e.g. after 7 days idle).
 */
export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

// Response interceptor to handle auto token refresh
api.interceptors.response.use(
  (response) => {
    // If the call succeeds, return the nested response.data
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 Unauthorized, and it hasn't been retried yet,
    // and it's not a request targeting authentication endpoints themselves.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Execute token refresh using a clean axios instance to bypass main interceptors
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        
        // Retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Refresh token expired or invalid, forcing session log out.');
        logoutCallback(); // Automatically reset user context in React
        
        const parsedError = refreshError.response?.data || {
          message: 'Session expired. Please log in again.'
        };
        return Promise.reject(parsedError);
      }
    }

    // Format standard client errors before rejecting
    const apiError = error.response?.data || {
      message: error.message || 'An unexpected client error occurred',
    };
    return Promise.reject(apiError);
  }
);

export default api;
