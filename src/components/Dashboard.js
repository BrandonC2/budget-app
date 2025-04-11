import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  Modal,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import { getAuthToken, setAuthToken } from '../services/auth';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
);

const API_URL = 'http://localhost:5001/api';

const StatCard = ({ title, value, icon, color, trend, onClick }) => {
  const theme = useTheme();
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`,
        color: 'white',
        boxShadow: theme.shadows[4],
        borderRadius: 3,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {title}
        </Typography>
        <Box
          sx={{
            p: { xs: 1, sm: 1.5 },
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          mb: 1,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        ${value.toFixed(2)}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          {trend > 0 ? (
            <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          ) : (
            <TrendingDownIcon sx={{ color: 'error.main', mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {Math.abs(trend)}% from last month
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const DetailModal = ({ open, onClose, title, children }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '80%' },
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {children}
      </Box>
    </Modal>
  );
};

const standardizeText = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Set up axios defaults
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Please log in to view dashboard');
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

    fetchTransactions();
  }, []);

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  };

  const { income, expenses, balance } = calculateTotals();

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = standardizeText(t.category);
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      const category = standardizeText(t.category);
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

  const expenseData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        borderWidth: 1,
      },
    ],
  };

  const incomeData = {
    labels: Object.keys(incomeByCategory),
    datasets: [
      {
        data: Object.values(incomeByCategory),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FFC107',
          '#9C27B0',
          '#FF5722',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate monthly statistics
  const monthlyStats = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        income: 0,
        expenses: 0,
        label: date.toLocaleDateString('default', { month: 'short', year: 'numeric' })
      };
    }
    
    if (transaction.type === 'income') {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expenses += transaction.amount;
    }
    
    return acc;
  }, {});

  // Sort months chronologically
  const sortedMonths = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, data]) => data);

  // Calculate month-over-month trends
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Number(((current - previous) / previous) * 100).toFixed(1);
  };

  const incomeTrend = sortedMonths.length >= 2 
    ? calculateTrend(
        sortedMonths[sortedMonths.length - 1].income,
        sortedMonths[sortedMonths.length - 2].income
      )
    : 0;

  const expensesTrend = sortedMonths.length >= 2
    ? calculateTrend(
        sortedMonths[sortedMonths.length - 1].expenses,
        sortedMonths[sortedMonths.length - 2].expenses
      )
    : 0;

  const balanceTrend = sortedMonths.length >= 2
    ? calculateTrend(
        sortedMonths[sortedMonths.length - 1].income - sortedMonths[sortedMonths.length - 1].expenses,
        sortedMonths[sortedMonths.length - 2].income - sortedMonths[sortedMonths.length - 2].expenses
      )
    : 0;

  // Calculate running balance
  let runningBalance = 0;
  const monthsWithBalance = sortedMonths.map(month => {
    runningBalance += (month.income - month.expenses);
    return {
      ...month,
      balance: runningBalance
    };
  });

  const monthlyData = {
    labels: monthsWithBalance.map(month => month.label),
    datasets: [
      {
        label: 'Income',
        data: monthsWithBalance.map(month => month.income),
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.light,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Expenses',
        data: monthsWithBalance.map(month => month.expenses),
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.light,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Running Balance',
        data: monthsWithBalance.map(month => month.balance),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income, Expenses, and Running Balance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => Math.min(prev + 1, sortedMonths.length - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderDetailView = () => {
    if (!selectedCard) return null;

    // Get transactions grouped by month
    const monthlyTransactions = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          label: monthLabel,
          income: 0,
          expenses: 0,
          balance: 0,
          categories: {
            income: {},
            expenses: {}
          }
        };
      }

      if (transaction.type === 'income') {
        acc[monthYear].income += transaction.amount;
        acc[monthYear].categories.income[transaction.category] = 
          (acc[monthYear].categories.income[transaction.category] || 0) + transaction.amount;
      } else {
        acc[monthYear].expenses += transaction.amount;
        acc[monthYear].categories.expenses[transaction.category] = 
          (acc[monthYear].categories.expenses[transaction.category] || 0) + transaction.amount;
      }

      acc[monthYear].balance = acc[monthYear].income - acc[monthYear].expenses;
      return acc;
    }, {});

    // Sort months chronologically
    const sortedMonths = Object.entries(monthlyTransactions)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort in descending order (newest first)
      .map(([_, data]) => data);

    const currentMonth = sortedMonths[currentMonthIndex];

    const renderMonthNavigation = () => (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          p: { xs: 1, sm: 2 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[1],
        }}
      >
        <IconButton 
          onClick={handlePrevMonth} 
          disabled={currentMonthIndex === sortedMonths.length - 1}
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.light',
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              color: 'text.disabled',
            },
            transition: 'all 0.2s ease',
            p: { xs: 0.5, sm: 1 },
          }}
        >
          <TrendingUpIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
            textAlign: 'center',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 1, sm: 2 },
          }}
        >
          {currentMonth?.label || 'No Data Available'}
        </Typography>
        <IconButton 
          onClick={handleNextMonth} 
          disabled={currentMonthIndex === 0}
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.light',
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              color: 'text.disabled',
            },
            transition: 'all 0.2s ease',
            p: { xs: 0.5, sm: 1 },
          }}
        >
          <TrendingDownIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
      </Box>
    );

    switch (selectedCard) {
      case 'income':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Monthly Income Breakdown
            </Typography>
            {renderMonthNavigation()}
            {currentMonth && (
              <Box>
                <Typography variant="body1" sx={{ color: 'success.main', mb: 2 }}>
                  Total Income: ${currentMonth.income.toFixed(2)}
                </Typography>
                <List>
                  {Object.entries(currentMonth.categories.income).map(([category, amount]) => (
                    <ListItem key={category} sx={{ pl: 2 }}>
                      <ListItemIcon>
                        <AttachMoneyIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={standardizeText(category)}
                        secondary={`$${amount.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 'expenses':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Monthly Expenses Breakdown
            </Typography>
            {renderMonthNavigation()}
            {currentMonth && (
              <Box>
                <Typography variant="body1" sx={{ color: 'error.main', mb: 2 }}>
                  Total Expenses: ${currentMonth.expenses.toFixed(2)}
                </Typography>
                <List>
                  {Object.entries(currentMonth.categories.expenses).map(([category, amount]) => (
                    <ListItem key={category} sx={{ pl: 2 }}>
                      <ListItemIcon>
                        <AttachMoneyIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={standardizeText(category)}
                        secondary={`$${amount.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 'balance':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Monthly Balance History
            </Typography>
            {renderMonthNavigation()}
            {currentMonth && (
              <Box>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Income"
                      secondary={`$${currentMonth.income.toFixed(2)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingDownIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Expenses"
                      secondary={`$${currentMonth.expenses.toFixed(2)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalanceIcon color={currentMonth.balance >= 0 ? "success" : "error"} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Balance"
                      secondary={`$${currentMonth.balance.toFixed(2)}`}
                      sx={{
                        color: currentMonth.balance >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                      }}
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: { xs: 2, sm: 4 }, 
          fontWeight: 'bold', 
          color: 'text.primary',
          letterSpacing: 0.5,
          position: 'relative',
          fontSize: { xs: '1.5rem', sm: '2rem' },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '60px',
            height: '4px',
            bgcolor: 'primary.main',
            borderRadius: 2,
          }
        }}
      >
        Dashboard Overview
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Income"
            value={income}
            icon={<TrendingUpIcon sx={{ fontSize: { xs: 20, sm: 30 } }} />}
            color="success"
            trend={incomeTrend}
            onClick={() => handleCardClick('income')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Expenses"
            value={expenses}
            icon={<TrendingDownIcon sx={{ fontSize: { xs: 20, sm: 30 } }} />}
            color="error"
            trend={expensesTrend}
            onClick={() => handleCardClick('expenses')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Balance"
            value={balance}
            icon={<AccountBalanceIcon sx={{ fontSize: { xs: 20, sm: 30 } }} />}
            color={balance >= 0 ? 'primary' : 'error'}
            trend={balanceTrend}
            onClick={() => handleCardClick('balance')}
          />
        </Grid>

        {/* Monthly Statistics */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              boxShadow: theme.shadows[4],
              borderRadius: 3,
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Monthly Statistics
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 }, position: 'relative' }}>
              {Object.keys(monthlyData.labels).length > 0 ? (
                <Line data={monthlyData} options={monthlyOptions} />
              ) : (
                <Typography align="center" sx={{ pt: 8 }}>
                  No monthly data to display
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              height: '100%',
              boxShadow: theme.shadows[4],
              borderRadius: 3,
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Income Breakdown
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 }, position: 'relative' }}>
              {Object.keys(incomeData.labels).length > 0 ? (
                <Doughnut data={incomeData} options={chartOptions} />
              ) : (
                <Typography align="center" sx={{ pt: 8 }}>
                  No income data to display
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              height: '100%',
              boxShadow: theme.shadows[4],
              borderRadius: 3,
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Expense Breakdown
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 }, position: 'relative' }}>
              {Object.keys(expenseData.labels).length > 0 ? (
                <Doughnut data={expenseData} options={chartOptions} />
              ) : (
                <Typography align="center" sx={{ pt: 8 }}>
                  No expense data to display
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              boxShadow: theme.shadows[4],
              borderRadius: 3,
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
              }}
            >
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow
                      key={transaction._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={standardizeText(transaction.type)}
                          color={transaction.type.toLowerCase() === 'income' ? 'success' : 'error'}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>{standardizeText(transaction.category)}</TableCell>
                      <TableCell>{standardizeText(transaction.description)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            color: transaction.type.toLowerCase() === 'income' ? 'success.main' : 'error.main',
                          }}
                        >
                          ${transaction.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <DetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedCard ? `${selectedCard.charAt(0).toUpperCase() + selectedCard.slice(1)} Details` : ''}
      >
        {renderDetailView()}
      </DetailModal>
    </Container>
  );
};

export default Dashboard; 