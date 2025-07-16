import React, { useState, useEffect } from 'react'; // PASTIKAN useEffect DIIMPORT

import axios from 'axios';
import {
  Box, Typography, Card, CardContent, LinearProgress,
  List, ListItem, ListItemText, Divider, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  Snackbar, Alert, TextField, Grid, Tooltip,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Add, CheckCircle, Warning, Error, Visibility, Delete,
  KeyboardArrowLeft, KeyboardArrowRight, Inventory2, Group, Build
} from '@mui/icons-material';
import { format } from 'date-fns';

// HAPUS ATAU ABAIKAN DATA STATIS INI
// const initialProductionData = [...]


const steps = [
  "Informasi Umum",
  "Personel",
  "Material",
  "Konfirmasi"
];

export default function Produksi() {
  // --- Deklarasi State Hooks ---
  // INISIALISASI DENGAN ARRAY KOSONG
  const [productionData, setProductionData] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newProduction, setNewProduction] = useState({
    name: "",
    target: "",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: "",
    personnel: [], // Perlu disesuaikan jika backend butuh format lain (misal: array ID)
    materials: [], // Perlu disesuaikan agar sesuai dengan backend (saat ini tidak sesuai FK tunggal)
    progress: [], // Perlu disesuaikan agar sesuai dengan backend
    currentPersonnel: "",
    currentMaterialName: "",
    currentMaterialQty: "",
    currentMaterialHarga: "",
    currentMaterialSatuan: ""
  });
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [personnelOptions, setPersonnelOptions] = useState([]); // State baru untuk menyimpan daftar personel dari backend
  
  // TAMBAHKAN STATE LOADING DAN ERROR
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // --- END Deklarasi State Hooks ---


  // --- Effect untuk Memuat Data dari Backend (RUN SAAT COMPONENT MOUNT) ---
  useEffect(() => {
    const fetchProductionData = async () => {
      setLoading(true); // Set loading menjadi true saat memulai fetch
      setError(null);   // Reset error state
      try {
        // PANGGIL ENDPOINT GET PRODUKSI
        const response = await axios.get('http://localhost:8080/api/produksi'); // Sesuaikan URL jika perlu
        // ISI STATE DENGAN DATA DARI BACKEND
        setProductionData(response.data);
      } catch (error) {
        console.error("Error fetching production data:", error);
        setError(error); // Simpan error di state
        setSnackbar({ open: true, message: "Gagal memuat data produksi. Silakan coba refresh.", severity: "error" });
      } finally {
        setLoading(false); // Set loading menjadi false setelah fetch selesai (sukses atau error)
      }
    };

    fetchProductionData(); // Panggil fungsi fetch saat komponen mount

  }, []); // Dependency array kosong ([]) berarti effect ini hanya berjalan sekali

  // ... END Effect untuk Memuat Data dari Backend (Produksi) ...

      // Effect untuk memuat data personel dari backend saat komponen dimuat
      useEffect(() => {
        const fetchPersonnelOptions = async () => {
          try {
            // SESUAIKAN URL ENDPOINT PERSONALIA JIKA PERLU
            const response = await axios.get('http://localhost:8080/api/personalia');
            // Asumsikan respons backend adalah array objek personel, masing-masing dengan field 'id' (Primary Key) dan 'name' (atau 'nama')
            // Pastikan struktur data dari backend `/api/personalia` memiliki field ID yang unik.
            setPersonnelOptions(response.data);
          } catch (error) {
            console.error("Error fetching personnel options:", error);
            // Tangani error, mungkin tampilkan pesan di snackbar
            setSnackbar({ open: true, message: "Gagal memuat opsi personel.", severity: "error" });
          }
        };
        fetchPersonnelOptions();
      }, []); // Jalankan sekali saat komponen mount


      // --- Deklarasi Fungsi-fungsi Handler ---
      // ...

  // --- END Effect untuk Memuat Data dari Backend ---


  // --- Deklarasi Fungsi-fungsi Handler ---
  // Hitung berdasarkan productionData dari state
  const totalProductions = productionData.length;
  const inProgressProductions = productionData.filter(p => p.status === "Dalam Proses").length;
  const completedProductions = productionData.filter(p => p.status === "Selesai").length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (field, valueField) => {
    if (newProduction[valueField].trim()) {
      setNewProduction(prev => ({
        ...prev,
        [field]: [...prev[field], prev[valueField].trim()],
        [valueField]: ""
      }));
    } else {
      setSnackbar({ open: true, message: "Input tidak boleh kosong!", severity: "error" });
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
        materials: [...prev.materials, newMaterial], // Kirim array material ini ke backend
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


  // FUNGSI UNTUK MENYIMPAN KE BACKEND (SETELAH KLIK 'Selesai & Simpan')
  const handleSaveProduction = async () => {
    // Data yang akan dikirim ke backend.
    // Backend akan menggenerate ID database (qc_id) dan ID frontend (FrontendID)
    const itemToSave = {
      // id: newId, // TIDAK PERLU MEMBUAT ID DI FRONTEND
      name: newProduction.name,
      target: parseInt(newProduction.target),
      // completed dan status awal biasanya diset di backend
      completed: 0, // Set awal 0
      status: "Dalam Proses", // Set status awal
      startDate: newProduction.startDate,
      endDate: newProduction.endDate,
      // Perhatikan kesesuaian struktur data personel, material, progress dengan yang diharapkan backend
      personnel: newProduction.personnel, // Mengirim array string (sesuai frontend saat ini)
      materials: newProduction.materials, // Mengirim array objek material (sesuai frontend saat ini)
      progress: newProduction.progress, // Mengirim array objek progress (sesuai frontend saat ini)
      // Jika backend Anda perlu ID frontend saat create, tambahkan di sini.
      // Berdasarkan kode QualityControl.go, FrontendID diparsing dari data input.
      // Jadi, mungkin Anda perlu menambahkan field `FrontendID` di sini jika skema database produksi Anda membutuhkannya,
      // meskipun di QualityControl.go logikanya ada di createQualityControl.
      // Jika Produksi tidak butuh FrontendID saat create, biarkan seperti ini.
    };

    try {
      // Kirim data ke backend menggunakan axios.post
      // URL: /api/produksi
      const response = await axios.post('http://localhost:8080/api/produksi', itemToSave); // Sesuaikan URL jika perlu

      // AMBIL DATA RESPON DARI BACKEND (ITEM PRODUKSI BARU DENGAN ID)
      const createdItem = response.data;

      // UPDATE STATE DENGAN DATA DARI BACKEND
      setProductionData(prev => [...prev, createdItem]);

      // Reset form dan tutup dialog
      setOpenAddDialog(false);
      setActiveStep(0); // Kembali ke step pertama
      setNewProduction({
        name: "", target: "", startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: "", personnel: [], materials: [], progress: [],
        currentPersonnel: "",
        currentMaterialName: "", currentMaterialQty: "", currentMaterialHarga: "", currentMaterialSatuan: ""
      });

      // Tampilkan notifikasi sukses
      setSnackbar({ open: true, message: "Produksi berhasil ditambahkan!", severity: "success" });

    } catch (error) {
      // Tangani error saat menyimpan ke backend
      console.error("Gagal menambahkan produksi:", error);
      // Coba ambil pesan error dari respons backend jika ada
      const errorMessage = error.response?.data?.error || "Gagal menyimpan ke server.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };


  const getStatusInfo = (status) => {
    if (status === "Selesai") return { color: "success", icon: <CheckCircle fontSize="small" /> };
    if (status === "Dalam Proses") return { color: "warning", icon: <Warning fontSize="small" /> };
    // Asumsi status lain adalah error atau default
    return { color: "error", icon: <Error fontSize="small" /> }; // Contoh untuk status selain Selesai/Dalam Proses
  };

  const handleOpenDetail = (item) => {
    setSelectedProduction(item);
    setOpenDetailDialog(true);
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

             {/* Dropdown atau input untuk menambah personel */}
             <Grid container spacing={2} alignItems="center" mb={2}>
             <Grid item xs={8}>
            <TextField
            fullWidth
            select
            label="Pilih Personel"
            value={newProduction.currentPersonnel}
            onChange={(e) => setNewProduction({ ...newProduction, currentPersonnel: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="">-- Pilih Personel --</option>
            {personnelOptions.map((person) => (
              <option key={person.id} value={person.name}>
                {person.name}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddItem("personnel", "currentPersonnel")}
            disabled={!newProduction.currentPersonnel}
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
              key={i}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveItem("personnel", i)}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemText primary={p} />
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
             {/* Perlu dipertimbangkan: Apakah ini input detail material baru atau pilihan dari daftar material yang sudah ada di inventory? */}
             {/* Jika pilihan dari inventory, perlu fetch data inventory dari backend dan gunakan Select/Autocomplete */}
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
           // Tampilkan tabel jika tidak loading dan data tidak kosong (atau jika ada error tapi data tidak kosong)
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
                         <Tooltip title="Lihat Detail">
                           <IconButton onClick={() => handleOpenDetail(item)} size="small">
                             <Visibility />
                           </IconButton>
                         </Tooltip>
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
        {/* Pastikan menggunakan selectedProduction?.id untuk keamanan */}
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
                <Typography variant="h6" gutterBottom mt={2}>
                  <Inventory2 sx={{ verticalAlign: 'middle', mr: 1 }} />Material Digunakan
                </Typography>
                <List dense>
                   {/* Pastikan selectedProduction?.materials adalah array */}
                  {selectedProduction?.materials && Array.isArray(selectedProduction.materials) && selectedProduction.materials.length > 0 ? (
                    selectedProduction.materials.map((m, index) => (
                      <ListItem key={index}>
                        {/* Tampilkan detail material */}
                        <ListItemText primary={`${m.name} (${m.qty} ${m.satuan}${m.harga ? ' @ Rp' + m.harga : ''})`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Tidak ada material digunakan." /></ListItem>
                  )}
                </List>
                <Typography variant="h6" gutterBottom mt={2}>Riwayat Progres</Typography>
                <List dense>
                    {/* Pastikan selectedProduction?.progress adalah array */}
                  {selectedProduction?.progress && Array.isArray(selectedProduction.progress) && selectedProduction.progress.length > 0 ? (
                    selectedProduction.progress.map((p, index) => (
                      <ListItem key={index}>
                        <ListItemText
                           // Pastikan p.date ada dan valid
                          primary={`${p.date ? format(new Date(p.date), 'dd MMM yyyy') : 'N/A'}: ${p.completed} unit selesai (${calculateProgressPercentage(p.completed, selectedProduction.target)}%)`}
                          secondary={p.notes}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Belum ada riwayat progres." /></ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
