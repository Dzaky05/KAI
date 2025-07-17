import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Box, Typography, Card, CardContent, Grid, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Paper, TextField,
  Button, IconButton, Snackbar, Alert, Tooltip, Chip,
  Drawer, MenuItem, FormControl, InputLabel, Select, LinearProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider // Added Divider for visual separation in drawer
} from '@mui/material';
import {
  Add, Delete, Edit, Download, Close, InfoOutlined, History as HistoryIcon // Added HistoryIcon
} from '@mui/icons-material';
import EngineeringIcon from '@mui/icons-material/Engineering';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, isPast, isToday, addDays } from 'date-fns';
import { id } from 'date-fns/locale'; // Untuk format tanggal Indonesia

export default function OverhaulPoint() {
  const [data, setData] = useState([
    {
      id: 1, name: 'KRD CC201-01', lokasi: 'Balai Yasa Yogyakarta', status: 'Proses', estimasi: '2025-07-20', progress: 75,
      history: [
        { id: 1, timestamp: '2025-07-01T10:00:00Z', description: 'Mulai perbaikan mesin utama.' },
        { id: 2, timestamp: '2025-07-05T14:30:00Z', description: 'Penggantian komponen rem depan.' },
      ]
    },
    {
      id: 2, name: 'PM 202-EX', lokasi: 'Dipo Jakarta', status: 'Selesai', estimasi: '2025-07-01', progress: 100,
      history: [
        { id: 1, timestamp: '2025-06-10T09:00:00Z', description: 'Inspeksi awal dan identifikasi masalah.' },
        { id: 2, timestamp: '2025-06-20T11:00:00Z', description: 'Penyelesaian perbaikan kelistrikan.' },
        { id: 3, timestamp: '2025-07-01T16:00:00Z', description: 'Uji coba dan dinyatakan selesai.' },
      ]
    },
    {
      id: 3, name: 'Signal 7A', lokasi: 'Bandung Selatan', status: 'Pending', estimasi: '2025-08-10', progress: 0,
      history: []
    },
    {
      id: 4, name: 'Lokomotif BB304', lokasi: 'Balai Yasa Surabaya', status: 'Proses', estimasi: '2025-07-08', progress: 40,
      history: [
        { id: 1, timestamp: '2025-07-01T09:00:00Z', description: 'Inspeksi awal dan perencanaan.' },
      ]
    },
    {
      id: 5, name: 'Gerbong Barang', lokasi: 'Gudang Cirebon', status: 'Selesai', estimasi: '2025-06-15', progress: 100,
      history: [
        { id: 1, timestamp: '2025-06-01T10:00:00Z', description: 'Perbaikan kerusakan minor.' },
        { id: 2, timestamp: '2025-06-15T12:00:00Z', description: 'Pengecatan dan finalisasi.' },
      ]
    },
  ]);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', lokasi: '', status: '', estimasi: '', progress: 0, history: [] }); // Initialize history
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State for adding new history
  const [newHistoryDescription, setNewHistoryDescription] = useState('');
  // State for editing history
  const [editHistoryDialogOpen, setEditHistoryDialogOpen] = useState(false);
  const [currentEditingHistory, setCurrentEditingHistory] = useState(null); // The history item being edited
useEffect(() => {
  fetchOverhaulData();
}, []);

const fetchOverhaulData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/overhaul'); // ganti sesuai endpointmu
    setData(response.data);
  } catch (error) {
    console.error('Gagal mengambil data overhaul:', error);
    setSnackbar({ open: true, message: 'Gagal mengambil data overhaul dari server.', severity: 'error' });
  }
};


  const filteredData = data.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.lokasi.toLowerCase().includes(search.toLowerCase()) ||
    d.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDrawer = (item = null) => {
    if (item) {
      setEditMode(true);
      setCurrentItem({
        ...item,
        estimasi: item.estimasi || '', // Pastikan estimasi tidak undefined untuk input date
        history: item.history || [] // Ensure history array exists
      });
    } else {
      setEditMode(false);
      setCurrentItem({ id: null, name: '', lokasi: '', status: 'Proses', estimasi: '', progress: 0, history: [] }); // Initialize empty history for new item
    }
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setNewHistoryDescription(''); // Clear new history input
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  if (!currentItem.name || !currentItem.lokasi || !currentItem.status || !currentItem.estimasi) {
    setSnackbar({ open: true, message: 'Semua kolom wajib diisi!', severity: 'error' });
    return;
  }

  try {
    if (editMode) {
      await axios.put(`http://localhost:8080/api/overhaul/${currentItem.id}`, currentItem);
      setSnackbar({ open: true, message: 'Data berhasil diperbarui!', severity: 'success' });
    } else {
      await axios.post(`http://localhost:8080/api/overhaul`, currentItem);
      setSnackbar({ open: true, message: 'Data berhasil ditambahkan!', severity: 'success' });
    }
    fetchOverhaulData(); // Refresh data dari server
    handleCloseDrawer();
  } catch (err) {
    console.error(err);
    setSnackbar({ open: true, message: 'Gagal menyimpan ke server.', severity: 'error' });
  }
};


  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/overhaul/${itemToDelete}`);
    setSnackbar({ open: true, message: 'Data overhaul berhasil dihapus!', severity: 'info' });
    fetchOverhaulData(); // Refresh dari server
  } catch (error) {
    console.error('Gagal menghapus:', error);
    setSnackbar({ open: true, message: 'Gagal menghapus data dari server.', severity: 'error' });
  }
  setDialogOpen(false);
  setItemToDelete(null);
};


  const handleCloseDialog = () => {
    setDialogOpen(false);
    setItemToDelete(null);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      ID: item.id,
      Nama: item.name,
      Lokasi: item.lokasi,
      Status: item.status,
      Estimasi: format(parseISO(item.estimasi), 'dd MMMM yyyy', { locale: id }),
      Progress: `${item.progress}%`,
      Riwayat: item.history.map(h => `${format(parseISO(h.timestamp), 'dd/MM/yy HH:mm')} - ${h.description}`).join('; ')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Overhaul');
    XLSX.writeFile(wb, `Laporan_Overhaul_Point_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
    setSnackbar({ open: true, message: 'Data diekspor ke Excel!', severity: 'success' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Laporan Overhaul Point Machine', 14, 16);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Nama', 'Lokasi', 'Status', 'Estimasi Selesai', 'Progres', 'Riwayat']],
      body: filteredData.map(i => [
        i.name,
        i.lokasi,
        i.status,
        format(parseISO(i.estimasi), 'dd MMMM yyyy', { locale: id }),
        `${i.progress}%`,
        i.history.map(h => `${format(parseISO(h.timestamp), 'dd/MM/yy HH:mm')} - ${h.description}`).join('\n')
      ]),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { top: 25 },
      columnStyles: {
        5: { cellWidth: 50 } // Adjust width for history column
      }
    });
    doc.save(`Laporan_Overhaul_Point_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
    setSnackbar({ open: true, message: 'Data diekspor ke PDF!', severity: 'success' });
  };

  const getStatusColor = (status) => {
    if (status === 'Selesai') return 'success';
    if (status === 'Proses') return 'warning';
    if (status === 'Pending') return 'info';
    return 'default';
  };

  const getEstimasiWarning = (estimasiDate) => {
    if (!estimasiDate || currentItem.status === 'Selesai') return null;
    const date = parseISO(estimasiDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    if (isPast(date) && !isToday(date)) {
      return { text: 'Terlambat!', color: 'error' };
    }
    if (date <= addDays(today, 7)) { // Within 7 days
      return { text: 'Mendekati Deadline!', color: 'warning' };
    }
    return null;
  };

  const totalOverhaul = data.length;
  const inProgress = data.filter(item => item.status === 'Proses').length;
  const completed = data.filter(item => item.status === 'Selesai').length;

  // --- History Management Functions ---
  const handleAddNewHistory = () => {
    if (newHistoryDescription.trim()) {
      setCurrentItem((prev) => ({
        ...prev,
        history: [
          ...prev.history,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            description: newHistoryDescription.trim(),
          },
        ],
      }));
      setNewHistoryDescription(''); // Clear input after adding
      setSnackbar({ open: true, message: 'Riwayat berhasil ditambahkan!', severity: 'info' });
    } else {
      setSnackbar({ open: true, message: 'Deskripsi riwayat tidak boleh kosong.', severity: 'warning' });
    }
  };

  const handleOpenEditHistoryDialog = (historyItem) => {
    setCurrentEditingHistory(historyItem);
    setEditHistoryDialogOpen(true);
  };

  const handleCloseEditHistoryDialog = () => {
    setCurrentEditingHistory(null);
    setEditHistoryDialogOpen(false);
  };

  const handleSaveEditedHistory = () => {
    if (currentEditingHistory && currentEditingHistory.description.trim()) {
      setCurrentItem((prev) => ({
        ...prev,
        history: prev.history.map((hist) =>
          hist.id === currentEditingHistory.id
            ? { ...currentEditingHistory, timestamp: new Date().toISOString() } // Update timestamp on edit
            : hist
        ),
      }));
      setSnackbar({ open: true, message: 'Riwayat berhasil diperbarui!', severity: 'success' });
      handleCloseEditHistoryDialog();
    } else {
      setSnackbar({ open: true, message: 'Deskripsi riwayat tidak boleh kosong.', severity: 'warning' });
    }
  };

  const handleHistoryDescriptionChange = (e) => {
    if (currentEditingHistory) {
      setCurrentEditingHistory((prev) => ({
        ...prev,
        description: e.target.value,
      }));
    }
  };

  const handleDeleteHistory = (historyId) => {
    setCurrentItem((prev) => ({
      ...prev,
      history: prev.history.filter((hist) => hist.id !== historyId),
    }));
    setSnackbar({ open: true, message: 'Riwayat berhasil dihapus.', severity: 'info' });
  };
  // --- End History Management Functions ---


  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box display="flex" alignItems="center" mb={3}>
        <EngineeringIcon sx={{ color: '#007BFF', fontSize: 36, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Manajemen Overhaul Point Machine</Typography>
      </Box>

      {/* Ringkasan Data */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Total Item Overhaul</Typography>
              <Typography variant="h5" component="div" fontWeight="bold">{totalOverhaul}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Sedang Proses</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="warning.main">{inProgress}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>Telah Selesai</Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="success.main">{completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Aksi */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
        <TextField
          size="small"
          label="Cari Nama/Lokasi/Status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
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
            Tambah Overhaul
          </Button>
        </Box>
      </Box>

      {/* Tabel Overhaul */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nama Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estimasi Selesai</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Progres</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Tidak ada data overhaul ditemukan.</TableCell>
              </TableRow>
            ) : (
              filteredData.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>
                    <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {item.estimasi ? format(parseISO(item.estimasi), 'dd MMMM yyyy', { locale: id }) : '-'}
                      {getEstimasiWarning(item.estimasi) && (
                        <Tooltip title={getEstimasiWarning(item.estimasi).text}>
                          <InfoOutlined color={getEstimasiWarning(item.estimasi).color} fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100px' }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          width: '100%',
                          height: 8,
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.progress === 100 ? '#4caf50' : '#2196f3',
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>{`${Math.round(item.progress)}%`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDrawer(item)}><Edit color="primary" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton onClick={() => handleDeleteClick(item.id)}><Delete color="error" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drawer Tambah/Edit */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: { xs: '90%', sm: 450 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">{editMode ? 'Edit Item Overhaul' : 'Tambah Item Overhaul Baru'}</Typography>
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
                label="Lokasi"
                name="lokasi"
                value={currentItem.lokasi}
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
                  <MenuItem value="Proses">Proses</MenuItem>
                  <MenuItem value="Selesai">Selesai</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimasi Selesai"
                type="date"
                name="estimasi"
                value={currentItem.estimasi}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            {currentItem.status === 'Proses' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Progres (%)"
                  type="number"
                  name="progress"
                  value={currentItem.progress}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="Isi progres dalam persentase (0-100)"
                />
              </Grid>
            )}

            {/* History Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} /> {/* Added divider for separation */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon /> Riwayat Overhaul
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Tambahkan Riwayat Baru"
                    variant="outlined"
                    fullWidth
                    value={newHistoryDescription}
                    onChange={(e) => setNewHistoryDescription(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNewHistory();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddNewHistory}
                    startIcon={<Add />}
                    sx={{ flexShrink: 0, borderRadius: 2 }}
                  >
                    Tambah
                  </Button>
                </Box>

                {currentItem.history.length > 0 ? (
                  <List dense>
                    {currentItem.history.map((hist) => (
                      <ListItem
                        key={hist.id}
                        sx={{
                          borderBottom: '1px solid #eee',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <ListItemText
                          primary={hist.description}
                          secondary={format(parseISO(hist.timestamp), 'dd MMMM yyyy HH:mm', { locale: id })}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit Riwayat">
                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditHistoryDialog(hist)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Riwayat">
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteHistory(hist.id)} color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Belum ada riwayat untuk item ini.
                  </Typography>
                )}
              </Paper>
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

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Konfirmasi Penghapusan"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus data overhaul ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Editing History Item */}
      <Dialog
        open={editHistoryDialogOpen}
        onClose={handleCloseEditHistoryDialog}
        aria-labelledby="edit-history-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="edit-history-dialog-title">Edit Riwayat</DialogTitle>
        <DialogContent>
          <TextField
            label="Deskripsi Riwayat"
            fullWidth
            multiline
            rows={4}
            value={currentEditingHistory?.description || ''}
            onChange={handleHistoryDescriptionChange}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditHistoryDialog} color="primary">
            Batal
          </Button>
          <Button onClick={handleSaveEditedHistory} color="primary" variant="contained">
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar Notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}