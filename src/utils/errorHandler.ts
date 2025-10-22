import { Message } from '@arco-design/web-react';

export interface ErrorInfo {
  message: string;
  details?: string;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Parse error and return user-friendly error information
 */
export const parseError = (error: any): ErrorInfo => {
  // Network errors
  if (!error.response) {
    if (error.message === 'Network Error') {
      return {
        message: 'Network connection failed',
        details: 'Please check your internet connection and try again.',
        retryable: true,
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout',
        details: 'The server is taking too long to respond. Please try again.',
        retryable: true,
      };
    }

    return {
      message: 'Connection error',
      details: 'Unable to connect to the server. Please try again later.',
      retryable: true,
    };
  }

  const statusCode = error.response?.status;
  const serverMessage = error.response?.data?.message || error.response?.data?.error;

  // HTTP status code errors
  switch (statusCode) {
    case 400:
      return {
        message: 'Invalid request',
        details: serverMessage || 'The request contains invalid data. Please check your input.',
        retryable: false,
        statusCode,
      };

    case 401:
      return {
        message: 'Authentication required',
        details: 'Your session has expired. Please log in again.',
        retryable: false,
        statusCode,
      };

    case 403:
      return {
        message: 'Access denied',
        details: 'You do not have permission to perform this action.',
        retryable: false,
        statusCode,
      };

    case 404:
      return {
        message: 'Not found',
        details: serverMessage || 'The requested resource was not found.',
        retryable: false,
        statusCode,
      };

    case 409:
      return {
        message: 'Conflict',
        details: serverMessage || 'This operation conflicts with existing data.',
        retryable: false,
        statusCode,
      };

    case 422:
      return {
        message: 'Validation error',
        details: serverMessage || 'The data provided failed validation.',
        retryable: false,
        statusCode,
      };

    case 429:
      return {
        message: 'Too many requests',
        details: 'You have made too many requests. Please wait a moment and try again.',
        retryable: true,
        statusCode,
      };

    case 500:
      return {
        message: 'Server error',
        details: 'An internal server error occurred. Please try again later.',
        retryable: true,
        statusCode,
      };

    case 502:
    case 503:
      return {
        message: 'Service unavailable',
        details: 'The server is temporarily unavailable. Please try again in a few moments.',
        retryable: true,
        statusCode,
      };

    case 504:
      return {
        message: 'Gateway timeout',
        details: 'The server took too long to respond. Please try again.',
        retryable: true,
        statusCode,
      };

    default:
      return {
        message: 'An error occurred',
        details: serverMessage || `An unexpected error occurred (Error ${statusCode}).`,
        retryable: true,
        statusCode,
      };
  }
};

/**
 * Display error message to user
 */
export const showError = (error: any, customMessage?: string) => {
  const errorInfo = parseError(error);

  const displayMessage = customMessage || errorInfo.message;
  const fullMessage = errorInfo.details
    ? `${displayMessage}: ${errorInfo.details}`
    : displayMessage;

  Message.error({
    content: fullMessage,
    duration: 5000,
  });

  return errorInfo;
};

/**
 * Retry function with exponential backoff
 */
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = parseError(error);

      // Don't retry if error is not retryable
      if (!errorInfo.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Show retry notification
 */
export const showRetryNotification = (attempt: number, maxRetries: number) => {
  Message.info({
    content: `Request failed. Retrying (${attempt}/${maxRetries})...`,
    duration: 2000,
  });
};
