import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Avatar,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  Badge,
  CircularProgress,
  Zoom,
  Fade,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fab
} from '@mui/material';
import {
  Storage as StorageIcon,
  Factory as FactoryIcon,
  Build as OverhaulIcon,
  Engineering as RekayasaIcon,
  Science as KalibrasiIcon,
  Inventory2 as InventoryIcon,
  People as PersonaliaIcon,
  Verified as QualityIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Palette as PaletteIcon,
  DragIndicator as DragIndicatorIcon,
  WbSunny as WbSunnyIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

// Custom styled components with enhanced effects
const ProgressCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.01)',
    boxShadow: theme.shadows[10],
    '&::before': {
      opacity: 0.1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  cursor: 'pointer',
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: alpha(theme.palette.grey[500], 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    transition: 'width 1s ease-in-out',
    boxShadow: theme.shadows[1],
  },
}));

const StatusBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  fontWeight: 'bold',
  fontSize: '0.65rem',
  padding: '4px 8px',
  borderRadius: 12,
  boxShadow: theme.shadows[1],
  zIndex: 1,
  backdropFilter: 'blur(4px)',
  background: alpha(theme.palette.background.paper, 0.8),
  animation: 'fadeIn 0.5s ease-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'scale(0.8)' },
    '100%': { opacity: 1, transform: 'scale(1)' },
  },
}));

const GlowEffect = styled('div')(({ color }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  background: `radial-gradient(circle at center, ${alpha(color, 0.1)} 0%, transparent 70%)`,
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.7,
}));

// Mock data
const initialDashboardData = [
  {
    id: 1,
    title: 'Overhaul Point Machine',
    progress: 65,
    status: 'warning',
    note: 'Custom 65%',
    subNote: 'Beberapa komponen memerlukan penggantian yang tertunda.',
    color: '#FF6D00',
    icon: <OverhaulIcon />,
    lastUpdated: new Date(Date.now() - 3600000),
    history: [45, 50, 55, 60, 63, 65, 66, 68, 65],
    priority: 'high',
    manager: 'Asep Sutisna',
    teamSize: 8,
    startDate: '2024-01-15',
    endDate: '2025-12-31',
  },
  {
    id: 2,
    title: 'Stock Production',
    progress: 78,
    status: 'normal',
    note: 'Custom 78%',
    subNote: 'Inventaris bahan baku mencukupi untuk 3 bulan ke depan.',
    color: '#43A047',
    icon: <StorageIcon />,
    lastUpdated: new Date(Date.now() - 7200000),
    history: [60, 65, 68, 72, 75, 78, 79, 78, 77],
    priority: 'medium',
    manager: 'Ade Prasetyo',
    teamSize: 12,
    startDate: '2024-03-01',
    endDate: '2025-10-30',
  },
  {
    id: 3,
    title: 'RingKasan Produksi',
    progress: 75,
    status: 'info',
    note: 'Total Progress: 75%',
    subNote: 'Y28 progress actuals are not actual locations in data collected and cannot detect remote.',
    color: '#1976D2',
    icon: <FactoryIcon />,
    lastUpdated: new Date(),
    history: [50, 55, 60, 65, 70, 75, 74, 76, 75],
    priority: 'medium',
    manager: 'Budi Santoso',
    teamSize: 15,
    startDate: '2024-02-20',
    endDate: '2025-11-15',
  },
  {
    id: 4,
    title: 'Produksi Radio Lokomotif',
    progress: 81,
    status: 'normal',
    note: 'Custom 81%',
    subNote: 'Pengujian kualitas akhir sedang dilakukan untuk batch terbaru.',
    color: '#7B1FA2',
    icon: <FactoryIcon />,
    lastUpdated: new Date(Date.now() - 10800000),
    history: [65, 68, 72, 75, 78, 81, 82, 81, 80],
    priority: 'low',
    manager: 'tomi setiawan',
    teamSize: 10,
    startDate: '2024-04-10',
    endDate: '2025-09-01',
  },
  {
    id: 5,
    title: 'Personalia',
    progress: 92,
    status: 'success',
    note: 'Custom 92%',
    subNote: 'Departemen personalia telah mencapai target rekrutmen tahunan.',
    color: '#0288D1',
    icon: <PersonaliaIcon />,
    lastUpdated: new Date(),
    history: [80, 83, 85, 88, 90, 92, 93, 92, 91],
    priority: 'low',
    manager: 'Hendri Wijaya',
    teamSize: 6,
    startDate: '2024-01-01',
    endDate: '2025-06-30',
  },
  {
    id: 6,
    title: 'Products! Way Station',
    progress: 63,
    status: 'warning',
    note: 'Custom 63%',
    subNote: 'Keterlambatan pengiriman bahan baku dari pemasok utama.',
    color: '#5D4037',
    icon: <InventoryIcon />,
    lastUpdated: new Date(Date.now() - 86400000),
    history: [50, 52, 55, 58, 60, 63, 62, 64, 63],
    priority: 'high',
    manager: 'maman suryaman',
    teamSize: 9,
    startDate: '2024-05-20',
    endDate: '2025-12-10',
  },
  {
    id: 7,
    title: 'Quality Control',
    progress: 81,
    status: 'normal',
    note: 'Custom 81%',
    subNote: 'Audit internal kualitas menunjukkan hasil yang memuaskan.',
    color: '#D32F2F',
    icon: <QualityIcon />,
    lastUpdated: new Date(),
    history: [70, 72, 75, 78, 80, 81, 82, 81, 80],
    priority: 'medium',
    manager: 'Rina Kusuma',
    teamSize: 11,
    startDate: '2024-03-10',
    endDate: '2025-08-20',
  },
];

