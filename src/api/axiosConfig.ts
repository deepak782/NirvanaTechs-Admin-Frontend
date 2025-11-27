import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token and handle absolute R2 URLs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // ⭐ If URL is absolute (R2 PDF), disable baseURL
    const isAbsoluteUrl = /^https?:\/\//i.test(config.url || "");
    if (isAbsoluteUrl) {
      config.baseURL = "";
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (401 auto logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;