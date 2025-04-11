import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Tooltip,
  useTheme,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { getAuthToken, setAuthToken } from '../services/auth';

const API_URL = 'http://localhost:5001/api';

const TransactionForm = ({ open, onClose, transaction, onSubmit }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    description: '',
    amount: '',
    date: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date.split('T')[0],
      });
    } else {
      setFormData({
        type: '',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.type || !formData.category || !formData.amount || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Other'],
    expense: ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Other'],
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
            required
          >
            {formData.type &&
              categories[formData.type].map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: '$',
            }}
          />

          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={transaction ? <EditIcon /> : <AddIcon />}
        >
          {transaction ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please log in to view transactions');
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/transactions`);
      setTransactions(res.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to fetch transactions');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await axios.put(
          `${API_URL}/transactions/${editingTransaction._id}`,
          formData
        );
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success',
        });
      } else {
        await axios.post(`${API_URL}/transactions`, formData);
        setSnackbar({
          open: true,
          message: 'Transaction added successfully',
          severity: 'success',
        });
      }
      fetchTransactions();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Failed to save transaction',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API_URL}/transactions/${id}`);
        setSnackbar({
          open: true,
          message: 'Transaction deleted successfully',
          severity: 'success',
        });
        fetchTransactions();
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: 'Failed to delete transaction',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
        >
          Add Transaction
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[4], borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction._id}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.type}
                    color={transaction.type === 'income' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: transaction.type === 'income' ? 'success.main' : 'error.main',
                    fontWeight: 'bold',
                  }}
                >
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setIsFormOpen(true);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(transaction._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TransactionForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Transactions; 