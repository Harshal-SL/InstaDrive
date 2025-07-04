import axios from 'axios';
import { errorMessages } from '../utils/errorHandler';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem('token');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Default error message
    let errorMessage = errorMessages.UNKNOWN_ERROR;

    // No response from server
    if (!error.response) {
      errorMessage = errorMessages.NETWORK_ERROR;
    } else {
      // Handle different status codes
      switch (error.response.status) {
        case 400:
          errorMessage = errorMessages.BAD_REQUEST;
          break;
        case 401:
          errorMessage = errorMessages.UNAUTHORIZED;
          // Could handle logout here if needed
          break;
        case 403:
          errorMessage = errorMessages.FORBIDDEN;
          break;
        case 404:
          errorMessage = errorMessages.NOT_FOUND;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = errorMessages.SERVER_ERROR;
          break;
        default:
          errorMessage = errorMessages.UNKNOWN_ERROR;
      }
    }

    // Add user-friendly message to error object
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default api;