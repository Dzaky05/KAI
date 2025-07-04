import React, { useState } from 'react';
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
  CircularProgress // Added CircularProgress for loading indicator
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
  Close as CloseIcon // Added CloseIcon for dialog
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Styled Components
const IconWrapper = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  marginRight: theme.spacing(2),
  color: '#fff',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  boxShadow: theme.shadows[3],
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[6],
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    transition: 'width 0.8s ease-in-out',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  '&:hover': {
    boxShadow: theme.shadows[12],
    transform: 'translateY(-5px)',
  },
  position: 'relative',
  overflow: 'visible',
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  position: 'absolute',
  top: -10,
  right: 10,
  fontWeight: 'bold',
  fontSize: '0.75rem',
  padding: '4px 8px',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: status === 'delayed' ? theme.palette.error.main :
    status === 'updated' ? theme.palette.success.main :
      theme.palette.warning.main,
  color: theme.palette.getContrastText(
    status === 'delayed' ? theme.palette.error.main :
      status === 'updated' ? theme.palette.success.main :
        theme.palette.warning.main
  ),
  boxShadow: theme.shadows[3],
  textTransform: 'uppercase',
}));

// Animation Components
const AnimatedGridItem = motion(Grid);

// Department Data with Extended Information
const departments = [
  {
    id: 1,
    title: 'Stock Production',
    icon: <StorageIcon />,
    color: '#43a047',
    progress: 82,
    update: '1 hour ago',
    status: 'updated',
    totalEmployees: 24,
    available: 20,
    onLeave: 3,
    training: 1,
    manager: 'John Doe',
    lastUpdated: new Date(Date.now() - 3600000),
    description: 'Manages the inventory and production of raw materials and finished goods. Ensures optimal stock levels and smooth production flow.',
  },
  {
    id: 2,
    title: 'Produksi',
    icon: <FactoryIcon />,
    color: '#1976d2',
    progress: 66,
    update: '2 hours ago',
    status: 'updated',
    totalEmployees: 45,
    available: 30,
    onLeave: 10,
    training: 5,
    manager: 'Jane Smith',
    lastUpdated: new Date(Date.now() - 7200000),
    description: 'Responsible for the entire manufacturing process, from raw material intake to final product assembly. Focuses on efficiency and quality output.',
  },
  {
    id: 3,
    title: 'Overhaul Point Machine',
    icon: <OverhaulIcon />,
    color: '#8e24aa',
    progress: 58,
    update: 'Today',
    status: 'updated',
    totalEmployees: 18,
    available: 11,
    onLeave: 5,
    training: 2,
    manager: 'Robert Johnson',
    lastUpdated: new Date(),
    description: 'Specializes in the maintenance, repair, and complete overhaul of point machines to ensure railway safety and operational integrity.',
  },
  {
    id: 4,
    title: 'Rekayasa',
    icon: <RekayasaIcon />,
    color: '#f57c00',
    progress: 74,
    update: '3 hours ago',
    status: 'updated',
    totalEmployees: 32,
    available: 24,
    onLeave: 6,
    training: 2,
    manager: 'Emily Davis',
    lastUpdated: new Date(Date.now() - 10800000),
    description: 'The engineering department, dedicated to designing, developing, and improving systems and processes for enhanced performance and innovation.',
  },
  {
    id: 5,
    title: 'Kalibrasi',
    icon: <KalibrasiIcon />,
    color: '#fbc02d',
    progress: 45,
    update: 'Delayed',
    status: 'delayed',
    totalEmployees: 15,
    available: 7,
    onLeave: 6,
    training: 2,
    manager: 'Michael Brown',
    lastUpdated: new Date(Date.now() - 86400000),
    description: 'Ensures the accuracy and precision of all measurement equipment and instruments through rigorous calibration procedures.',
  },
  {
    id: 6,
    title: 'Inventory',
    icon: <InventoryIcon />,
    color: '#5e35b1',
    progress: 83,
    update: 'Just now',
    status: 'updated',
    totalEmployees: 22,
    available: 19,
    onLeave: 2,
    training: 1,
    manager: 'Sarah Wilson',
    lastUpdated: new Date(),
    description: 'Manages all aspects of inventory control, including stock tracking, ordering, and distribution to prevent shortages or overstocking.',
  },
  {
    id: 7,
    title: 'Personalia',
    icon: <PersonaliaIcon />,
    color: '#039be5',
    progress: 91,
    update: 'All positions filled',
    status: 'updated',
    totalEmployees: 12,
    available: 11,
    onLeave: 1,
    training: 0,
    manager: 'David Taylor',
    lastUpdated: new Date(),
    description: 'The human resources department, responsible for recruitment, employee relations, payroll, and overall personnel management.',
  },
  {
    id: 8,
    title: 'Quality Control',
    icon: <QualityIcon />,
    color: '#d32f2f',
    progress: 88,
    update: 'Today',
    status: 'updated',
    totalEmployees: 28,
    available: 25,
    onLeave: 2,
    training: 1,
    manager: 'Lisa Anderson',
    lastUpdated: new Date(),
    description: 'Dedicated to upholding the highest standards of product and service quality through thorough inspection and testing processes.',
  },
];

