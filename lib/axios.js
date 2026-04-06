import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const publicPaths = [
        '/auth/register',
        '/auth/login',
        '/auth/verify-email',
        '/auth/forgot-password-request',
        '/auth/reset-password'
      ];
      
      if (token && !publicPaths.some(path => config.url.includes(path))) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Prevent redirect loop if already on root
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          window.location.href = '/?auth=login&session=expired';
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
