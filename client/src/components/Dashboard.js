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
  Alert,
  ToggleButtonGroup,
  ToggleButton,
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
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import axios from 'axios';
import { getAuthToken, setAuthToken } from '../services/auth';
import { useUserPreferences } from '../context/UserPreferencesContext';
import WeeklyView from './WeeklyView';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
);

const API_URL = 'http://localhost:5001/api';

const StatCard = ({ title, value, icon, color, trend, onClick }) => {
  const theme = useTheme();
  const { formatCurrency } = useUserPreferences();
  
  // Use pastel colors with darker text for better readability
  const colors = {
    success: {
      main: '#c8e6c9',  // Pastel green
      light: '#e8f5e9',
      dark: '#4caf50',  // Darker green for contrast
      text: '#1b5e20'   // Dark green text
    },
    error: {
      main: '#ffcdd2',  // Pastel red
      light: '#ffebee',
      dark: '#ef5350',  // Darker red for contrast
      text: '#b71c1c'   // Dark red text
    },
    primary: {
      main: '#bbdefb',  // Pastel blue
      light: '#e3f2fd',
      dark: '#2196f3',  // Darker blue for contrast
      text: '#0d47a1'   // Dark blue text
    }
  };
  
  const cardColor = colors[color];
  
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%',
        background: cardColor.main,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 15px 0 rgba(0, 0, 0, 0.4)'
          : '0 4px 15px 0 rgba(0, 0, 0, 0.1)',
        '&:hover': {
          transform: 'scale(1.04)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 30px 0 rgba(0, 0, 0, 0.6)'
            : '0 8px 30px 0 rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        position: 'relative',
        zIndex: 1
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 500, 
          letterSpacing: '0.01em', 
          fontSize: { xs: '0.95rem', sm: '1.05rem' },
          color: cardColor.text,
        }}>
          {title}
        </Typography>
        <Box
          sx={{
            p: { xs: 1, sm: 1.2 },
            borderRadius: '50%',
            bgcolor: cardColor.dark,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
            color: '#ffffff',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 600,
          mb: 1.5,
          fontSize: { xs: '1.7rem', sm: '1.9rem' },
          letterSpacing: '-0.02em',
          position: 'relative',
          zIndex: 1,
          color: cardColor.text,
        }}
      >
        {formatCurrency(value)}
      </Typography>
      {trend && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 'auto',
          pt: 1,
          borderTop: `1px solid ${cardColor.dark}25`,
          position: 'relative',
          zIndex: 1
        }}>
          {trend > 0 ? (
            <TrendingUpIcon sx={{ color: cardColor.text, opacity: 0.9, mr: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
          ) : (
            <TrendingDownIcon sx={{ color: cardColor.text, opacity: 0.9, mr: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
          )}
          <Typography variant="body2" sx={{ 
            fontWeight: 400, 
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            letterSpacing: '0.01em',
            opacity: 0.9,
            color: cardColor.text,
          }}>
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
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                color: 'text.primary'
              }
            }}
          >
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
  const [errorMessage, setErrorMessage] = useState(null);
  const theme = useTheme();
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const { formatCurrency, formatDate } = useUserPreferences();
  const [viewMode, setViewMode] = useState('monthly');

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
          setErrorMessage('Please log in to view dashboard');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/transactions`);
        setTransactions(res.data);
        setLoading(false);
        setErrorMessage(null);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to fetch transactions');
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
          '#FF5252', // Red
          '#FF9800', // Orange
          '#FFC107', // Amber
          '#FFEB3B', // Yellow
          '#4CAF50', // Green
          '#2196F3', // Blue
          '#673AB7', // Deep Purple
          '#E91E63', // Pink
        ],
        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
        borderWidth: theme.palette.mode === 'dark' ? 3 : 2,
        hoverBorderWidth: 4,
        hoverBorderColor: theme.palette.primary.main,
      },
    ],
  };

  const incomeData = {
    labels: Object.keys(incomeByCategory),
    datasets: [
      {
        data: Object.values(incomeByCategory),
        backgroundColor: [
          '#4CAF50', // Green
          '#2196F3', // Blue
          '#00BCD4', // Cyan
          '#9C27B0', // Purple
          '#3F51B5', // Indigo
        ],
        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
        borderWidth: theme.palette.mode === 'dark' ? 3 : 2,
        hoverBorderWidth: 4,
        hoverBorderColor: theme.palette.primary.main,
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
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += formatCurrency(context.parsed);
            }
            return label;
          }
        }
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
  sortedMonths.forEach(month => {
    runningBalance += (month.income - month.expenses);
    month.balance = runningBalance;
  });

  const monthlyData = {
    labels: sortedMonths.map(month => month.label),
    datasets: [
      {
        label: 'Income',
        data: sortedMonths.map(month => month.income),
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.main,
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: sortedMonths.map(month => month.expenses),
        backgroundColor: theme.palette.error.main,
        borderColor: theme.palette.error.main,
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Balance',
        data: sortedMonths.map(month => month.balance),
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Monthly Financial Overview',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          callback: value => formatCurrency(value),
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        stacked: false,
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
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
    setCurrentMonthIndex((prev) => Math.min(prev + 1, monthlyData.labels.length - 1));
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
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.primary'
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
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.primary'
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
                  Total Income: {formatCurrency(currentMonth.income)}
                </Typography>
                <List>
                  {Object.entries(currentMonth.categories.income).map(([category, amount]) => (
                    <ListItem key={category} sx={{ pl: 2 }}>
                      <ListItemIcon>
                        <AttachMoneyIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={standardizeText(category)}
                        secondary={formatCurrency(amount)}
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
                  Total Expenses: {formatCurrency(currentMonth.expenses)}
                </Typography>
                <List>
                  {Object.entries(currentMonth.categories.expenses).map(([category, amount]) => (
                    <ListItem key={category} sx={{ pl: 2 }}>
                      <ListItemIcon>
                        <AttachMoneyIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={standardizeText(category)}
                        secondary={formatCurrency(amount)}
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
                      secondary={formatCurrency(currentMonth.income)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingDownIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Expenses"
                      secondary={formatCurrency(currentMonth.expenses)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalanceIcon color={currentMonth.balance >= 0 ? "primary" : "error"} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Balance"
                      secondary={formatCurrency(currentMonth.balance)}
                      sx={{
                        color: currentMonth.balance >= 0 ? 'primary.main' : 'error.main',
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {errorMessage}
        </Alert>
      ) : null}

      {/* View mode toggle */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: 'center',
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: { xs: 2, sm: 0 },
            fontSize: { xs: '1.75rem', sm: '2.1rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Financial Dashboard
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) {
              setViewMode(newMode);
            }
          }}
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
              },
              '@media (max-width: 600px)': {
                '&:active': {
                  background: theme.palette.mode === 'dark'
                    ? theme.palette.primary.dark
                    : theme.palette.primary.main,
                  color: '#fff',
                }
              }
            }
          }}
        >
          <ToggleButton value="monthly" aria-label="monthly view">
            <CalendarViewMonthIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Overall Budget
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="weekly view">
            <CalendarViewWeekIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Weekly Budget
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading...</Typography>
        </Box>
      ) : viewMode === 'weekly' ? (
        <WeeklyView />
      ) : (
        <>
          {/* Monthly View Content */}
          <Grid container spacing={3}>
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
                color={balance >= 0 ? "primary" : "error"}
                trend={balanceTrend}
                onClick={() => handleCardClick('balance')}
              />
            </Grid>

            {/* Monthly Statistics */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  mb: 4,
                  borderRadius: 2,
                  boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(66, 66, 66, 0.9)' 
                      : 'rgba(248, 250, 252, 1)',
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>Monthly Statistics</Typography>
                <Box sx={{ height: 300, pt: 2 }}>
                  {Object.keys(monthlyData.labels).length > 0 ? (
                    <Bar data={monthlyData} options={monthlyOptions} />
                  ) : (
                    <Typography align="center" sx={{ pt: 8, color: theme.palette.text.primary }}>
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
                  p: { xs: 2.5, sm: 3 },
                  height: '100%',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(129, 199, 132, 0.15)' 
                    : 'rgba(232, 245, 233, 0.8)',
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(129, 199, 132, 0.2)' 
                      : 'rgba(232, 245, 233, 0.9)',
                  },
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(129, 199, 132, 0.2)'
                    : 'rgba(129, 199, 132, 0.2)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 3,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: theme.palette.success.light,
                      marginRight: '10px'
                    }
                  }}
                >
                  Income Breakdown
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 300 }, position: 'relative' }}>
                  {Object.keys(incomeData.labels).length > 0 ? (
                    <Doughnut data={incomeData} options={chartOptions} />
                  ) : (
                    <Typography align="center" sx={{ pt: 8, color: theme.palette.text.primary }}>
                      No income data to display
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  height: '100%',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(229, 115, 115, 0.15)' 
                    : 'rgba(255, 235, 238, 0.8)',
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(229, 115, 115, 0.2)' 
                      : 'rgba(255, 235, 238, 0.9)',
                  },
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(229, 115, 115, 0.2)'
                    : 'rgba(229, 115, 115, 0.2)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 3,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: theme.palette.error.light,
                      marginRight: '10px'
                    }
                  }}
                >
                  Expense Breakdown
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 300 }, position: 'relative' }}>
                  {Object.keys(expenseData.labels).length > 0 ? (
                    <Doughnut data={expenseData} options={chartOptions} />
                  ) : (
                    <Typography align="center" sx={{ pt: 8, color: theme.palette.text.primary }}>
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
                  p: { xs: 2.5, sm: 3 },
                  boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(121, 134, 203, 0.15)' 
                    : 'rgba(232, 234, 246, 0.8)',
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(121, 134, 203, 0.2)' 
                      : 'rgba(232, 234, 246, 0.9)',
                  },
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(121, 134, 203, 0.2)'
                    : 'rgba(121, 134, 203, 0.2)',
                  overflow: 'hidden'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 3,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: theme.palette.primary.light,
                      marginRight: '10px'
                    }
                  }}
                >
                  Recent Transactions
                </Typography>
                <TableContainer sx={{ 
                  maxHeight: { xs: 350, sm: 'none' },
                  overflow: 'auto',
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                    borderRadius: '10px',
                  },
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          letterSpacing: '0.01em',
                          borderBottom: '1px solid',
                          borderColor: 'rgba(0,0,0,0.05)',
                        }}>Date</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          letterSpacing: '0.01em',
                          borderBottom: '1px solid',
                          borderColor: 'rgba(0,0,0,0.05)',
                        }}>Type</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          letterSpacing: '0.01em',
                          borderBottom: '1px solid',
                          borderColor: 'rgba(0,0,0,0.05)',
                        }}>Category</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          letterSpacing: '0.01em',
                          display: { xs: 'none', sm: 'table-cell' },
                          borderBottom: '1px solid',
                          borderColor: 'rgba(0,0,0,0.05)',
                        }}>Description</TableCell>
                        <TableCell align="right" sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.secondary,
                          fontSize: '0.85rem',
                          letterSpacing: '0.01em',
                          borderBottom: '1px solid',
                          borderColor: 'rgba(0,0,0,0.05)',
                        }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow
                          key={transaction._id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.02)',
                            },
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: 'background-color 0.2s',
                            borderBottom: '1px solid',
                            borderColor: 'rgba(0,0,0,0.03)',
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.875rem', py: 1.5 }}>
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={standardizeText(transaction.type)}
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                borderRadius: '4px',
                                px: 0.8,
                                fontSize: '0.75rem',
                                height: '24px',
                                letterSpacing: '0.01em',
                                backgroundColor: transaction.type.toLowerCase() === 'income' 
                                  ? theme.palette.mode === 'dark' ? 'rgba(200, 250, 205, 0.15)' : 'rgba(200, 250, 205, 0.5)'
                                  : theme.palette.mode === 'dark' ? 'rgba(255, 235, 238, 0.15)' : 'rgba(255, 235, 238, 0.5)',
                                color: transaction.type.toLowerCase() === 'income' 
                                  ? theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32'
                                  : theme.palette.mode === 'dark' ? '#e57373' : '#c62828',
                                border: '1px solid',
                                borderColor: transaction.type.toLowerCase() === 'income' 
                                  ? 'rgba(129, 199, 132, 0.3)' 
                                  : 'rgba(229, 115, 115, 0.3)',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', py: 1.5 }}>{standardizeText(transaction.category)}</TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: '0.875rem', py: 1.5 }}>{standardizeText(transaction.description)}</TableCell>
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: transaction.type.toLowerCase() === 'income' 
                                  ? theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32'
                                  : theme.palette.mode === 'dark' ? '#e57373' : '#c62828',
                              }}
                            >
                              {formatCurrency(transaction.amount)}
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
        </>
      )}
    </Container>
  );
};

export default Dashboard; 