export default function DashboardPersonel() {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDialogOpen = (dept) => {
    setSelectedDept(dept);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDept(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data fetching
    setTimeout(() => {
      // In a real application, you'd fetch new data here
      setLoading(false);
    }, 1500); // Increased timeout for better visual effect
  };

  const filteredDepartments = departments.filter(dept =>
    dept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={4}
        p={2}
        borderRadius={3}
        sx={{ bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[2] }}
      >
        <Box mb={{ xs: 2, md: 0 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
            Ringkasan Personil per Divisi 👷‍♂️
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Overview workforce across all departments and their operational status.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" width={{ xs: '100%', md: 'auto' }}>
          <TextField
            size="small"
            placeholder="Cari departemen, manajer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2, flexGrow: 1 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary" disabled={loading} sx={{ p: 1.5, borderRadius: 2 }}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Department Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={80} thickness={4} color="primary" />
          <Typography variant="h6" color="text.secondary" ml={3}>Memuat data...</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredDepartments.length === 0 ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={5}>
                <Typography variant="h6" color="text.secondary">Tidak ada departemen yang ditemukan.</Typography>
              </Box>
            </Grid>
          ) : (
            filteredDepartments.map((dept, index) => (
              <AnimatedGridItem
                item
                xs={12}
                sm={6}
                md={4}
                lg={3} // Added lg breakpoint for more columns on larger screens
                key={dept.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StyledCard>
                  <StatusBadge
                    label={
                      dept.status === 'delayed' ? 'Butuh Perhatian' :
                        dept.update.includes('hour') || dept.update.includes('Just now') ? 'Terbaru' :
                          dept.update.includes('Today') ? 'Diupdate Hari Ini' : 'Terupdate'
                    }
                    status={dept.status}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <IconWrapper sx={{ bgcolor: dept.color }}>
                        {dept.icon}
                      </IconWrapper>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: theme.palette.text.primary }}>
                          {dept.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Badge
                            badgeContent={dept.totalEmployees}
                            color="primary"
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }}
                            sx={{ '.MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
                          >
                            <span style={{ marginLeft: 20 }}>Personil Total</span>
                          </Badge>
                          <br />
                          <span style={{ marginLeft: 0 }}>Diperbarui: {dept.update}</span>
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 40 }}>
                      {dept.description.substring(0, 80)}... {/* Short description */}
                    </Typography>

                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.primary" gutterBottom>Ketersediaan Personil</Typography>
                      <ProgressBar
                        variant="determinate"
                        value={dept.progress}
                        sx={{
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: dept.color,
                          },
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {dept.progress}% Aktif
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dept.available} Tersedia
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={1} mb={2}>
                      <Grid item xs={6}>
                        <Chip
                          label={`${dept.onLeave} Cuti`}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ width: '100%' }}
                          icon={<PersonaliaIcon fontSize="small" />}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip
                          label={`${dept.training} Pelatihan`}
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ width: '100%' }}
                          icon={<RekayasaIcon fontSize="small" />}
                        />
                      </Grid>
                    </Grid>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<InfoIcon />}
                      onClick={() => handleDialogOpen(dept)}
                      sx={{ mt: 'auto', borderRadius: 2, py: 1.2 }} // Push button to bottom
                    >
                      Lihat Detail
                    </Button>
                  </CardContent>
                </StyledCard>
              </AnimatedGridItem>
            ))
          )}
        </Grid>
      )}

      {/* Department Detail Dialog */}
      {selectedDept && (
        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4, boxShadow: theme.shadows[10] } }}
        >
          <DialogTitle sx={{ bgcolor: selectedDept.color, color: '#fff', pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  {selectedDept.icon}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {selectedDept.title}
                </Typography>
              </Box>
              <IconButton onClick={handleDialogClose} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {selectedDept.description}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Manajer Departemen</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedDept.manager}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Personil</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedDept.totalEmployees} Orang</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Personil Tersedia</Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">{selectedDept.available}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Sedang Cuti</Typography>
                <Typography variant="h6" color="warning.main" fontWeight="bold">{selectedDept.onLeave}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Dalam Pelatihan</Typography>
                <Typography variant="h6" color="info.main" fontWeight="bold">{selectedDept.training}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Update Terakhir</Typography>
                <Typography variant="body1">{selectedDept.lastUpdated.toLocaleString('id-ID', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</Typography>
              </Grid>
              <Grid item xs={12} mt={2}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>Status Ketersediaan</Typography>
                <ProgressBar
                  variant="determinate"
                  value={selectedDept.progress}
                  sx={{ height: 12, borderRadius: 6 }}
                  color={
                    selectedDept.progress > 80 ? 'success' :
                      selectedDept.progress > 50 ? 'primary' : 'error'
                  }
                />
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  {selectedDept.progress}% personil aktif di departemen ini.
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleDialogClose} variant="outlined" color="secondary" sx={{ borderRadius: 2 }}>
              Tutup
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Tambah Personil
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<EditIcon />}
              sx={{ borderRadius: 2 }}
            >
              Edit Departemen
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}