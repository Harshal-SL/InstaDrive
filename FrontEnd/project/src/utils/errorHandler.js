/**
 * Error handling utilities for the application
 */

// Standard error messages
export const errorMessages = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  
  // Car-related errors
  CAR_NOT_FOUND: 'Car not found.',
  CAR_NOT_AVAILABLE: 'This car is not available for the selected dates.',
  BOOKING_FAILED: 'Failed to create booking. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
};

/**
 * Get user-friendly error message based on error response
 * @param {Object} error - Error object from axios or other source
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // If error has a custom message, use it
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // Handle axios errors
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Check if server provided a specific error message
    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    // Handle common HTTP status codes
    switch (status) {
      case 400:
        return errorMessages.BAD_REQUEST;
      case 401:
        return errorMessages.UNAUTHORIZED;
      case 403:
        return errorMessages.FORBIDDEN;
      case 404:
        return errorMessages.NOT_FOUND;
      case 408:
        return errorMessages.TIMEOUT_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return errorMessages.SERVER_ERROR;
      default:
        return errorMessages.UNKNOWN_ERROR;
    }
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message === 'Network Error') {
    return errorMessages.NETWORK_ERROR;
  }

  // Handle timeout errors
  if (error?.code === 'ECONNABORTED') {
    return errorMessages.TIMEOUT_ERROR;
  }

  // Default fallback
  return errorMessages.UNKNOWN_ERROR;
};

/**
 * Log error for debugging purposes
 * @param {Object} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = 'Unknown') => {
  console.error(`[${context}] Error:`, error);
  
  // In production, you might want to send errors to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, { context });
  }
};

/**
 * Handle API errors consistently
 * @param {Object} error - Error object from API call
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error, context = 'API') => {
  logError(error, context);
  return getErrorMessage(error);
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} - Standardized error object
 */
export const createError = (message, code = 'UNKNOWN', details = {}) => {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validate form data and return errors
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Object with field errors
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = errorMessages.REQUIRED_FIELD;
      return;
    }

    if (value && rule.email && !isValidEmail(value)) {
      errors[field] = errorMessages.INVALID_EMAIL;
      return;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `Must be at least ${rule.minLength} characters long.`;
      return;
    }

    if (value && rule.phone && !isValidPhone(value)) {
      errors[field] = errorMessages.INVALID_PHONE;
      return;
    }
  });

  return errors;
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if phone number is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};
