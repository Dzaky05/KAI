import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, FormControl, InputLabel, Select, MenuItem,
  Grid, IconButton, Tooltip, Stack, TablePagination
} from '@mui/material';
import {
  Search, Edit, Visibility, Print, FileDownload,
  Sort, ArrowUpward, ArrowDownward, Clear, AccountCircle
} from '@mui/icons-material';

const Personalia = () => {
  const initialData = [];

  const [data, setData] = useState(initialData); // <-- PINDAH KE ATAS

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/personalia');
        setData(response.data); // <-- Sekarang setData sudah terdefinisi
      } catch (error) {
        console.error('Gagal ambil data personalia:', error);
      }
    };
    fetchData();
  }, []);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Changed initial sort key to null
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    divisi: '',
    status: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
  nip: "",
  jabatan: "",
  divisi: "",
  status: "",
  joinDate: "",
  urgentNumber: "",
  phoneNumber: "",
});

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  

  

  const uniqueDivisi = useMemo(() => [...new Set(data.map(item => item.divisi))], [data]);
  const uniqueStatus = useMemo(() => [...new Set(data.map(item => item.status))], [data]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  // Filter data
  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const matchesSearch = Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesFilters = 
        (filters.divisi === '' || item.divisi === filters.divisi) &&
        (filters.status === '' || item.status === filters.status);
      
      return matchesSearch && matchesFilters;
    });
  }, [sortedData, searchTerm, filters]);

  // Pagination
  const currentItems = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort arrow component
  const SortArrow = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return <Sort sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5, color: 'text.secondary' }} />;
    return sortConfig.direction === 'asc' ? <ArrowUpward sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5 }} /> : <ArrowDownward sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5 }} />;
  };

  // Status Chip component
  const StatusChip = ({ status }) => {
    let color = 'default';
    if (status === 'Aktif') color = 'success';
    if (status === 'Cuti') color = 'warning';
    if (status === 'Non-Aktif') color = 'error';
    
    return <Chip label={status} color={color} size="small" />;
  };

  // Handle row click for detail modal
  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Handle opening the edit modal
  const handleEditClick = (employee, event) => {
    event.stopPropagation(); // Prevent row click from triggering detail modal
    setSelectedEmployee(employee);
    setEditFormData({ ...employee }); // Initialize edit form with current employee data
    setShowEditModal(true);
  };
   // Handle perubahan input form tambah
   const handleAddFormChange = (e) => {
     const { name, value } = e.target;
     setAddFormData((prevData) => ({
       ...prevData,
       [name]: value,
     }));
  };

  // Handle changes in the edit form
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle saving the edited data
  const handleSaveEdit = async () => {
  try {
    await axios.put(`http://localhost:8080/api/personalia/${editFormData.id}`, editFormData);
    setData((prevData) =>
      prevData.map((emp) =>
        emp.id === editFormData.id ? { ...editFormData } : emp
      )
    );
    setShowEditModal(false);
    setShowModal(false);
    setSelectedEmployee(null);
  } catch (error) {
    console.error('Gagal update data:', error);
  }
};

