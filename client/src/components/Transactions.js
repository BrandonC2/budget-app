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
  Card,
  CardContent,
  CardActions,
  Divider,
  useMediaQuery,
  DialogContentText,
  Fab,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import axios from 'axios';
import { getAuthToken, setAuthToken } from '../services/auth';
import { useUserPreferences } from '../context/UserPreferencesContext';

const API_URL = 'https://budget-app-56om.onrender.com/api';

const TransactionForm = ({ open, onClose, transaction, onSubmit }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { formatCurrency} = useUserPreferences();
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </Typography>
        {fullScreen && (
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <Divider />
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
              startAdornment: formatCurrency(0).charAt(0),
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
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!fullScreen && <Button onClick={onClose}>Cancel</Button>}
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          size={fullScreen ? "large" : "medium"}
          fullWidth={fullScreen}
          startIcon={transaction ? <EditIcon /> : <AddIcon />}
        >
          {transaction ? 'Update' : 'Add Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const theme = useTheme();
  const { formatCurrency, formatDate } = useUserPreferences();
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        boxShadow: theme.shadows[2],
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {transaction.category}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(transaction.date)}
            </Typography>
          </Box>
          
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: transaction.type === 'income' ? 'success.main' : 'error.main',
            }}
          >
            {formatCurrency(transaction.amount)}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {transaction.description || 'No description'}
        </Typography>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', py: 1 }}>
        <Button 
          size="small" 
          startIcon={<EditIcon />} 
          onClick={() => onEdit(transaction)}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          color="error" 
          startIcon={<DeleteIcon />} 
          onClick={() => onDelete(transaction._id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

// DeleteConfirmationDialog component
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, transactionId }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Transaction</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.primary'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => onConfirm(transactionId)} 
          color="error" 
          variant="contained"
          sx={{
            '&:hover': {
              bgcolor: 'error.dark',
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Transactions = () => {
  const theme = useTheme();
  const { formatCurrency, formatDate } = useUserPreferences();
  const [transactions, setTransactions] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [viewMode, setViewMode] = useState('monthly');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [currentWeekEnd, setCurrentWeekEnd] = useState(() => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 6);
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      if (currentTransaction) {
        await axios.put(
          `${API_URL}/transactions/${currentTransaction._id}`,
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

  const confirmDelete = (id) => {
    setDeleteDialogOpen(true);
    setDeleteId(id);
  };

  const handleDelete = async (id) => {
    setDeleteDialogOpen(false);
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
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const getWeekLabel = (date) => {
    if (!date) return '';
    
    // Get the start of the current week
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Get the start of the given week
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    if (weekStart.getTime() === currentWeekStart.getTime()) {
      return 'Current Week';
    }
    
    const diffInWeeks = Math.floor((currentWeekStart - weekStart) / (7 * 24 * 60 * 60 * 1000));
    return `${diffInWeeks} Week${diffInWeeks !== 1 ? 's' : ''} Ago`;
  };

  const getMonthLabel = (date) => {
    if (!date) return '';
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return 'Current Month';
    }
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handlePreviousMonth = () => {
    if (!currentMonth) return;
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (newDate <= new Date()) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    if (!currentMonth) return;
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (newDate <= new Date()) {
      setCurrentMonth(newDate);
    }
  };

  const handlePreviousWeek = () => {
    if (!currentWeekStart) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    if (newDate <= new Date()) {
      setCurrentWeekStart(newDate);
      setCurrentWeekEnd(new Date(newDate.getTime() + 6 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNextWeek = () => {
    if (!currentWeekStart) return;
    
    // Get the start of the current week
    const todayWeekStart = new Date();
    todayWeekStart.setDate(todayWeekStart.getDate() - todayWeekStart.getDay());
    todayWeekStart.setHours(0, 0, 0, 0);
    
    // Calculate next week's dates
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    nextWeekStart.setHours(0, 0, 0, 0);
    
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
    nextWeekEnd.setHours(23, 59, 59, 999);
    
    // Only allow navigation if we're not at or beyond current week
    if (nextWeekStart <= todayWeekStart) {
      setCurrentWeekStart(nextWeekStart);
      setCurrentWeekEnd(nextWeekEnd);
    }
  };

  const getWeekRange = (date) => {
    if (!date) return { start: new Date(), end: new Date() };
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const filterTransactionsByDate = (transactions) => {
    if (viewMode === 'monthly') {
      if (!currentMonth) return [];
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth.getMonth() &&
               transactionDate.getFullYear() === currentMonth.getFullYear();
      });
    } else {
      if (!currentWeekStart || !currentWeekEnd) return [];
      const { start, end } = getWeekRange(currentWeekStart);
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= start && transactionDate <= end;
      });
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: isMobile ? 2 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 3,
        mb: 4
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: isMobile ? 2 : 0
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ fontWeight: 'bold' }}
          >
            Transactions
          </Typography>

          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
              sx={{
                background: theme.palette.background.paper,
                borderRadius: '10px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: theme.palette.divider,
                p: 0.5,
                '& .MuiToggleButton-root': {
                  borderRadius: '8px !important',
                  m: 0.5,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  border: 'none',
                  transition: 'all 0.2s',
                  px: 2,
                  py: 0.8,
                  '&.Mui-selected': {
                    background: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.dark
                      : theme.palette.primary.main,
                    color: '#fff',
                    fontWeight: 500,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main,
                      color: '#fff',
                    }
                  },
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.1)'
                      : 'rgba(0, 0, 0, 0.04)',
                  }
                }
              }}
            >
              <ToggleButton value="monthly" aria-label="monthly view">
                <CalendarViewMonthIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Monthly
              </ToggleButton>
              <ToggleButton value="weekly" aria-label="weekly view">
                <CalendarViewWeekIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Weekly
              </ToggleButton>
            </ToggleButtonGroup>

            {!isMobile && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setCurrentTransaction(null);
                  setFormOpen(true);
                }}
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Add Transaction
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            p: 1.5,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.6)' : 'rgba(232, 245, 253, 0.5)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          }}>
            <IconButton
              onClick={viewMode === 'monthly' ? handlePreviousMonth : handlePreviousWeek}
              size="small"
              disabled={viewMode === 'monthly' 
                ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1) < new Date(2020, 0, 1)
                : new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000) < new Date(2020, 0, 1)
              }
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  color: 'text.primary'
                }
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {viewMode === 'monthly' ? getMonthLabel(currentMonth) : getWeekLabel(currentWeekStart)}
            </Typography>
            <IconButton
              onClick={viewMode === 'monthly' ? handleNextMonth : handleNextWeek}
              size="small"
              disabled={viewMode === 'monthly' 
                ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > new Date()
                : currentWeekEnd > Date.now()
              }
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(6, 3, 3, 0.04)',
                  color: 'text.primary'
                }
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {isMobile ? (
        // Mobile view with cards
        <Box>
          {filterTransactionsByDate(transactions).length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'ceenter' }}>
              <Typography color="text.secondary">
                {viewMode === 'weekly' 
                  ? "No transactions found for this week. Add your first transaction!" 
                  : "No transactions found. Add your first transaction!"}
              </Typography>
            </Paper>
          ) : (
            filterTransactionsByDate(transactions).map((transaction) => (
              <TransactionCard
                key={transaction._id}
                transaction={transaction}
                onEdit={(transaction) => {
                  setCurrentTransaction(transaction);
                  setFormOpen(true);
                }}
                onDelete={confirmDelete}
              />
            ))
          )}
        </Box>
      ) : (
        // Desktop view with table
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
              {filterTransactionsByDate(transactions).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ py: 3 }} color="text.secondary">
                      {viewMode === 'weekly' 
                        ? "No transactions found for this week. Add your first transaction!" 
                        : "No transactions found. Add your first transaction!"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filterTransactionsByDate(transactions).map((transaction) => (
                  <TableRow
                    key={transaction._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} 
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: transaction.type === 'income' ? 'success.main' : 'error.main',
                        }}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => {
                            setCurrentTransaction(transaction);
                            setFormOpen(true);
                          }}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                              color: 'text.primary'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => confirmDelete(transaction._id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                              color: 'text.primary'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Floating action button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
          }}
          onClick={() => {
            setCurrentTransaction(null);
            setFormOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setCurrentTransaction(null);
        }}
        transaction={currentTransaction}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        transactionId={deleteId}
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