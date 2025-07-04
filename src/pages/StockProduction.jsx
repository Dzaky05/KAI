import React, { useState } from 'react';
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
  Button, 
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  LinearProgress,
  Snackbar,
  Alert,
  Badge
} from "@mui/material";
import { 
  Storage as StorageIcon, 
  Add, 
  Search, 
  FilterAlt, 
  Warning, 
  Edit, 
  Delete,
  Print,
  Download,
  CheckCircle,
  Error,
  Info,
  Notifications
} from "@mui/icons-material";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Frame from "../components/Frame";

// Enhanced initial stock data
const initialStockData = [
  { id: 1, name: "Rel Kereta API", code: "RL-KT-001", quantity: 150, minStock: 100, location: "Gudang A", category: "Elektrik", unit: "pcs", lastUpdated: "2023-05-15" },
  { id: 2, name: "Baut Khusus M10", code: "BT-KS-002", quantity: 1200, minStock: 1500, location: "Gudang B", category: "Mekanik", unit: "pcs", lastUpdated: "2023-05-10" },
  { id: 3, name: "Panel Kontrol PLC", code: "PN-CT-003", quantity: 25, minStock: 30, location: "Gudang C", category: "Elektrik", unit: "unit", lastUpdated: "2023-05-18" },
  { id: 4, name: "Kabel Listrik 2.5mm", code: "KB-LT-004", quantity: 500, minStock: 400, location: "Gudang A", category: "Elektrik", unit: "meter", lastUpdated: "2023-05-12" },
  { id: 5, name: "Bearing 6204ZZ", code: "BR-005", quantity: 80, minStock: 100, location: "Gudang B", category: "Mekanik", unit: "pcs", lastUpdated: "2023-05-14" },
  { id: 6, name: "Sistem Hidrolik 10Ton", code: "SH-006", quantity: 12, minStock: 15, location: "Gudang C", category: "Hidrolik", unit: "set", lastUpdated: "2023-05-16" },
];

// Unit options for items
const unitOptions = ["pcs", "unit", "meter", "set", "kg", "liter", "roll", "box"];
const categoryOptions = ["Elektrik", "Mekanik", "Hidrolik", "Pneumatik", "Tools"];

