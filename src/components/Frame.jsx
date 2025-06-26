import * as React from "react";
import { styled, useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import FactoryIcon from "@mui/icons-material/Factory";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import ScienceIcon from "@mui/icons-material/Science";
import PeopleIcon from "@mui/icons-material/People";
import StorageIcon from "@mui/icons-material/Storage";
import { Link, useLocation } from "react-router-dom";
import { Avatar, Collapse, Menu, MenuItem, Tooltip, Badge, Switch } from "@mui/material";
import { ExpandLess, ExpandMore, Logout, Settings, Notifications, Brightness4, Brightness7 } from "@mui/icons-material";
import kaiLogo from "../assets/logokai.png";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh'
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  background: theme.palette.mode === 'dark' 
    ? "linear-gradient(to right, #FF8C00, #FFA500)"
    : "linear-gradient(to right, #1976d2, #2196f3)",
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  zIndex: theme.zIndex.drawer + 1,
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  background: theme.palette.mode === 'dark' ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)",
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    background: theme.palette.error.main,
    color: theme.palette.common.white,
  },
}));

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function Frame({ children }) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [open, setOpen] = React.useState(true);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifications] = React.useState(3); 

  const profile = Boolean(anchorEl);
  const handleOpenProfile = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseProfile = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const mainMenuItems = [
    { to: "/", icon: <HomeIcon />, label: "Home", exact: true },
    { to: "/StockProduction", icon: <StorageIcon />, label: "Stock Production", badge: 2 },
    { to: "/Produksi", icon: <ProductionQuantityLimitsIcon />, label: "Produksi" },
    { to: "/Overhaul", icon: <BuildIcon />, label: "Overhaul point" },
    { to: "/Rekayasa", icon: <BuildIcon />, label: "Rekayasa" },
    { to: "/Kalibrasi", icon: <ScienceIcon />, label: "Kalibrasi", badge: 1 },
    { to: "/Inventory", icon: <InventoryIcon />, label: "Inventory" },
    { to: "/Personalia", icon: <PeopleIcon />, label: "Personalia" },
  ];

  const topNavItems = [
    { to: "/", label: "Home" },
    { to: "/StockProduction", label: "Stock" },
    { to: "/Produksi", label: "Produksi" },
    { to: "/Inventory", label: "Inventory" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          flexDirection: 'column', 
          alignItems: 'stretch', 
          minHeight: '64px !important', 
          p: 0,
          gap: 1
        }}>
          {/* Top row with menu button, title, and user controls */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%', 
            px: 2, 
            pt: 1,
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{ mr: 1, ...(open && { display: "none" }) }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  color: "#fff", 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                PT KERETA API BALAI YASA & LAA
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Toggle dark/light mode">
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <NotificationBadge badgeContent={notifications} color="error">
                    <Notifications />
                  </NotificationBadge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleOpenProfile}
                  size="small"
                  aria-controls={profile ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={profile ? "true" : undefined}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background: theme.palette.mode === 'dark' 
                        ? "linear-gradient(135deg, #FF8C00, #FFA500)"
                        : "linear-gradient(135deg, #1976d2, #2196f3)",
                      boxShadow: theme.shadows[2],
                      color: "white",
                      fontWeight: 'bold'
                    }}
                  >
                    M
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Running Teks / Marquee */}
          <Box sx={{
            width: '100%',
            overflow: 'hidden',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(0,0,0,0.08)',
            height: 28,
            display: 'flex',
            alignItems: 'center',
            borderBottom: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255,255,255,0.15)'
              : '1px solid rgba(0,0,0,0.15)'
          }}>
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                px: 2,
                animation: 'marquee 15s linear infinite',
              }}
            >
              Selamat datang di Sistem Informasi Produksi PT KAI Balai Yasa & LAA. Untuk bantuan, hubungi admin. | Welcome to the Production Information System of PT KAI Balai Yasa & LAA.
            </Box>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </Box>

          {/* Navigation links */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: '12px',
            width: '100%',
            px: 2,
            pb: 1,
            '& .menu-item': {
              color: 'white',
              fontWeight: '500',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
              '&.active': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                fontWeight: '600'
              }
            }
          }}>
            {topNavItems.map((item) => (
              <Link 
                to={item.to} 
                key={item.to}
                className={`menu-item ${location.pathname === item.to ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </Box>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={profile}
            onClose={handleCloseProfile}
            onClick={handleCloseProfile}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: "visible",
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
              <MenuItem onClick={handleCloseProfile}>
                <Avatar /> Profile
              </MenuItem>
            </Link>
            <Divider />
            <MenuItem onClick={handleCloseProfile}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleCloseProfile}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(195deg, #1A1A1A, #121212)' 
              : 'linear-gradient(195deg, #f5f5f5, #e0e0e0)',
            color: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(0, 0, 0, 0.8)',
            borderRight: 'none',
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={kaiLogo} alt="KAI Logo" style={{ height: 36 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Production
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: "inherit" }}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: theme.palette.mode === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
        
        <List sx={{ pt: 1 }}>
          {mainMenuItems.map((item) => (
            <Link 
              to={item.to} 
              key={item.to}
              style={{ textDecoration: 'none' }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)}
                  sx={{
                    color: 'inherit',
                    borderLeft: '4px solid transparent',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 165, 0, 0.15)' 
                        : 'rgba(25, 118, 210, 0.15)',
                      color: theme.palette.mode === 'dark' ? '#FFA500' : '#1976d2',
                      borderLeft: theme.palette.mode === 'dark' 
                        ? '4px solid #FFA500' 
                        : '4px solid #1976d2',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.mode === 'dark' ? '#FFA500' : '#1976d2'
                      }
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.05)',
                      color: theme.palette.mode === 'dark' ? '#FFA500' : '#1976d2',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.mode === 'dark' ? '#FFA500' : '#1976d2'
                      }
                    },
                    transition: 'all 0.2s ease-in-out',
                    py: 1.5,
                    pl: 3
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: 'medium',
                      fontSize: '0.9rem'
                    }} 
                  />
                  {item.badge && (
                    <Box sx={{ 
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {item.badge}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: 3,
          minHeight: 'calc(100vh - 64px - 24px)'
        }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
}

// Create a wrapper component to provide the color mode context
export function ToggleColorMode({ children }) {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: {
                  main: '#1976d2',
                },
                secondary: {
                  main: '#9c27b0',
                },
              }
            : {
                // Dark mode palette
                primary: {
                  main: '#FFA500',
                },
                secondary: {
                  main: '#ff9800',
                },
                background: {
                  default: '#121212',
                  paper: '#1E1E1E',
                },
              }),
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}