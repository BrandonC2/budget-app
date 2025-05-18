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
  Container,
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
import { useThemeMode } from '../context/ThemeContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleThemeChange = (e) => {
    e.stopPropagation();
    toggleDarkMode();
  };

  const userMenuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <AccountCircleIcon />,
      onClick: () => {
        handleClose();
        // TODO: Navigate to profile page
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => {
        handleClose();
        navigate('/settings');
      },
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpIcon />,
      onClick: () => {
        handleClose();
        // TODO: Show help dialog
      },
    },
    {
      id: 'theme',
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? <LightModeIcon /> : <DarkModeIcon />,
      onClick: handleClose,
      endAdornment: (
        <Switch
          checked={darkMode}
          onChange={handleThemeChange}
          color="primary"
          size="small"
          onClick={(e) => e.stopPropagation()} 
        />
      ),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogoutIcon color="error" />,
      onClick: handleLogout,
      sx: { color: 'error.main' },
    },
  ];

  const drawer = (
    <Box sx={{ width: 280, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white',
              color: 'primary.main',
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || <AccountCircleIcon />}
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {user?.name || 'User'}
          </Typography>
        </Box>
        {user?.email && (
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8,
              ml: 7,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user.email}
          </Typography>
        )}
      </Box>
      <List sx={{ p: 1.5, overflow: 'hidden' }}>
        <ListItem 
          button 
          component={RouterLink} 
          to="/dashboard" 
          onClick={handleDrawerToggle}
          sx={{
            mb: 0.5,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '& .MuiListItemIcon-root': {
                color: 'text.primary',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            primaryTypographyProps={{ 
              fontWeight: 'medium',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          />
        </ListItem>
        <ListItem 
          button 
          component={RouterLink} 
          to="/transactions" 
          onClick={handleDrawerToggle}
          sx={{
            mb: 0.5,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '& .MuiListItemIcon-root': {
                color: 'text.primary',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Transactions" 
            primaryTypographyProps={{ 
              fontWeight: 'medium',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          />
        </ListItem>
      </List>
      <Divider />
      <List sx={{ p: 1.5, overflow: 'hidden' }}>
        {userMenuItems.map((item) => {
          const isThemeItem = item.id === 'theme';
          
          return (
            <ListItem
              key={item.id}
              button
              onClick={() => {
                item.onClick();
                if (!isThemeItem) handleDrawerToggle();
              }}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                ...item.sx,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  '& .MuiListItemIcon-root': {
                    color: 'text.primary',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: 'medium',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              />
              {item.endAdornment}
            </ListItem>
          );
        })}
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
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ overflow: 'hidden' }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          px: { xs: 1.5, sm: 2 },
          minHeight: { xs: '56px', sm: '64px' }
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {isMobile && isAuthenticated && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary'
                  }
                }}
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
                whiteSpace: 'nowrap',
              }}
            >
              Broken't
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
                    width: 280,
                    overflow: 'hidden',
                  },
                }}
              >
                {drawer}
              </Drawer>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  startIcon={<DashboardIcon />}
                  sx={{
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    px: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: 'text.primary'
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
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    px: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: 'text.primary'
                    },
                  }}
                >
                  Transactions
                </Button>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    p: 1,
                    ml: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                  onClick={handleMenu}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 38,
                      height: 38,
                      boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase() || <AccountCircleIcon />}
                  </Avatar>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      width: 230,
                      maxWidth: '90vw',
                      overflow: 'hidden',
                    },
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 46,
                          height: 46,
                          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                          flexShrink: 0,
                        }}
                      >
                        {user?.username?.[0]?.toUpperCase() || <AccountCircleIcon />}
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user?.username || 'User'}
                        </Typography>
                        {user?.email && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Divider />
                  {userMenuItems.map((item) => {
                    const isThemeItem = item.id === 'theme';
                    
                    return (
                      <MenuItem
                        key={item.id}
                        onClick={isThemeItem ? null : item.onClick}
                        sx={{
                          py: 1.2,
                          px: 2,
                          ...item.sx,
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                            '& .MuiListItemIcon-root': {
                              color: 'text.primary',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          primaryTypographyProps={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        />
                        {item.endAdornment}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </Box>
            )
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'text.primary',
                  px: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary'
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
                  px: 1.5,
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
      </Container>
    </AppBar>
  );
};

export default Navbar; 