import axios from 'axios';
import { API_URL } from './api';
import { Alert } from 'react-native';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// Add interceptor to include the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Break require cycle by requiring store dynamically inside the interceptor
    const { store } = require('../store');
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor to handle unauthorized access (Silent Refresh)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/forgot-password') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return new Promise(() => {});
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Break require cycle by requiring store dynamically
        const { store } = require('../store');
        const { logout, updateTokens } = require('../store/slices/authSlice');

        const refreshToken = store.getState().auth.refreshToken;

        if (!refreshToken) {
          Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại');
          store.dispatch(logout());
          return new Promise(() => {});
        }

        try {
          // Dùng axios thô để tránh vòng lặp import (circular dependency) với auth.service
          const res = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;

          store.dispatch(updateTokens({ token: newAccessToken, refreshToken: newRefreshToken }));

          processQueue(null, newAccessToken);

          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại');
          const { store } = require('../store');
          const { logout } = require('../store/slices/authSlice');
          store.dispatch(logout());
          return new Promise(() => {});
        } finally {
          isRefreshing = false;
        }
      } else {
        Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại');
        const { store } = require('../store');
        const { logout } = require('../store/slices/authSlice');
        store.dispatch(logout());
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
