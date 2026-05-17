/**
 * API Utility for ALIAS
 * Uses relative /api paths so Vite proxy forwards to http://localhost:8000
 */
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://Ansika26-Alias-backend.hf.space/api';

/**
 * Enhanced fetch with automatic Auth header and error handling
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');

  const headers = { ...options.headers };

  // Only set JSON content-type if not a multipart request
  if (!options._multipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Remove internal flag
  delete config._multipart;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication error:', response.status);
      if (response.status === 401) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
      }
    }

    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/** GET request */
export const get = async (endpoint, params = {}) => {
  let url = endpoint;
  const query = new URLSearchParams(params).toString();
  if (query) url += (url.includes('?') ? '&' : '?') + query;
  return apiFetch(url, { method: 'GET' });
};

/** POST request with JSON body */
export const post = async (endpoint, body) => {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/** Multipart POST for file uploads — lets browser set Content-Type + boundary */
export const postMultipart = async (endpoint, formData) => {
  return apiFetch(endpoint, {
    method: 'POST',
    body: formData,
    _multipart: true, // signals apiFetch to skip Content-Type header
  });
};

/** DELETE request */
export const del = async (endpoint) => {
  return apiFetch(endpoint, { method: 'DELETE' });
};
