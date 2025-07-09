import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  // LinearProgress, // We will re-add LinearProgress for the dialog, but keep it commented for the card itself
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
  CircularProgress, // Keep CircularProgress for the card
  Zoom,
  Fade,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  List, // Added List import for notifications
  ListItem, // Added ListItem import for notifications
  ListItemIcon,
  ListItemText,
  Fab,
  LinearProgress // Re-added LinearProgress import for dialog
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const progressData = [
  { id: 1, title: "Overhaul Point Machine", progress: 65, icon: <OverhaulIcon />, color: "#4CAF50" , note: "Proses perbaikan dan pemeliharaan mesin." },
  { id: 2, title: "Stock Production", progress: 78, icon: <StorageIcon />, color: "#2196F3", note: "Data stok bahan baku dan produk jadi." },
  { id: 3, title: "Ringkasan Produksi", progress: 75, icon: <FactoryIcon />, color: "#FFC107", note: "Ringkasan tentang produksi dan efisiensi." },
  { id: 4, title: "Produksi Radio Lokomotif", progress: 81, icon: <FactoryIcon />, color: "#9C27B0", note: "Ringkasan tentang Produksi Radio Lokomotif" },
  { id: 5, title: "Personalia", progress: 92, icon: <PersonaliaIcon />, color: "#FF5722" , note: "Data karyawan dan manajemen sumber daya manusia." },
  { id: 6, title: "Products! Way Station", progress: 63, icon: <StorageIcon />, color: "#00BCD4", note: "Data produk dan inventaris di stasiun." },
  { id: 7, title: "Quality Control", progress: 81, icon: <QualityIcon />, color: "#795548", note: "Proses dan standar kontrol kualitas." },
];

const activityData = [
  {
    id: 1,
    title: "Product Tertinggi: Personalis",
    description: "Notebook 90% dengan performitoritas.",
    timestamp: "2 Jam lalu",
    type: "update",
    icon: <CheckCircleIcon color="success" />,
  },
  {
    id: 2,
    title: "Perbaikan Mesin A",
    description: "Membutuhkan penggantian komponen utama.",
    timestamp: "4 Jam lalu",
    type: "warning",
    icon: <WarningIcon color="warning" />,
  },
  {
    id: 3,
    title: "Inspeksi Kualitas",
    description: "Laporan inspeksi bulan ini telah selesai.",
    timestamp: "1 Jam lalu",
    type: "info",
    icon: <InfoIcon color="info" />,
  },
  {
    id: 4,
    title: "Proyek Kalibrasi Baru",
    description: "Proyek kalibrasi instrumen baru dimulai.",
    timestamp: "3 Hari lalu",
    type: "new",
    icon: <AddIcon color="primary" />,
  },
  {
    id: 5,
    title: "Penambahan Stok Baut",
    description: "500 unit baut baru telah ditambahkan ke inventori.",
    timestamp: "1 Minggu lalu",
    type: "update",
    icon: <StorageIcon color="action" />,
  },
];

function ProgressCard({ title, progress, icon, color, note, onClick }) {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: onClick ? "pointer" : "default",
          transition: "all 0.3s ease-in-out",
          overflow: 'hidden',
          position: 'relative',
          borderBottom: `4px solid ${color || theme.palette.primary.main}`,
        }}
        onClick={onClick}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
              {title}
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={48}
                thickness={5}
                sx={{
                  color: color || theme.palette.primary.main,
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            </Box>
          </Box>
          {note && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Note: {note}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActivityItem({ activity }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));

  const activityVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={activityVariant}
      initial="hidden"
      animate="visible"
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: theme.palette.background.paper,
          borderLeft: `5px solid ${
            activity.type === 'update' ? theme.palette.info.main :
            activity.type === 'warning' ? theme.palette.warning.main :
            activity.type === 'info' ? theme.palette.primary.main :
            theme.palette.success.main
          }`,
        }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.grey[100],
            color: theme.palette.text.secondary,
            boxShadow: theme.shadows[1],
          }}
        >
          {activity.icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {activity.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activity.description}
          </Typography>
        </Box>
        {isLargeScreen && (
          <Chip
            label={activity.timestamp}
            size="small"
            color="default"
            sx={{
              ml: 'auto',
              fontWeight: 'medium',
              bgcolor: theme.palette.grey[50],
            }}
          />
        )}
      </Paper>
    </motion.div>
  );
}


