import React, { useState, useEffect, useContext } from 'react';
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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

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

// React Router
import { Link, Outlet, useLocation } from 'react-router-dom';

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
    backgroundColor: '#f5f7fa',
    minHeight: "100vh",
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  background: "#FF6D00", // Changed to orange
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
  background: '#F0F0F0',
  borderBottom: `1px solid rgba(0,0,0,0.1)`,
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
  },
}));

const ProgressCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function Frame({ onLogout }) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [open, setOpen] = React.useState(true);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifications] = React.useState(3);
  const [openCollapse, setOpenCollapse] = React.useState({});

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

  // Sample progress data
  const progressData = [
    { title: "Overhaul Point Machine", progress: 65, note: "Custom" },
    { title: "Stock Production", progress: 78, note: "Custom" },
    { title: "RingKasan Produksi", progress: 75, note: "Total Progress: 75%", subNote: "Note: V2B progress actuals are not actual locations in data collected and cannot detect remote." },
    { title: "Produksi Radio Lokomotif", progress: 81, note: "Custom" },
    { title: "Personalia", progress: 92, note: "Custom" },
    { title: "Products! Way Station", progress: 63, note: "Custom" },
    { title: "Quality Control", progress: 81, note: "Custom" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            flexDirection: "column",
            alignItems: "stretch",
            minHeight: "64px !important",
            p: 0,
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              px: 2,
              pt: 1,
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                PT KERETA API BALAI YASA & LAA
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Toggle dark/light mode">
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === "dark" ? (
                    <Brightness7 />
                  ) : (
                    <Brightness4 />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton color="inherit" aria-label={`Show ${notifications} new notifications`}>
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
                      background: "linear-gradient(135deg, #FF6D00, #FF9E40)", // Orange gradient
                      boxShadow: theme.shadows[2],
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    M
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              background: "rgba(255,255,255,0.15)", // Lighter overlay for orange
              height: 28,
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-block",
                whiteSpace: "nowrap",
                fontSize: "0.9rem",
                fontWeight: "medium",
                letterSpacing: "0.2px",
                color: "#fff",
                px: 2,
                animation: "marquee 15s linear infinite",
              }}
            >
              Selamat datang di Sistem Informasi Produksi PT KAI Balai Yasa &
              LAA. Untuk bantuan, hubungi admin. | Welcome to the Production
              Information System of PT KAI Balai Yasa & LAA.
            </Box>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "12px",
              width: "100%",
              px: 2,
              pb: 1,
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
                },
                "&.active": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                  fontWeight: "600",
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
            <MenuItem onClick={() => { handleCloseProfile(); onLogout(); }}>
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
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#FFFFFF",
            color: "rgba(0, 0, 0, 0.87)",
            borderRight: "none",
            boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={kaiLogo} alt="KAI Logo" style={{ height: 36 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "rgba(0, 0, 0, 0.87)" }}>
              Production
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: "rgba(0, 0, 0, 0.6)" }}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider
          sx={{
            borderColor: "rgba(0,0,0,0.1)",
          }}
        />

        <List sx={{ pt: 1 }}>
          {mainMenuItems.map((item) => (
            item.subItems ? (
              <React.Fragment key={item.label}>
                <ListItemButton
                  onClick={() => handleCollapseClick(item.label)}
                  sx={{
                    color: "rgba(0, 0, 0, 0.7)",
                    borderLeft: "4px solid transparent",
                    py: 1.5,
                    pl: 3,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                      color: theme.palette.primary.main,
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                    },
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.light + '1A',
                      color: theme.palette.primary.main,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                    },
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
                            color: "rgba(0, 0, 0, 0.6)",
                            borderLeft: "4px solid transparent",
                            "&.Mui-selected": {
                              backgroundColor: theme.palette.primary.light + '1A',
                              color: theme.palette.primary.main,
                              borderLeft: `4px solid ${theme.palette.primary.main}`,
                              "& .MuiListItemIcon-root": {
                                color: theme.palette.primary.main,
                              },
                            },
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                              color: theme.palette.primary.main,
                              "& .MuiListItemIcon-root": {
                                color: theme.palette.primary.main,
                              },
                            },
                            transition: "all 0.2s ease-in-out",
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
                      color: "rgba(0, 0, 0, 0.7)",
                      borderLeft: "4px solid transparent",
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.primary.light + '1A',
                        color: theme.palette.primary.main,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        "& .MuiListItemIcon-root": {
                          color: theme.palette.primary.main,
                        },
                      },
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                        color: theme.palette.primary.main,
                        "& .MuiListItemIcon-root": {
                          color: theme.palette.primary.main,
                        },
                      },
                      transition: "all 0.2s ease-in-out",
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
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            p: 3,
            minHeight: "calc(100vh - 64px - 24px - 48px)",
            mt: 2,
            mb: 2,
          }}
        >
          {/* Progress Cards Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
              gap: 3,
              mb: 4
            }}
          >
            {progressData.map((item, index) => (
              <ProgressCard key={index}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {item.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        sx={{ 
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            backgroundColor: '#FF6D00' // Changed to orange
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.progress}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.note}
                  </Typography>
                  {item.subNote && (
                    <Typography variant="caption" color="text.secondary">
                      {item.subNote}
                    </Typography>
                  )}
                </CardContent>
              </ProgressCard>
            ))}
          </Box>

          {/* Recent Activities Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Aktivitas Terkini
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Product Terteggi: Personalis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Notebook 90% perspecsation dengan performatoritask.
              </Typography>
            </CardContent>
          </Card>

          <Outlet />
        </Box>
      </Main>
    </Box>
  );
}

export function ToggleColorMode({ children }) {
  const [mode, setMode] = React.useState("light");

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode palette (Primary Orange)
                primary: {
                  main: "#FF6D00", // Bright orange primary
                  light: "#FF9E40", // Lighter orange
                  dark: "#E65100", // Darker orange
                  contrastText: "#fff",
                },
                secondary: {
                  main: "#FF9800", // Secondary orange
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
                // Dark mode palette (keep orange but darker)
                primary: {
                  main: "#FF6D00", // Orange primary for dark mode
                  light: "#FF9E40",
                  dark: "#E65100",
                  contrastText: "#fff",
                },
                secondary: {
                  main: "#FF9800", // Secondary orange
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
                transition: 'background-color 0.3s ease',
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