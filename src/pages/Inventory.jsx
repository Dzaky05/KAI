import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField,
  Button, IconButton, InputLabel, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip, Drawer, Divider,
  Snackbar, Alert, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle // Import Dialog components
} from '@mui/material';
import {
  Add, Delete, Edit, Download, Close
} from '@mui/icons-material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Inventory() {
  const [inventoryData, setInventoryData] = useState([
    { id: 1, name: "Rel Kereta", quantity: 150, location: "Gudang A", status: "Tersedia", itemCode: "INV-GDA-0001" },
    { id: 2, name: "Baut Khusus", quantity: 1200, location: "Gudang B", status: "Tersedia", itemCode: "INV-GDB-0002" },
    { id: 3, name: "Panel Kontrol", quantity: 25, location: "Gudang C", status: "Limit", itemCode: "INV-GDC-0003" },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newItem, setNewItem] = useState({ name: '', quantity: '', location: '', status: '' });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // New state for confirmation dialog
  const [itemToDeleteId, setItemToDeleteId] = useState(null); // New state to store id of item to delete

  const generateCode = (location, id) => {
    const loc = location?.split(' ')[1]?.toUpperCase() || 'XX';
    return `INV-GD${loc}-${String(id).padStart(4, '0')}`;
  };

  const handleAddOrUpdate = () => {
    if (!newItem.name || !newItem.quantity || !newItem.location || !newItem.status) {
      return setSnackbar({ open: true, message: 'Semua field wajib diisi', severity: 'error' });
    }
    if (editMode) {
      setInventoryData(prev =>
        prev.map(item =>
          item.id === newItem.id ? { ...newItem, quantity: +newItem.quantity } : item
        )
      );
      setSnackbar({ open: true, message: 'Item diperbarui', severity: 'success' });
    } else {
      const id = inventoryData.length ? Math.max(...inventoryData.map(i => i.id)) + 1 : 1;
      const itemCode = generateCode(newItem.location, id);
      setInventoryData(prev => [...prev, { ...newItem, id, itemCode, quantity: +newItem.quantity }]);
      setSnackbar({ open: true, message: 'Item ditambahkan', severity: 'success' });
    }
    setOpenDrawer(false);
    setEditMode(false);
    setNewItem({ name: '', quantity: '', location: '', status: '' });
  };

  const handleEdit = (item) => {
    setNewItem(item);
    setEditMode(true);
    setOpenDrawer(true);
  };

  // Modified handleDelete to open confirmation dialog
  const handleDeleteClick = (id) => {
    setItemToDeleteId(id);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setInventoryData(prev => prev.filter(item => item.id !== itemToDeleteId));
    setSnackbar({ open: true, message: 'Item dihapus', severity: 'info' });
    setOpenConfirmDialog(false);
    setItemToDeleteId(null);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setItemToDeleteId(null);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'Inventory.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Inventory", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [['Kode', 'Nama', 'Jumlah', 'Lokasi', 'Status']],
      body: filteredData.map(i => [i.itemCode, i.name, i.quantity, i.location, i.status])
    });
    doc.save('Inventory.pdf');
  };

  const filteredData = inventoryData
    .filter(item => statusFilter === 'Semua' || item.status === statusFilter)
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getChipColor = (status) => {
    if (status === 'Tersedia') return 'success';
    if (status === 'Limit') return 'warning';
    return 'error';
  };

  const totalItems = inventoryData.length;
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <InventoryIcon sx={{ color: '#FF8C00', fontSize: 36, mr: 2 }} />
        <Typography variant="h5" fontWeight="bold">Manajemen Inventory</Typography>
      </Box>

      {/* 📊 Ringkasan Inventory */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Total Item Unik</Typography>
              <Typography variant="h4" component="div" fontWeight="bold">{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Total Kuantitas</Typography>
              <Typography variant="h4" component="div" fontWeight="bold">{totalQuantity}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3 }} />

      {/* 🔍 Filter & Aksi */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
        <TextField
          size="small"
          label="Cari Item"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="Semua">Semua</MenuItem>
            <MenuItem value="Tersedia">Tersedia</MenuItem>
            <MenuItem value="Limit">Limit</MenuItem>
            <MenuItem value="Habis">Habis</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button onClick={exportExcel} variant="outlined" startIcon={<Download />}>Excel</Button>
          <Button onClick={exportPDF} variant="outlined" startIcon={<Download />}>PDF</Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#E07B00' } }}
            onClick={() => { setOpenDrawer(true); setEditMode(false); setNewItem({ name: '', quantity: '', location: '', status: '' }); }}
          >
            Tambah
          </Button>
        </Box>
      </Box>

      {/* 📋 Tabel Inventory */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Kode</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Jumlah</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Tidak ada data inventory ditemukan.</TableCell>
              </TableRow>
            ) : (
              filteredData.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.itemCode}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={getChipColor(row.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit"><IconButton onClick={() => handleEdit(row)}><Edit color="primary" /></IconButton></Tooltip>
                    <Tooltip title="Hapus"><IconButton onClick={() => handleDeleteClick(row.id)}><Delete color="error" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📦 Drawer Tambah/Edit Item */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: { xs: '90%', sm: 450 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">{editMode ? 'Edit Item' : 'Tambah Item Baru'}</Typography>
            <IconButton onClick={() => setOpenDrawer(false)}><Close /></IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Item"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kuantitas"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lokasi"
                value={newItem.location}
                onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newItem.status}
                  label="Status"
                  onChange={(e) => setNewItem(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="Tersedia">Tersedia</MenuItem>
                  <MenuItem value="Limit">Limit</MenuItem>
                  <MenuItem value="Habis">Habis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                sx={{ bgcolor: '#FF8C00', '&:hover': { bgcolor: '#E07B00' }, mt: 2 }}
                fullWidth
                onClick={handleAddOrUpdate}
              >
                {editMode ? 'Perbarui' : 'Tambah'}
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
        <DialogTitle id="alert-dialog-title">{"Konfirmasi Hapus Item"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Anda yakin ingin menghapus item ini dari inventory? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Batal</Button>
          <Button onClick={handleConfirmDelete} autoFocus color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar Notifikasi */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}