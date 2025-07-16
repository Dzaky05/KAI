
import React, { useState, useEffect, useMemo } from 'react'; // Import useEffect dan useMemo
import {
  Box, Typography, Card, CardContent, Grid, TextField,
  Button, IconButton, InputLabel, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip, Drawer, Divider,
  Snackbar, Alert, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle,
  useTheme
} from '@mui/material';
import {
  Add, Delete, Edit, Download, Close,
  Warning as WarningIcon
} from '@mui/icons-material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Perbaikan typo: autotable

export default function Inventory() {
  const theme = useTheme();

  // Mengganti data statis dengan state yang akan diisi dari backend
  const [inventoryData, setInventoryData] = useState([]);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Menyesuaikan state awal currentItem dengan field database/backend
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', quantity: '', location: '', status: '', itemCode: '' }); // ID sekarang merujuk ke ID database (int)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [itemToDeleteName, setItemToDeleteName] = useState('');
  const [loading, setLoading] = useState(true); // State untuk indikator loading saat fetch data
  const [error, setError] = useState(null); // State untuk menangani error fetch


  // URL endpoint backend Go Anda
  const API_URL = 'http://localhost:8080/api/inventory'; // Ganti jika backend berjalan di URL/port lain

  // Fungsi untuk mengambil data dari backend
  const fetchInventory = async () => {
    setLoading(true); // Set loading menjadi true
    setError(null); // Reset error
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        // Tangani error jika response tidak OK (misal status 404, 500)
        const errorData = await response.json(); // Coba parse error message dari backend
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }
      const data = await response.json();
      // Sesuaikan format data dari backend jika perlu sebelum menyimpannya di state
      // Misalnya, jika backend mengembalikan ID sebagai field `ProduksiID` atau `QcID`,
      // Anda perlu memetakan itu ke field `id` di state React Anda.
      // Berdasarkan kode Go sebelumnya, field ID di backend adalah `InventoryID` (int) dan JSON tagnya `id`.
      // Jadi, mapping seharusnya langsung cocok.
      setInventoryData(data); // Simpan data yang diterima di state
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err); // Simpan error di state
      setSnackbar({ open: true, message: `Gagal memuat data: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false); // Set loading menjadi false setelah selesai (baik sukses maupun error)
    }
  };

  // Ambil data dari backend saat komponen pertama kali dimuat
  useEffect(() => {
    fetchInventory();
  }, []); // Dependency array kosong berarti efek ini hanya dijalankan sekali saat mount

  // Memoized data untuk filtering agar tidak dihitung ulang setiap render jika data tidak berubah
  const filteredData = useMemo(() => {
    return inventoryData.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase()) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(search.toLowerCase())) // Periksa itemCode sebelum toLowerCase
    );
  }, [inventoryData, search]);


  const handleOpenDrawer = (item = null) => {
    if (item) {
      setEditMode(true);
      // Pastikan currentItem memiliki struktur yang sesuai dengan data dari backend
      setCurrentItem({
        id: item.id, // Menggunakan id dari data backend
        name: item.name || '',
        quantity: item.quantity || '', // Quantity dari backend (int), di sini string untuk TextField
        location: item.location || '',
        status: item.status || '',
        itemCode: item.itemCode || ''
      });
    } else {
      setEditMode(false);
      // State awal untuk item baru
      setCurrentItem({ id: null, name: '', quantity: '', location: '', status: 'Tersedia', itemCode: '' });
    }
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
     // Reset currentItem saat drawer ditutup
    setCurrentItem({ id: null, name: '', quantity: '', location: '', status: 'Tersedia', itemCode: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  // Mengubah handleSave menjadi async untuk mengirim data ke backend
  const handleSave = async () => {
    if (!currentItem.name || currentItem.quantity === '' || !currentItem.location || !currentItem.status || !currentItem.itemCode) {
      setSnackbar({ open: true, message: 'Semua kolom wajib diisi!', severity: 'error' });
      return;
    }

    // Persiapkan data yang akan dikirim ke backend
    const itemToSave = {
      // Jangan sertakan ID jika mode tambah, backend akan membuatnya
      // Jika mode edit, sertakan ID di URL, bukan di body request (sesuai implementasi backend Go)
      name: currentItem.name,
      quantity: Number(currentItem.quantity), // Pastikan quantity adalah angka
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
        // Mode edit: Lakukan permintaan PUT
        method = 'PUT';
        url = `${API_URL}/${currentItem.id}`; // Tambahkan ID di URL
        successMessage = 'Data item berhasil diperbarui!';
      } else {
        // Mode tambah: Lakukan permintaan POST
        method = 'POST';
        url = API_URL;
        successMessage = 'Item berhasil ditambahkan!';
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // Tambahkan header Authorization jika diperlukan
        },
        body: JSON.stringify(itemToSave), // Kirim data sebagai JSON string
      });

      if (!response.ok) {
        // Tangani error dari backend
        const errorData = await response.json();
        throw new Error(`Failed to save data: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const savedItem = await response.json(); // Ambil data yang disimpan dari respons backend

      // Perbarui state berdasarkan respons backend
      if (editMode) {
        // Jika mode edit, perbarui item yang bersangkutan di state
        setInventoryData(prev => prev.map(item =>
           // ID dari backend adalah item.id
          item.id === savedItem.id ? savedItem : item
        ));
      } else {
        // Jika mode tambah, tambahkan item baru dari respons backend ke state
        // Backend Go mengembalikan item yang baru dibuat dengan ID yang sudah terisi
        setInventoryData(prev => [...prev, savedItem]);
      }

      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      handleCloseDrawer(); // Tutup drawer setelah berhasil

    } catch (err) {
      console.error("Error saving inventory item:", err);
      setSnackbar({ open: true, message: `Gagal menyimpan data: ${err.message}`, severity: 'error' });
    }
  };

  // Mengubah handleConfirmDelete menjadi async untuk mengirim permintaan DELETE ke backend
  const handleConfirmDelete = async () => {
    if (itemToDeleteId === null) return; // Pastikan ada item yang akan dihapus

    try {
      const response = await fetch(`${API_URL}/${itemToDeleteId}`, {
        method: 'DELETE',
        // Tambahkan header Authorization jika diperlukan
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(`Failed to delete data: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      // Jika berhasil (status 204 No Content), perbarui state dengan menghapus item
      setInventoryData(prev => prev.filter(item => item.id !== itemToDeleteId));

      setSnackbar({ open: true, message: `Item '${itemToDeleteName}' berhasil dihapus!`, severity: 'info' });

    } catch (err) {
      console.error("Error deleting inventory item:", err);
       setSnackbar({ open: true, message: `Gagal menghapus data: ${err.message}`, severity: 'error' });
    } finally {
      // Tutup dialog konfirmasi dan reset state itemToDeleteId/Name
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
    // Removed specific color assignments for 'Overhaul' and 'Rekayasa' as requested.
    if (status === 'Perbaikan') return 'default';
    return 'default'; // Default for Overhaul, Rekayasa, and any other unhandled status
  };

  const totalItems = inventoryData.length;
  const availableItems = inventoryData.filter(item => item.status === 'Tersedia').length;
  const limitedItems = inventoryData.filter(item => item.status === 'Limit').length;
  const unavailableItems = inventoryData.filter(item => item.status === 'Tidak Tersedia').length;
  const producedItems = inventoryData.filter(item => item.status === 'Diproduksi').length;
  const overhaulItems = inventoryData.filter(item => item.status === 'Overhaul').length; // Corrected: re-added definition
  const engineeredItems = inventoryData.filter(item => item.status === 'Rekayasa').length; // Corrected: re-added definition
  const repairedItems = inventoryData.filter(item => item.status === 'Perbaikan').length;

  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);

  // item dengan yang paling banyak kuantitasnya
  const mostQuantityItem = inventoryData.reduce((prev, current) => {
    return (prev && current && prev.quantity !== undefined && current.quantity !== undefined && prev.quantity > current.quantity) ? prev : current;
  }, { name: 'N/A', quantity: 0 });


    // Tampilkan pesan loading atau error
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Typography>Memuat data...</Typography></Box>;
    }

    if (error && inventoryData.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'error.main' }}><Typography>Gagal memuat data. {error.message}</Typography></Box>;
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
        />
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<Download />} onClick={exportExcel}>Excel</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={exportPDF}>PDF</Button>
           {/* Tombol Tambah Item */}
            <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ bgcolor: '#007BFF', '&:hover': { bgcolor: '#0056b3' } }}
                onClick={() => handleOpenDrawer()} // Membuka drawer untuk menambah baru
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
            {filteredData.length === 0 && !loading ? ( // Tampilkan pesan jika tidak ada data dan tidak loading
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
                      {/* Menggunakan item.id dari data backend untuk penghapusan */}
                      <IconButton onClick={() => handleDeleteClick(item)}><Delete color="error" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
            {/* Tambahkan indikator loading di dalam tabel jika loading */}
            {loading && (
                 <TableRow>
                    <TableCell colSpan={6} align="center">Memuat...</TableCell>
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
                onClick={handleSave} // Memanggil fungsi handleSave yang sudah async
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
