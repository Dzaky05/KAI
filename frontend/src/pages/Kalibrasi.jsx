
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box, Typography, Card, CardContent, Grid, Stepper, Step, StepLabel,
  Button, Divider, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Snackbar, Alert, // Import Snackbar, Alert
  FormControl, InputLabel, Select, MenuItem // Added for potential future use in forms
} from "@mui/material";
import {
  Science as ScienceIcon, CheckCircle, Schedule, Error, Add, Edit, Delete, Close // Import Add, Edit, Delete, Close
} from "@mui/icons-material";
import WarningIcon from '@mui/icons-material/Warning'; // Import WarningIcon

const steps = [
  'Penerimaan Alat',
  'Pemeriksaan Awal',
  'Proses Kalibrasi',
  'Verifikasi Hasil',
  'Sertifikasi'
];

// Data statis asli (akan tetap ada)
const initialStaticCalibrationData = [
  { id: 1, name: "Multimeter Digital", status: "Dalam Proses", progress: 2, dueDate: "2023-12-15" },
  { id: 2, name: "Oscilloscope", status: "Selesai", progress: 5, dueDate: "2023-11-30" },
  { id: 3, name: "Signal Generator", status: "Belum Dimulai", progress: 0, dueDate: "2024-01-10" },
  { id: 4, name: "Power Supply", status: "Dalam Proses", progress: 3, dueDate: "2023-12-05" },
];


// URL endpoint backend Go Anda
const API_URL = 'http://localhost:8080/api/kalibrasi'; // Ganti jika backend berjalan di URL/port lain


