import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import FloatingAIAssistant from './FloatingAIAssistant';
import {
  AccountCircle,
  Home,
  Description,
  Dashboard,
  Logout,
  Psychology,
  SmartToy,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              color: 'primary.main',
              fontFamily: '"DM Sans", sans-serif'
            }}
          >
            Mortgage Assistant
          </Typography>

          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                color="inherit"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ 
                  color: 'text.primary',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                startIcon={<Description />}
                onClick={() => navigate('/applications')}
                sx={{ 
                  color: 'text.primary',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                Applications
              </Button>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/documents')}
                sx={{ 
                  color: 'text.primary',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                Documents
              </Button>

              <IconButton
                size="large"
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ color: 'text.primary' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.first_name?.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem 
                  onClick={() => handleNavigation('/profile')}
                  sx={{ fontFamily: '"Inter", sans-serif' }}
                >
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ fontFamily: '"Inter", sans-serif' }}
                >
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}

          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ 
                  color: 'text.primary',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ 
                  ml: 1,
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      
      {/* Floating AI Assistant - available on all pages */}
      <FloatingAIAssistant />
    </Box>
  );
};

export default Layout;