export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState(0); // This state seems unused, consider removing if not needed.

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event, newValue) => {
    setFilterType(newValue);
  };

  const filteredActivities = activityData.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const topPerformer = {
    name: "Mochammad N",
    role: "Manajer Produksi",
    avatar: "/path/to/avatar.jpg", // Replace with actual avatar path
    achievements: "Meningkatkan efisiensi lini produksi sebesar 15%",
    score: 4.8,
  };

  const recentNotifications = [
    { id: 1, message: "Perbaikan darurat pada mesin X selesai.", time: "5 menit lalu", type: "success" },
    { id: 2, message: "Stok bahan baku kritis: Pesan segera!", time: "30 menit lalu", type: "warning" },
    { id: 3, message: "Laporan bulanan siap diunduh.", time: "1 jam lalu", type: "info" },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Produksi
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {progressData.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <ProgressCard
              title={item.title}
              progress={item.progress}
              icon={item.icon}
              color={item.color}
              note={item.note}
              onClick={() => handleCardClick(item)}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Aktivitas Terkini Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Aktivitas Terkini
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Cari aktivitas..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
                <Tabs
                  value={filterType}
                  onChange={handleFilterChange}
                  aria-label="activity filter tabs"
                  indicatorColor="primary"
                  textColor="primary"
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons="auto"
                >
                  <Tab label="Semua" value="all" />
                  <Tab label="Update" value="update" />
                  <Tab label="Peringatan" value="warning" />
                  <Tab label="Info" value="info" />
                </Tabs>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <AnimatePresence mode="wait">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Tidak ada aktivitas yang ditemukan.
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </Grid>

        {/* Right Sidebar - Top Performer & Notifications */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Top Performer
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={topPerformer.avatar}
                sx={{ width: 60, height: 60, mr: 2, boxShadow: theme.shadows[2] }}
              >
                {topPerformer.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {topPerformer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topPerformer.role}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <StarIcon sx={{ verticalAlign: 'middle', fontSize: '1rem', color: '#FFD700', mr: 0.5 }} />
              Pencapaian: {topPerformer.achievements}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Rating: <Chip label={topPerformer.score} color="primary" size="small" />
            </Typography>
            <Button variant="contained" color="primary" fullWidth sx={{ borderRadius: 2 }}>
              Lihat Profil Lengkap
            </Button>
          </Paper>

          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Notifikasi Terbaru
            </Typography>
            <List>
              {recentNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" aria-label="close">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      {notification.type === 'success' && <CheckCircleIcon color="success" />}
                      {notification.type === 'warning' && <WarningIcon color="warning" />}
                      {notification.type === 'info' && <InfoIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium">
                          {notification.message}
                        </Typography>
                      }
                      secondary={notification.time}
                      primaryTypographyProps={{ noWrap: false }}
                    />
                  </ListItem>
                  <Divider light />
                </React.Fragment>
              ))}
            </List>
            <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2, borderRadius: 2 }}>
              Lihat Semua Notifikasi
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <AnimatePresence>
        {openDialog && selectedItem && (
          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            aria-labelledby="card-details-title"
            aria-describedby="card-details-description"
            maxWidth="sm"
            fullWidth
            TransitionComponent={Zoom}
            PaperProps={{
              sx: { borderRadius: 3, overflow: 'hidden' },
            }}
          >
            <DialogTitle
              id="card-details-title"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                px: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedItem.title}
              </Typography>
              <IconButton onClick={handleDialogClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: selectedItem.color, mr: 2, width: 56, height: 56 }}>
                  {selectedItem.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: selectedItem.color }}>
                    {selectedItem.title}
                  </Typography>
                  {/* Keep the progress percentage in the dialog */}
                  <Typography variant="body1" color="text.secondary">
                    Progress Global: {selectedItem.progress}%
                  </Typography>
                </Box>
              </Box>
              {/* Keep LinearProgress in the dialog */}
              <LinearProgress
                variant="determinate"
                value={selectedItem.progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  mb: 3,
                  backgroundColor: theme.palette.grey[200],
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: selectedItem.color,
                    borderRadius: 6,
                  },
                }}
              />
              {selectedItem.note && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                  Catatan: {selectedItem.note}
                </Typography>
              )}

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom>
                Detail Aktivitas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                    <Chip
                      label={selectedItem.progress < 100 ? "Sedang Berlangsung" : "Selesai"}
                      color={selectedItem.progress < 100 ? "warning" : "success"}
                      size="small"
                      sx={{ mt: 0.5, fontWeight: 'bold' }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Tenggat Waktu:</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      31 Desember 2025
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Deskripsi:</Typography>
                    <Typography variant="body1">
                      Detail lebih lanjut mengenai {selectedItem.title}. Ini bisa mencakup daftar tugas,
                      tim yang terlibat, riwayat pembaruan, dan data relevan lainnya.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                p: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
                justifyContent: 'space-between',
              }}
            >
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