const initialRecentActivities = [
  {
    id: 1,
    title: 'Aktivitas Terkini',
    product: 'Terteggi: Personalis',
    description: 'Notebook 905; perspectation dengan performatoritask.',
    lastUpdated: new Date(),
    type: 'update',
  },
  {
    id: 2,
    title: 'Peringatan Sistem',
    product: 'Quality Control',
    description: 'Pemeriksaan kualitas batch #2456 memerlukan verifikasi tambahan.',
    lastUpdated: new Date(Date.now() - 3600000),
    type: 'alert',
  },
  {
    id: 3,
    title: 'Pencapaian',
    product: 'Personalia',
    description: 'Tim Personalia mencapai target rekrutmen bulan ini lebih awal.',
    lastUpdated: new Date(Date.now() - 7200000),
    type: 'achievement',
  },
  {
    id: 4,
    title: 'Update Progress',
    product: 'Stock Production',
    description: 'Progress Stock Production meningkat 3% menjadi 78%.',
    lastUpdated: new Date(Date.now() - 10800000),
    type: 'update',
  },
  {
    id: 5,
    title: 'Peringatan Sistem',
    product: 'Overhaul Point Machine',
    description: 'Perlu perhatian segera: Penggantian komponen tertunda.',
    lastUpdated: new Date(Date.now() - 14400000),
    type: 'alert',
  },
];

const priorityMap = {
  high: { color: 'error', icon: <WarningIcon fontSize="small" /> },
  medium: { color: 'warning', icon: <StarIcon fontSize="small" /> },
  low: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
};

