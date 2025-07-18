import React, { useState, useEffect } from 'react'; // PASTIKAN useEffect DIIMPORT

import axios from 'axios';
import {
  Box, Typography, Card, CardContent, LinearProgress,
  List, ListItem, ListItemText, Divider, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  Snackbar, Alert, TextField, Grid, Tooltip,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Select, MenuItem, InputLabel, FormControl // Tambahkan Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import {
  Add, CheckCircle, Warning, Error, Visibility, Delete, Edit, // Tambahkan ikon Edit
  KeyboardArrowLeft, KeyboardArrowRight, Inventory2, Group, Build
} from '@mui/icons-material';
import { format } from 'date-fns';

const steps = [
  "Informasi Umum",
  "Personel",
  "Material",
  "Konfirmasi"
];

export default function Produksi() {
  // --- Deklarasi State Hooks ---
  const [productionData, setProductionData] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newProduction, setNewProduction] = useState({
    name: "",
    target: "",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: "",
    personnel: [], // Array untuk menyimpan NIP personel yang dipilih
    materials: [],
    progress: [], // Progress data, jika ada
    currentPersonnel: "", // Akan menyimpan NIP dari personel yang dipilih
    currentMaterialName: "",
    currentMaterialQty: "",
    currentMaterialHarga: "",
    currentMaterialSatuan: ""
  });
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // State baru untuk menyimpan daftar personel dari backend
  const [personnelOptions, setPersonnelOptions] = useState([]);
  const [loadingPersonnelOptions, setLoadingPersonnelOptions] = useState(true); // Loading state untuk personel
  const [errorPersonnelOptions, setErrorPersonnelOptions] = useState(null); // Error state untuk personel
  
  // State loading dan error untuk data produksi utama
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk dialog edit produksi
  const [openEditProductionDialog, setOpenEditProductionDialog] = useState(false);
  const [editProductionData, setEditProductionData] = useState(null); // Data produksi yang sedang diedit

  // NEW: State untuk dialog konfirmasi hapus
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Item yang akan dihapus

  // URL dasar API dari .env
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // --- Effect untuk Memuat Data Produksi dari Backend ---
  useEffect(() => {
    const fetchProductionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/produksi`); // Menggunakan API_BASE_URL
        setProductionData(response.data);
      } catch (error) {
        console.error("Error fetching production data:", error);
        setError(error);
        setSnackbar({ open: true, message: "Gagal memuat data produksi. Silakan coba refresh.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProductionData();
  }, [API_BASE_URL]); // Tambahkan API_BASE_URL sebagai dependensi

  // --- Effect untuk Memuat Data Personel dari Backend ---
  useEffect(() => {
    const fetchPersonnelOptions = async () => {
      setLoadingPersonnelOptions(true); // Set loading menjadi true saat memulai fetch
      setErrorPersonnelOptions(null); // Reset error state
      try {
        const response = await axios.get(`${API_BASE_URL}/api/personalia`); // Menggunakan API_BASE_URL
        if (Array.isArray(response.data)) {
          setPersonnelOptions(response.data);
        } else {
          throw new Error("Format data personalia tidak sesuai.");
        }
      } catch (error) {
        console.error("Error fetching personnel options:", error);
        setErrorPersonnelOptions(error); // Simpan error di state
        setSnackbar({ open: true, message: `Gagal memuat opsi personel: ${error.message || "Terjadi kesalahan."}`, severity: "error" });
      } finally {
        setLoadingPersonnelOptions(false); // Set loading menjadi false setelah fetch selesai
      }
    };
    fetchPersonnelOptions();
  }, [API_BASE_URL]); // Tambahkan API_BASE_URL sebagai dependensi

  // --- Deklarasi Fungsi-fungsi Handler ---
  const totalProductions = productionData.length;
  const inProgressProductions = productionData.filter(p => p.status === "Dalam Proses").length;
  const completedProductions = productionData.filter(p => p.status === "Selesai").length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (newProduction.currentPersonnel.trim()) {
      if (!newProduction.personnel.includes(newProduction.currentPersonnel)) {
        setNewProduction(prev => ({
          ...prev,
          personnel: [...prev.personnel, newProduction.currentPersonnel.trim()],
          currentPersonnel: "" // Reset pilihan setelah ditambahkan
        }));
      } else {
        setSnackbar({ open: true, message: "Personel ini sudah ditambahkan!", severity: "warning" });
      }
    } else {
      setSnackbar({ open: true, message: "Pilih personel terlebih dahulu!", severity: "error" });
    }
  };

  const handleAddMaterial = () => {
    const { currentMaterialName, currentMaterialQty, currentMaterialHarga, currentMaterialSatuan } = newProduction;
    if (currentMaterialName.trim() && currentMaterialQty !== "" && currentMaterialHarga !== "" && currentMaterialSatuan.trim()) {
      const newMaterial = {
        name: currentMaterialName.trim(),
        qty: parseInt(currentMaterialQty),
        harga: parseFloat(currentMaterialHarga),
        satuan: currentMaterialSatuan.trim()
      };
      setNewProduction(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
        currentMaterialName: "",
        currentMaterialQty: "",
        currentMaterialHarga: "",
        currentMaterialSatuan: ""
      }));
    } else {
      setSnackbar({ open: true, message: "Harap lengkapi semua detail material!", severity: "error" });
    }
  };

  const handleRemoveItem = (listName, index) => {
    setNewProduction(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    switch (activeStep) {
      case 0: // General Information
        if (!newProduction.name || newProduction.target === "" || !newProduction.startDate || !newProduction.endDate) {
          setSnackbar({ open: true, message: "Harap lengkapi semua informasi umum.", severity: "error" });
          return;
        }
        const targetNum = parseInt(newProduction.target);
        if (isNaN(targetNum) || targetNum <= 0) {
          setSnackbar({ open: true, message: "Target produksi harus berupa angka dan lebih dari 0.", severity: "error" });
          return;
        }
        if (newProduction.startDate > newProduction.endDate) {
          setSnackbar({ open: true, message: "Tanggal mulai tidak boleh setelah tanggal selesai.", severity: "error" });
          return;
        }
        break;
      case 1: // Personnel
        if (newProduction.personnel.length === 0) {
          setSnackbar({ open: true, message: "Harap tambahkan setidaknya satu personel.", severity: "error" });
          return;
        }
        break;
      case 2: // Material
        if (newProduction.materials.length === 0) {
          setSnackbar({ open: true, message: "Harap tambahkan setidaknya satu material.", severity: "error" });
          return;
        }
        break;
      case 3: // Konfirmasi - Tidak perlu validasi tambahan di sini jika step sebelumnya sudah divalidasi
        break;
      default:
        break;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const handleSaveProduction = async () => {
    const itemToSave = {
      name: newProduction.name,
      target: parseInt(newProduction.target),
      completed: 0, // Set awal 0
      status: "Dalam Proses", // Set status awal
      startDate: newProduction.startDate,
      endDate: newProduction.endDate,
      personnel: newProduction.personnel, // Mengirim array NIP string
      materials: newProduction.materials, // Mengirim array objek material
      progress: newProduction.progress, // Mengirim array objek progress (jika ada)
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/produksi`, itemToSave); // Menggunakan API_BASE_URL
      const createdItem = response.data;
      setProductionData(prev => [...prev, createdItem]);

      setOpenAddDialog(false);
      setActiveStep(0);
      setNewProduction({
        name: "", target: "", startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: "", personnel: [], materials: [], progress: [],
        currentPersonnel: "",
        currentMaterialName: "", currentMaterialQty: "", currentMaterialHarga: "", currentMaterialSatuan: ""
      });

      setSnackbar({ open: true, message: "Produksi berhasil ditambahkan!", severity: "success" });

    } catch (error) {
      console.error("Gagal menambahkan produksi:", error);
      const errorMessage = error.response?.data?.error || "Gagal menyimpan ke server.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const getStatusInfo = (status) => {
    if (status === "Selesai") return { color: "success", icon: <CheckCircle fontSize="small" /> };
    if (status === "Dalam Proses") return { color: "warning", icon: <Warning fontSize="small" /> };
    return { color: "error", icon: <Error fontSize="small" /> };
  };

  const handleOpenDetail = (item) => {
    setSelectedProduction(item);
    setOpenDetailDialog(true);
  };

  // --- Fungsi untuk membuka dialog edit ---
  const handleOpenEditDialog = (item) => {
    setEditProductionData({ ...item }); // Salin data item ke state edit
    setOpenEditProductionDialog(true);
  };

  // --- Fungsi untuk menangani perubahan input di form edit ---
  const handleEditProductionChange = (e) => {
    const { name, value } = e.target; 
    
    // Perbaikan: Konversi nilai ke number hanya untuk field 'target' dan 'completed'
    let newValue = value;
    if (name === 'target' || name === 'completed') {
      newValue = parseInt(value, 10);
      if (isNaN(newValue)) { // Tangani jika input kosong atau bukan angka
        newValue = 0; // Atau biarkan null/undefined jika Anda ingin input kosong
      }
    }
    
    setEditProductionData(prev => ({ ...prev, [name]: newValue }));
  };

  // --- Fungsi untuk menyimpan perubahan setelah edit ---
  const handleSaveEditProduction = async () => {
    if (!editProductionData) return;

    try {
      // Kirim PUT request ke backend
      const response = await axios.put(`${API_BASE_URL}/api/produksi/${editProductionData.id}`, editProductionData);

      // Perbarui state productionData dengan data yang sudah diupdate
      setProductionData(prevData =>
        prevData.map(item => (item.id === response.data.id ? response.data : item))
      );

      setOpenEditProductionDialog(false); // Tutup dialog edit
      setSnackbar({ open: true, message: "Produksi berhasil diperbarui!", severity: "success" });
    } catch (error) {
      console.error("Gagal memperbarui produksi:", error);
      const errorMessage = error.response?.data?.error || "Gagal memperbarui ke server.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  // NEW: Fungsi untuk membuka dialog konfirmasi hapus
  const handleOpenConfirmDeleteDialog = (item) => {
    setItemToDelete(item);
    setOpenConfirmDeleteDialog(true);
  };

  // NEW: Fungsi untuk menghapus produksi setelah konfirmasi
  const handleDeleteProduction = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/produksi/${itemToDelete.id}`);
      setProductionData(prevData => prevData.filter(item => item.id !== itemToDelete.id));
      setSnackbar({ open: true, message: "Produksi berhasil dihapus!", severity: "success" });
    } catch (error) {
      console.error("Gagal menghapus produksi:", error);
      const errorMessage = error.response?.data?.error || "Gagal menghapus dari server.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setOpenConfirmDeleteDialog(false); // Tutup dialog konfirmasi
      setItemToDelete(null); // Reset item yang akan dihapus
    }
  };

  const calculateProgressPercentage = (completed, target) => {
    if (target === 0 || isNaN(target) || target < 0) return 0;
    if (completed < 0 || isNaN(completed)) completed = 0;
    return Math.min(100, Math.round((completed / target) * 100));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Nama Produksi"
                value={newProduction.name}
                onChange={handleInputChange}
                required
                helperText={!newProduction.name ? "Nama produksi wajib diisi" : ""}
                error={!newProduction.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="target"
                type="number"
                label="Target Produksi (Unit)"
                value={newProduction.target}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1 }}
                helperText={isNaN(parseInt(newProduction.target)) || parseInt(newProduction.target) <= 0 ? "Target harus angka > 0" : ""}
                error={isNaN(parseInt(newProduction.target)) || parseInt(newProduction.target) <= 0}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="startDate"
                label="Tanggal Mulai"
                type="date"
                value={newProduction.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                helperText={!newProduction.startDate ? "Tanggal mulai wajib diisi" : ""}
                error={!newProduction.startDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="endDate"
                label="Tanggal Selesai (Estimasi)"
                type="date"
                value={newProduction.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                helperText={!newProduction.endDate ? "Tanggal selesai wajib diisi" : "" || (newProduction.startDate > newProduction.endDate ? "Tanggal selesai harus setelah mulai" : "")}
                error={!newProduction.endDate || (newProduction.startDate && newProduction.endDate && newProduction.startDate > newProduction.endDate)}
              />
            </Grid>
          </Grid>
        );
      case 1:// Personnel
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Personel Terlibat</Typography>

            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  select
                  label="Pilih Personel"
                  value={newProduction.currentPersonnel}
                  onChange={(e) => setNewProduction({ ...newProduction, currentPersonnel: e.target.value })}
                  SelectProps={{ native: true }}
                  disabled={loadingPersonnelOptions} // Disable saat loading
                  error={!!errorPersonnelOptions} // Tampilkan error jika ada
                  helperText={errorPersonnelOptions ? `Error: ${errorPersonnelOptions.message}` : ''}
                >
                  <option value="">-- Pilih Personel --</option>
                  {loadingPersonnelOptions ? (
                    <option disabled>Memuat personel...</option>
                  ) : personnelOptions.length === 0 ? (
                    <option disabled>Tidak ada personel tersedia.</option>
                  ) : (
                    personnelOptions.map((person) => (
                      // Menggunakan personalia_id sebagai key dan nip sebagai value
                      // Menampilkan NIP dan Jabatan untuk identifikasi yang lebih baik
                      <option key={person.personalia_id} value={person.nip}>
                        {person.nip} - {person.jabatan}
                      </option>
                    ))
                  )}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem} // Panggil handleAddItem tanpa parameter field/valueField
                  disabled={!newProduction.currentPersonnel || loadingPersonnelOptions}
                >
                  Tambah
                </Button>
              </Grid>
            </Grid>

            <List dense>
              {newProduction.personnel.length === 0 ? (
                <Typography color="text.secondary">Belum ada personel ditambahkan.</Typography>
              ) : (
                newProduction.personnel.map((p, i) => (
                  <ListItem
                    key={i} // Menggunakan index sebagai key karena p adalah string NIP
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveItem("personnel", i)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={p} /> {/* Menampilkan NIP */}
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        );

      case 2: // Material
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Material Digunakan</Typography>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nama Material"
                  value={newProduction.currentMaterialName}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={newProduction.currentMaterialQty}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialQty: e.target.value })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Harga"
                  type="number"
                  value={newProduction.currentMaterialHarga}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialHarga: e.target.value })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Satuan"
                  value={newProduction.currentMaterialSatuan}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialSatuan: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleAddMaterial} startIcon={<Add />}>
                  Tambah Material
                </Button>
              </Grid>
            </Grid>
            <List dense>
              {newProduction.materials.length === 0 ? (
                <Typography color="text.secondary">Belum ada material ditambahkan.</Typography>
              ) : (
                newProduction.materials.map((m, i) => (
                  <ListItem
                    key={i} // Menggunakan index sebagai key (kurang ideal)
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveItem("materials", i)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={`${m.name} (${m.qty} ${m.satuan} @ Rp${m.harga})`} />
                  </ListItem>
                ))
              )}
            </List>
            {newProduction.materials.length === 0 && activeStep === 2 && (
              <Typography color="error" variant="caption">Setidaknya satu material wajib ditambahkan</Typography>
            )}
          </Box>
        );
      case 3: // Konfirmasi
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Konfirmasi Data Produksi</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Nama Produksi:</strong> {newProduction.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Target:</strong> {newProduction.target} unit</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Periode:</strong> {newProduction.startDate && newProduction.endDate ? `${format(new Date(newProduction.startDate), 'dd MMM yyyy')} - ${format(new Date(newProduction.endDate), 'dd MMM yyyy')}` : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Personel:</strong></Typography>
                <List dense>
                  {newProduction.personnel.length > 0 ? newProduction.personnel.map((item, idx) => <ListItemText key={idx} primary={`- ${item}`} />) : <ListItemText primary="- Tidak ada" />}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Material:</strong></Typography>
                <List dense>
                  {newProduction.materials.length > 0 ? newProduction.materials.map((item, idx) => <ListItemText key={idx} primary={`- ${item.name} (${item.qty} ${item.satuan} @ Rp${item.harga})`} />) : <ListItemText primary="- Tidak ada" />}
                </List>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Inventory2 sx={{ color: '#007BFF', fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Manajemen Produksi Barang</Typography>
      </Box>

      {/* Summary Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Inventory2 color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Total Produksi</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">{totalProductions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Dalam Proses</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="warning.dark">{inProgressProductions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Selesai</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.dark">{completedProductions}</Typography>
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
          onClick={() => setOpenAddDialog(true)}
        >
          Buat Produksi Baru
        </Button>
      </Box>

      {/* Production List - Now as a Table */}
      <TableContainer component={Paper} elevation={3}>
        {/* KONDISI RENDER BERDASARKAN LOADING DAN ERROR */}
        {loading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ mb: 1 }} />
            <Typography color="text.secondary">Memuat data produksi...</Typography>
          </Box>
        )}

        {error && !loading && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            <Typography>Gagal memuat data produksi.</Typography>
            <Typography variant="body2">{error.message || "Terjadi kesalahan tidak diketahui."}</Typography>
          </Box>
        )}

        {!loading && !error && productionData.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="text.secondary">Belum ada data produksi.</Typography>
            <Typography variant="body2" color="text.secondary">Klik "Buat Produksi Baru" untuk memulai.</Typography>
          </Box>
        ) : (
          (!loading && productionData.length > 0) ? (
            <Table sx={{ minWidth: 650 }} aria-label="production table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell> {/* ID dari backend */}
                  <TableCell>Nama Produksi</TableCell>
                  <TableCell align="right">Target (Unit)</TableCell>
                  <TableCell align="right">Selesai (Unit)</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Periode</TableCell>
                  <TableCell>Personel</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Mapping data dari state productionData */}
                {productionData.map((item) => {
                  const progressPercentage = calculateProgressPercentage(item.completed, item.target);
                  const statusInfo = getStatusInfo(item.status);
                  const isCompleted = item.status === "Selesai";

                  return (
                    <TableRow
                      key={item.id} // Gunakan ID unik dari backend sebagai key
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {item.id} {/* Tampilkan ID dari backend */}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.target}</TableCell>
                      <TableCell align="right">{item.completed}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progressPercentage}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: isCompleted ? '#4caf50' : '#2196f3',
                                },
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{progressPercentage}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={statusInfo.color}
                          icon={statusInfo.icon}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {/* Pastikan tanggal dari backend diformat dengan benar */}
                        {item.startDate && item.endDate ?
                           `${format(new Date(item.startDate), 'dd MMM yyyy')} - ${format(new Date(item.endDate), 'dd MMM yyyy')}`
                          : 'N/A' // Tangani jika tanggal kosong
                        }
                      </TableCell>
                      <TableCell>
                        {/* Pastikan item.personnel adalah array dan tangani jika null/undefined */}
                        {item.personnel && Array.isArray(item.personnel) && item.personnel.length > 0 ? item.personnel.join(', ') : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        {/* Menggunakan Box dengan display="flex" untuk menempatkan ikon berdampingan */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Tooltip title="Edit Produksi">
                            <IconButton onClick={() => handleOpenEditDialog(item)} size="small" color="primary">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Lihat Detail">
                            <IconButton onClick={() => handleOpenDetail(item)} size="small" color="info">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {/* NEW: Tombol Hapus */}
                          <Tooltip title="Hapus Produksi">
                            <IconButton onClick={() => handleOpenConfirmDeleteDialog(item)} size="small" color="error">
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

      {/* Dialog Buat Produksi Baru */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Buat Produksi Baru</DialogTitle>
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
            onClick={activeStep === steps.length - 1 ? handleSaveProduction : handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <KeyboardArrowRight />}
          >
            {activeStep === steps.length - 1 ? 'Selesai & Simpan' : 'Lanjut'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detail Produksi */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduction?.name} <Chip label={selectedProduction?.id} size="small" sx={{ ml: 1 }} /></DialogTitle>
        <DialogContent dividers>
          {selectedProduction && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Informasi Umum</Typography>
                <List dense>
                  <ListItem><ListItemText primary={`Target: ${selectedProduction.target} unit`}/></ListItem>
                  <ListItem><ListItemText primary={`Selesai: ${selectedProduction.completed} unit`}/></ListItem>
                  <ListItem><ListItemText primary={`Status: ${selectedProduction.status}`} /></ListItem>
                    {/* Pastikan tanggal dari backend diformat dengan benar di detail */}
                  <ListItem><ListItemText primary={`Periode: ${selectedProduction.startDate && selectedProduction.endDate ? format(new Date(selectedProduction.startDate), 'dd MMM yyyy') + ' - ' + format(new Date(selectedProduction.endDate), 'dd MMM yyyy') : 'N/A'}`} /></ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Group sx={{ verticalAlign: 'middle', mr: 1 }} />Personel Terlibat
                </Typography>
                <List dense>
                    {/* Pastikan selectedProduction?.personnel adalah array */}
                  {selectedProduction?.personnel && Array.isArray(selectedProduction.personnel) && selectedProduction.personnel.length > 0 ? (
                    selectedProduction.personnel.map((p, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`- ${p}`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Tidak ada personel terlibat." /></ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)} color="primary">Tutup</Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              setOpenDetailDialog(false); // Tutup dialog detail
              handleOpenEditDialog(selectedProduction); // Buka dialog edit dengan data yang sama
            }}
          >
            Edit Produksi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit Produksi */}
      <Dialog open={openEditProductionDialog} onClose={() => setOpenEditProductionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Produksi: {editProductionData?.name}</DialogTitle>
        <DialogContent dividers>
          {editProductionData && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Nama Produksi"
                  value={editProductionData.name || ''}
                  onChange={handleEditProductionChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="target"
                  label="Target (Unit)"
                  type="number"
                  value={editProductionData.target || ''}
                  onChange={handleEditProductionChange}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="completed"
                  label="Selesai (Unit)"
                  // Hapus type="number" di sini
                  value={editProductionData.completed || 0} // Default 0 jika null/undefined
                  onChange={handleEditProductionChange}
                  inputProps={{ min: 0, max: editProductionData.target || 999999, inputMode: 'numeric', pattern: '[0-9]*' }} // Tambahkan inputMode dan pattern
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Tanggal Mulai"
                  type="date"
                  value={editProductionData.startDate || ''}
                  onChange={handleEditProductionChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="endDate"
                  label="Tanggal Selesai (Estimasi)"
                  type="date"
                  value={editProductionData.endDate || ''}
                  onChange={handleEditProductionChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    name="status"
                    value={editProductionData.status || ''}
                    label="Status"
                    onChange={handleEditProductionChange}
                  >
                    <MenuItem value="Dalam Proses">Dalam Proses</MenuItem>
                    <MenuItem value="Selesai">Selesai</MenuItem>
                    <MenuItem value="Tertunda">Tertunda</MenuItem>
                    <MenuItem value="Dibatalkan">Dibatalkan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* Anda bisa menambahkan bagian untuk mengedit personel dan material di sini juga,
                  tetapi itu akan lebih kompleks karena melibatkan penambahan/penghapusan item dalam array.
                  Untuk saat ini, kita fokus pada status dan completed. */}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProductionDialog(false)} variant="outlined">Batal</Button>
          <Button
            variant="contained"
            onClick={handleSaveEditProduction}
            startIcon={<Edit />}
            // Anda bisa menambahkan validasi di sini sebelum mengaktifkan tombol Simpan
            disabled={!editProductionData?.name || !editProductionData?.target || editProductionData?.target <= 0 || !editProductionData?.startDate || !editProductionData?.endDate || (editProductionData?.startDate > editProductionData?.endDate)}
          >
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Dialog Konfirmasi Hapus */}
      <Dialog
        open={openConfirmDeleteDialog}
        onClose={() => setOpenConfirmDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Konfirmasi Penghapusan"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus produksi "<strong>{itemToDelete?.name}</strong>" (ID: {itemToDelete?.id})?
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDeleteDialog(false)} color="primary">
            Batal
          </Button>
          <Button onClick={handleDeleteProduction} color="error" variant="contained" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
