export const API_URL = 'https://budget-app-56om.onrender.com'; // local: http://localhost:5001/api

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    UPDATE_PROFILE: '/auth/update-profile',
    UPDATE_PASSWORD: '/auth/update-password',
    VERIFY_PASSWORD: '/auth/verify-password'
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id) => `/transactions/${id}`
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 