import axios from 'axios';

const getAPIBaseURL = () => {
  // Primary environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Secondary environment variable
  if (process.env.REACT_APP_API_BASE) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_BASE);
    return process.env.REACT_APP_API_BASE;
  }

  // Fallback for local development
  const defaultURL = 'http://localhost:3001';
  console.log('Using fallback API URL:', defaultURL);
  return defaultURL;

  // Note: In development, set REACT_APP_API_URL environment variable
  // REACT_APP_API_URL=https://elmiseswatini-backend.onrender.com
};

// Export for fetch() calls throughout the app
// Use /api prefix when building endpoint URLs
const API_BASE_URL = getAPIBaseURL();

// FIX: Ensure API_ENDPOINT has exactly one '/api' suffix.
// This handles cases where REACT_APP_API_URL might or might not include it.
export const API_ENDPOINT = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

// Axios instance
const API = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lmis_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired/invalid tokens globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication expired.');

      localStorage.removeItem('lmis_token');
      localStorage.removeItem('lmis_user');

      // Optional redirect
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default API;