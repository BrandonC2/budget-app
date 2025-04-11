import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
    // TODO: Implement theme change logic
  };

  const userMenuItems = [
    {
      label: 'Profile',
      icon: <AccountCircleIcon />,
      onClick: () => {
        handleClose();
        // TODO: Navigate to profile page
      },
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => {
        handleClose();
        // TODO: Navigate to settings page
      },
    },
    {
      label: 'Help & Support',
      icon: <HelpIcon />,
      onClick: () => {
        handleClose();
        // TODO: Show help dialog
      },
    },
    {
      label: 'Dark Mode',
      icon: darkMode ? <LightModeIcon /> : <DarkModeIcon />,
      onClick: handleThemeChange,
      endAdornment: (
        <Switch
          checked={darkMode}
          onChange={handleThemeChange}
          color="primary"
          size="small"
        />
      ),
    },
    {
      label: 'Logout',
      icon: <LogoutIcon color="error" />,
      onClick: handleLogout,
      sx: { color: 'error.main' },
    },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.name?.[0]?.toUpperCase() || <AccountCircleIcon />}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        <ListItem 
          button 
          component={RouterLink} 
          to="/dashboard" 
          onClick={handleDrawerToggle}
          sx={{
            '&:hover': {
              bgcolor: 'primary.light',
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem 
          button 
          component={RouterLink} 
          to="/transactions" 
          onClick={handleDrawerToggle}
          sx={{
            '&:hover': {
              bgcolor: 'primary.light',
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            },
          }}
        >
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleThemeChange}
                color="primary"
              />
            }
            label={darkMode ? "Light Mode" : "Dark Mode"}
          />
        </ListItem>
        <ListItem 
          button 
          onClick={() => {
            handleLogout();
            handleDrawerToggle();
          }}
          sx={{
            '&:hover': {
              bgcolor: 'error.light',
              '& .MuiListItemIcon-root': {
                color: 'error.main',
              },
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: theme.shadows[1],
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Budget Tracker
          </Typography>
        </Box>

        {isAuthenticated ? (
          isMobile ? (
            <Drawer
              variant="temporary"
              anchor="left"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: 250,
                },
              }}
            >
              {drawer}
            </Drawer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/dashboard"
                startIcon={<DashboardIcon />}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                component={RouterLink}
                to="/transactions"
                startIcon={<ReceiptIcon />}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                  },
                }}
              >
                Transactions
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
                onClick={handleMenu}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || <AccountCircleIcon />}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.name || 'User'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase() || <AccountCircleIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {user?.name || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                {userMenuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={item.onClick}
                    sx={{
                      ...item.sx,
                      '&:hover': {
                        bgcolor: 'primary.light',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {item.endAdornment}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/login"
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                },
              }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 