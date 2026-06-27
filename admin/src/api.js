import axios from 'axios';
import API_URL from './config/api';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const adminInfo = localStorage.getItem('adminInfo');
  if (adminInfo) {
    const { token } = JSON.parse(adminInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = (email, password) =>
  API.post('/auth/login', { email, password });

export const getDashboard = () => API.get('/admin/dashboard');
export const getUsers = () => API.get('/admin/users');
export const getOrders = () => API.get('/admin/orders');
export const updateOrder = (id, data) => API.put(`/admin/orders/${id}`, data);
export const getProducts = () => API.get('/admin/products');
export const createProduct = (data) => API.post('/admin/products', data);
export const updateProduct = (id, data) => API.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/products/${id}`);

export const getCategories = () => API.get('/admin/categories');
export const createCategory = (data) => API.post('/admin/categories', data);
export const updateCategory = (id, data) => API.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/admin/categories/${id}`);

export const getReviews = () => API.get('/admin/reviews');
export const updateReview = (id, data) => API.put(`/admin/reviews/${id}`, data);
export const deleteReview = (id) => API.delete(`/admin/reviews/${id}`);

export const getAppBanners = () => API.get('/admin/app-banners');
export const createAppBanner = (data) => API.post('/admin/app-banners', data);
export const updateAppBanner = (id, data) => API.put(`/admin/app-banners/${id}`, data);
export const deleteAppBanner = (id) => API.delete(`/admin/app-banners/${id}`);

export const getCallbacks = () => API.get('/admin/callbacks');
export const updateCallback = (id, data) => API.put(`/admin/callbacks/${id}`, data);
export const deleteCallback = (id) => API.delete(`/admin/callbacks/${id}`);

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  // Let axios set multipart boundary automatically — manual Content-Type breaks uploads
  return API.post('/admin/upload', formData);
};

export default API;