/**
 * Mobile API Utility for ALIAS
 * Handles requests to the backend with Auth headers
 */

// For local development with Android Emulator use 10.0.2.2
// For physical devices, use your computer's IP address
const BASE_URL = 'http://10.0.2.2:8000/api';

// Simple memory storage for demo purposes
// In production, use @react-native-async-storage/async-storage
let authData = {
  token: null,
  role: null,
  user: null
};

export const setAuth = (token, role, user, usn) => {
  authData = { token, role, user, usn };
};

export const clearAuth = () => {
  authData = { token: null, role: null, user: null, usn: null };
};

export const getAuth = () => authData;

export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  return apiFetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });
};

export const apiFetch = async (endpoint, options = {}) => {
  const headers = { ...options.headers };
  
  if (!options._multipart && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (authData.token) {
    headers['Authorization'] = `Bearer ${authData.token}`;
  }

  const config = {
    ...options,
    headers,
  };

  delete config._multipart;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('Mobile API Error:', error);
    throw error;
  }
};

export const get = async (endpoint, params = {}) => {
  let url = endpoint;
  const query = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  if (query) url += (url.includes('?') ? '&' : '?') + query;
  return apiFetch(url, { method: 'GET' });
};

export const post = async (endpoint, body) => {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};
