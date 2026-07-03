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

// Flags and queue to handle concurrent 401 exceptions
let isRefreshing = false;
let failedQueue = [];

/**
 * Process the queued requests once the refresh token call resolves.
 * @param {Error|null} error - Error object if refresh failed, null on success.
 */
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If it's a request to login or register, do not attempt a refresh rotation
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
        const apiError = error.response?.data || {
          message: error.message || 'Authentication failed',
        };
        return Promise.reject(apiError);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Once resolved, retry original request (which will now send the updated cookie automatically)
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Execute token refresh using a clean axios instance to bypass interceptors
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        
        isRefreshing = false;
        
        // Resolve all queued promises in the queue
        processQueue(null);
        
        // Retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        
        const parsedError = refreshError.response?.data || {
          message: 'Session expired. Please log in again.'
        };

        // Reject all queued promises in the queue
        processQueue(parsedError);

        console.warn('Refresh token expired or invalid, forcing session log out.');
        logoutCallback(); // Automatically reset user context in React
        
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
