import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  Alert,
  Snackbar,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useUserPreferences } from '../context/UserPreferencesContext';

// Tab Panel component for Settings sections
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings = () => {
  const { user, updatePassword, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { currency, dateFormat, startingDay, updatePreferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Profile settings
  const [username, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  
  // Local preference states
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localDateFormat, setLocalDateFormat] = useState(dateFormat);
  const [localStartingDay, setLocalStartingDay] = useState(startingDay);

  // Update local preferences when context values change  
  useEffect(() => {
    setLocalCurrency(currency);
    setLocalDateFormat(dateFormat);
    setLocalStartingDay(startingDay);
  }, [currency, dateFormat, startingDay]);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    const result = await updatePassword(currentPassword, newPassword);
    setPasswordMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!username.trim()) {
      setProfileMessage({
        type: 'error',
        text: 'Name cannot be empty'
      });
      return;
    }

    try {
      const result = await updateProfile({ username: username.trim() });
      setProfileMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    }
  };

  const handleSavePreferences = () => {
    // Save preferences using the context
    updatePreferences({
      currency: localCurrency,
      dateFormat: localDateFormat,
      startingDay: localStartingDay
    });
    
    setSnackbar({
      open: true,
      message: 'Preferences saved successfully',
      severity: 'success',
    });
  };

  const handleSaveNotifications = () => {
    // TODO: Implement notifications save logic
    setSnackbar({
      open: true,
      message: 'Notification settings saved',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Settings
      </Typography>
      
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Profile" />
            <Tab label="Preferences" />
            <Tab label="Appearance" />
            <Tab label="Notifications" />
          </Tabs>
        </Box>
        
        {/* Profile Settings */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account Information
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <form onSubmit={handleProfileUpdate}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin="normal"
                error={profileMessage.type === 'error'}
                helperText={profileMessage.type === 'error' ? profileMessage.text : ''}
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>
            </form>
            {profileMessage.text && (
              <Alert severity={profileMessage.type} sx={{ mt: 2 }}>
                {profileMessage.text}
              </Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Change Password
          </Typography>
          
          <Box>
            <form onSubmit={handlePasswordUpdate}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Update Password
              </Button>
            </form>
            {passwordMessage.text && (
              <Alert severity={passwordMessage.type} sx={{ mt: 2 }}>
                {passwordMessage.text}
              </Alert>
            )}
          </Box>
        </TabPanel>
        
        {/* Preferences Settings */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Regional Settings
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Currency</InputLabel>
              <Select
                value={localCurrency}
                label="Currency"
                onChange={(e) => setLocalCurrency(e.target.value)}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="JPY">JPY (¥)</MenuItem>
                <MenuItem value="CAD">CAD ($)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Date Format</InputLabel>
              <Select
                value={localDateFormat}
                label="Date Format"
                onChange={(e) => setLocalDateFormat(e.target.value)}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Week Starts On</InputLabel>
              <Select
                value={localStartingDay}
                label="Week Starts On"
                onChange={(e) => setLocalStartingDay(e.target.value)}
              >
                <MenuItem value="Monday">Monday</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
                <MenuItem value="Saturday">Saturday</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSavePreferences}
              sx={{ 
                mt: 2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              Save Preferences
            </Button>
          </Box>
        </TabPanel>
        
        {/* Appearance Settings */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Theme
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  color="primary"
                />
              }
              label={darkMode ? "Dark Mode" : "Light Mode"}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Choose between light and dark mode for the application interface.
          </Typography>
        </TabPanel>
        
        {/* Notifications Settings */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notification Preferences
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={budgetAlerts}
                  onChange={() => setBudgetAlerts(!budgetAlerts)}
                  color="primary"
                />
              }
              label="Budget Alerts"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={weeklyReports}
                  onChange={() => setWeeklyReports(!weeklyReports)}
                  color="primary"
                />
              }
              label="Weekly Reports"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveNotifications}
              >
                Save Notification Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
      
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

export default Settings; 