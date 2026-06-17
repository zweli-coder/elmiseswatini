import axios from 'axios';


const getAPIBaseURL = () => {
  // Check for REACT_APP_API_URL first (from .env)
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback to REACT_APP_API_BASE if set
  if (process.env.REACT_APP_API_BASE) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_BASE);
    return process.env.REACT_APP_API_BASE;
  }

  const defaultURL = 'https://elmiseswatini-backend.onrender.com/api';
  console.log('Using fallback API URL:', defaultURL);
  return defaultURL;
};

const API = axios.create({
  baseURL: getAPIBaseURL(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lmis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;