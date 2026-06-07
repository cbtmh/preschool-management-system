import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://54.95.243.24:8080',
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Do not attach token for public API endpoints
    const isPublicApi = config.url && config.url.includes('/api/public/');
    
    if (token && !isPublicApi) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Bỏ qua trang cảnh báo của ngrok khi gọi API trên Web
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      
      // Determine if the user is on a public portal page
      const currentPath = window.location.pathname;
      const isPublicRoute = 
        currentPath === '/' || 
        currentPath === '/about' || 
        currentPath.startsWith('/news') || 
        currentPath === '/programs' || 
        currentPath === '/contact';

      // Only redirect to login if NOT on a public route
      if (!isPublicRoute) {
        localStorage.setItem('sessionExpired', 'true');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;