// Handle save add
const handleSaveAdd = async () => {
  try {
    const response = await axios.post("http://localhost:8080/api/personalia", addFormData);
    setData((prev) => [...prev, response.data]);
    setShowAddModal(false);
    setAddFormData({
      nip: "", jabatan: "", divisi: "", status: "", joinDate: "", urgentNumber: "", phoneNumber: ""
    });
  } catch (error) {
    console.error("Gagal tambah data:", error);
  }
};


  // Reset filters
  const resetFilters = () => {
    setFilters({
      divisi: '',
      status: '',
    });
    setSearchTerm('');
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold">
            Data Personalia PT Kereta Api Indonesia
          </Typography>
          <Button variant="contained" onClick={() => setShowAddModal(true)} sx={{ bgcolor: 'success.main' }}>
           Tambah Data Personalia
          </Button>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<Print />} sx={{ bgcolor: 'primary.light' }}>
              Cetak
            </Button>
            <Button variant="contained" startIcon={<FileDownload />} sx={{ bgcolor: 'primary.light' }}>
              Export Excel
            </Button>
          </Stack>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {/* Search and Filter Bar */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cari pegawai..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0); // Reset page when searching
                }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="divisi-select-label">Divisi</InputLabel>
                  <Select
                    labelId="divisi-select-label"
                    value={filters.divisi}
                    label="Divisi"
                    onChange={(e) => {
                      setFilters({ ...filters, divisi: e.target.value });
                      setPage(0); // Reset page on filter change
                    }}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {uniqueDivisi.map((divisi) => (
                      <MenuItem key={divisi} value={divisi}>{divisi}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={filters.status}
                    label="Status"
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      setPage(0); // Reset page on filter change
                    }}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {uniqueStatus.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<Clear />} 
                  onClick={resetFilters}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Reset Filter
                </Button>
              </Stack>
            </Grid>
          </Grid>
          
          {/* Data Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="employee table">
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell onClick={() => requestSort('nip')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    NIP <SortArrow sortKey="nip" />
                  </TableCell>
                  <TableCell onClick={() => requestSort('jabatan')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Jabatan <SortArrow sortKey="jabatan" />
                  </TableCell>
                  <TableCell onClick={() => requestSort('divisi')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Divisi <SortArrow sortKey="divisi" />
                  </TableCell>
                  <TableCell onClick={() => requestSort('status')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Status <SortArrow sortKey="status" />
                  </TableCell>
                  <TableCell onClick={() => requestSort('urgentNumber')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    No. Urgent <SortArrow sortKey="urgentNumber" />
                  </TableCell>
                  <TableCell onClick={() => requestSort('phoneNumber')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    No. Telepon <SortArrow sortKey="phoneNumber" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      sx={{ '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } }}
                    >
                      <TableCell>{item.nip}</TableCell>
                      <TableCell>{item.jabatan}</TableCell>
                      <TableCell>{item.divisi}</TableCell>
                      <TableCell><StatusChip status={item.status} /></TableCell>
                      <TableCell>{item.urgentNumber}</TableCell>
                      <TableCell>{item.phoneNumber}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Data">
                          <IconButton 
                            color="primary" 
                            size="small" 
                            onClick={(event) => handleEditClick(item, event)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lihat Detail">
                          <IconButton 
                            color="info" 
                            size="small" 
                            sx={{ ml: 1 }}
                            onClick={(event) => {
                                event.stopPropagation(); 
                                handleRowClick(item);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}> {/* Adjusted colSpan */}
                      <Typography variant="body1" color="text.secondary" mb={2}>
                        Tidak ada data yang ditemukan
                      </Typography>
                      <Button variant="outlined" startIcon={<Clear />} onClick={resetFilters}>
                        Reset Filter
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count }) =>
              `Menampilkan ${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`} pegawai`
            }
          />
        </Box>
      </Paper>
      
      {/* Employee Detail Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" component="span" fontWeight="bold">
            Detail Pegawai
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedEmployee && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                  <AccountCircle sx={{ fontSize: 100, color: 'text.secondary' }} />
                  <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>
                    {selectedEmployee.nip} {/* Display NIP instead of nama */}
                  </Typography>
                  <StatusChip status={selectedEmployee.status} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Informasi Umum</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">NIP:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEmployee.nip}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Jabatan:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEmployee.jabatan}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Divisi:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEmployee.divisi}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Tanggal Bergabung:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEmployee.joinDate}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Nomor Urgent:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEmployee.urgentNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Nomor Telepon:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEmployee.phoneNumber}</Typography>
                  </Grid>
                </Grid>
                <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>Informasi Tambahan</Typography>
                <Typography variant="body2" color="text.secondary">
                  Detail tambahan tentang pegawai bisa ditampilkan di sini, seperti kontak, riwayat pelatihan, dll.
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setShowModal(false)} variant="outlined">
            Tutup
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Edit />}
            onClick={() => {
              setShowModal(false);
              setEditFormData({ ...selectedEmployee });
              setShowEditModal(true);
            }}
          >
            Edit Data
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="md" fullWidth>
  <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
    Tambah Data Personalia
  </DialogTitle>
  <DialogContent dividers sx={{ p: 3 }}>

    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="nip" label="NIP" value={addFormData.nip} onChange={handleAddFormChange} size="small" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="jabatan" label="Jabatan" value={addFormData.jabatan} onChange={handleAddFormChange} size="small" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="divisi" label="Divisi" value={addFormData.divisi} onChange={handleAddFormChange} size="small" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="status" label="Status" value={addFormData.status} onChange={handleAddFormChange} size="small" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="joinDate" label="Tanggal Bergabung" type="date" value={addFormData.joinDate} onChange={handleAddFormChange} size="small" InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="urgentNumber" label="Nomor Urgent" value={addFormData.urgentNumber} onChange={handleAddFormChange} size="small" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="phoneNumber" label="Nomor Telepon" value={addFormData.phoneNumber} onChange={handleAddFormChange} size="small" />
      </Grid>
    </Grid>
  </DialogContent>
  
  <DialogActions sx={{ p: 2 }}>
    <Button onClick={() => setShowAddModal(false)} variant="outlined">Batal</Button>
    <Button onClick={handleSaveAdd} variant="contained" color="success" startIcon={<Edit />}>Simpan</Button>
  </DialogActions>
</Dialog>


      {/* Employee Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" component="span" fontWeight="bold">
            Edit Data Pegawai
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {editFormData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                  <AccountCircle sx={{ fontSize: 100, color: 'text.secondary' }} />
                  <Typography variant="h5" fontWeight="bold" mt={2} mb={1}>
                    {editFormData.nip} {/* Display NIP instead of nama */}
                  </Typography>
                  <StatusChip status={editFormData.status} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Informasi Umum</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="NIP"
                      name="nip"
                      value={editFormData.nip}
                      onChange={handleEditFormChange}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  {/* Removed TextField for "Nama Pegawai" */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Jabatan"
                      name="jabatan"
                      value={editFormData.jabatan}
                      onChange={handleEditFormChange}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Divisi</InputLabel>
                      <Select
                        name="divisi"
                        value={editFormData.divisi}
                        label="Divisi"
                        onChange={handleEditFormChange}
                      >
                        {uniqueDivisi.map((divisi) => (
                          <MenuItem key={divisi} value={divisi}>{divisi}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tanggal Bergabung"
                      name="joinDate"
                      value={editFormData.joinDate}
                      onChange={handleEditFormChange}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={editFormData.status}
                        label="Status"
                        onChange={handleEditFormChange}
                      >
                        {uniqueStatus.map((status) => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nomor Urgent"
                      name="urgentNumber"
                      value={editFormData.urgentNumber}
                      onChange={handleEditFormChange}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nomor Telepon"
                      name="phoneNumber"
                      value={editFormData.phoneNumber}
                      onChange={handleEditFormChange}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setShowEditModal(false)} variant="outlined">
            Batal
          </Button>
          <Button variant="contained" startIcon={<Edit />} onClick={handleSaveEdit}>
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Personalia;