import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, LinearProgress,
  List, ListItem, ListItemText, Divider, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  Snackbar, Alert, TextField, Grid, Tooltip,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import {
  Add, CheckCircle, Warning, Error, Visibility, Delete, Edit,
  KeyboardArrowLeft, KeyboardArrowRight, Build, LocationOn, Schedule, Person, Inventory, History
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isValid } from 'date-fns';

const steps = [
  "Informasi Umum",
  "Detail Tambahan",
  "Konfirmasi"
];

const statusOptions = ['Belum Dimulai', 'Dalam Proses', 'Selesai', 'Tertunda'];

export default function Overhaul() {
  // Main state
  const [overhaulData, setOverhaulData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form states
  const [newOverhaul, setNewOverhaul] = useState({
    name: '',
    location: '',
    status: 'Belum Dimulai',
    estimate: null,
    progress: 0,
    personalia_id: null,
    materials_id: null,
    history_id: null,
    inventory_id: null,
  });

  // Related data options
  const [personaliaOptions, setPersonaliaOptions] = useState([]);
  const [materialsOptions, setMaterialsOptions] = useState([]);
  const [historyOptions, setHistoryOptions] = useState([]);
  const [inventoryOptions, setInventoryOptions] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);
  const [errorRelatedData, setErrorRelatedData] = useState(null);

  // Selected item states
  const [selectedOverhaul, setSelectedOverhaul] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Detail dialog additional states (for displaying multiple related items, assuming API provides them)
  const [detailPersonnel, setDetailPersonnel] = useState([]); // Use a different name to avoid conflict with `personnel` if it's meant for form input
  const [detailMaterials, setDetailMaterials] = useState([]); // Use a different name
  const [detailProgress, setDetailProgress] = useState([]); // Use a different name
  // These 'current' states are typically for adding new items in a form, not for display
  // const [currentPersonnel, setCurrentPersonnel] = useState("");
  // const [currentMaterialName, setCurrentMaterialName] = useState("");
  // const [currentMaterialQty, setCurrentMaterialQty] = useState("");
  // const [currentMaterialHarga, setCurrentMaterialHarga] = useState("");
  // const [currentMaterialSatuan, setCurrentMaterialSatuan] = useState("");

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // API URLs
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const OVERHAUL_API_URL = `${API_BASE_URL}/api/overhaul`;
  const PERSONALIA_API_URL = `${API_BASE_URL}/api/personalia`;
  const MATERIALS_API_URL = `${API_BASE_URL}/api/materials`;
  const HISTORY_API_URL = `${API_BASE_URL}/api/history`;
  const INVENTORY_API_URL = `${API_BASE_URL}/api/inventory`;

  // Fetch main Overhaul data
  const fetchOverhauls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(OVERHAUL_API_URL);
      setOverhaulData(response.data);
    } catch (err) {
      console.error("Error fetching overhaul data:", err);
      setError(err);
      setSnackbar({ open: true, message: "Gagal memuat data overhaul.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch related data for dropdowns
  const fetchRelatedData = async () => {
    setLoadingRelatedData(true);
    setErrorRelatedData(null);
    try {
      const [personaliaRes, materialsRes, historyRes, inventoryRes] = await Promise.all([
        axios.get(PERSONALIA_API_URL),
        axios.get(MATERIALS_API_URL),
        axios.get(HISTORY_API_URL),
        axios.get(INVENTORY_API_URL)
      ]);

      setPersonaliaOptions(Array.isArray(personaliaRes.data) ? personaliaRes.data : []);
      setMaterialsOptions(Array.isArray(materialsRes.data) ? materialsRes.data : []);
      setHistoryOptions(Array.isArray(historyRes.data) ? historyRes.data : []);
      setInventoryOptions(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      
    } catch (err) {
      console.error("Error fetching related data:", err);
      setErrorRelatedData(err);
      setSnackbar({ open: true, message: `Gagal memuat opsi terkait: ${err.message || "Terjadi kesalahan."}`, severity: "error" });
    } finally {
      setLoadingRelatedData(false);
    }
  };

  useEffect(() => {
    fetchOverhauls();
    fetchRelatedData();
  }, []);

  // Status summary calculations
  const totalOverhauls = overhaulData.length;
  const notStartedOverhauls = overhaulData.filter(o => o.status === 'Belum Dimulai').length;
  const inProgressOverhauls = overhaulData.filter(o => o.status === 'Dalam Proses').length;
  const completedOverhauls = overhaulData.filter(o => o.status === 'Selesai').length;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convert string empty to null for optional IDs
    if (['personalia_id', 'materials_id', 'history_id', 'inventory_id'].includes(name)) {
      newValue = value === '' ? null : Number(value);
    } else if (name === 'progress') {
      newValue = Number(value);
    }
    setNewOverhaul(prev => ({ ...prev, [name]: newValue }));
  };

  // Handle DateTimePicker changes
  const handleDateChange = (date) => {
    setNewOverhaul(prev => ({ ...prev, estimate: date }));
  };

  // Open Add Dialog
  const handleOpenAddDialog = () => {
    setActiveStep(0);
    setNewOverhaul({
      name: '',
      location: '',
      status: 'Belum Dimulai',
      estimate: null,
      progress: 0,
      personalia_id: null,
      materials_id: null,
      history_id: null,
      inventory_id: null,
    });
    setOpenAddDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEditDialog = (item) => {
    let parsedEstimate = null;
    if (item.estimate && typeof item.estimate === 'string') {
      try {
        const dateObj = parseISO(item.estimate);
        if (isValid(dateObj)) {
          parsedEstimate = dateObj;
        }
      } catch (e) {
        console.warn("Error parsing date:", e);
      }
    }
    
    setNewOverhaul({
      ...item,
      estimate: parsedEstimate,
      personalia_id: item.personalia_id || null,
      materials_id: item.materials_id || null,
      history_id: item.history_id || null,
      inventory_id: item.inventory_id || null,
      progress: item.progress !== undefined && item.progress !== null ? Number(item.progress) : 0,
    });
    setOpenEditDialog(true);
  };

  // Open Detail Dialog
  const handleOpenDetailDialog = (item) => {
    setSelectedOverhaul(item);
    
    // Initialize additional detail states based on the item (if available)
    // IMPORTANT: These assume 'item' has 'personnel', 'materials', 'progress' arrays
    // If your API does not return these, these will be empty.
    setDetailPersonnel(item.personnel || []);
    setDetailMaterials(item.materials || []);
    setDetailProgress(item.progress || []);
    
    setOpenDetailDialog(true);
  };

  // Stepper Navigation
  const handleNext = () => {
    // Validation logic for each step
    switch (activeStep) {
      case 0: // Informasi Umum
        if (!newOverhaul.name || !newOverhaul.status) {
          setSnackbar({ open: true, message: "Nama item dan Status harus diisi.", severity: "warning" });
          return;
        }
        const progressValue = Number(newOverhaul.progress);
        if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
          setSnackbar({ open: true, message: "Progress harus angka antara 0 dan 100.", severity: "warning" });
          return;
        }
        break;
      case 1: // Detail Tambahan
        // No specific validation for optional fields
        break;
      case 2: // Konfirmasi
        // No validation needed
        break;
      default:
        break;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Save overhaul (both add and edit)
  const handleSaveOverhaul = async (isEdit = false) => {
    try {
      let formattedEstimate = null;
      if (newOverhaul.estimate instanceof Date && isValid(newOverhaul.estimate)) {
        formattedEstimate = newOverhaul.estimate.toISOString();
      } else if (newOverhaul.estimate !== null) {
        setSnackbar({ open: true, message: "Format Tanggal & Waktu Estimasi tidak valid.", severity: "warning" });
        return;
      }

      // Construct payload
      const payload = {
        name: newOverhaul.name,
        status: newOverhaul.status,
        progress: newOverhaul.progress,
        location: newOverhaul.location || null,
        estimate: formattedEstimate,
        personalia_id: newOverhaul.personalia_id,
        materials_id: newOverhaul.materials_id,
        history_id: newOverhaul.history_id,
        inventory_id: newOverhaul.inventory_id,
        // If your backend supports saving arrays like these, uncomment and adjust:
        // personnel: detailPersonnel, 
        // materials: detailMaterials,
        // progress: detailProgress
      };

      let response;
      if (isEdit) {
        response = await axios.put(`${OVERHAUL_API_URL}/${newOverhaul.id}`, payload);
        setSnackbar({ open: true, message: "Overhaul berhasil diperbarui!", severity: "success" });
      } else {
        response = await axios.post(OVERHAUL_API_URL, payload);
        setSnackbar({ open: true, message: "Overhaul berhasil ditambahkan!", severity: "success" });
      }

      // Close dialog and refresh data
      setOpenAddDialog(false);
      setOpenEditDialog(false);
      fetchOverhauls();
    } catch (error) {
      console.error('Error saving overhaul:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  // Handle Delete
  const handleDeleteConfirm = (item) => {
    setItemToDelete(item);
    setOpenConfirmDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${OVERHAUL_API_URL}/${itemToDelete.id}`);
      setSnackbar({ open: true, message: "Overhaul berhasil dihapus!", severity: "success" });
      setOpenConfirmDeleteDialog(false);
      fetchOverhauls();
    } catch (error) {
      console.error('Error deleting overhaul:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Terjadi kesalahan saat menghapus data.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  // Get status info for chips
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Selesai':
        return { color: 'success', icon: <CheckCircle fontSize="small" /> };
      case 'Dalam Proses':
        return { color: 'warning', icon: <Warning fontSize="small" /> };
      case 'Belum Dimulai':
        return { color: 'info', icon: <Schedule fontSize="small" /> };
      case 'Tertunda':
        return { color: 'error', icon: <Error fontSize="small" /> };
      default:
        return { color: 'default', icon: null };
    }
  };

  // Get step content for stepper
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nama Item Overhaul"
                name="name"
                value={newOverhaul.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Lokasi"
                name="location"
                value={newOverhaul.location || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Opsional"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newOverhaul.status}
                  label="Status"
                  onChange={handleChange}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Tanggal & Waktu Estimasi Selesai"
                  value={newOverhaul.estimate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      helperText="Opsional (Format: dd/mm/yyyy hh:mm AM/PM)"
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Progress (%)"
                name="progress"
                type="number"
                value={newOverhaul.progress}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
                required
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" disabled={loadingRelatedData}>
                <InputLabel>Penanggung Jawab (Personel) (Opsional)</InputLabel>
                <Select
                  name="personalia_id"
                  value={newOverhaul.personalia_id || ''}
                  label="Penanggung Jawab (Personel) (Opsional)"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Tidak ada</em></MenuItem>
                  {loadingRelatedData ? (
                    <MenuItem disabled><CircularProgress size={20} /> Memuat personel...</MenuItem>
                  ) : (
                    personaliaOptions.map((personel) => (
                      <MenuItem key={personel.id} value={personel.id}>{personel.name}</MenuItem>
                    ))
                  )}
                </Select>
                {errorRelatedData && <Typography color="error" variant="caption">Gagal memuat opsi personel.</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" disabled={loadingRelatedData}>
                <InputLabel>Pilih Material (Opsional)</InputLabel>
                <Select
                  name="materials_id"
                  value={newOverhaul.materials_id || ''}
                  label="Pilih Material (Opsional)"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Tidak ada</em></MenuItem>
                  {loadingRelatedData ? (
                    <MenuItem disabled><CircularProgress size={20} /> Memuat material...</MenuItem>
                  ) : (
                    materialsOptions.map((material) => (
                      <MenuItem key={material.id} value={material.id}>{material.name}</MenuItem>
                    ))
                  )}
                </Select>
                {errorRelatedData && <Typography color="error" variant="caption">Gagal memuat opsi material.</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" disabled={loadingRelatedData}>
                <InputLabel>History ID (Opsional)</InputLabel>
                <Select
                  name="history_id"
                  value={newOverhaul.history_id || ''}
                  label="History ID (Opsional)"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Tidak ada</em></MenuItem>
                  {loadingRelatedData ? (
                    <MenuItem disabled><CircularProgress size={20} /> Memuat history...</MenuItem>
                  ) : (
                    historyOptions.map((history) => (
                      <MenuItem key={history.id} value={history.id}>{history.name}</MenuItem>
                    ))
                  )}
                </Select>
                {errorRelatedData && <Typography color="error" variant="caption">Gagal memuat opsi history.</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" disabled={loadingRelatedData}>
                <InputLabel>Inventory ID (Opsional)</InputLabel>
                <Select
                  name="inventory_id"
                  value={newOverhaul.inventory_id || ''}
                  label="Inventory ID (Opsional)"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Tidak ada</em></MenuItem>
                  {loadingRelatedData ? (
                    <MenuItem disabled><CircularProgress size={20} /> Memuat inventory...</MenuItem>
                  ) : (
                    inventoryOptions.map((inventory) => (
                      <MenuItem key={inventory.id} value={inventory.id}>{inventory.name}</MenuItem>
                    ))
                  )}
                </Select>
                {errorRelatedData && <Typography color="error" variant="caption">Gagal memuat opsi inventory.</Typography>}
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Review Data Overhaul:</Typography>
            <List dense>
              <ListItem><ListItemText primary={`Nama Item: ${newOverhaul.name}`} /></ListItem>
              <ListItem><ListItemText primary={`Lokasi: ${newOverhaul.location || '-'}`} /></ListItem>
              <ListItem><ListItemText primary={`Status: ${newOverhaul.status}`} /></ListItem>
              <ListItem>
                <ListItemText primary={`Estimasi Selesai: ${newOverhaul.estimate && isValid(newOverhaul.estimate) ? format(newOverhaul.estimate, 'dd/MM/yyyy HH:mm') : '-'}`} />
              </ListItem>
              <ListItem><ListItemText primary={`Progress: ${newOverhaul.progress}%`} /></ListItem>
              <ListItem>
                <ListItemText primary={`Penanggung Jawab: ${newOverhaul.personalia_id ? (personaliaOptions.find(p => p.id === newOverhaul.personalia_id)?.name || newOverhaul.personalia_id) : '-'}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Materials: ${newOverhaul.materials_id ? (materialsOptions.find(m => m.id === newOverhaul.materials_id)?.name || newOverhaul.materials_id) : '-'}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`History: ${newOverhaul.history_id ? (historyOptions.find(h => h.id === newOverhaul.history_id)?.name || newOverhaul.history_id) : '-'}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Inventory: ${newOverhaul.inventory_id ? (inventoryOptions.find(i => i.id === newOverhaul.inventory_id)?.name || newOverhaul.inventory_id) : '-'}`} />
              </ListItem>
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              Pastikan semua data sudah benar sebelum menyimpan.
            </Alert>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Build sx={{ color: '#007BFF', fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Manajemen Overhaul</Typography>
      </Box>

      {/* Summary Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Build color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Total Overhaul</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">{totalOverhauls}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Belum Dimulai</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="info.dark">{notStartedOverhauls}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Dalam Proses</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="warning.dark">{inProgressOverhauls}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Selesai</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.dark">{completedOverhauls}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Main Action */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Tambah Overhaul
        </Button>
      </Box>

      {/* Overhaul List - Table */}
      <TableContainer component={Paper} elevation={3}>
        {/* Loading state */}
        {loading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ mb: 1 }} />
            <Typography color="text.secondary">Memuat data overhaul...</Typography>
          </Box>
        )}

        {/* Error state */}
        {error && !loading && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            <Typography>Gagal memuat data overhaul.</Typography>
            <Typography variant="body2">{error.message || "Terjadi kesalahan tidak diketahui."}</Typography>
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && overhaulData.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="text.secondary">Belum ada data overhaul.</Typography>
            <Typography variant="body2" color="text.secondary">Klik "Tambah Overhaul" untuk memulai.</Typography>
          </Box>
        ) : (
          (!loading && overhaulData.length > 0) ? (
            <Table sx={{ minWidth: 650 }} aria-label="overhaul table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nama Item</TableCell>
                  <TableCell>Lokasi</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Estimasi Selesai</TableCell>
                  <TableCell>Penanggung Jawab</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overhaulData.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  
                  return (
                    <TableRow
                      key={item.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {item.id}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={statusInfo.color}
                          icon={statusInfo.icon}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.progress || 0}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: statusInfo.color === 'success' ? '#4caf50' : '#2196f3',
                                },
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{item.progress}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {item.estimate && isValid(parseISO(item.estimate))
                          ? format(parseISO(item.estimate), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.personalia_id ? (personaliaOptions.find(p => p.id === item.personalia_id)?.name || item.personalia_id) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Tooltip title="Edit Overhaul">
                            <IconButton onClick={() => handleOpenEditDialog(item)} size="small" color="primary">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Lihat Detail">
                            <IconButton onClick={() => handleOpenDetailDialog(item)} size="small" color="info">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Overhaul">
                            <IconButton onClick={() => handleDeleteConfirm(item)} size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null
        )}
      </TableContainer>

      {/* Dialog Tambah Overhaul */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Overhaul Baru</DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<KeyboardArrowLeft />}>
            Kembali
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? () => handleSaveOverhaul(false) : handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <KeyboardArrowRight />}
          >
            {activeStep === steps.length - 1 ? 'Simpan' : 'Lanjut'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit Overhaul */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Overhaul: {newOverhaul.name}</DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<KeyboardArrowLeft />}>
            Kembali
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? () => handleSaveOverhaul(true) : handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <KeyboardArrowRight />}
          >
            {activeStep === steps.length - 1 ? 'Simpan Perubahan' : 'Lanjut'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detail Overhaul */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOverhaul?.name} 
          <Chip label={`ID: ${selectedOverhaul?.id}`} size="small" sx={{ ml: 1 }} />
        </DialogTitle>
        <DialogContent dividers>
          {selectedOverhaul && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Build sx={{ mr: 1 }} /> Informasi Umum
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={`Nama Item: ${selectedOverhaul.name}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={`Lokasi: ${selectedOverhaul.location || '-'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={
                      <>
                        Status: <Chip
                          label={selectedOverhaul.status}
                          color={getStatusInfo(selectedOverhaul.status).color}
                          icon={getStatusInfo(selectedOverhaul.status).icon}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={
                      <>
                        Progress:
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={selectedOverhaul.progress || 0}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getStatusInfo(selectedOverhaul.status).color === 'success' ? '#4caf50' : '#2196f3',
                                },
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{selectedOverhaul.progress}%</Typography>
                          </Box>
                        </Box>
                      </>
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={`Estimasi Selesai: ${selectedOverhaul.estimate && isValid(parseISO(selectedOverhaul.estimate)) ? format(parseISO(selectedOverhaul.estimate), 'dd/MM/yyyy HH:mm') : '-'}`} 
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoOutlined sx={{ mr: 1 }} /> Detail Terkait
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={
                      `Penanggung Jawab: ${selectedOverhaul.personalia_id 
                        ? (personaliaOptions.find(p => p.id === selectedOverhaul.personalia_id)?.name || `ID: ${selectedOverhaul.personalia_id}`) 
                        : '-'}`
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={
                      `Material Utama: ${selectedOverhaul.materials_id 
                        ? (materialsOptions.find(m => m.id === selectedOverhaul.materials_id)?.name || `ID: ${selectedOverhaul.materials_id}`) 
                        : '-'}`
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={
                      `Catatan Riwayat: ${selectedOverhaul.history_id 
                        ? (historyOptions.find(h => h.id === selectedOverhaul.history_id)?.name || `ID: ${selectedOverhaul.history_id}`) 
                        : '-'}`
                    } />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={
                      `Inventaris Terkait: ${selectedOverhaul.inventory_id 
                        ? (inventoryOptions.find(i => i.id === selectedOverhaul.inventory_id)?.name || `ID: ${selectedOverhaul.inventory_id}`) 
                        : '-'}`
                    } />
                  </ListItem>
                </List>
              </Grid>

              {/* Placeholder for Personnel (Multiple) */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} /> Personel Terlibat
                </Typography>
                {detailPersonnel.length > 0 ? (
                  <List dense>
                    {detailPersonnel.map((person, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`${person.name} (NIP: ${person.nip || '-'}) - ${person.role || '-'}`} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada personel tambahan yang dicatat untuk overhaul ini.
                  </Typography>
                )}
              </Grid>

              {/* Placeholder for Materials (Multiple) */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory sx={{ mr: 1 }} /> Daftar Material
                </Typography>
                {detailMaterials.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nama Material</TableCell>
                          <TableCell>Kuantitas</TableCell>
                          <TableCell>Satuan</TableCell>
                          <TableCell align="right">Harga per Satuan</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailMaterials.map((material, index) => (
                          <TableRow key={index}>
                            <TableCell>{material.name}</TableCell>
                            <TableCell>{material.qty}</TableCell>
                            <TableCell>{material.unit}</TableCell>
                            <TableCell align="right">{material.harga ? `Rp ${material.harga.toLocaleString('id-ID')}` : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada material tambahan yang dicatat untuk overhaul ini.
                  </Typography>
                )}
              </Grid>

              {/* Placeholder for Progress History */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <History sx={{ mr: 1 }} /> Riwayat Progress
                </Typography>
                {detailProgress.length > 0 ? (
                  <List dense>
                    {detailProgress.map((p, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={`Progress: ${p.percentage}% pada ${p.date ? format(parseISO(p.date), 'dd/MM/yyyy HH:mm') : '-'}`} 
                          secondary={p.notes || "Tidak ada catatan."} 
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada riwayat progress yang dicatat untuk overhaul ini.
                  </Typography>
                )}
              </Grid>

            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={openConfirmDeleteDialog}
        onClose={() => setOpenConfirmDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Konfirmasi Penghapusan"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Anda yakin ingin menghapus overhaul "<strong>{itemToDelete?.name}</strong>"?
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDeleteDialog(false)}>Batal</Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}