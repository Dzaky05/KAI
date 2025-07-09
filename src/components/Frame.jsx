import React, { useState, useEffect, useContext, useMemo } from 'react';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Fab from '@mui/material/Fab';
import useMediaQuery from '@mui/material/useMediaQuery';
import Skeleton from '@mui/material/Skeleton';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import FactoryIcon from '@mui/icons-material/Factory';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import BuildIcon from '@mui/icons-material/Build';
import ScienceIcon from '@mui/icons-material/Science';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import Notifications from '@mui/icons-material/Notifications';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HelpOutline from '@mui/icons-material/HelpOutline';

// React Router
import { Link, Outlet, useLocation } from 'react-router-dom';

import kaiLogo from "../assets/logokai.png";

const drawerWidth = 260;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    backgroundColor: theme.palette.mode === 'light' ? '#f5f7fa' : '#121212',
    minHeight: "100vh",
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  background: "linear-gradient(135deg, #FF6D00 0%, #E65100 100%)",
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
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
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  background: theme.palette.mode === 'light' ? '#F0F0F0' : '#1E1E1E',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
    background: theme.palette.error.main,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    animation: 'pulse 2s infinite',
  },
}));

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function Frame({ children, onLogout }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState(3);
  const [openCollapse, setOpenCollapse] = useState({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

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

  const handleCollapseClick = (label) => {
    setOpenCollapse((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const mainMenuItems = [
    { to: "/", icon: <HomeIcon />, label: "Home", exact: true },
    { to: "/StockProduction", icon: <StorageIcon />, label: "Stock Production", badge: 2 },
    {
      label: "Manufacturing",
      icon: <FactoryIcon />,
      subItems: [
        { to: "/Produksi", icon: <ProductionQuantityLimitsIcon />, label: "Produksi" },
        { to: "/Overhaul", icon: <BuildIcon />, label: "Overhaul Point" },
        { to: "/Rekayasa", icon: <BuildIcon />, label: "Rekayasa" },
      ],
    },
    { to: "/Kalibrasi", icon: <ScienceIcon />, label: "Kalibrasi", badge: 1 },
    { to: "/Inventory", icon: <InventoryIcon />, label: "Inventory" },
    { to: "/Personalia", icon: <PeopleIcon />, label: "Personalia" },
    { to: "/QualityControl", icon: <BuildIcon />, label: "Quality Control" },
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
        <Toolbar
          sx={{
            justifyContent: "space-between",
            flexDirection: "row", // Changed to row for horizontal layout
            alignItems: "center", // Align items vertically in the center
            minHeight: "64px !important",
            p: 0,
            px: 2, // Added horizontal padding
            gap: 2, // Added gap between elements
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ 
                mr: 1, 
                ...(open && { display: "none" }),
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'transform 0.3s'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              PT KERETA API BALAI YASA & LAA
            </Typography>
            {/* Horizontal navigation items */}
            <Box
              sx={{
                display: "flex", // Always display flex
                gap: "12px", //
                ml: 3, // Add some margin to separate from title
                "& .menu-item": {
                  color: "white",
                  fontWeight: "500",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transform: 'translateY(-2px)',
                  },
                  "&.active": {
                    backgroundColor: "rgba(255,255,255,0.3)",
                    fontWeight: "600",
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80%',
                      height: 2,
                      background: theme.palette.primary.main,
                    }
                  },
                },
              }}
            >
              {topNavItems.map((item) => (
                <Link
                  to={item.to}
                  key={item.to}
                  className={`menu-item ${
                    location.pathname === item.to ? "active" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip 
              title="Toggle dark/light mode" 
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? '#FF6D00' : '#E65100',
                    color: 'white',
                    fontSize: '0.8rem',
                    boxShadow: theme.shadows[4],
                  }
                }
              }}
            >
              <IconButton 
                onClick={colorMode.toggleColorMode} 
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'transform 0.5s'
                }}
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                aria-label={`Show ${notifications} new notifications`}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
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
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: "linear-gradient(135deg, #FF6D00, #FF9E40)",
                    boxShadow: theme.shadows[2],
                    color: "white",
                    fontWeight: "bold",
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  M
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          {/* Removed the running text Box */}
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
          `}</style>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: theme.palette.mode === 'light' ? '#FFFFFF' : '#1E1E1E',
            color: theme.palette.text.primary,
            borderRight: "none",
            boxShadow: theme.shadows[4],
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box>
          <DrawerHeader>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img 
                src={kaiLogo} 
                alt="KAI Logo" 
                style={{ 
                  height: 36,
                  transition: 'transform 0.5s',
                  '&:hover': {
                    transform: 'rotate(360deg)',
                  }
                }} 
              />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Production
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />

          <List sx={{ pt: 1 }}>
            {mainMenuItems.map((item) => (
              item.subItems ? (
                <React.Fragment key={item.label}>
                  <ListItemButton
                    onClick={() => handleCollapseClick(item.label)}
                    sx={{
                      color: theme.palette.text.secondary,
                      borderLeft: "4px solid transparent",
                      py: 1.5,
                      pl: 3,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.primary.main,
                        "& .MuiListItemIcon-root": {
                          color: theme.palette.primary.main,
                        },
                        transform: 'translateX(4px)',
                      },
                      "&.Mui-selected": {
                        backgroundColor: `${theme.palette.primary.main}20`,
                        color: theme.palette.primary.main,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        "& .MuiListItemIcon-root": {
                          color: theme.palette.primary.main,
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          height: '100%',
                          width: 4,
                          background: theme.palette.primary.main,
                        },
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    selected={item.subItems.some(subItem =>
                      subItem.exact
                        ? location.pathname === subItem.to
                        : location.pathname.startsWith(subItem.to)
                    )}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: "medium",
                        fontSize: "0.9rem",
                      }}
                    />
                    {openCollapse[item.label] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openCollapse[item.label]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <Link
                          to={subItem.to}
                          key={subItem.to}
                          style={{ textDecoration: "none" }}
                        >
                          <ListItemButton
                            selected={
                              subItem.exact
                                ? location.pathname === subItem.to
                                : location.pathname.startsWith(subItem.to)
                            }
                            sx={{
                              pl: 6,
                              color: theme.palette.text.secondary,
                              borderLeft: "4px solid transparent",
                              "&.Mui-selected": {
                                backgroundColor: `${theme.palette.primary.main}20`,
                                color: theme.palette.primary.main,
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                "& .MuiListItemIcon-root": {
                                  color: theme.palette.primary.main,
                                },
                              },
                              "&:hover": {
                                backgroundColor: theme.palette.action.hover,
                                color: theme.palette.primary.main,
                                "& .MuiListItemIcon-root": {
                                  color: theme.palette.primary.main,
                                },
                                transform: 'translateX(4px)',
                              },
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              py: 1.5,
                            }}
                          >
                            <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.label}
                              primaryTypographyProps={{
                                fontWeight: "medium",
                                fontSize: "0.85rem",
                              }}
                            />
                          </ListItemButton>
                        </Link>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <Link
                  to={item.to}
                  key={item.to}
                  style={{ textDecoration: "none" }}
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={
                        item.exact
                          ? location.pathname === item.to
                          : location.pathname.startsWith(item.to)
                      }
                      sx={{
                        color: theme.palette.text.secondary,
                        borderLeft: "4px solid transparent",
                        "&.Mui-selected": {
                          backgroundColor: `${theme.palette.primary.main}20`,
                          color: theme.palette.primary.main,
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                          "& .MuiListItemIcon-root": {
                            color: theme.palette.primary.main,
                          },
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            height: '100%',
                            width: 4,
                            background: theme.palette.primary.main,
                          },
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.primary.main,
                          "& .MuiListItemIcon-root": {
                            color: theme.palette.primary.main,
                          },
                          transform: 'translateX(4px)',
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        py: 1.5,
                        pl: 3,
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: "medium",
                          fontSize: "0.9rem",
                        }}
                      />
                      {item.badge && (
                        <Box
                          sx={{
                            backgroundColor: "error.main",
                            color: "white",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            mr: 2,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                </Link>
              )
            ))}
          </List>
        </Box>

        <Box sx={{ 
          p: 2, 
          textAlign: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
          transition: 'all 0.3s',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }
        }} onClick={() => window.location.href = '/'}>
          <Typography 
            variant="overline" 
            sx={{
              fontWeight: 'bold',
              color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
              letterSpacing: '1px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <img src={kaiLogo} alt="KAI Logo" style={{ height: 20 }} />
            BALAI YASA & LAA
          </Typography>
        </Box>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            p: 3,
            minHeight: "calc(100vh - 64px - 24px - 48px)",
            mt: 2,
            mb: 2,
          }}
        >
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={100} />
            </Box>
          ) : (
            <>
              {children}
              <Outlet />
            </>
          )}
        </Box>
      </Main>

      <Fab
        color="primary"
        aria-label="toggle drawer"
        onClick={open ? handleDrawerClose : handleDrawerOpen}
        sx={{
          position: 'fixed',
          left: open ? drawerWidth + 16 : 16,
          bottom: 16,
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {open ? <ChevronLeftIcon /> : <MenuIcon />}
      </Fab>

      <Fab
        color="secondary"
        aria-label="help"
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: theme.zIndex.drawer + 1,
        }}
        onClick={() => setHelpOpen(true)}
      >
        <HelpOutline />
      </Fab>

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
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
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
        <Link to="/Profile" style={{ textDecoration: "none", color: "inherit" }}>
          <MenuItem 
            onClick={handleCloseProfile}
            sx={{
              '& .MuiTouchRipple-root': {
                color: theme.palette.primary.main,
              }
            }}
          >
            <Avatar /> Profile
          </MenuItem>
        </Link>
        <Divider />
        <MenuItem 
          onClick={handleCloseProfile}
          sx={{
            '& .MuiTouchRipple-root': {
              color: theme.palette.primary.main,
            }
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem 
          onClick={() => { handleCloseProfile(); onLogout(); }}
          sx={{
            '& .MuiTouchRipple-root': {
              color: theme.palette.error.main,
            }
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

export function ToggleColorMode({ children }) {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: {
                  main: "#FF6D00",
                  light: "#FF9E40",
                  dark: "#E65100",
                  contrastText: "#fff",
                },
                secondary: {
                  main: "#FF9800",
                  light: "#FFB74D",
                  dark: "#F57C00",
                },
                error: {
                  main: "#EF5350",
                },
                background: {
                  default: '#f5f7fa',
                  paper: '#ffffff',
                },
                text: {
                  primary: 'rgba(0, 0, 0, 0.87)',
                  secondary: 'rgba(0, 0, 0, 0.6)',
                }
              }
            : {
                primary: {
                  main: "#FF6D00",
                  light: "#FF9E40",
                  dark: "#E65100",
                  contrastText: "#fff",
                },
                secondary: {
                  main: "#FF9800",
                  light: "#FFB74D",
                  dark: "#F57C00",
                },
                error: {
                  main: "#EF5350",
                },
                background: {
                  default: "#121212",
                  paper: "#1E1E1E",
                },
                text: {
                  primary: 'rgba(255, 255, 255, 0.87)',
                  secondary: 'rgba(255, 255, 255, 0.6)',
                }
              }),
        },
        typography: {
          fontFamily: [
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(','),
          h6: {
            fontSize: '1.15rem',
            '@media (min-width:600px)': {
              fontSize: '1.4rem',
            },
            fontWeight: 700,
          },
          subtitle1: {
            fontSize: '1rem',
            fontWeight: 600,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease, color 0.3s ease',
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: mode === 'light' ? '#f1f1f1' : '#2d2d2d',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: mode === 'light' ? '#888' : '#555',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#FF6D00',
                }
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                },
              },
            },
          },
          MuiToolbar: {
            styleOverrides: {
              root: {
                minHeight: 'auto',
                padding: '0 !important',
              }
            }
          }
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}