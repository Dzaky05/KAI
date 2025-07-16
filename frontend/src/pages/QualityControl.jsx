import React, { useState, useMemo } from 'react';
import axios from 'axios' ;
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
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Add,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Factory as FactoryIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Sample data for different departments
const initialData = {
  production: [
    { id: "PRD-001", product: "Radio Lokomotif", batch: "BATCH-2023-11", status: "Lulus", tested: 25, passed: 25, date: "2023-11-05", department: "Production" },
    { id: "PRD-002", product: "Way Station", batch: "BATCH-2023-10", status: "Lulus", tested: 30, passed: 28, date: "2023-10-28", department: "Production" },
    { id: "PRD-003", product: "Sentranik", batch: "BATCH-2023-11", status: "Dalam Proses", tested: 15, passed: 12, date: "2023-11-12", department: "Production" },
  ],
  overhaul: [
    { id: "OVH-001", product: "Point Machine A", batch: "BATCH-2023-09", status: "Tidak Lulus", tested: 20, passed: 15, date: "2023-09-20", department: "Overhaul" },
    { id: "OVH-002", product: "Point Machine B", batch: "BATCH-2023-10", status: "Lulus", tested: 18, passed: 18, date: "2023-10-15", department: "Overhaul" },
  ],
  rekayasa: [
    { id: "RKY-001", product: "Control Panel", batch: "BATCH-2023-11", status: "Lulus", tested: 10, passed: 9, date: "2023-11-08", department: "Rekayasa" },
    { id: "RKY-002", product: "Signal System", batch: "BATCH-2023-10", status: "Dalam Proses", tested: 12, passed: 10, date: "2023-10-30", department: "Rekayasa" },
  ],
  kalibrasi: [
    { id: "KAL-001", product: "Battery Pack", batch: "BATCH-2023-11", status: "Lulus", tested: 50, passed: 48, date: "2023-11-10", department: "Kalibrasi" },
    { id: "KAL-002", product: "Cable Set", batch: "BATCH-2023-09", status: "Tidak Lulus", tested: 30, passed: 25, date: "2023-09-25", department: "Kalibrasi" },
  ],
};