export default function Kalibrasi() {
  // State aktif step (dari kode asli)
  const [activeStep, setActiveStep] = React.useState(2);

  // --- State untuk Data ---
  // State untuk data yang diambil dari backend
  const [backendCalibrationData, setBackendCalibrationData] = useState([]);
  // State untuk status loading saat fetch
  const [loading, setLoading] = useState(true);
  // State untuk error saat fetch
  const [error, setError] = useState(null);
  // Data yang akan ditampilkan (mengutamakan data backend, fallback ke statis)
  const displayedCalibrationData = backendCalibrationData.length > 0 ? backendCalibrationData : initialStaticCalibrationData;

  // --- State untuk Form Tambah Alat ---
  const [newTool, setNewTool] = useState({ name: '', dueDate: '' }); // Form data untuk tambah
  const [openAddDialog, setOpenAddDialog] = useState(false); // Kontrol dialog tambah


  // --- State untuk Form Edit Alat ---
  const [editMode, setEditMode] = useState(false); // Mode edit atau tambah
  const [openEditDialog, setOpenEditDialog] = useState(false); // Kontrol dialog edit
  // State untuk data form edit
  const [editFormData, setEditFormData] = useState({
    id: null, name: '', status: '', progress: '', dueDate: '' // ID merujuk ke ID database
  });


  // --- State untuk Konfirmasi Hapus ---
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null); // ID item yang akan dihapus
  const [itemToDeleteName, setItemToDeleteName] = useState(''); // Nama item yang akan dihapus


  // --- State untuk Snackbar ---
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // State Snackbar


  // --- Fungsi Koneksi Backend ---

  // Fungsi untuk mengambil data dari backend
  const fetchCalibrations = async () => {
    setLoading(true); // Set loading menjadi true
    setError(null); // Reset error
    try {
      const response = await axios.get(API_URL);
       // Berdasarkan kode Go, backend mengembalikan array Calibration
      setBackendCalibrationData(response.data);
    } catch (err) {
      console.error("Error fetching calibrations:", err);
      setError(err); // Simpan error di state
      setSnackbar({ open: true, message: `Gagal memuat data: ${err.message}`, severity: 'error' });
       setBackendCalibrationData([]); // Kosongkan data backend jika fetch gagal
    } finally {
      setLoading(false); // Set loading menjadi false
    }
  };

  // --- useEffect untuk Memuat Data ---
  useEffect(() => {
    fetchCalibrations(); // Ambil data saat komponen pertama kali dimuat
  }, []); // Dependency array kosong berarti efek ini hanya dijalankan sekali saat mount


  // --- Handler untuk Operasi CRUD ---

  // Handler untuk membuka dialog Tambah Alat
  const handleOpenAddDialog = () => {
    setEditMode(false); // Mode tambah
    setNewTool({ name: '', dueDate: '' }); // Reset form tambah
    setOpenAddDialog(true);
  };

   // Handler untuk menutup dialog Tambah Alat dan mereset form
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewTool({ name: '', dueDate: '' }); // Reset form tambah
  };

  // Handler untuk input form Tambah Alat
   const handleNewToolChange = (e) => {
    const { name, value } = e.target;
    setNewTool(prev => ({ ...prev, [name]: value }));
  };


  // Handler untuk menambah alat baru (Menggunakan Axios POST)
  const handleAddTool = async () => {
    if (!newTool.name || !newTool.dueDate) {
      setSnackbar({ open: true, message: "Nama dan Tanggal wajib diisi!", severity: "error" });
      return;
    }

    try {
      // Kirim data ke backend
      const response = await axios.post(API_URL, {
        name: newTool.name,
        status: "Belum Dimulai", // Status awal
        progress: 0,           // Progres awal
        dueDate: newTool.dueDate
        // Jika ada foreign key inventory_id yang perlu dikirim, tambahkan di sini
      });

       // Berdasarkan kode Go, backend mengembalikan item yang baru dibuat dengan ID terisi
      console.log("Item added successfully:", response.data);

      setSnackbar({ open: true, message: "Alat berhasil ditambahkan", severity: "success" });
      handleCloseAddDialog(); // Tutup dialog tambah
      fetchCalibrations(); // Ambil ulang data dari backend untuk memperbarui tampilan

    } catch (err) {
      console.error("Error adding tool:", err);
       const errorMessage = err.response?.data?.error || err.message || "Gagal menambahkan alat";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  // Handler untuk membuka dialog Edit Alat
  const handleOpenEditDialog = (item) => {
    setEditMode(true); // Mode edit
    // Isi form edit dengan data item yang dipilih
    setEditFormData({
      id: item.id, // Menggunakan ID database
      name: item.name || '',
      status: item.status || '',
      progress: item.progress || 0, // Progres dari backend
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '', // Format tanggal yyyy-MM-dd untuk input date
    });
    setOpenEditDialog(true);
  };

  // Handler untuk menutup dialog Edit Alat dan mereset form
   const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
     setEditFormData({ id: null, name: '', status: '', progress: '', dueDate: '' }); // Reset form edit
  };

   // Handler untuk input form Edit Alat
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };


  // Handler untuk menyimpan perubahan alat (Menggunakan Axios PUT)
  const handleSaveEdit = async () => {
     if (!editFormData.name || !editFormData.status || !editFormData.dueDate || editFormData.progress === '' ) {
      setSnackbar({ open: true, message: "Semua kolom wajib diisi!", severity: "error" });
      return;
    }

     // Pastikan progress adalah angka
    const progressNumber = Number(editFormData.progress);
    if (isNaN(progressNumber) || progressNumber < 0 || progressNumber > steps.length) {
         setSnackbar({ open: true, message: `Progres harus angka antara 0 dan ${steps.length}`, severity: "error" });
        return;
    }

    try {
      // Kirim data ke backend
      const response = await axios.put(`${API_URL}/${editFormData.id}`, {
        name: editFormData.name,
        status: editFormData.status,
        progress: progressNumber, // Kirim progress sebagai angka
        dueDate: editFormData.dueDate,
         // Jika ada foreign key inventory_id yang perlu dikirim, tambahkan di sini
      });

      console.log("Item updated successfully:", response.data);

      setSnackbar({ open: true, message: "Alat berhasil diperbarui", severity: "success" });
      handleCloseEditDialog(); // Tutup dialog edit
      fetchCalibrations(); // Ambil ulang data dari backend

    } catch (err) {
      console.error("Error updating tool:", err);
       const errorMessage = err.response?.data?.error || err.message || "Gagal memperbarui alat";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };


  // Handler untuk membuka dialog Konfirmasi Hapus
  const handleDeleteClick = (item) => {
    setItemToDeleteId(item.id); // Menggunakan ID database
    setItemToDeleteName(item.name);
    setOpenConfirmDialog(true);
  };

  // Handler untuk menutup dialog Konfirmasi Hapus
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setItemToDeleteId(null);
    setItemToDeleteName('');
  };

  // Handler untuk mengkonfirmasi dan menghapus alat (Menggunakan Axios DELETE)
  const handleConfirmDelete = async () => {
     if (itemToDeleteId === null) return;

    try {
      // Kirim permintaan delete ke backend
      await axios.delete(`${API_URL}/${itemToDeleteId}`);

      console.log("Item deleted successfully:", itemToDeleteId);

      setSnackbar({ open: true, message: `Alat '${itemToDeleteName}' berhasil dihapus!`, severity: "info" });
      handleCloseConfirmDialog(); // Tutup dialog konfirmasi
      fetchCalibrations(); // Ambil ulang data dari backend

    } catch (err) {
      console.error("Error deleting tool:", err);
       const errorMessage = err.response?.data?.error || err.message || "Gagal menghapus alat";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
       handleCloseConfirmDialog(); // Tutup dialog konfirmasi meskipun error
    }
  };

  // Helper untuk mendapatkan warna chip status
  const getStatusColor = (status) => {
    if (status === 'Selesai') return 'success';
    if (status === 'Dalam Proses') return 'warning';
    if (status === 'Belum Dimulai') return 'error';
    return 'default';
  };

   // Tampilkan pesan loading
    if (loading && backendCalibrationData.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Typography>Memuat data kalibrasi...</Typography></Box>;
    }

    // Tampilkan pesan error jika data backend kosong dan ada error
     if (error && backendCalibrationData.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'error.main' }}>
                <Typography>Gagal memuat data. {error.message}</Typography>
               </Box>;
    }


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ScienceIcon fontSize="large" sx={{ color: '#9C27B0', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Sistem Kalibrasi Alat
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Proses Kalibrasi
              </Typography>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => ( // Menggunakan index sebagai key
                  <Step key={index}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Daftar Alat yang Dikalibrasi
              </Typography>
              {/* Tampilkan pesan loading atau error jika data backend kosong tapi masih ada data statis */}
               {loading && backendCalibrationData.length === 0 && initialStaticCalibrationData.length > 0 && (
                 <Box sx={{ textAlign: 'center', mb: 2 }}><Typography variant="body2" color="text.secondary">Memuat data terbaru...</Typography></Box>
               )}
               {error && backendCalibrationData.length === 0 && initialStaticCalibrationData.length > 0 && (
                 <Box sx={{ textAlign: 'center', mb: 2, color: 'error.main' }}><Typography variant="body2">Gagal memuat data terbaru.</Typography></Box>
               )}

              <Grid container spacing={2}>
                {/* Menggunakan data yang ditampilkan */}
                {displayedCalibrationData.map((item) => (
                  <Grid item xs={12} key={item.id}> {/* Menggunakan item.id dari data */}
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}> {/* Added flexWrap */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 2 }}> {/* Added mr */}
                          {item.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* Box for chips and buttons */}
                            <Chip
                              label={item.status}
                              icon={
                                item.status === "Selesai" ? <CheckCircle /> :
                                  item.status === "Dalam Proses" ? <Schedule /> : <Error />
                              }
                               color={getStatusColor(item.status)} // Menggunakan helper function
                              variant="outlined"
                              size="small" // Smaller chip
                            />
                             {/* Tombol Edit */}
                            <Tooltip title="Edit Alat">
                                <IconButton size="small" color="primary" onClick={() => handleOpenEditDialog(item)}>
                                    <Edit fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                            {/* Tombol Hapus */}
                             <Tooltip title="Hapus Alat">
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(item)}>
                                    <Delete fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Target Selesai: {item.dueDate}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        // Menggunakan item.progress (dari backend) untuk perhitungan
                        value={(item.progress / steps.length) * 100}
                        sx={{
                          height: 8,
                          mt: 2,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: '#9C27B0'
                          }
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
                 {/* Jika tidak ada data sama sekali (baik backend maupun statis) */}
                {displayedCalibrationData.length === 0 && !loading && !error && (
                    <Grid item xs={12}>
                         <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                            <Typography variant="h6">Tidak ada data kalibrasi.</Typography>
                            <Typography variant="body2">Klik "Tambah Alat Baru" untuk menambahkan.</Typography>
                         </Box>
                    </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Statistik Kalibrasi
              </Typography>
               {/* Statistik dihitung berdasarkan displayedCalibrationData */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(156, 39, 176, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                      {displayedCalibrationData.length}
                    </Typography>
                    <Typography variant="body2">Total Alat</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                       {displayedCalibrationData.filter(item => item.status === 'Selesai').length}
                    </Typography>
                    <Typography variant="body2">Selesai</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                      {displayedCalibrationData.filter(item => item.status === 'Dalam Proses').length}
                    </Typography>
                    <Typography variant="body2">Dalam Proses</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                       {displayedCalibrationData.filter(item => item.status === 'Belum Dimulai').length}
                    </Typography>
                    <Typography variant="body2">Belum Dimulai</Typography>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tombol Tambah Alat Baru */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              backgroundColor: '#9C27B0',
              '&:hover': { backgroundColor: '#7B1FA2' },
              py: 1.5,
              borderRadius: 2
            }}
            onClick={handleOpenAddDialog} // Memanggil handler untuk membuka dialog tambah
          >
            Tambah Alat Baru
          </Button>
        </Grid>
      </Grid>

      {/* Dialog Tambah Alat */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Alat Kalibrasi</DialogTitle>
        <DialogContent dividers> {/* Added dividers */}
          <TextField
            autoFocus
            margin="dense"
            name="name" // Ditambahkan nama untuk input
            label="Nama Alat"
            type="text"
            fullWidth
            variant="outlined"
            value={newTool.name}
            onChange={handleNewToolChange} // Memanggil handler change
          />
          <TextField
            margin="dense"
            name="dueDate" // Ditambahkan nama untuk input
            label="Tanggal Target Selesai"
            type="date"
            fullWidth
            variant="outlined" // Changed to outlined
            InputLabelProps={{ shrink: true }}
            value={newTool.dueDate}
            onChange={handleNewToolChange} // Memanggil handler change
          />
           {/* Tambahkan field lain jika perlu di form tambah */}
           {/* Contoh: TextField untuk foreign key inventory_id jika frontend mengelolanya */}
           {/*
           <TextField
                margin="dense"
                name="inventoryId"
                label="ID Inventory Terkait (Opsional)"
                type="number"
                fullWidth
                variant="outlined"
                value={newTool.inventoryId || ''}
                onChange={handleNewToolChange}
            />
            */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Batal</Button>
          <Button variant="contained" onClick={handleAddTool} sx={{ bgcolor: '#9C27B0' }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>


       {/* Dialog Edit Alat */}
       <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
            <DialogTitle>Edit Alat Kalibrasi</DialogTitle>
            <DialogContent dividers> {/* Added dividers */}
                <TextField
                    margin="dense"
                    name="name"
                    label="Nama Alat"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={editFormData.name}
                    onChange={handleEditFormChange} // Memanggil handler change
                />
                 {/* Form Control untuk Status */}
                 <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={editFormData.status}
                      label="Status"
                      onChange={handleEditFormChange} // Memanggil handler change
                    >
                        <MenuItem value="Belum Dimulai">Belum Dimulai</MenuItem>
                        <MenuItem value="Dalam Proses">Dalam Proses</MenuItem>
                        <MenuItem value="Selesai">Selesai</MenuItem>
                    </Select>
                </FormControl>

                 {/* TextField untuk Progres */}
                <TextField
                    margin="dense"
                    name="progress"
                    label={`Langkah Progres (0-${steps.length})`} // Menampilkan jumlah langkah
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={editFormData.progress}
                    onChange={handleEditFormChange} // Memanggil handler change
                     inputProps={{ min: 0, max: steps.length }} // Batasan input
                />

                <TextField
                    margin="dense"
                    name="dueDate"
                    label="Tanggal Target Selesai"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={editFormData.dueDate}
                    onChange={handleEditFormChange} // Memanggil handler change
                />
                 {/* Tambahkan field lain jika perlu di form edit */}
                  {/* Contoh: TextField untuk foreign key inventory_id jika frontend mengelolanya */}
                 {/*
                 <TextField
                      margin="dense"
                      name="inventoryId"
                      label="ID Inventory Terkait (Opsional)"
                      type="number"
                      fullWidth
                      variant="outlined"
                      value={editFormData.inventoryId || ''}
                      onChange={handleEditFormChange}
                  />
                 */}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseEditDialog}>Batal</Button>
                <Button variant="contained" onClick={handleSaveEdit} sx={{ bgcolor: '#9C27B0' }}>
                    Simpan Perubahan
                </Button>
            </DialogActions>
        </Dialog>


        {/* Confirmation Dialog for Deletion */}
        <Dialog
            open={openConfirmDialog}
            onClose={handleCloseConfirmDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <Box display="flex" alignItems="center">
                    <WarningIcon color="warning" sx={{ mr: 1 }} /> Konfirmasi Hapus Alat
                </Box>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Anda yakin ingin menghapus alat "<strong>{itemToDeleteName}</strong>" ini dari daftar kalibrasi? Tindakan ini tidak dapat dibatalkan.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseConfirmDialog} color="primary">
                    Batal
                </Button>
                <Button onClick={handleConfirmDelete} color="error" autoFocus>
                    Hapus
                </Button>
            </DialogActions>
        </Dialog>


      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
 