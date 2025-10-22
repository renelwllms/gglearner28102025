import { Message } from '@arco-design/web-react';
import axios from 'axios';
import store from '@/store';
const instance: any = axios.create({
  timeout: 20000,
});
// instance.defaults.withCredentials = true;

const processRequest = (config) => {
  const { token } = store.getState();
  if (token) {
    config.headers.Authorization = token
  }

  return config;
};

instance.interceptors.request.use(
  (config) => {
    return processRequest(config);
  },
  (error) => Promise.reject(error)
);

const processResponse = (response) => {
  if (response?.data?.code !== 0) {
    return Message.error(response?.data?.message || 'error');
  }
  return response.data;
};

const processResponseError = (error) => {
  // Handle 401 - Unauthorized
  if (error?.response?.status === 401) {
    Message.error({
      content: 'Session expired. Please refresh the page to log in again.',
      duration: 5000,
    });
    // Optionally redirect to login or clear token
    // window.location.reload();
    return Promise.reject(error);
  }

  // Handle 403 - Forbidden
  if (error?.response?.status === 403) {
    Message.error('You do not have permission to access this resource.');
    return Promise.reject(error);
  }

  // Handle 404 - Not Found
  if (error?.response?.status === 404) {
    Message.error('Requested resource not found.');
    return Promise.reject(error);
  }

  // Handle 500 - Server Error
  if (error?.response?.status >= 500) {
    Message.error('Server error. Please try again later.');
    return Promise.reject(error);
  }

  // Handle timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    Message.error('Request timeout. Please check your connection and try again.');
    return Promise.reject(error);
  }

  // Handle network errors
  if (!error?.response) {
    Message.error('Network error. Please check your internet connection.');
    return Promise.reject(error);
  }

  // Generic error with message from server if available
  const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
  Message.error(errorMessage);
  return Promise.reject(error);
};

instance.interceptors.response.use(
  (response) => {
    return processResponse(response);
  },
  (error) => {
    return processResponseError(error);
  }
);

const request = (api, data, options?) => {
  let config: any = {
    ...options,
    ...api,
  };

  if (/get/i.test(api.method)) {
    config = {
      ...config,
      params: data,
    };
  } else {
    config = {
      ...config,
      data,
    };
  }

  return instance(config);
};

export { request };