export default function QualityControl() {
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRepairModal, setOpenRepairModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQcEntry, setNewQcEntry] = useState({
    product: '',
    batch: '',
    tested: '',
    passed: '',
    status: '',
    date: '',
    department: 'Production',
  });

  // Combine all data for the "All" tab
  const allData = useMemo(() => {
    return [
      ...data.production,
      ...data.overhaul,
      ...data.rekayasa,
      ...data.kalibrasi,
    ];
  }, [data]);

  // Get current data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'production': return data.production;
      case 'overhaul': return data.overhaul;
      case 'rekayasa': return data.rekayasa;
      case 'kalibrasi': return data.kalibrasi;
      default: return allData;
    }
  }, [activeTab, data, allData]);

  // Handles tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handles changes in the search input field
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clears the search input field
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handles sorting of table columns
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };


  // Closes the "Add New QC Entry" modal and resets the form
  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewQcEntry({
      product: '',
      batch: '',
      tested: '',
      passed: '',
      status: '',
      date: '',
      department: 'Production',
    });
  };

  // Opens the repair modal
  const handleOpenRepairModal = (item) => {
    setSelectedItem(item);
    setOpenRepairModal(true);
  };

  // Closes the repair modal
  const handleCloseRepairModal = () => {
    setOpenRepairModal(false);
    setSelectedItem(null);
  };

  // Handles changes in the "Add New QC Entry" form fields
  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewQcEntry((prev) => ({ ...prev, [name]: value }));
  };

  // Adds a new QC entry to the appropriate department
  const handleAddNewQc = () => {
  const department = newQcEntry.department.toLowerCase();
  const entryToAdd = {
    ...newQcEntry,
    tested: parseInt(newQcEntry.tested),
    passed: parseInt(newQcEntry.passed),
  };

  axios.post('/api/qc', entryToAdd)
    .then(() => axios.get('/api/qc'))
    .then((res) => {
      setData(res.data);

      // Bisa juga disisipkan update manual jika dibutuhkan:
      // setData(prev => ({
      //   ...prev,
      //   [department]: [...prev[department], entryToAdd]
      // }));

      handleCloseAddModal();
    })
    .catch((err) => {
      console.error('Gagal menambahkan data QC:', err);
    });
  };

  

  // Handles sending item back to its original department for repair
  const handleSendForRepair = () => {
  if (!selectedItem) return;

  axios.put(`/api/qc/${selectedItem.id}`, { status: 'Dalam Perbaikan' })
    .then(() => axios.get('/api/qc'))
    .then((res) => {
      setData(res.data);
      handleCloseRepairModal();
    })
    .catch((err) => {
      console.error('Gagal mengirim ke perbaikan:', err);
    });
};

  // Memoized data for filtering and sorting
  const filteredAndSortedData = useMemo(() => {
    let tempData = [...currentData];

    // Apply search filter
    if (searchTerm) {
      tempData = tempData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      tempData.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (sortColumn === 'tested' || sortColumn === 'passed') {
          valA = parseInt(valA);
          valB = parseInt(valB);
        }

        if (valA < valB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return tempData.slice(0, 50);
  }, [currentData, searchTerm, sortColumn, sortDirection]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  axios.get('/api/qc')
    .then((res) => {
      const raw = res.data;

      const formatted = {
        production: raw.filter(q => q.department.toLowerCase().includes("production")),
        overhaul: raw.filter(q => q.department.toLowerCase().includes("overhaul")),
        rekayasa: raw.filter(q => q.department && q.department.toLowerCase() === "rekayasa"),
        kalibrasi: raw.filter(q => q.department && q.department.toLowerCase() === "kalibrasi"),

      };

      setData(formatted);
    })
    .catch((err) => {
      console.error('Gagal memuat data QC:', err);
      setData(initialData);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

useEffect(() => {
  console.log("Data QC dari backend:", data);
}, [data]);





  // Calculate statistics
  const totalTested = currentData.reduce((acc, item) => acc + item.tested, 0);
  const totalPassed = currentData.reduce((acc, item) => acc + item.passed, 0);
  const overallPassRate = totalTested > 0 ? Math.round((totalPassed / totalTested) * 100) : 0;

  const statusCounts = {
    "Lulus": currentData.filter(q => q.status === "Lulus").length,
    "Dalam Proses": currentData.filter(q => q.status === "Dalam Proses").length,
    "Tidak Lulus": currentData.filter(q => q.status === "Tidak Lulus").length,
    "Dalam Perbaikan": currentData.filter(q => q.status === "Dalam Perbaikan").length,
  };

  const doughnutData = {
    labels: ['Lulus', 'Dalam Proses', 'Tidak Lulus', 'Dalam Perbaikan'],
    datasets: [
      {
        data: [
          statusCounts["Lulus"], 
          statusCounts["Dalam Proses"], 
          statusCounts["Tidak Lulus"],
          statusCounts["Dalam Perbaikan"]
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#2196F3'],
        hoverBackgroundColor: ['#66BB6A', '#FFB74D', '#E57373', '#42A5F5'],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

if (loading) {
  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <Typography variant="h6" color="text.secondary">Memuat data QC...</Typography>
    </Box>
  );
}

  return (
    <Box sx={{ p: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ScienceIcon sx={{ color: '#9C27B0', mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Quality Control</Typography>
      </Box>

      {/* Tabs for different departments */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="department tabs">
          <Tab label="Semua" value="all" />
          <Tab label="Produksi" value="production" icon={<FactoryIcon />} iconPosition="start" />
          <Tab label="Overhaul" value="overhaul" icon={<BuildIcon />} iconPosition="start" />
          <Tab label="Rekayasa" value="rekayasa" icon={<EngineeringIcon />} iconPosition="start" />
          <Tab label="kalibrasi" value="kalibrasi" icon={<InventoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Add QC Button and Search Bar Section */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Cari ID QC, Produk, Batch..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '40%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddModal}
            sx={{
              backgroundColor: '#9C27B0',
              '&:hover': { backgroundColor: '#7B1FA2' },
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Tambah QC
          </Button>
        </CardContent>
      </Card>

      {/* QC Table Section */}
      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  {[
                    { label: 'ID QC', id: 'id' },
                    { label: 'Departemen', id: 'department' },
                    { label: 'Produk', id: 'product' },
                    { label: 'Batch', id: 'batch' },
                    { label: 'Status', id: 'status' },
                    { label: 'Tested/Passed', id: 'tested' },
                    { label: 'Pass Rate', id: 'passRate' },
                    { label: 'Tanggal', id: 'date' },
                    { label: 'Aksi', id: 'action' }
                  ].map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{ fontWeight: 'bold', cursor: col.id !== 'action' && col.id !== 'passRate' ? 'pointer' : 'default' }}
                      onClick={() => col.id !== 'action' && col.id !== 'passRate' && handleSort(col.id)}
                    >
                      {col.label}
                      {sortColumn === col.id && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.map((row) => {
                  const passRate = row.tested > 0 ? Math.round((row.passed / row.tested) * 100) : 0;
                  const colorMap = {
                    "Lulus": '#4CAF50',
                    "Dalam Proses": '#FF9800',
                    "Tidak Lulus": '#F44336',
                    "Dalam Perbaikan": '#2196F3'
                  };
                  return (
                   <TableRow key={row.id || row.FrontendID} hover>
                   <TableCell>{row.id || row.FrontendID}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.product}</TableCell>
                      <TableCell>{row.batch}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          variant="outlined"
                          color={
                            row.status === "Lulus" ? "success" :
                            row.status === "Dalam Proses" ? "warning" :
                            row.status === "Tidak Lulus" ? "error" : "info"
                          }
                        />
                      </TableCell>
                      <TableCell>{row.tested} / {row.passed}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={passRate}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: colorMap[row.status],
                                borderRadius: 4,
                              }
                            }}
                          />
                          <Typography variant="body2">{passRate}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          sx={{ color: '#9C27B0', textTransform: 'none' }}
                          onClick={() => handleOpenRepairModal(row)}
                        >
                          {row.status === "Tidak Lulus" ? "Perbaiki" : "Detail"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredAndSortedData.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Tidak ada data Quality Control yang ditemukan.
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Statistics and Overall Pass Rate Summary Section */}
      <Grid container spacing={3}>
        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Statistik QC</Typography>
              <Grid container spacing={2}>
                {[
                  { label: "Total QC", value: currentData.length, color: "#9C27B0", bg: 'rgba(156, 39, 176, 0.1)' },
                  { label: "Lulus", value: statusCounts["Lulus"], color: "#4CAF50", bg: 'rgba(76, 175, 80, 0.1)' },
                  { label: "Tidak Lulus", value: statusCounts["Tidak Lulus"], color: "#F44336", bg: 'rgba(244, 67, 54, 0.1)' },
                  { label: "Dalam Perbaikan", value: statusCounts["Dalam Perbaikan"], color: "#2196F3", bg: 'rgba(33, 150, 243, 0.1)' }
                ].map((stat, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Card sx={{ textAlign: 'center', backgroundColor: stat.bg, p: 2 }}>
                      <Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography>
                      <Typography variant="body2">{stat.label}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {/* Doughnut Chart */}
              <Box sx={{ mt: 3, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {currentData.length < 100 ? (
  <Doughnut data={doughnutData} options={doughnutOptions} />
) : (
  <Typography variant="body2" color="text.secondary">Terlalu banyak data untuk menampilkan chart</Typography>
)}

              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Overall Pass Rate Summary Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Status Rate Keseluruhan</Typography>
              <LinearProgress
                variant="determinate"
                value={overallPassRate}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#9C27B0',
                    borderRadius: 6
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Tested: {totalTested}</Typography>
                <Typography variant="body2">Passed: {totalPassed}</Typography>
                <Typography variant="body2" fontWeight="bold">{overallPassRate}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                Status rate dihitung dari total produk yang diuji dan berhasil melewati QC.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add QC Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Entri Quality Control Baru</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Departemen</InputLabel>
                <Select
                  name="department"
                  value={newQcEntry.department}
                  onChange={handleNewEntryChange}
                  label="Departemen"
                >
                  <MenuItem value="Production">Produksi</MenuItem>
                  <MenuItem value="Overhaul">Overhaul Point Machine</MenuItem>
                  <MenuItem value="Rekayasa">Rekayasa</MenuItem>
                  <MenuItem value="Kalibrasi">Kalibrasi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="product"
                label="Nama Produk"
                type="text"
                fullWidth
                variant="outlined"
                value={newQcEntry.product}
                onChange={handleNewEntryChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="batch"
                label="Kode Batch"
                type="text"
                fullWidth
                variant="outlined"
                value={newQcEntry.batch}
                onChange={handleNewEntryChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="tested"
                label="Jumlah Diuji"
                type="number"
                fullWidth
                variant="outlined"
                value={newQcEntry.tested}
                onChange={handleNewEntryChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="passed"
                label="Jumlah Lulus"
                type="number"
                fullWidth
                variant="outlined"
                value={newQcEntry.passed}
                onChange={handleNewEntryChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newQcEntry.status}
                  onChange={handleNewEntryChange}
                  label="Status"
                >
                  <MenuItem value=""><em>Pilih Status</em></MenuItem>
                  <MenuItem value="Lulus">Lulus</MenuItem>
                  <MenuItem value="Dalam Proses">Dalam Proses</MenuItem>
                  <MenuItem value="Tidak Lulus">Tidak Lulus</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="date"
                label="Tanggal QC"
                type="date"
                fullWidth
                variant="outlined"
                value={newQcEntry.date}
                onChange={handleNewEntryChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} sx={{ color: '#9C27B0' }}>Batal</Button>
          <Button
            onClick={handleAddNewQc}
            variant="contained"
            sx={{
              backgroundColor: '#9C27B0',
              '&:hover': { backgroundColor: '#7B1FA2' },
            }}
          >
            Tambah
          </Button>
        </DialogActions>
      </Dialog>

      {/* Repair Modal */}
      <Dialog open={openRepairModal} onClose={handleCloseRepairModal} fullWidth maxWidth="sm">
        <DialogTitle>Kirim untuk Perbaikan</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Anda akan mengirim item berikut untuk perbaikan:
              </Typography>
              <Box sx={{ mt: 2, mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography><strong>ID:</strong> {selectedItem.id}</Typography>
                <Typography><strong>Produk:</strong> {selectedItem.product}</Typography>
                <Typography><strong>Batch:</strong> {selectedItem.batch}</Typography>
                <Typography><strong>Departemen:</strong> {selectedItem.department}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Item ini akan dikembalikan ke departemen asal untuk proses perbaikan.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRepairModal} sx={{ color: '#9C27B0' }}>Batal</Button>
          <Button
            onClick={handleSendForRepair}
            variant="contained"
            sx={{
              backgroundColor: '#9C27B0',
              '&:hover': { backgroundColor: '#7B1FA2' },
            }}
          >
            Konfirmasi Perbaikan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