export default function StockProductionEnhanced() {
  const [stockData, setStockData] = useState(() => {
    const savedData = localStorage.getItem('stockData');
    return savedData ? JSON.parse(savedData) : initialStockData;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [newItem, setNewItem] = useState({
    name: "",
    code: "",
    quantity: 0,
    minStock: 0,
    location: "",
    category: "",
    unit: "pcs"
  });

  // Save to localStorage whenever stockData changes
  useEffect(() => {
    localStorage.setItem('stockData', JSON.stringify(stockData));
  }, [stockData]);

  // Filtered stock data with animation support
  const filteredStockData = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === "all" || item.location === filterLocation;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Locations and categories for filters
  const locations = [...new Set(stockData.map(item => item.location))];
  const categories = [...new Set(stockData.map(item => item.category))];

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(stockData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");
    XLSX.writeFile(workbook, "stock_data.xlsx");
    showSnackbar("Data berhasil diexport ke Excel", "success");
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Stock Produksi", 14, 16);
    doc.autoTable({
      head: [["ID", "Nama Item", "Kode", "Kategori", "Jumlah", "Min Stock", "Unit", "Lokasi", "Status"]],
      body: stockData.map(item => [
        item.id, 
        item.name, 
        item.code, 
        item.category,
        item.quantity, 
        item.minStock, 
        item.unit, 
        item.location,
        getStockStatus(item.quantity, item.minStock).status
      ]),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [63, 81, 181] }
    });
    doc.save("stock_report.pdf");
    showSnackbar("Data berhasil diexport ke PDF", "success");
  };

  // Handle dialog operations
  const handleOpenAddDialog = () => {
    setEditMode(false);
    setNewItem({
      name: "",
      code: "",
      quantity: 0,
      minStock: 0,
      location: locations[0] || "",
      category: categories[0] || "",
      unit: "pcs"
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    setNewItem({ ...item });
    setOpenDialog(true);
  };

  // Handle save item with date tracking
  const handleSaveItem = () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      if (editMode) {
        // Update existing item
        setStockData(stockData.map(item => 
          item.id === selectedItem.id ? { ...newItem, lastUpdated: currentDate } : item
        ));
        showSnackbar("Item berhasil diperbarui", "success");
      } else {
        // Add new item
        const newId = Math.max(...stockData.map(item => item.id), 0) + 1;
        setStockData([...stockData, { ...newItem, id: newId, lastUpdated: currentDate }]);
        showSnackbar("Item baru berhasil ditambahkan", "success");
      }
      setOpenDialog(false);
    } catch (error) {
      showSnackbar("Gagal menyimpan item: " + error.message, "error");
    }
  };

  // Handle delete item
  const handleDeleteItem = (id) => {
    try {
      setStockData(stockData.filter(item => item.id !== id));
      setOpenDeleteDialog(false);
      showSnackbar("Item berhasil dihapus", "success");
    } catch (error) {
      showSnackbar("Gagal menghapus item: " + error.message, "error");
    }
  };

  // Helper functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "minStock" ? parseInt(value) || 0 : value
    }));
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity >= minStock) return { status: "Aman", color: "success", icon: <CheckCircle fontSize="small" /> };
    if (quantity >= minStock * 0.5) return { status: "Warning", color: "warning", icon: <Warning fontSize="small" /> };
    return { status: "Kritis", color: "error", icon: <Error fontSize="small" /> };
  };

  const calculateStockPercentage = (quantity, minStock) => {
    return Math.round((quantity / minStock) * 100);
  };

  // Count critical items for badge
  const criticalItemsCount = stockData.filter(item => item.quantity < item.minStock * 0.5).length;

  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        {/* Header with notification badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Badge badgeContent={criticalItemsCount} color="error" overlap="circular" sx={{ mr: 2 }}>
            <StorageIcon fontSize="large" sx={{ color: '#4CAF50' }} />
          </Badge>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Manajemen Stock Produksi
          </Typography>
        </Box>

        {/* Search and Filter Card */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cari item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: '#999', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Lokasi</InputLabel>
                  <Select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    label="Filter Lokasi"
                  >
                    <MenuItem value="all">Semua Lokasi</MenuItem>
                    {locations.map(location => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Kategori</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Filter Kategori"
                  >
                    <MenuItem value="all">Semua Kategori</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  fullWidth
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={handleOpenAddDialog}
                  sx={{ 
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#388E3C' },
                    height: '40px'
                  }}
                >
                  Tambah
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Total Item</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stockData.length}</Typography>
                  <LinearProgress variant="determinate" value={100} color="info" sx={{ mt: 1, height: 6 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Stock Aman</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {stockData.filter(item => item.quantity >= item.minStock).length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stockData.filter(item => item.quantity >= item.minStock).length / stockData.length) * 100} 
                    color="success" 
                    sx={{ mt: 1, height: 6 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Perlu Restock</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    {stockData.filter(item => item.quantity < item.minStock && item.quantity >= item.minStock * 0.5).length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stockData.filter(item => item.quantity < item.minStock && item.quantity >= item.minStock * 0.5).length / stockData.length) * 100} 
                    color="warning" 
                    sx={{ mt: 1, height: 6 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Stock Kritis</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                    {stockData.filter(item => item.quantity < item.minStock * 0.5).length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stockData.filter(item => item.quantity < item.minStock * 0.5).length / stockData.length) * 100} 
                    color="error" 
                    sx={{ mt: 1, height: 6 }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Daftar Stock Produksi
                </Typography>
                <Box>
                  <Tooltip title="Cetak Laporan PDF">
                    <IconButton sx={{ mr: 1 }} onClick={handleExportPDF}>
                      <Print />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export ke Excel">
                    <IconButton onClick={handleExportExcel}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <TableContainer component={Paper} sx={{ boxShadow: 'none', maxHeight: '500px', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nama Item</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Kode</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Jumlah</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Min Stock</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Satuan</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Terakhir Update</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStockData.length > 0 ? (
                      filteredStockData.map((row) => {
                        const status = getStockStatus(row.quantity, row.minStock);
                        return (
                          <TableRow key={row.id} hover>
                            <TableCell>{row.id}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                            <TableCell>
                              <Chip label={row.code} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell>{row.quantity.toLocaleString()}</TableCell>
                            <TableCell>{row.minStock.toLocaleString()}</TableCell>
                            <TableCell>{row.unit}</TableCell>
                            <TableCell>
                              <Chip 
                                icon={status.icon}
                                label={status.status}
                                color={status.color}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{row.lastUpdated}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleOpenEditDialog(row)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Hapus">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => {
                                    setSelectedItem(row);
                                    setOpenDeleteDialog(true);
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} sx={{ textAlign: 'center', py: 4 }}>
                          <Info color="action" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body1" color="text.secondary">
                            Tidak ada data yang ditemukan
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Critical Stock List */}
        {stockData.filter(item => item.quantity < item.minStock).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Notifications color="error" sx={{ mr: 1 }} />
                  Item Perlu Restock
                  <Chip label="Peringatan" color="error" size="small" sx={{ ml: 2 }} />
                </Typography>
                <List dense>
                  {stockData
                    .filter(item => item.quantity < item.minStock)
                    .sort((a, b) => (a.quantity / a.minStock) - (b.quantity / b.minStock))
                    .map((item) => {
                      const percentage = calculateStockPercentage(item.quantity, item.minStock);
                      return (
                        <ListItem 
                          key={item.id} 
                          sx={{ 
                            py: 1,
                            borderLeft: `4px solid ${
                              percentage >= 50 ? '#FF9800' : '#F44336'
                            }`,
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {item.name} ({item.code})
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage > 100 ? 100 : percentage} 
                                  color={percentage >= 50 ? 'warning' : 'error'}
                                  sx={{ 
                                    width: '100px', 
                                    mr: 2,
                                    height: '8px',
                                    borderRadius: '4px'
                                  }}
                                />
                                <Typography variant="body2">
                                  {item.quantity} {item.unit} / {item.minStock} {item.unit} ({percentage}%)
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                              {item.location}
                            </Typography>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="warning"
                              startIcon={<Add />}
                              sx={{ mr: 1 }}
                              onClick={() => handleOpenEditDialog(item)}
                            >
                              Restock
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => {
                                setSelectedItem(item);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              Hapus
                            </Button>
                          </Box>
                        </ListItem>
                      );
                    })}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editMode ? 'Edit Item Stock' : 'Tambah Item Stock Baru'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nama Item"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Kode Item"
                  name="code"
                  value={newItem.code}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    name="category"
                    value={newItem.category}
                    onChange={handleInputChange}
                    label="Kategori"
                  >
                    {categoryOptions.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Lokasi</InputLabel>
                  <Select
                    name="location"
                    value={newItem.location}
                    onChange={handleInputChange}
                    label="Lokasi"
                  >
                    {locations.map(location => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Jumlah Stock"
                  name="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Minimum Stock"
                  name="minStock"
                  type="number"
                  value={newItem.minStock}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Satuan</InputLabel>
                  <Select
                    name="unit"
                    value={newItem.unit}
                    onChange={handleInputChange}
                    label="Satuan"
                  >
                    {unitOptions.map(unit => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button 
              onClick={handleSaveItem}
              variant="contained"
              disabled={!newItem.name || !newItem.code || !newItem.category || !newItem.location}
            >
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus item <strong>{selectedItem?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Kode: {selectedItem?.code} | Lokasi: {selectedItem?.location}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
            <Button 
              onClick={() => handleDeleteItem(selectedItem?.id)}
              variant="contained"
              color="error"
            >
              Hapus
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Frame>
  );
}