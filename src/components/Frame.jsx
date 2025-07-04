import React, { useState, useEffect, useContext } from 'react';

import {
  styled,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
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
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Avatar,
  Collapse,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Logout,
  Settings,
  Notifications,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import kaiLogo from "../assets/logokai.png"; // Pastikan path ini benar

const drawerWidth = 240;

// Styled component untuk Main content area
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
    minHeight: "100vh",
  })
);

// Styled component untuk AppBar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  // App Bar background: Orange for light mode, Blue for dark mode
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(to right, #1976d2, #2196f3)" // Blue gradient for dark mode
      : "linear-gradient(to right, #FF8C00, #FFA500)", // Orange gradient for light mode
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

// Styled component untuk Drawer Header
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  // Drawer Header background: consistent light grey for visibility
  background: '#F0F0F0', // A light grey to stand out slightly from the white sidebar body
  borderBottom: `1px solid rgba(0,0,0,0.1)`, // Consistent light border
}));

// Styled component untuk Notification Badge
const NotificationBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
    background: theme.palette.error.main,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[1], // Added subtle shadow for badge
  },
}));

// Create the context for color mode
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

/**
 * Frame Component
 * Ini adalah komponen layout utama yang mencakup AppBar, Drawer (Sidebar),
 * dan area konten utama.
 *
 * @param {Function} onLogout - Fungsi callback untuk menangani logout.
 */