export default function EnhancedDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [recentActivities, setRecentActivities] = useState(initialRecentActivities);
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');

  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const openMoreMenu = Boolean(moreAnchorEl);

  const handleMoreMenuClick = (event, item) => {
    setSelectedItem(item);
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDialogOpen = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 300);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data fetch and update
    setTimeout(() => {
      const updatedData = dashboardData.map(item => ({
        ...item,
        progress: Math.min(100, item.progress + Math.floor(Math.random() * 5) - 1), // Simulate slight progress change
        lastUpdated: new Date(),
        history: [...item.history.slice(-5), Math.min(100, item.progress + Math.floor(Math.random() * 5) - 1)] // Add new history point
      }));
      setDashboardData(updatedData);

      const newActivity = {
        id: recentActivities.length + 1,
        title: 'Update Progress Otomatis',
        product: updatedData[Math.floor(Math.random() * updatedData.length)].title,
        description: `Beberapa proyek telah diperbarui secara otomatis.`,
        lastUpdated: new Date(),
        type: 'update',
      };
      setRecentActivities(prev => [newActivity, ...prev].slice(0, 5)); // Keep latest 5

      setLoading(false);
      setNotifications(prev => prev + 1); // Simulate new notification on refresh
    }, 1200);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
    // This would typically trigger a change in your theme context
    // For this example, we'll just toggle the local state.
    // In a real app, you'd call a function provided by your theme context, e.g., toggleColorMode().
    console.log("Toggling theme (requires theme context implementation)");
  };

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredData = dashboardData.filter(item =>
    item.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    item.manager.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Categorize data by status
  const categorizedData = {
    all: filteredData,
    warning: filteredData.filter(item => item.status === 'warning'),
    normal: filteredData.filter(item => item.status === 'normal'),
    success: filteredData.filter(item => item.status === 'success'),
    info: filteredData.filter(item => item.status === 'info'), // Added info category
  };

  useEffect(() => {
    // Simulate periodic updates
    const interval = setInterval(() => {
      if (!loading && Math.random() > 0.7) { // Randomly trigger refresh
        handleRefresh();
      }
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [loading]);

  const FAB_SX = {
    position: 'fixed',
    bottom: 16,
    right: 16,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': { transform: 'scale(0.9)', boxShadow: '0 0 0 0 rgba(0,0,0,0.7)' },
      '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(0,0,0,0)' },
      '100%': { transform: 'scale(0.9)', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
    },
    zIndex: 1000,
  };

  return (
    <Box sx={{
      p: { xs: 1, sm: 3 },
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
      backgroundImage: theme.palette.mode === 'dark'
        ? 'linear-gradient(rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.9))'
        : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
    }}>
      {/* Header Section with animated gradient */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={4}
        p={3}
        borderRadius={3}
        sx={{
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          boxShadow: theme.shadows[4],
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`
              : `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
            animation: 'shimmer 3s infinite',
            zIndex: 0,
          },
        }}
      >
        <Box position="relative" zIndex={1}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight="bold"
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#fff',
              mb: 1,
              textShadow: theme.shadows[1],
            }}
          >
            Dashboard Produksi
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : alpha('#fff', 0.9),
            }}
          >
            Ringkasan progress produksi dan aktivitas terkini
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          width={{ xs: '100%', md: 'auto' }}
          mt={{ xs: 2, md: 0 }}
          position="relative"
          zIndex={1}
        >
          <TextField
            size="small"
            placeholder="Cari proyek atau manajer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              mr: 2,
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : alpha('#fff', 0.9),
                borderRadius: 3,
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : alpha(theme.palette.primary.main, 0.3),
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : alpha(theme.palette.primary.main, 0.5),
                },
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.text.primary,
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{
                color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : alpha(theme.palette.primary.main, 0.7),
                mr: 1
              }} />,
            }}
          />
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              color="inherit"
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : alpha('#fff', 0.9),
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : alpha('#fff', 0.8),
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />
              ) : (
                <RefreshIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <Badge
              badgeContent={notifications}
              color="error"
              overlap="circular"
              sx={{ ml: 1 }}
            >
              <IconButton
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : alpha('#fff', 0.9),
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : alpha('#fff', 0.8),
                  },
                }}
              >
                <NotificationsIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />
              </IconButton>
            </Badge>
          </Tooltip>
          <Tooltip title="Toggle Theme">
            <IconButton
              onClick={handleToggleTheme}
              sx={{
                ml: 1,
                backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : alpha('#fff', 0.9),
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : alpha('#fff', 0.8),
                },
              }}
            >
              {isDarkMode ? (
                <WbSunnyIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />
              ) : (
                <DarkModeIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </Box>

      {/* Tabs for filtering */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: 2,
            },
          }}
        >
          <Tab label="Semua" sx={{ minWidth: 'unset', px: 2 }} />
          <Tab
            label="Perhatian"
            icon={<WarningIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minWidth: 'unset', px: 2 }}
          />
          <Tab
            label="Normal"
            icon={<CheckCircleIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minWidth: 'unset', px: 2 }}
          />
          <Tab
            label="Sukses"
            icon={<StarIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minWidth: 'unset', px: 2 }}
          />
          <Tab
            label="Informasi"
            icon={<InfoIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minWidth: 'unset', px: 2 }}
          />
        </Tabs>
      </Box>

      {/* Progress Cards with animated entrance */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Fade in={!loading} timeout={500}>
          <Grid container spacing={3}>
            <AnimatePresence mode="wait">
              {(tabValue === 0 ? categorizedData.all :
                tabValue === 1 ? categorizedData.warning :
                  tabValue === 2 ? categorizedData.normal :
                    tabValue === 3 ? categorizedData.success :
                      categorizedData.info).map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                            onClick={() => handleDialogOpen(item)}
                          >
                            <ProgressCard>
                              <GlowEffect color={item.color} />
                              <StatusBadge
                                label={
                                  item.status === 'warning' ? 'Perhatian' :
                                    item.status === 'success' ? 'Sukses' :
                                      item.status === 'info' ? 'Informasi' : 'Normal'
                                }
                                color={
                                  item.status === 'warning' ? 'error' :
                                    item.status === 'success' ? 'success' :
                                      item.status === 'info' ? 'info' : 'primary'
                                }
                                sx={{
                                  backgroundColor:
                                    item.status === 'warning' ? alpha(theme.palette.error.main, 0.2) :
                                      item.status === 'success' ? alpha(theme.palette.success.main, 0.2) :
                                        item.status === 'info' ? alpha(theme.palette.info.main, 0.2) :
                                          alpha(theme.palette.primary.main, 0.2),
                                  color:
                                    item.status === 'warning' ? theme.palette.error.main :
                                      item.status === 'success' ? theme.palette.success.main :
                                        item.status === 'info' ? theme.palette.info.main :
                                          theme.palette.primary.main,
                                }}
                              />
                              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                  <Avatar sx={{
                                    bgcolor: item.color,
                                    color: '#fff',
                                    mr: 2,
                                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 10px ${alpha(item.color, 0.5)}`,
                                  }}>
                                    {item.icon}
                                  </Avatar>
                                  <Box flexGrow={1}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                      {item.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                      {priorityMap[item.priority].icon}
                                      <Box component="span" ml={0.5}>{item.manager}</Box>
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    onClick={(e) => { e.stopPropagation(); handleMoreMenuClick(e, item); }}
                                    size="small"
                                  >
                                    <MoreIcon />
                                  </IconButton>
                                </Box>

                                {/* Mini sparkline chart */}
                                <Box sx={{ height: 40, mb: 1 }}>
                                  <Sparklines data={item.history} width={100} height={40}>
                                    <SparklinesLine
                                      color={item.color}
                                      style={{ strokeWidth: 2, fill: alpha(item.color, 0.2) }}
                                    />
                                    <SparklinesSpots />
                                  </Sparklines>
                                </Box>

                                <Box mb={2}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="body2" color="text.secondary">
                                      {item.note}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: item.color }}>
                                      {item.progress}%
                                    </Typography>
                                  </Box>
                                  <ProgressBar
                                    variant="determinate"
                                    value={item.progress}
                                    sx={{
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: item.color,
                                      },
                                    }}
                                  />
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Chip
                                    label={`${item.teamSize} anggota`}
                                    size="small"
                                    variant="outlined"
                                    icon={<PersonaliaIcon fontSize="small" />}
                                    sx={{
                                      borderColor: alpha(theme.palette.grey[500], 0.2),
                                      backgroundColor: alpha(theme.palette.grey[500], 0.05),
                                    }}
                                  />
                                  <Chip
                                    label={item.priority === 'high' ? 'Tinggi' : item.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                    size="small"
                                    color={priorityMap[item.priority].color}
                                    icon={priorityMap[item.priority].icon}
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              </CardContent>
                            </ProgressCard>
                          </motion.div>
                        </Grid>
                      ))}
            </AnimatePresence>

            {/* Recent Activities Section */}
            <Grid item xs={12} md={6} lg={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
                      <NotificationsIcon sx={{ mr: 1, color: theme.palette.warning.main }} /> Aktivitas Terkini
                    </Typography>

                    <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                      <AnimatePresence>
                        {recentActivities.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                borderLeft: `4px solid ${
                                  activity.type === 'alert' ? theme.palette.error.main :
                                    activity.type === 'achievement' ? theme.palette.success.main :
                                      theme.palette.primary.main
                                  }`,
                                backgroundColor: alpha(
                                  activity.type === 'alert' ? theme.palette.error.main :
                                    activity.type === 'achievement' ? theme.palette.success.main :
                                      theme.palette.primary.main,
                                  0.05
                                ),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(5px)',
                                  boxShadow: theme.shadows[1],
                                },
                              }}
                            >
                              <Box display="flex" alignItems="flex-start">
                                <Avatar sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 2,
                                  bgcolor:
                                    activity.type === 'alert' ? alpha(theme.palette.error.main, 0.1) :
                                      activity.type === 'achievement' ? alpha(theme.palette.success.main, 0.1) :
                                        alpha(theme.palette.primary.main, 0.1),
                                  color:
                                    activity.type === 'alert' ? theme.palette.error.main :
                                      activity.type === 'achievement' ? theme.palette.success.main :
                                        theme.palette.primary.main,
                                }}>
                                  {activity.type === 'alert' ? <WarningIcon fontSize="small" /> :
                                    activity.type === 'achievement' ? <StarIcon fontSize="small" /> :
                                      <NotificationsIcon fontSize="small" />}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {activity.product}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                                    {activity.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                    {activity.lastUpdated.toLocaleTimeString()} - {activity.lastUpdated.toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Floating Action Button for Add Project */}
      <Fab
        color="primary"
        aria-label="add"
        sx={FAB_SX}
        onClick={() => alert("Add New Project functionality would go here!")}
        component={motion.div}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AddIcon />
      </Fab>

      {/* More Options Menu */}
      <Menu
        anchorEl={moreAnchorEl}
        open={openMoreMenu}
        onClose={handleMoreMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleDialogClose(); handleDialogOpen(selectedItem); handleMoreMenuClose(); }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lihat Detail</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { alert(`Edit ${selectedItem?.title}`); handleMoreMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Proyek</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { alert(`Hapus ${selectedItem?.title}`); handleMoreMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hapus Proyek</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { alert(`Bagikan ${selectedItem?.title}`); handleMoreMenuClose(); }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bagikan</ListItemText>
        </MenuItem>
      </Menu>

      {/* Animated Detail Dialog */}
      <AnimatePresence>
        {selectedItem && (
          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Zoom}
            PaperProps={{
              sx: {
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 10px 30px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            <DialogTitle sx={{
              bgcolor: alpha(selectedItem.color, 0.2),
              color: selectedItem.color,
              borderBottom: `1px solid ${alpha(selectedItem.color, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{
                    bgcolor: selectedItem.color,
                    color: '#fff',
                    mr: 2,
                    boxShadow: `0 0 10px ${alpha(selectedItem.color, 0.5)}`,
                  }}>
                    {selectedItem.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedItem.title}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      {priorityMap[selectedItem.priority].icon}
                      <Box component="span" ml={0.5}>{selectedItem.manager}</Box>
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={handleDialogClose}
                  sx={{
                    color: selectedItem.color,
                    '&:hover': {
                      backgroundColor: alpha(selectedItem.color, 0.1),
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box
                position="absolute"
                top={0}
                right={0}
                width="50%"
                height="100%"
                sx={{
                  background: `linear-gradient(90deg, transparent, ${alpha(selectedItem.color, 0.05)})`,
                  opacity: 0.3,
                  zIndex: 0,
                }}
              />
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight="medium" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{
                    width: 8,
                    height: 8,
                    bgcolor: selectedItem.color,
                    borderRadius: '50%',
                    mr: 1
                  }} />
                  Progress Detail
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box flexGrow={1} mr={2}>
                    <ProgressBar
                      variant="determinate"
                      value={selectedItem.progress}
                      sx={{
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: selectedItem.color,
                          boxShadow: `0 0 8px ${alpha(selectedItem.color, 0.5)}`,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: selectedItem.color }}>
                    {selectedItem.progress}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedItem.note}
                </Typography>
                {selectedItem.subNote && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {selectedItem.subNote}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="medium" mb={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{
                      width: 8,
                      height: 8,
                      bgcolor: selectedItem.color,
                      borderRadius: '50%',
                      mr: 1
                    }} />
                    Informasi Tim
                  </Typography>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.05),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Manajer
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedItem.manager}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ukuran Tim
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedItem.teamSize} orang
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Prioritas
                        </Typography>
                        <Chip
                          label={
                            selectedItem.priority === 'high' ? 'Tinggi' :
                              selectedItem.priority === 'medium' ? 'Sedang' : 'Rendah'
                          }
                          size="small"
                          color={priorityMap[selectedItem.priority].color}
                          icon={priorityMap[selectedItem.priority].icon}
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Status
                        </Typography>
                        <Chip
                          label={
                            selectedItem.status === 'warning' ? 'Perhatian' :
                              selectedItem.status === 'success' ? 'Sukses' :
                                selectedItem.status === 'info' ? 'Informasi' : 'Normal'
                          }
                          size="small"
                          color={
                            selectedItem.status === 'warning' ? 'error' :
                              selectedItem.status === 'success' ? 'success' :
                                selectedItem.status === 'info' ? 'info' : 'primary'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Tanggal Mulai
                        </Typography>
                        <Typography variant="body2">
                          {selectedItem.startDate}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Tanggal Berakhir
                        </Typography>
                        <Typography variant="body2">
                          {selectedItem.endDate}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="medium" mb={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{
                      width: 8,
                      height: 8,
                      bgcolor: selectedItem.color,
                      borderRadius: '50%',
                      mr: 1
                    }} />
                    Progress History
                  </Typography>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.05),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
                      <Sparklines data={selectedItem.history} width={200} height={80}>
                        <SparklinesLine
                          color={selectedItem.color}
                          style={{
                            strokeWidth: 3,
                            fill: alpha(selectedItem.color, 0.2),
                            filter: `drop-shadow(0 0 5px ${alpha(selectedItem.color, 0.3)})`,
                          }}
                        />
                        <SparklinesSpots size={3} spotColors={{
                          '-1': theme.palette.error.main,
                          '0': theme.palette.info.main,
                          '1': theme.palette.success.main
                        }} />
                      </Sparklines>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Awal: {selectedItem.history[0]}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sekarang: {selectedItem.history[selectedItem.history.length - 1]}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" textAlign="right" mt={1}>
                      Terakhir Diupdate: {selectedItem.lastUpdated.toLocaleDateString()} {selectedItem.lastUpdated.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{
              p: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              justifyContent: 'space-between',
            }}>
              <Button
                onClick={handleDialogClose}
                variant="outlined"
                color="inherit"
                sx={{ borderRadius: 2 }}
              >
                Tutup
              </Button>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: 2, mr: 1 }}
                  onClick={() => alert(`Edit ${selectedItem.title}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PersonAddIcon />}
                  sx={{ borderRadius: 2 }}
                  onClick={() => alert(`Tambah Anggota ke ${selectedItem.title}`)}
                >
                  Tambah Anggota
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  );
}

// Custom hook for debouncing search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}