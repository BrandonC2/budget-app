import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Initialize auth token from localStorage
const token = getAuthToken();
if (token) {
  setAuthToken(token);
} 