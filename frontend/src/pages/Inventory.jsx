import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios'; // Tidak perlu axios jika menggunakan fetch API
import {
  Box, Typography, Card, CardContent, Grid, TextField,
  Button, IconButton, InputLabel, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip, Drawer, Divider,
  Snackbar, Alert, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle,
  useTheme, CircularProgress
} from '@mui/material';
import {
  Add, Delete, Edit, Download, Close,
  Warning as WarningIcon,
  Search
} from '@mui/icons-material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Inventory() {
  const theme = useTheme();

  const [inventoryData, setInventoryData] = useState([]);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', quantity: '', location: '', status: '', itemCode: '' });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [itemToDeleteName, setItemToDeleteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL endpoint backend Go Anda - Langsung menggunakan import.meta.env.VITE_API_URL
  // const API_BASE_URL = import.meta.env.VITE_API_URL; // Baris ini dihapus

  // Fungsi untuk mengambil data dari backend
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Langsung menggunakan import.meta.env.VITE_API_URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`);
      
      if (!response.ok) {
        let errorDetails = 'Unknown error';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.details || 'Unknown error from server';
        } catch (jsonError) {
          errorDetails = response.statusText || 'Non-JSON error response';
        }
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorDetails}`);
      }
      const data = await response.json();
      setInventoryData(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err);
      setSnackbar({ open: true, message: `Gagal memuat data: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Ambil data dari backend saat komponen pertama kali dimuat
  useEffect(() => {
    fetchInventory();
  }, []);

  // Memoized data untuk filtering agar tidak dihitung ulang setiap render jika data tidak berubah
  const filteredData = useMemo(() => {
    return inventoryData.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase()) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(search.toLowerCase()))
    );
  }, [inventoryData, search]);

  const handleOpenDrawer = (item = null) => {
    if (item) {
      setEditMode(true);
      setCurrentItem({
        id: item.id,
        name: item.name || '',
        quantity: item.quantity || '',
        location: item.location || '',
        status: item.status || '',
        itemCode: item.itemCode || ''
      });
    } else {
      setEditMode(false);
      setCurrentItem({ id: null, name: '', quantity: '', location: '', status: 'Tersedia', itemCode: '' });
    }
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setCurrentItem({ id: null, name: '', quantity: '', location: '', status: 'Tersedia', itemCode: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentItem.name || currentItem.quantity === '' || !currentItem.location || !currentItem.status || !currentItem.itemCode) {
      setSnackbar({ open: true, message: 'Semua kolom wajib diisi!', severity: 'error' });
      return;
    }

    const itemToSave = {
      name: currentItem.name,
      quantity: Number(currentItem.quantity),
      location: currentItem.location,
      status: currentItem.status,
      itemCode: currentItem.itemCode,
    };

    try {
      let response;
      let successMessage;
      let method;
      let url;

      if (editMode) {
        method = 'PUT';
        url = `${import.meta.env.VITE_API_URL}/api/inventory/${currentItem.id}`; // Langsung menggunakan import.meta.env.VITE_API_URL
        successMessage = 'Data item berhasil diperbarui!';
      } else {
        method = 'POST';
        url = `${import.meta.env.VITE_API_URL}/api/inventory`; // Langsung menggunakan import.meta.env.VITE_API_URL
        successMessage = 'Item berhasil ditambahkan!';
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemToSave),
      });

      if (!response.ok) {
        let errorDetails = 'Unknown error';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.details || 'Unknown error from server';
        } catch (jsonError) {
          errorDetails = response.statusText || 'Non-JSON error response';
        }
        throw new Error(`Failed to save data: ${response.status} ${response.statusText} - ${errorDetails}`);
      }

      const savedItem = await response.json();

      if (editMode) {
        setInventoryData(prev => prev.map(item =>
          item.id === savedItem.id ? savedItem : item
        ));
      } else {
        setInventoryData(prev => [...prev, savedItem]);
      }

      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      handleCloseDrawer();

    } catch (err) {
      console.error("Error saving inventory item:", err);
      setSnackbar({ open: true, message: `Gagal menyimpan data: ${err.message}`, severity: 'error' });
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDeleteId(item.id);
    setItemToDeleteName(item.name);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setItemToDeleteId(null);
    setItemToDeleteName('');
  };

  const handleConfirmDelete = async () => {
    if (itemToDeleteId === null) return;

    try {
      // Langsung menggunakan import.meta.env.VITE_API_URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/${itemToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorDetails = 'Unknown error';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.details || 'Unknown error from server';
        } catch (jsonError) {
          errorDetails = response.statusText || 'Non-JSON error response';
        }
        throw new Error(`Failed to delete data: ${response.status} ${response.statusText} - ${errorDetails}`);
      }

      setInventoryData(prev => prev.filter(item => item.id !== itemToDeleteId));
      setSnackbar({ open: true, message: `Item '${itemToDeleteName}' berhasil dihapus!`, severity: 'info' });

    } catch (err) {
      console.error("Error deleting inventory item:", err);
      setSnackbar({ open: true, message: `Gagal menghapus data: ${err.message}`, severity: 'error' });
    } finally {
      setOpenConfirmDialog(false);
      setItemToDeleteId(null);
      setItemToDeleteName('');
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(inventoryData.map(item => ({
      ID: item.id,
      "Nama Barang": item.name,
      "Kuantitas": item.quantity,
      "Lokasi": item.location,
      "Status": item.status,
      "Kode Item": item.itemCode
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Laporan_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setSnackbar({ open: true, message: 'Data diekspor ke Excel!', severity: 'success' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Laporan Inventory Barang', 14, 16);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Nama Barang', 'Kuantitas', 'Lokasi', 'Status', 'Kode Item']],
      body: inventoryData.map(i => [
        i.id, i.name, i.quantity, i.location, i.status, i.itemCode
      ]),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    doc.save(`Laporan_Inventory_${new Date().toISOString().slice(0, 10)}.pdf`);
    setSnackbar({ open: true, message: 'Data diekspor ke PDF!', severity: 'success' });
  };

  const getStatusColor = (status) => {
    if (status === 'Tersedia') return 'success';
    if (status === 'Limit') return 'warning';
    if (status === 'Tidak Tersedia') return 'error';
    if (status === 'Diproduksi') return 'info';
    if (status === 'Perbaikan') return 'default';
    return 'default';
  };

  const totalItems = inventoryData.length;
  const availableItems = inventoryData.filter(item => item.status === 'Tersedia').length;
  const limitedItems = inventoryData.filter(item => item.status === 'Limit').length;
  const unavailableItems = inventoryData.filter(item => item.status === 'Tidak Tersedia').length;
  const producedItems = inventoryData.filter(item => item.status === 'Diproduksi').length;
  const overhaulItems = inventoryData.filter(item => item.status === 'Overhaul').length;
  const engineeredItems = inventoryData.filter(item => item.status === 'Rekayasa').length;
  const repairedItems = inventoryData.filter(item => item.status === 'Perbaikan').length;

  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);

  const mostQuantityItem = inventoryData.reduce((prev, current) => {
    return (prev && current && prev.quantity !== undefined && current.quantity !== undefined && prev.quantity > current.quantity) ? prev : current;
  }, { name: 'N/A', quantity: 0 });

  // Tampilkan pesan loading atau error
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="h6">Memuat data...</Typography>
      </Box>
    );
  }

  if (error && inventoryData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'error.main' }}>
        <WarningIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6">Gagal memuat data.</Typography>
        <Typography variant="body1">{error.message}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchInventory}>Coba Lagi</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box display="flex" alignItems="center" mb={3}>
        <InventoryIcon sx={{ color: '#007BFF', fontSize: 36, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Manajemen Inventory Barang</Typography>
      </Box>

      {/* Ringkasan Data */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Total Item Jenis</Typography>
              <Typography variant="h5" component="div" fontWeight="bold">{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Jumlah Barang</Typography>
              <Typography variant="h5" component="div" fontWeight="bold">{totalQuantity}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Tersedia</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="success.main">{availableItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Limit</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="warning.main">{limitedItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Diproduksi</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="info.main">{producedItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Overhaul</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="default">{overhaulItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Rekayasa</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="default">{engineeredItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Perbaikan</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="default">{repairedItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Card for Most Quantity Item */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Barang Paling Sering Dipakai</Typography>
              <Typography variant="h5" component="div" fontWeight="bold">
                {mostQuantityItem.name} ({mostQuantityItem.quantity})
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Aksi */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
        <TextField
          size="small"
          label="Cari Nama/Lokasi/Status/Kode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<Download />} onClick={exportExcel}>Excel</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={exportPDF}>PDF</Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ bgcolor: '#007BFF', '&:hover': { bgcolor: '#0056b3' } }}
            onClick={() => handleOpenDrawer()}
          >
            Tambah Item
          </Button>
        </Box>
      </Box>

      {/* Tabel Inventory */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nama Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Kode Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Kuantitas</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lokasi Pengerjaan</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Tidak ada item inventory ditemukan.</TableCell>
              </TableRow>
            ) : (
              filteredData.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDrawer(item)}><Edit color="primary" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton onClick={() => handleDeleteClick(item)}><Delete color="error" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
            {/* Tambahkan indikator loading di dalam tabel jika loading */}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                  <Typography>Memuat...</Typography>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>Jumlah Barang :</TableCell>
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>{totalQuantity}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} align="center">
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drawer Tambah/Edit Item */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: '90%', sm: 450 },
            top: theme.mixins.toolbar.minHeight,
            [theme.breakpoints.up('sm')]: {
              top: theme.mixins.toolbar[theme.breakpoints.up('sm')].minHeight,
            },
            height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
            [theme.breakpoints.up('sm')]: {
              height: `calc(100vh - ${theme.mixins.toolbar[theme.breakpoints.up('sm')].minHeight}px)`,
            },
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">{editMode ? 'Edit Item Inventory' : 'Tambah Item Inventory Baru'}</Typography>
            <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Item"
                name="name"
                value={currentItem.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kode Item"
                name="itemCode"
                value={currentItem.itemCode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kuantitas"
                name="quantity"
                type="number"
                value={currentItem.quantity}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lokasi"
                name="location"
                value={currentItem.location}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentItem.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="Tersedia">Tersedia</MenuItem>
                  <MenuItem value="Limit">Limit</MenuItem>
                  <MenuItem value="Tidak Tersedia">Tidak Tersedia</MenuItem>
                  <MenuItem value="Diproduksi">Diproduksi</MenuItem>
                  <MenuItem value="Perbaikan">Perbaikan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                sx={{ bgcolor: '#007BFF', '&:hover': { bgcolor: '#0056b3' }, mt: 2 }}
                fullWidth
                onClick={handleSave}
              >
                {editMode ? 'Perbarui Data' : 'Tambah Data'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Drawer>

      {/* Confirmation Dialog for Deletion */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Box display="flex" alignItems="center">
            <WarningIcon color="warning" sx={{ mr: 1 }} /> Konfirmasi Hapus Item
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Anda yakin ingin menghapus item "<strong>{itemToDeleteName}</strong>" ini dari inventory? Tindakan ini tidak dapat dibatalkan.
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

      {/* Snackbar */}
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