export default function Frame({ onLogout }) { // Menerima onLogout sebagai prop
  const theme = useTheme();
  // Menggunakan useContext untuk mengakses fungsi toggleColorMode dari ColorModeContext
  const colorMode = React.useContext(ColorModeContext);
  const [open, setOpen] = React.useState(true); // State untuk mengontrol buka/tutup drawer
  const location = useLocation(); // Hook untuk mendapatkan informasi lokasi URL saat ini
  const [anchorEl, setAnchorEl] = React.useState(null); // State untuk mengontrol menu profil
  const [notifications] = React.useState(3); // State dummy untuk jumlah notifikasi
  // State untuk mengelola status buka/tutup sub-menu di sidebar
  const [openCollapse, setOpenCollapse] = React.useState({});

  const profile = Boolean(anchorEl); // Mengecek apakah menu profil sedang terbuka
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

  // Fungsi untuk mengelola buka/tutup collapse menu item
  const handleCollapseClick = (label) => {
    setOpenCollapse((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Definisi item menu utama untuk sidebar
  const mainMenuItems = [
    { to: "/", icon: <HomeIcon />, label: "Home", exact: true },
    { to: "/StockProduction", icon: <StorageIcon />, label: "Stock Production", badge: 2 },
    {
      label: "Manufacturing", // Kategori baru untuk item bersarang
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

  // Definisi item menu untuk navigasi atas
  const topNavItems = [
    { to: "/", label: "Home" },
    { to: "/StockProduction", label: "Stock" },
    { to: "/Produksi", label: "Produksi" },
    { to: "/Inventory", label: "Inventory" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* AppBar (Header) */}
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
          {/* Baris atas dengan tombol menu, judul, dan kontrol pengguna */}
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
              {/* Tombol untuk mengganti mode terang/gelap */}
              <Tooltip title="Toggle dark/light mode">
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === "dark" ? (
                    <Brightness7 />
                  ) : (
                    <Brightness4 />
                  )}
                </IconButton>
              </Tooltip>

              {/* Ikon Notifikasi dengan Badge */}
              <Tooltip title="Notifications">
                <IconButton color="inherit" aria-label={`Show ${notifications} new notifications`}>
                  <NotificationBadge badgeContent={notifications} color="error">
                    <Notifications />
                  </NotificationBadge>
                </IconButton>
              </Tooltip>

              {/* Avatar Pengguna dan Menu Profil */}
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
                      background:
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, #1976d2, #2196f3)" // Blue gradient for avatar in dark mode
                          : "linear-gradient(135deg, #FF8C00, #FFA500)", // Orange gradient for avatar in light mode
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

          {/* Running Teks / Marquee */}
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
              height: 28,
              display: "flex",
              alignItems: "center",
              borderBottom:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(0,0,0,0.15)",
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
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
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

          {/* Navigation links (Top Navbar) */}
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

          {/* Menu Dropdown untuk Profil */}
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
            {/* Perbaikan: Menambahkan onClick={onLogout} untuk tombol Logout */}
            <MenuItem onClick={() => { handleCloseProfile(); onLogout(); }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer (Sidebar) */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            // Sidebar background is now white regardless of theme mode
            background: "#FFFFFF", // Pure white background
            color: "rgba(0, 0, 0, 0.87)", // Dark text for readability on white background
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
            borderColor: "rgba(0,0,0,0.1)", // Light border for divider
          }}
        />

        {/* Daftar Menu Sidebar */}
        <List sx={{ pt: 1 }}>
          {mainMenuItems.map((item) => (
            item.subItems ? (
              <React.Fragment key={item.label}>
                <ListItemButton
                  onClick={() => handleCollapseClick(item.label)}
                  sx={{
                    color: "rgba(0, 0, 0, 0.7)", // Default text color for main items
                    borderLeft: "4px solid transparent",
                    py: 1.5,
                    pl: 3,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)", // Subtle hover effect
                      color: theme.palette.primary.main, // Primary color on hover
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main, // Primary color for icon on hover
                      },
                    },
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.light + '1A', // Light primary with transparency for selected background
                      color: theme.palette.primary.main, // Primary color for selected text
                      borderLeft: `4px solid ${theme.palette.primary.main}`, // Primary color border for selected item
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main, // Primary color for selected icon
                      },
                    },
                  }}
                  // Menentukan apakah item utama ini harus 'selected'
                  // Ini akan true jika salah satu sub-itemnya cocok dengan pathname
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
                            pl: 6, // Increased padding for sub-items
                            color: "rgba(0, 0, 0, 0.6)", // Default text color for sub-items
                            borderLeft: "4px solid transparent",
                            "&.Mui-selected": {
                              backgroundColor: theme.palette.primary.light + '1A', // Light primary with transparency for selected background
                              color: theme.palette.primary.main, // Primary color for selected text
                              borderLeft: `4px solid ${theme.palette.primary.main}`, // Primary color border for selected item
                              "& .MuiListItemIcon-root": {
                                color: theme.palette.primary.main, // Primary color for selected icon
                              },
                            },
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)", // Subtle hover effect for sub-items
                              color: theme.palette.primary.main, // Primary color on hover
                              "& .MuiListItemIcon-root": {
                                color: theme.palette.primary.main, // Primary color for icon on hover
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
                              fontSize: "0.85rem", // Slightly smaller font for sub-items
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
                      color: "rgba(0, 0, 0, 0.7)", // Default text color for main items
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

      {/* Main Content Area */}
      <Main open={open}>
        <DrawerHeader /> {/* Ini untuk memberikan padding agar konten tidak tertutup AppBar */}
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 3, // Increased shadow for more depth
            p: 3,
            minHeight: "calc(100vh - 64px - 24px - 48px)", // Adjusted height for better fit and bottom margin
            mt: 2, // Added top margin for content box
            mb: 2, // Added bottom margin for content box
          }}
        >
          {/* INI PERBAIKAN PENTING: Menggunakan <Outlet /> untuk merender rute anak */}
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
}

/**
 * ToggleColorMode Component
 * Ini adalah Context Provider yang menyediakan tema Material-UI dan fungsi
 * untuk mengganti mode warna (terang/gelap) ke seluruh aplikasi.
 *
 * @param {React.ReactNode} children - Komponen anak yang akan menerima konteks tema.
 */
export function ToggleColorMode({ children }) {
  const [mode, setMode] = React.useState("light"); // Default ke light mode

  // Memoize objek colorMode untuk mencegah re-render yang tidak perlu
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  // Memoize pembuatan tema untuk mencegah re-render yang tidak perlu
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode, // Set mode palet secara dinamis
          ...(mode === "light"
            ? {
                // Palet mode terang (Primary Orange)
                primary: {
                  main: "#FFA500", // Orange primary untuk light mode
                  contrastText: "#fff", // Memastikan teks di atas primary berwarna putih
                },
                secondary: {
                  main: "#ff9800", // Secondary disesuaikan untuk orange
                },
                background: {
                  default: '#f0f2f5', // Background lebih terang untuk light mode
                  paper: '#ffffff',
                },
                text: {
                  primary: 'rgba(0, 0, 0, 0.87)',
                  secondary: 'rgba(0, 0, 0, 0.6)',
                }
              }
            : {
                // Palet mode gelap (Primary Blue)
                primary: {
                  main: "#1976d2", // Blue primary untuk dark mode
                  contrastText: "#fff", // Memastikan teks di atas primary berwarna putih
                },
                secondary: {
                  main: "#2196f3", // Secondary disesuaikan untuk blue
                },
                background: {
                  default: "#121212", // Background gelap
                  paper: "#1E1E1E", // Background paper lebih gelap
                },
                text: {
                  primary: 'rgba(255, 255, 255, 0.87)',
                  secondary: 'rgba(255, 255, 255, 0.6)',
                }
              }),
        },
        // Anda bisa menambahkan properti tema lainnya di sini seperti typography, shadows, dll.
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease', // Transisi halus untuk background
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)', // Subtle shadow on selected item
                },
              },
            },
          },
        },
      }),
    [mode], // Tema akan dibuat ulang hanya jika mode berubah
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}