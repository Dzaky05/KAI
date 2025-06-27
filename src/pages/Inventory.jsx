import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Drawer,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Search,
  Add,
  FilterAlt,
  Inventory as InventoryIcon,
  Edit,
  Delete,
  Close,
  Download
} from "@mui/icons-material";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Frame from "../components/Frame";

export default function Inventory() {
  const [inventoryData, setInventoryData] = useState([
    { id: 1, name: "Rel Kereta", quantity: 150, location: "Gudang A", status: "Tersedia" },
    { id: 2, name: "Baut Khusus", quantity: 1200, location: "Gudang B", status: "Tersedia" },
    { id: 3, name: "Panel Kontrol", quantity: 25, location: "Gudang C", status: "Limit" },
    { id: 4, name: "Kabel Listrik", quantity: 500, location: "Gudang A", status: "Tersedia" },
    { id: 5, name: "Bearing", quantity: 80, location: "Gudang B", status: "Limit" },
    { id: 6, name: "Sistem Hidrolik", quantity: 12, location: "Gudang C", status: "Habis" },
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newItem, setNewItem] = useState({ name: '', quantity: '', location: '', status: '' });
  const [editMode, setEditMode] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      setInventoryData(prev => prev.filter(item => item.id !== id));
      setSnackbar({ open: true, message: 'Item berhasil dihapus.', severity: 'info' });
    }
  };

  const handleEdit = (item) => {
    setNewItem(item);
    setEditMode(true);
    setOpenAddDrawer(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.location || !newItem.status) {
      setSnackbar({ open: true, message: 'Semua field harus diisi!', severity: 'error' });
      return;
    }
    if (editMode) {
      setInventoryData(prev => prev.map(item => item.id === newItem.id ? { ...newItem, quantity: parseInt(newItem.quantity) } : item));
      setSnackbar({ open: true, message: 'Item berhasil diperbarui.', severity: 'success' });
    } else {
      const id = inventoryData.length ? Math.max(...inventoryData.map(i => i.id)) + 1 : 1;
      setInventoryData([...inventoryData, { ...newItem, id, quantity: parseInt(newItem.quantity) }]);
      setSnackbar({ open: true, message: 'Item berhasil ditambahkan.', severity: 'success' });
    }
    setOpenAddDrawer(false);
    setNewItem({ name: '', quantity: '', location: '', status: '' });
    setEditMode(false);
  };

  const filteredData = inventoryData
    .filter(row => (statusFilter === 'Semua' || row.status === statusFilter))
    .filter(row => row.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 16);
    doc.autoTable({
      startY: 20,
      head: [["ID", "Nama Item", "Jumlah", "Lokasi", "Status"]],
      body: filteredData.map(row => [row.id, row.name, row.quantity, row.location, row.status])
    });
    doc.save("Inventory.pdf");
  };

  const totalItems = inventoryData.length;
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
  const countByStatus = (status) => inventoryData.filter(i => i.status === status).length;

  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <InventoryIcon fontSize="large" sx={{ color: '#FF8C00', mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="#333">
            Manajemen Inventory
          </Typography>
        </Box>

        {/* Statistik Ringkasan */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderLeft: '5px solid #4CAF50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Item</Typography>
                <Typography variant="h5" fontWeight="bold">{totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderLeft: '5px solid #2196F3' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Kuantitas</Typography>
                <Typography variant="h5" fontWeight="bold">{totalQuantity}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderLeft: '5px solid #FFC107' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Ringkasan Status</Typography>
                <Typography variant="body1">Tersedia: {countByStatus("Tersedia")}</Typography>
                <Typography variant="body1">Limit: {countByStatus("Limit")}</Typography>
                <Typography variant="body1">Habis: {countByStatus("Habis")}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter & Ekspor */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Cari inventory..."
                sx={{ width: 200 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ width: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="Semua">Semua</MenuItem>
                  <MenuItem value="Tersedia">Tersedia</MenuItem>
                  <MenuItem value="Limit">Limit</MenuItem>
                  <MenuItem value="Habis">Habis</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <Button onClick={exportToExcel} variant="outlined" startIcon={<Download />} sx={{ mr: 1 }}>
                  Excel
                </Button>
                <Button onClick={exportToPDF} variant="outlined" startIcon={<Download />} sx={{ mr: 2 }}>
                  PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => { setOpenAddDrawer(true); setEditMode(false); setNewItem({ name: '', quantity: '', location: '', status: '' }); }}
                  sx={{ backgroundColor: '#FF8C00', '&:hover': { backgroundColor: '#FF6D00' } }}
                >
                  Tambah Item
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabel Inventory */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nama Item</TableCell>
                <TableCell>Jumlah</TableCell>
                <TableCell>Lokasi</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(row)}>
                        <Edit color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton onClick={() => handleDelete(row.id)}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Drawer Tambah/Edit Item */}
        <Drawer anchor="right" open={openAddDrawer} onClose={() => setOpenAddDrawer(false)}>
          <Box sx={{ width: 320, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{editMode ? 'Edit Item' : 'Tambah Item'}</Typography>
              <IconButton onClick={() => setOpenAddDrawer(false)}>
                <Close />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TextField fullWidth label="Nama Item" name="name" value={newItem.name} onChange={handleInputChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Jumlah" name="quantity" value={newItem.quantity} onChange={handleInputChange} type="number" sx={{ mb: 2 }} />
            <TextField fullWidth label="Lokasi" name="location" value={newItem.location} onChange={handleInputChange} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={newItem.status} onChange={handleInputChange} label="Status">
                <MenuItem value="Tersedia">Tersedia</MenuItem>
                <MenuItem value="Limit">Limit</MenuItem>
                <MenuItem value="Habis">Habis</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddItem} fullWidth sx={{ backgroundColor: '#FF8C00', '&:hover': { backgroundColor: '#FF6D00' } }}>
              Simpan
            </Button>
          </Box>
        </Drawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Frame>
  );
}
