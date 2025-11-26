import axios from 'axios';

const envApiUrl = process.env.API_URL;
const baseURL = (envApiUrl && envApiUrl.trim()) || 'http://192.168.1.18:5000';

export const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = global.authToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 403) {
      const err = new Error('Forbidden');
      err.code = 403;
      err.response = error.response;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
