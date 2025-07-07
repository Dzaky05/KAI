import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Science as ScienceIcon,
  Add,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const initialQcData = [
  { id: "QC-001", product: "Radio Lokomotif", batch: "BATCH-2023-11", status: "Lulus", tested: 25, passed: 25, date: "2023-11-05" },
  { id: "QC-002", product: "Way Station", batch: "BATCH-2023-10", status: "Lulus", tested: 30, passed: 28, date: "2023-10-28" },
  { id: "QC-003", product: "Sentranik", batch: "BATCH-2023-11", status: "Dalam Proses", tested: 15, passed: 12, date: "2023-11-12" },
  { id: "QC-004", product: "Gentanik", batch: "BATCH-2023-09", status: "Tidak Lulus", tested: 20, passed: 15, date: "2023-09-20" },
];

export default function QualityControl() {
  const [qcData, setQcData] = useState(initialQcData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newQcEntry, setNewQcEntry] = useState({
    product: '',
    batch: '',
    tested: '',
    passed: '',
    status: '',
    date: '',
  });

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
      // If the same column is clicked, toggle sort direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If a new column is clicked, set it as the sort column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Opens the "Add New QC Entry" modal
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
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
    });
  };

  // Handles changes in the "Add New QC Entry" form fields
  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewQcEntry((prev) => ({ ...prev, [name]: value }));
  };

  // Adds a new QC entry to the qcData state
  const handleAddNewQc = () => {
    // Generate a simple unique ID for demonstration purposes
    const newId = `QC-${String(qcData.length + 1).padStart(3, '0')}`;
    const entryToAdd = {
      id: newId,
      ...newQcEntry,
      // Convert tested and passed values to integers
      tested: parseInt(newQcEntry.tested),
      passed: parseInt(newQcEntry.passed),
    };
    // Update the qcData state with the new entry
    setQcData((prev) => [...prev, entryToAdd]);
    // Close the modal after adding the entry
    handleCloseAddModal();
  };

  // Memoized data for filtering and sorting the QC table
  const filteredAndSortedData = useMemo(() => {
    let tempData = [...qcData];

    // Apply search filter if searchTerm is not empty
    if (searchTerm) {
      tempData = tempData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting if a sortColumn is selected
    if (sortColumn) {
      tempData.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        // Special handling for numeric columns
        if (sortColumn === 'tested' || sortColumn === 'passed') {
          valA = parseInt(valA);
          valB = parseInt(valB);
        }

        // Compare values based on sort direction
        if (valA < valB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0; // Values are equal
      });
    }
    return tempData;
  }, [qcData, searchTerm, sortColumn, sortDirection]); // Dependencies for memoization

  // Calculate total tested and passed items
  const totalTested = qcData.reduce((acc, item) => acc + item.tested, 0);
  const totalPassed = qcData.reduce((acc, item) => acc + item.passed, 0);
  // Calculate overall pass rate, handling division by zero
  const overallPassRate = totalTested > 0 ? Math.round((totalPassed / totalTested) * 100) : 0;

  // Count occurrences of each status
  const statusCounts = {
    "Lulus": qcData.filter(q => q.status === "Lulus").length,
    "Dalam Proses": qcData.filter(q => q.status === "Dalam Proses").length,
    "Tidak Lulus": qcData.filter(q => q.status === "Tidak Lulus").length,
  };

  // Data for the Doughnut chart
  const doughnutData = {
    labels: ['Lulus', 'Dalam Proses', 'Tidak Lulus'],
    datasets: [
      {
        data: [statusCounts["Lulus"], statusCounts["Dalam Proses"], statusCounts["Tidak Lulus"]],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'], // Green, Orange, Red
        hoverBackgroundColor: ['#66BB6A', '#FFB74D', '#E57373'], // Lighter shades for hover effect
      },
    ],
  };

  // Options for the Doughnut chart
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fit into its container
    plugins: {
      legend: {
        position: 'right', // Position legend on the right side
        labels: {
          usePointStyle: true, // Use circular points for legend items
        },
      },
      tooltip: {
        callbacks: {
          // Custom tooltip label to show value and percentage
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

  return (
    <Box sx={{ p: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ScienceIcon sx={{ color: '#9C27B0', mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Quality Control</Typography>
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
                    { label: 'Produk', id: 'product' },
                    { label: 'Batch', id: 'batch' },
                    { label: 'Status', id: 'status' },
                    { label: 'Tested/Passed', id: 'tested' }, // Column for sorting by 'tested' count
                    { label: 'Pass Rate', id: 'passRate' },
                    { label: 'Tanggal', id: 'date' },
                    { label: 'Aksi', id: 'action' }
                  ].map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{ fontWeight: 'bold', cursor: col.id !== 'action' && col.id !== 'passRate' ? 'pointer' : 'default' }}
                      // Enable sorting only for specific columns
                      onClick={() => col.id !== 'action' && col.id !== 'passRate' && handleSort(col.id)}
                    >
                      {col.label}
                      {/* Display sort icons if the column is currently sorted */}
                      {sortColumn === col.id && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> : <ArrowDownwardIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.map((row) => {
                  // Calculate pass rate for each row, handling division by zero
                  const passRate = row.tested > 0 ? Math.round((row.passed / row.tested) * 100) : 0;
                  // Map status to corresponding color for LinearProgress bar
                  const colorMap = {
                    "Lulus": '#4CAF50', // Green
                    "Dalam Proses": '#FF9800', // Orange
                    "Tidak Lulus": '#F44336' // Red
                  };
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.product}</TableCell>
                      <TableCell>{row.batch}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          variant="outlined"
                          // Set chip color based on status
                          color={
                            row.status === "Lulus" ? "success" :
                            row.status === "Dalam Proses" ? "warning" : "error"
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
                        <Button size="small" sx={{ color: '#9C27B0', textTransform: 'none' }}>
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Message when no data is found after filtering */}
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
                  { label: "Total QC", value: qcData.length, color: "#9C27B0", bg: 'rgba(156, 39, 176, 0.1)' },
                  { label: "Lulus", value: statusCounts["Lulus"], color: "#4CAF50", bg: 'rgba(76, 175, 80, 0.1)' },
                  { label: "Tidak Lulus", value: statusCounts["Tidak Lulus"], color: "#F44336", bg: 'rgba(244, 67, 54, 0.1)' }
                ].map((stat, i) => (
                  <Grid item xs={4} key={i}>
                    <Card sx={{ textAlign: 'center', backgroundColor: stat.bg, p: 2 }}>
                      <Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography>
                      <Typography variant="body2">{stat.label}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {/* Doughnut Chart for status distribution */}
              <Box sx={{ mt: 3, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
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

      {/* Add QC Modal (Dialog) */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Entri Quality Control Baru</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
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
    </Box>
  );
}
