import axios from 'axios';

// Get base URL from environment or localStorage (for runtime FastAPI config in Settings)
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('predictx_api_base_url');
    if (savedUrl) return savedUrl;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('predictx_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with graceful fallback
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful logging for demo/offline frontend operation
    console.warn('[PredictX API Client] Network request diverted to client fallback:', error?.message);
    return Promise.reject(error);
  }
);

export default apiClient;
