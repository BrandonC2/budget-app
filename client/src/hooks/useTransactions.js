import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_ENDPOINTS, getAuthHeader } from '../config/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.TRANSACTIONS.BASE}`, {
        headers: getAuthHeader()
      });
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await axios.post(
        `${API_URL}${API_ENDPOINTS.TRANSACTIONS.BASE}`,
        transactionData,
        { headers: getAuthHeader() }
      );
      setTransactions(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding transaction:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to add transaction' };
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await axios.put(
        `${API_URL}${API_ENDPOINTS.TRANSACTIONS.BY_ID(id)}`,
        transactionData,
        { headers: getAuthHeader() }
      );
      setTransactions(prev => prev.map(t => t._id === id ? response.data : t));
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating transaction:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update transaction' };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(
        `${API_URL}${API_ENDPOINTS.TRANSACTIONS.BY_ID(id)}`,
        { headers: getAuthHeader() }
      );
      setTransactions(prev => prev.filter(t => t._id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting transaction:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to delete transaction' };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
}; 