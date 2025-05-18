import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_ENDPOINTS, getAuthHeader } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}${API_ENDPOINTS.AUTH.VERIFY}`, {
            headers: getAuthHeader()
          });
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        username,
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const verifyPassword = async (currentPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}${API_ENDPOINTS.AUTH.VERIFY_PASSWORD}`,
        { password: currentPassword },
        { headers: getAuthHeader() }
      );
      return response.data.isValid;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}${API_ENDPOINTS.AUTH.UPDATE_PASSWORD}`,
        { currentPassword, newPassword },
        { headers: getAuthHeader() }
      );
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update password'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(
        `${API_URL}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`,
        profileData,
        { headers: getAuthHeader() }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        return {
          success: true,
          message: response.data.message
        };
      }
      return {
        success: false,
        message: response.data.message
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    verifyPassword,
    updatePassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 