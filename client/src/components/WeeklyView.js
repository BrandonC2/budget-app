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
  IconButton,
  useTheme,
  Stack,
  Modal,
  Chip,
  Divider,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useUserPreferences } from '../context/UserPreferencesContext';
import axios from 'axios';
import { getAuthToken, setAuthToken } from '../services/auth';

const API_URL = 'http://localhost:5001/api';

const WeeklyView = () => {
  const theme = useTheme();
  const { formatCurrency, formatDate, startingDay } = useUserPreferences();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = previous week, etc.
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyTotal, setWeeklyTotal] = useState({ income: 0, expenses: 0, balance: 0 });
  const [weeklyTrends, setWeeklyTrends] = useState({ income: 0, expenses: 0, balance: 0 });
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTransactions, setDetailTransactions] = useState([]);

  const getStartOfWeek = (date) => {
    // Create a new date object to avoid modifying the input
    const d = new Date(date.getTime());
    const day = d.getDay();
    
    // Calculate the day offset based on startingDay preference
    let dayOffset;
    switch (startingDay) {
      case 'Monday':
        dayOffset = day === 0 ? -6 : 1 - day;
        break;
      case 'Sunday':
        dayOffset = -day;
        break;
      case 'Saturday':
        dayOffset = day === 0 ? -1 : day === 1 ? -2 : 6 - day;
        break;
      default:
        dayOffset = day === 0 ? -6 : 1 - day; // Default to Monday
    }
    
    // Create a new date object for the result
    const result = new Date(d.getTime());
    result.setDate(result.getDate() + dayOffset);
    result.setHours(0, 0, 0, 0);
    
    console.log('getStartOfWeek calculation:', {
      inputDate: date.toISOString(),
      day: day,
      dayOffset: dayOffset,
      result: result.toISOString(),
      resultTime: result.getTime()
    });
    
    return result;
  };

  const getWeekDates = (offset = 0) => {
    // Create a new date object for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the start of the current week
    const currentWeekStart = getStartOfWeek(today);
    
    // Calculate the target week's start date
    const targetWeekStart = new Date(currentWeekStart.getTime());
    targetWeekStart.setDate(targetWeekStart.getDate() + (offset * 7));
    
    // Calculate the target week's end date
    const targetWeekEnd = new Date(targetWeekStart.getTime());
    targetWeekEnd.setDate(targetWeekEnd.getDate() + 6);
    targetWeekEnd.setHours(23, 59, 59, 999);
    
    console.log('getWeekDates calculation:', {
      today: today.toISOString(),
      todayTime: today.getTime(),
      currentWeekStart: currentWeekStart.toISOString(),
      currentWeekStartTime: currentWeekStart.getTime(),
      offset: offset,
      targetWeekStart: targetWeekStart.toISOString(),
      targetWeekStartTime: targetWeekStart.getTime(),
      targetWeekEnd: targetWeekEnd.toISOString(),
      targetWeekEndTime: targetWeekEnd.getTime()
    });
    
    return { start: targetWeekStart, end: targetWeekEnd };
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
    }
    fetchTransactions();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (transactions.length > 0) {
      const { start, end } = getWeekDates(weekOffset);
      console.log('Weekly view update:', {
        offset: weekOffset,
        start: start.toISOString(),
        end: end.toISOString(),
        startTime: start.getTime(),
        endTime: end.getTime()
      });
      updateWeeklyView(start, end);
    }
  }, [transactions, weekOffset, startingDay]);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
      setLoading(false);
      // Initialize the week dates after fetching transactions
      initializeWeekDates();
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      setLoading(false);
    }
  };

  const initializeWeekDates = () => {
    console.log('Initializing week dates:', {
      offset: 0,
      dates: getWeekDates(0)
    });
    setWeekOffset(0);
  };

  const goToPreviousWeek = () => {
    const newOffset = weekOffset - 1;
    const currentDates = getWeekDates(weekOffset);
    const newDates = getWeekDates(newOffset);
    
    console.log('Previous week navigation:', {
      currentOffset: weekOffset,
      newOffset: newOffset,
      currentWeekDates: {
        start: currentDates.start.toISOString(),
        end: currentDates.end.toISOString()
      },
      newWeekDates: {
        start: newDates.start.toISOString(),
        end: newDates.end.toISOString()
      }
    });
    
    // Force a state update
    setWeekOffset(newOffset);
  };

  const goToNextWeek = () => {
    const nextOffset = weekOffset + 1;
    
    // Allow navigation if we're not beyond current week
    if (nextOffset <= 0) {
      console.log('Navigating forward from offset:', weekOffset, 'to', nextOffset);
      setWeekOffset(nextOffset);
    } else {
      console.log('Already at current week. Offset:', weekOffset);
    }
  };
  

  

  const updateWeeklyView = (start, end) => {
    if (!start || !end) return;

    // Filter transactions within the current week
    const weeklyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });

    // Calculate previous week's data
    const previousWeekStart = new Date(start);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(end);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    // Filter transactions for previous week
    const previousWeekTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= previousWeekStart && transactionDate <= previousWeekEnd;
    });

    // Initialize day of week arrays
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Reorder days based on starting day preference
    const startDayIndex = dayNames.findIndex(day => day === startingDay);
    const orderedDayNames = startDayIndex === -1 
      ? dayNames 
      : [...dayNames.slice(startDayIndex), ...dayNames.slice(0, startDayIndex)];

    // Initialize daily breakdowns
    const daily = orderedDayNames.map((day, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index);
      return {
        name: day,
        date: new Date(date),
        income: 0,
        expenses: 0,
        balance: 0
      };
    });

    // Calculate daily totals
    weeklyTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const dayOfWeek = transactionDate.getDay();
      const amount = parseFloat(transaction.amount);
      
      // Find the corresponding day in our ordered array
      let dayIndex;
      if (startingDay === 'Monday') {
        dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      } else if (startingDay === 'Sunday') {
        dayIndex = dayOfWeek;
      } else if (startingDay === 'Saturday') {
        dayIndex = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 2 : dayOfWeek - 5;
      } else {
        dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Default to Monday
      }

      if (transaction.type === 'income') {
        daily[dayIndex].income += amount;
      } else {
        daily[dayIndex].expenses += amount;
      }
      daily[dayIndex].balance = daily[dayIndex].income - daily[dayIndex].expenses;
    });

    // Calculate weekly totals
    const totals = daily.reduce((acc, day) => ({
      income: acc.income + day.income,
      expenses: acc.expenses + day.expenses,
      balance: (acc.income + day.income) - (acc.expenses + day.expenses)
    }), { income: 0, expenses: 0, balance: 0 });

    // Format data for chart display
    const chartData = daily.map(day => ({
      name: day.name.substring(0, 3),
      Income: day.income,
      Expenses: day.expenses,
      Balance: day.balance
    }));

    // Calculate previous week totals
    const prevTotals = {
      income: previousWeekTransactions.reduce((sum, t) => t.type === 'income' ? sum + parseFloat(t.amount) : sum, 0),
      expenses: previousWeekTransactions.reduce((sum, t) => t.type === 'expense' ? sum + parseFloat(t.amount) : sum, 0),
      balance: 0
    };
    prevTotals.balance = prevTotals.income - prevTotals.expenses;
    
    // Calculate trends (percentage change from previous week)
    const trends = {
      income: prevTotals.income === 0 ? 0 : Math.round((totals.income - prevTotals.income) / prevTotals.income * 100),
      expenses: prevTotals.expenses === 0 ? 0 : Math.round((totals.expenses - prevTotals.expenses) / prevTotals.expenses * 100),
      balance: prevTotals.balance === 0 ? 0 : Math.round((totals.balance - prevTotals.balance) / Math.abs(prevTotals.balance) * 100)
    };

    setDailyBreakdown(daily);
    setWeeklyTotal(totals);
    setWeeklyTrends(trends);
    setWeeklyData(chartData);
  };

  const renderWeekNavigation = () => {
    const { start, end } = getWeekDates(weekOffset);
    const formatWeekRange = () => {
      return `${formatDate(start)} - ${formatDate(end)}`;
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={goToPreviousWeek} 
          sx={{
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.primary'
            }
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {formatWeekRange()}
          </Typography>
        </Stack>
        
        <IconButton 
          onClick={goToNextWeek} 
          disabled={weekOffset >= 0}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.primary'
            },
            '&.Mui-disabled': {
              color: 'text.disabled'
            }
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    );
  };

  const handleCardClick = (type) => {
    const { start, end } = getWeekDates(weekOffset);
    
    // Filter weekly transactions by type (income, expenses, or all for balance)
    const weeklyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });

    let filteredTransactions = weeklyTransactions;
    let title = "Weekly Transactions";
    
    if (type === 'income') {
      filteredTransactions = weeklyTransactions.filter(t => t.type === 'income');
      title = "Weekly Income";
    } else if (type === 'expenses') {
      filteredTransactions = weeklyTransactions.filter(t => t.type === 'expense');
      title = "Weekly Expenses";
    } else if (type === 'balance') {
      title = "Weekly Balance";
    }
    
    setSelectedDetail({ title, type, period: 'week' });
    setDetailTransactions(filteredTransactions);
    setDetailModalOpen(true);
  };

  const handleBarClick = (data, index) => {
    const day = dailyBreakdown[index];
    const dayTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const dayStart = new Date(day.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day.date);
      dayEnd.setHours(23, 59, 59, 999);
      return transactionDate >= dayStart && transactionDate <= dayEnd;
    });
    
    setSelectedDetail({ 
      title: `${day.name} (${formatDate(day.date)})`, 
      type: 'day',
      period: 'day'
    });
    setDetailTransactions(dayTransactions);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedDetail(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading weekly data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> 
      
      {renderWeekNavigation()}
      
      {/* Weekly Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              background: '#c8e6c9',  // Pastel green
              color: '#1b5e20',       // Dark green text
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
            onClick={() => handleCardClick('income')}
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
              }}>
                Weekly Income
              </Typography>
              <Box
                sx={{
                  p: { xs: 1, sm: 1.2 },
                  borderRadius: '50%',
                  bgcolor: '#4caf50',  // Darker green for contrast
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                  color: '#ffffff',
                }}
              >
                <TrendingUpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
              }}
            >
              {formatCurrency(weeklyTotal.income)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 'auto',
              pt: 1,
              borderTop: '1px solid rgba(0,0,0,0.05)',
              position: 'relative',
              zIndex: 1
            }}>
              {weeklyTrends.income > 0 ? (
                <TrendingUpIcon sx={{ color: '#1b5e20', opacity: 0.9, mr: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
              ) : (
                <TrendingDownIcon sx={{ color: '#1b5e20', opacity: 0.9, mr: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
              )}
              <Typography variant="body2" sx={{ 
                fontWeight: 400, 
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                letterSpacing: '0.01em',
                opacity: 0.9,
              }}>
                {Math.abs(weeklyTrends.income)}% from last week
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              background: '#ffcdd2',  // Pastel red
              color: '#b71c1c',       // Dark red text
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
            onClick={() => handleCardClick('expenses')}
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
              }}>
                Weekly Expenses
              </Typography>
              <Box
                sx={{
                  p: { xs: 1, sm: 1.2 },
                  borderRadius: '50%',
                  bgcolor: '#ef5350',  // Darker red for contrast
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                  color: '#ffffff',
                }}
              >
                <TrendingDownIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
              }}
            >
              {formatCurrency(weeklyTotal.expenses)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 'auto',
              pt: 1,
              borderTop: '1px solid rgba(0,0,0,0.05)',
              position: 'relative',
              zIndex: 1
            }}>
              {weeklyTrends.expenses > 0 ? (
                <TrendingUpIcon sx={{ color: '#b71c1c', opacity: 0.9, mr: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
              ) : (
                <TrendingDownIcon sx={{ color: '#b71c1c', opacity: 0.9, mr: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
              )}
              <Typography variant="body2" sx={{ 
                fontWeight: 400, 
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                letterSpacing: '0.01em',
                opacity: 0.9,
              }}>
                {Math.abs(weeklyTrends.expenses)}% from last week
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              background: weeklyTotal.balance >= 0 ? '#bbdefb' : '#ffcdd2',  // Pastel blue or red
              color: weeklyTotal.balance >= 0 ? '#0d47a1' : '#b71c1c',       // Dark blue or red text
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
            onClick={() => handleCardClick('balance')}
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
              }}>
                Weekly Balance
              </Typography>
              <Box
                sx={{
                  p: { xs: 1, sm: 1.2 },
                  borderRadius: '50%',
                  bgcolor: weeklyTotal.balance >= 0 ? '#2196f3' : '#ef5350',  // Darker blue/red for contrast
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                  color: '#ffffff',
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
              }}
            >
              {formatCurrency(weeklyTotal.balance)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 'auto',
              pt: 1,
              borderTop: '1px solid rgba(0,0,0,0.05)',
              position: 'relative',
              zIndex: 1
            }}>
              {weeklyTrends.balance > 0 ? (
                <TrendingUpIcon sx={{ 
                  color: weeklyTotal.balance >= 0 ? '#0d47a1' : '#b71c1c', 
                  opacity: 0.9, 
                  mr: 1, 
                  fontSize: { xs: '0.9rem', sm: '1.1rem' } 
                }} />
              ) : (
                <TrendingDownIcon sx={{ 
                  color: weeklyTotal.balance >= 0 ? '#0d47a1' : '#b71c1c', 
                  opacity: 0.9, 
                  mr: 1, 
                  fontSize: { xs: '0.9rem', sm: '1.1rem' } 
                }} />
              )}
              <Typography variant="body2" sx={{ 
                fontWeight: 400, 
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                letterSpacing: '0.01em',
                opacity: 0.9,
              }}>
                {Math.abs(weeklyTrends.balance)}% from last week
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Weekly Chart */}
      <Paper sx={{ 
        p: 3, 
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
      }}>
        <Typography variant="h6" gutterBottom>Daily Breakdown</Typography>
        <Box sx={{ height: 300, pt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={(data) => {
                if (data && data.activeTooltipIndex !== undefined) {
                  handleBarClick(data, data.activeTooltipIndex);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).replace(/[^0-9.-]+/g, '')}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => {
                  const day = dailyBreakdown.find(d => d.name.substring(0, 3) === label);
                  return `${label} (${formatDate(day.date)})`;
                }}
              />
              <Legend />
              <Bar dataKey="Income" fill={theme.palette.success.main} />
              <Bar dataKey="Expenses" fill={theme.palette.error.main} />
              <Bar dataKey="Balance" fill={theme.palette.primary.main} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      {/* Daily Breakdown Table */}
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2,
        boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(66, 66, 66, 0.9)' 
            : 'rgba(248, 250, 252, 1)',
        }
      }}>
        <Typography variant="h6" gutterBottom>Daily Activity</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Income</TableCell>
                <TableCell align="right">Expenses</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyBreakdown.map((day) => (
                <TableRow 
                  key={day.name} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => {
                    const dayTransactions = transactions.filter(transaction => {
                      const transactionDate = new Date(transaction.date);
                      const dayStart = new Date(day.date);
                      dayStart.setHours(0, 0, 0, 0);
                      const dayEnd = new Date(day.date);
                      dayEnd.setHours(23, 59, 59, 999);
                      return transactionDate >= dayStart && transactionDate <= dayEnd;
                    });
                    setSelectedDetail({ 
                      title: `${day.name} (${formatDate(day.date)})`, 
                      type: 'day',
                      period: 'day'
                    });
                    setDetailTransactions(dayTransactions);
                    setDetailModalOpen(true);
                  }}
                >
                  <TableCell>{day.name}</TableCell>
                  <TableCell>{formatDate(day.date)}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {formatCurrency(day.income)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {formatCurrency(day.expenses)}
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: day.balance >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}>
                    {formatCurrency(day.balance)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Weekly Total</TableCell>
                <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  {formatCurrency(weeklyTotal.income)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  {formatCurrency(weeklyTotal.expenses)}
                </TableCell>
                <TableCell align="right" sx={{ 
                  color: weeklyTotal.balance >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {formatCurrency(weeklyTotal.balance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={closeDetailModal}
        aria-labelledby="detail-modal-title"
        aria-describedby="detail-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '70%' },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          {selectedDetail && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" id="detail-modal-title">
                  {selectedDetail.title} Transactions
                </Typography>
                <IconButton 
                  onClick={closeDetailModal} 
                  size="small"
                  sx={{
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
              
              {detailTransactions.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                  No transactions found for this period.
                </Typography>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailTransactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                color={transaction.type === 'income' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>{transaction.description || '-'}</TableCell>
                            <TableCell align="right" sx={{ 
                              color: transaction.type === 'income' ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle1">
                      Total Transactions: {detailTransactions.length}
                    </Typography>
                    
                    <Box>
                      {selectedDetail.period === 'week' && (
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Total: {formatCurrency(detailTransactions.reduce((sum, t) => 
                            selectedDetail.type === 'balance' 
                              ? sum + (t.type === 'income' ? t.amount : -t.amount)
                              : sum + parseFloat(t.amount), 0)
                          )}
                        </Typography>
                      )}
                      
                      {selectedDetail.period === 'day' && (
                        <>
                          <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                            Income: {formatCurrency(detailTransactions
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                            )}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                            Expenses: {formatCurrency(detailTransactions
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                            )}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default WeeklyView; 