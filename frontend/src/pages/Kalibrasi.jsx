// src/pages/Kalibrasi.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import {
    Box, Typography, Card, CardContent, Grid, Stepper, Step, StepLabel,
    Button, Divider, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Tooltip, Snackbar, Alert,
    FormControl, InputLabel, Select, MenuItem, DialogContentText,
    CircularProgress
} from "@mui/material";
import {
    Science as ScienceIcon, CheckCircle, Schedule, Error, Add, Edit, Delete, Close,
    Warning as WarningIcon
} from "@mui/icons-material";
import { format, parseISO, isValid } from 'date-fns'; // Import parseISO dan isValid

const steps = [
    'Penerimaan Alat',
    'Pemeriksaan Awal',
    'Proses Kalibrasi',
    'Verifikasi Hasil',
    'Sertifikasi'
];

// URL endpoint backend Go Anda, menggunakan variabel lingkungan
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/api/kalibrasi`;
const INVENTORY_API_URL = `${API_BASE_URL}/api/inventory`; // URL untuk mengambil data inventory

export default function Kalibrasi() {
    const [activeStep, setActiveStep] = useState(2); // Default step untuk tampilan stepper

    // State untuk data kalibrasi dari backend
    const [backendCalibrationData, setBackendCalibrationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk daftar inventory dari backend (untuk dropdown)
    const [inventoryOptions, setInventoryOptions] = useState([]);
    const [loadingInventoryOptions, setLoadingInventoryOptions] = useState(true);
    const [errorInventoryOptions, setErrorInventoryOptions] = useState(null);

    // State untuk Form Tambah Alat
    const [newTool, setNewTool] = useState({ name: '', status: 'Belum Dimulai', progress: 0, dueDate: null, inventory_id: null }); // Inisialisasi yang lebih baik
    const [openAddDialog, setOpenAddDialog] = useState(false);

    // State untuk Form Edit Alat
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editFormData, setEditFormData] = useState({
        id: null, name: '', status: '', progress: '', dueDate: null, inventory_id: null
    });

    // State untuk Konfirmasi Hapus
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [itemToDeleteName, setItemToDeleteName] = useState('');

    // State untuk Snackbar notifikasi
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // --- Fungsi Koneksi Backend ---

    // Fungsi untuk mengambil data kalibrasi dari backend
    const fetchCalibrations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            setBackendCalibrationData(response.data);
        } catch (err) {
            console.error("Error fetching calibrations:", err);
            setError(err);
            setSnackbar({ open: true, message: `Gagal memuat data kalibrasi: ${err.message}`, severity: 'error' });
            setBackendCalibrationData([]); // Kosongkan data backend jika fetch gagal
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mengambil data inventory dari backend (untuk dropdown)
    const fetchInventoryOptions = async () => {
        setLoadingInventoryOptions(true);
        setErrorInventoryOptions(null);
        try {
            const response = await axios.get(INVENTORY_API_URL);
            if (Array.isArray(response.data)) {
                setInventoryOptions(response.data);
            } else {
                throw new Error("Format data inventory tidak sesuai.");
            }
        } catch (err) {
            console.error("Error fetching inventory options:", err);
            setErrorInventoryOptions(err);
            setSnackbar({ open: true, message: `Gagal memuat opsi inventory: ${err.message || "Terjadi kesalahan."}`, severity: "error" });
        } finally {
            setLoadingInventoryOptions(false);
        }
    };

    // --- useEffect untuk Memuat Data Saat Komponen Dimuat ---
    useEffect(() => {
        fetchCalibrations();
        fetchInventoryOptions(); // Ambil data inventory saat komponen dimuat
    }, []);

    // Data yang akan ditampilkan (saat ini langsung dari backend)
    const displayedCalibrationData = backendCalibrationData;

    // --- Handler untuk Operasi CRUD ---

    // Membuka dialog Tambah Alat
    const handleOpenAddDialog = () => {
        // Reset form dengan nilai default yang benar
        setNewTool({ 
            name: '', 
            status: 'Belum Dimulai', 
            progress: 0, 
            dueDate: null, // Null untuk DateTimePicker
            inventory_id: null 
        }); 
        setOpenAddDialog(true);
    };

    // Menutup dialog Tambah Alat
    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewTool({ name: '', status: 'Belum Dimulai', progress: 0, dueDate: null, inventory_id: null }); // Reset penuh
    };

    // Menangani perubahan input di form Tambah Alat
    const handleNewToolChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'inventory_id') {
            // Konversi ke number atau null jika string kosong
            newValue = value === '' ? null : parseInt(value, 10);
        } else if (name === 'dueDate') {
            // Biarkan sebagai string untuk input type="date", akan di-parse saat submit
            // Atau jika menggunakan DateTimePicker, ini akan menjadi Date object
        } else if (name === 'progress') {
            newValue = Number(value);
            if (isNaN(newValue)) newValue = 0;
        }

        setNewTool(prev => ({ ...prev, [name]: newValue }));
    };

    // Menambah alat baru ke backend
    const handleAddTool = async () => {
        if (!newTool.name || !newTool.dueDate) { // dueDate harus ada, meskipun mungkin string kosong dari input type="date"
            setSnackbar({ open: true, message: "Nama dan Tanggal Jatuh Tempo wajib diisi!", severity: "error" });
            return;
        }

        // Validasi progress
        const progressNumber = Number(newTool.progress);
        if (isNaN(progressNumber) || progressNumber < 0 || progressNumber >= steps.length) {
            setSnackbar({ open: true, message: `Progres harus angka antara 0 dan ${steps.length - 1}.`, severity: "error" });
            return;
        }

        // --- PENTING: FORMAT dueDate ke ISO String ---
        let formattedDueDate = null;
        try {
            // Jika newTool.dueDate adalah string dari input type="date", parse dulu
            // Jika Anda beralih ke DateTimePicker, newTool.dueDate akan menjadi Date object
            const dateObj = newTool.dueDate instanceof Date 
                            ? newTool.dueDate 
                            : parseISO(newTool.dueDate); // Asumsi newTool.dueDate adalah 'YYYY-MM-DD' dari input date

            if (isValid(dateObj)) {
                formattedDueDate = dateObj.toISOString(); // Format ke ISO string (e.g., "2025-07-22T00:00:00.000Z")
            } else {
                setSnackbar({ open: true, message: "Format Tanggal Jatuh Tempo tidak valid.", severity: "error" });
                return;
            }
        } catch (e) {
            console.error("Error parsing dueDate:", e);
            setSnackbar({ open: true, message: "Format Tanggal Jatuh Tempo tidak valid.", severity: "error" });
            return;
        }
        
        // Membangun payload tanpa duplikasi field
        const itemToSave = {
            name: newTool.name,
            status: newTool.status, // Ambil dari state newTool (default "Belum Dimulai")
            progress: progressNumber,
            dueDate: formattedDueDate,
            inventory_id: newTool.inventory_id, // Sudah dihandle ke null/int di handleNewToolChange
        };

        console.log("[DEBUG] Payload Add Kalibrasi:", itemToSave); // Debugging payload

        try {
            const response = await axios.post(API_URL, itemToSave);
            console.log("Item added successfully:", response.data);
            setSnackbar({ open: true, message: "Alat berhasil ditambahkan", severity: "success" });
            handleCloseAddDialog();
            fetchCalibrations(); // Ambil ulang data untuk memperbarui tampilan
        } catch (err) {
            console.error("Error adding tool:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Gagal menambahkan alat";
            setSnackbar({ open: true, message: errorMessage, severity: "error" });
        }
    };

    // Membuka dialog Edit Alat
    const handleOpenEditDialog = (item) => {
        let parsedDueDate = null;
        if (item.dueDate) {
            try {
                // Parse ISO string dari backend ke Date object
                const dateObj = parseISO(item.dueDate);
                if (isValid(dateObj)) {
                    // Kemudian format ke 'yyyy-MM-dd' untuk input type="date"
                    parsedDueDate = format(dateObj, 'yyyy-MM-dd');
                } else {
                    console.warn(`[WARN] Invalid dueDate string from backend for item ID ${item.id}: ${item.dueDate}`);
                }
            } catch (e) {
                console.error(`[ERROR] Failed to parse dueDate string for item ID ${item.id}: ${item.dueDate}`, e);
            }
        }

        setEditFormData({
            id: item.id,
            name: item.name || '',
            status: item.status || 'Belum Dimulai', // Default status jika kosong
            progress: item.progress !== undefined && item.progress !== null ? Number(item.progress) : 0,
            dueDate: parsedDueDate,
            inventory_id: item.inventory_id || null // Pastikan ini null jika tidak ada
        });
        setOpenEditDialog(true);
    };

    // Menutup dialog Edit Alat
    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditFormData({ 
            id: null, 
            name: '', 
            status: '', 
            progress: 0, 
            dueDate: null, 
            inventory_id: null 
        });
    };

    // Menangani perubahan input di form Edit Alat
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'progress') {
            newValue = Number(value);
            if (isNaN(newValue)) newValue = 0;
        } else if (name === 'inventory_id') {
            newValue = value === '' ? null : parseInt(value, 10);
        }
        // dueDate dari input type="date" sudah berupa string 'YYYY-MM-DD', biarkan saja
        setEditFormData(prevData => ({ ...prevData, [name]: newValue }));
    };

    // Menyimpan perubahan alat ke backend
    const handleSaveEdit = async () => {
        if (!editFormData.name || !editFormData.status || !editFormData.dueDate || editFormData.progress === '') {
            setSnackbar({ open: true, message: "Nama, Status, Tanggal Jatuh Tempo, dan Progres wajib diisi!", severity: "error" });
            return;
        }

        const progressNumber = Number(editFormData.progress);
        if (isNaN(progressNumber) || progressNumber < 0 || progressNumber >= steps.length) {
            setSnackbar({ open: true, message: `Progres harus angka antara 0 dan ${steps.length - 1}`, severity: "error" });
            return;
        }

        // --- PENTING: FORMAT dueDate ke ISO String ---
        let formattedDueDate = null;
        try {
            const dateObj = editFormData.dueDate instanceof Date 
                            ? editFormData.dueDate 
                            : parseISO(editFormData.dueDate); // Asumsi 'YYYY-MM-DD' dari input date

            if (isValid(dateObj)) {
                formattedDueDate = dateObj.toISOString();
            } else {
                setSnackbar({ open: true, message: "Format Tanggal Jatuh Tempo tidak valid.", severity: "error" });
                return;
            }
        } catch (e) {
            console.error("Error parsing dueDate for edit:", e);
            setSnackbar({ open: true, message: "Format Tanggal Jatuh Tempo tidak valid.", severity: "error" });
            return;
        }

        const itemToUpdate = {
            name: editFormData.name,
            status: editFormData.status,
            progress: progressNumber,
            dueDate: formattedDueDate,
            inventory_id: editFormData.inventory_id,
        };

        console.log("[DEBUG] Payload Edit Kalibrasi:", itemToUpdate); // Debugging payload

        try {
            const response = await axios.put(`${API_URL}/${editFormData.id}`, itemToUpdate);
            console.log("Item updated successfully:", response.data);
            setSnackbar({ open: true, message: "Alat berhasil diperbarui", severity: "success" });
            handleCloseEditDialog();
            fetchCalibrations(); // Ambil ulang data
        } catch (err) {
            console.error("Error updating tool:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Gagal memperbarui alat";
            setSnackbar({ open: true, message: errorMessage, severity: "error" });
        }
    };

    // Membuka dialog Konfirmasi Hapus
    const handleDeleteClick = (item) => {
        setItemToDeleteId(item.id);
        setItemToDeleteName(item.name);
        setOpenConfirmDialog(true);
    };

    // Menutup dialog Konfirmasi Hapus
    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setItemToDeleteId(null);
        setItemToDeleteName('');
    };

    // Mengkonfirmasi dan menghapus alat dari backend
    const handleConfirmDelete = async () => {
        if (itemToDeleteId === null) return;

        try {
            await axios.delete(`${API_URL}/${itemToDeleteId}`);
            console.log("Item deleted successfully:", itemToDeleteId);
            setSnackbar({ open: true, message: `Alat '${itemToDeleteName}' berhasil dihapus!`, severity: "info" });
            handleCloseConfirmDialog();
            fetchCalibrations(); // Ambil ulang data
        } catch (err) {
            console.error("Error deleting tool:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Gagal menghapus alat";
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

    // Tampilkan pesan loading atau error awal saat data utama belum dimuat
    if (loading && backendCalibrationData.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <CircularProgress size={50} sx={{ mb: 2 }} />
                <Typography variant="h6">Memuat data kalibrasi...</Typography>
            </Box>
        );
    }

    if (error && backendCalibrationData.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'error.main' }}>
                <WarningIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">Gagal memuat data kalibrasi.</Typography>
                <Typography variant="body1">{error.message || "Terjadi kesalahan tidak diketahui."}</Typography>
                <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchCalibrations}>Coba Lagi</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ScienceIcon fontSize="large" sx={{ color: '#9C27B0', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Sistem Kalibrasi Alat
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Bagian Proses Kalibrasi & Daftar Alat */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 2, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Proses Kalibrasi
                            </Typography>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map((label, index) => (
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
                            {loading && backendCalibrationData.length === 0 ? (
                                <Box sx={{ textAlign: 'center', mb: 2 }}><CircularProgress size={24} /><Typography variant="body2" color="text.secondary">Memuat data...</Typography></Box>
                            ) : error && backendCalibrationData.length === 0 ? (
                                <Box sx={{ textAlign: 'center', mb: 2, color: 'error.main' }}><Typography variant="body2">Gagal memuat data.</Typography></Box>
                            ) : backendCalibrationData.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                                    <Typography variant="h6">Tidak ada data kalibrasi.</Typography>
                                    <Typography variant="body2">Klik "Tambah Alat Baru" untuk menambahkan.</Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {backendCalibrationData.map((item) => (
                                        <Grid item xs={12} key={item.id}>
                                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 2 }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            label={item.status}
                                                            icon={
                                                                item.status === "Selesai" ? <CheckCircle /> :
                                                                item.status === "Dalam Proses" ? <Schedule /> : <Error />
                                                            }
                                                            color={getStatusColor(item.status)}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                        <Tooltip title="Edit Alat">
                                                            <IconButton size="small" color="primary" onClick={() => handleOpenEditDialog(item)}>
                                                                <Edit fontSize="small"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Hapus Alat">
                                                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(item)}>
                                                                <Delete fontSize="small"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    Target Selesai: {item.dueDate ? format(parseISO(item.dueDate), 'dd MMM yyyy') : 'N/A'}
                                                </Typography>
                                                {item.inventory && ( // Tampilkan nama inventory jika ada
                                                    <Typography variant="body2" color="text.secondary">
                                                        Inventory: {item.inventory.name} ({item.inventory.itemCode})
                                                    </Typography>
                                                )}
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(item.progress / (steps.length -1)) * 100} /* dibagi steps.length -1 karena progress 0-indexed */
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
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bagian Statistik & Tombol Tambah */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Statistik Kalibrasi
                            </Typography>
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
                        onClick={handleOpenAddDialog}
                    >
                        Tambah Alat Baru
                    </Button>
                </Grid>
            </Grid>

            {/* Dialog Tambah Alat */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
                <DialogTitle>Tambah Alat Kalibrasi</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Nama Alat"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTool.name}
                        onChange={handleNewToolChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="dueDate"
                        label="Tanggal Target Selesai"
                        type="date"
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={newTool.dueDate || ''} // Pastikan ini string kosong jika null
                        onChange={handleNewToolChange}
                        required
                    />
                    <FormControl fullWidth margin="dense" variant="outlined" disabled={loadingInventoryOptions}>
                        <InputLabel>Pilih Inventory (Opsional)</InputLabel>
                        <Select
                            name="inventory_id"
                            value={newTool.inventory_id === null ? '' : newTool.inventory_id} // Tampilkan '' jika null
                            label="Pilih Inventory (Opsional)"
                            onChange={handleNewToolChange}
                            error={!!errorInventoryOptions}
                        >
                            <MenuItem value=""><em>Tidak ada</em></MenuItem>
                            {loadingInventoryOptions ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 1 }} /> Memuat inventory...
                                </MenuItem>
                            ) : inventoryOptions.length === 0 ? (
                                <MenuItem disabled>Tidak ada inventory tersedia.</MenuItem>
                            ) : (
                                inventoryOptions.map((inv) => (
                                    <MenuItem key={inv.id} value={inv.id}>
                                        {inv.name} ({inv.itemCode})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        {errorInventoryOptions && <Typography color="error" variant="caption">{`Error: ${errorInventoryOptions.message}`}</Typography>}
                    </FormControl>
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
                <DialogContent dividers>
                    <TextField
                        margin="dense"
                        name="name"
                        label="Nama Alat"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        required
                    />
                    <FormControl fullWidth margin="dense" variant="outlined">
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={editFormData.status}
                            label="Status"
                            onChange={handleEditFormChange}
                        >
                            <MenuItem value="Belum Dimulai">Belum Dimulai</MenuItem>
                            <MenuItem value="Dalam Proses">Dalam Proses</MenuItem>
                            <MenuItem value="Selesai">Selesai</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        name="progress"
                        label={`Langkah Progres (0-${steps.length - 1})`}
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editFormData.progress}
                        onChange={handleEditFormChange}
                        inputProps={{ min: 0, max: steps.length - 1 }}
                        required
                    />

                    <TextField
                        margin="dense"
                        name="dueDate"
                        label="Tanggal Target Selesai"
                        type="date"
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        value={editFormData.dueDate || ''} // Pastikan ini string kosong jika null
                        onChange={handleEditFormChange}
                        required
                    />
                    <FormControl fullWidth margin="dense" variant="outlined" disabled={loadingInventoryOptions}>
                        <InputLabel>Pilih Inventory (Opsional)</InputLabel>
                        <Select
                            name="inventory_id"
                            value={editFormData.inventory_id === null ? '' : editFormData.inventory_id} // Tampilkan '' jika null
                            label="Pilih Inventory (Opsional)"
                            onChange={handleEditFormChange}
                            error={!!errorInventoryOptions}
                        >
                            <MenuItem value=""><em>Tidak ada</em></MenuItem>
                            {loadingInventoryOptions ? (
                                <MenuItem disabled>Memuat inventory...</MenuItem>
                            ) : inventoryOptions.length === 0 ? (
                                <MenuItem disabled>Tidak ada inventory tersedia.</MenuItem>
                            ) : (
                                inventoryOptions.map((inv) => (
                                    <MenuItem key={inv.id} value={inv.id}>
                                        {inv.name} ({inv.itemCode})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        {errorInventoryOptions && <Typography color="error" variant="caption">{`Error: ${errorInventoryOptions.message}`}</Typography>}
                    </FormControl>
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