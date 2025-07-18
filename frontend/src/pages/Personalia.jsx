import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, FormControl, InputLabel, Select, MenuItem,
  Grid, IconButton, Tooltip, Stack, TablePagination,
  CircularProgress
} from '@mui/material';
import {
  Search, Edit, Visibility, Print, FileDownload, Delete, // Tambahkan ikon Delete
  Sort, ArrowUpward, ArrowDownward, Clear, AccountCircle
} from '@mui/icons-material';

const Personalia = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);

  // State untuk modal konfirmasi delete
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/personalia`);
        
        if (!Array.isArray(response.data)) {
          throw new Error("Format data tidak valid");
        }
        
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Gagal memuat data personalia");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
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
    divisi: "",
    jabatan: "",
    status: "",
    joinDate: "",
    urgentNumber: "",
    phoneNumber: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  
  const isAddFormValid = Object.values(addFormData).every(val => val !== '');
  const isEditFormValid = Object.values(editFormData || {}).every(val => val !== '');
  

  const uniqueDivisi = useMemo(() => [...new Set(data.map(item => item.divisi))], [data]);
  const uniqueStatus = useMemo(() => [...new Set(data.map(item => item.status))], [data]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

  const SortArrow = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return <Sort sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5, color: 'text.secondary' }} />;
    return sortConfig.direction === 'asc' ? <ArrowUpward sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5 }} /> : <ArrowDownward sx={{ fontSize: 16, verticalAlign: 'middle', ml: 0.5 }} />;
  };

  const StatusChip = ({ status }) => {
    let color = 'default';
    if (status === 'Aktif') color = 'success';
    if (status === 'Cuti') color = 'warning';
    if (status === 'Non-Aktif') color = 'error';
    
    return <Chip label={status} color={color} size="small" />;
  };

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleEditClick = (employee, event) => {
    event.stopPropagation();
    setSelectedEmployee(employee);
    setEditFormData({ ...employee });
    setShowEditModal(true);
  };

  // --- Fungsi untuk menghandle klik tombol Delete ---
  const handleDeleteClick = (employee, event) => {
    event.stopPropagation(); // Mencegah row click memicu modal detail
    setEmployeeToDelete(employee); // Simpan data pegawai yang akan dihapus
    setShowDeleteConfirmModal(true); // Tampilkan modal konfirmasi
  };

  // --- Fungsi untuk menghandle konfirmasi Delete ---
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return; // Pastikan ada pegawai yang dipilih

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/personalia/${employeeToDelete.personalia_id}`);
      
      // Perbarui state 'data' dengan menghapus item yang sudah dihapus
      setData(prevData => prevData.filter(item => item.personalia_id !== employeeToDelete.personalia_id));
      
      setShowDeleteConfirmModal(false); // Tutup modal konfirmasi
      setEmployeeToDelete(null); // Reset pegawai yang akan dihapus
      alert(`Data NIP ${employeeToDelete.nip} berhasil dihapus!`); // Notifikasi sukses
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      alert('Gagal menghapus data. Lihat console untuk detail.');
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/personalia/${editFormData.personalia_id}`, editFormData);
      
      setData((prevData) =>
        prevData.map((item) =>
          item.personalia_id === editFormData.personalia_id ? { ...item, ...editFormData } : item
        )
      );

      setShowEditModal(false);
      alert('Data berhasil diperbarui!');
    } catch (error) {
      console.error('Gagal update data:', error);
      alert('Gagal update data. Lihat console untuk detail.');
    }
  };

  const handleSaveAdd = async () => {
    try {
      const newData = {
        nip: addFormData.nip,
        divisi: addFormData.divisi,
        jabatan: addFormData.jabatan,
        status: addFormData.status,
        joinDate: addFormData.joinDate,
        urgentNumber: addFormData.urgentNumber,
        phoneNumber: addFormData.phoneNumber,
        profile_id: null, // PENTING: sesuaikan dengan ID yang valid di backend Anda
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/personalia`, newData);

      setData(prev => [...prev, response.data]);
      setShowAddModal(false);
      setAddFormData({
        nip: "",
        divisi: "",
        jabatan: "",
        status: "",
        joinDate: "",
        urgentNumber: "",
        phoneNumber: "",
      });
      alert('Data berhasil ditambahkan!');
    } catch (error) {
      console.error('Gagal tambah data:', error);
      alert('Gagal tambah data. Lihat console untuk detail.');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/personalia/export/excel`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_personalia.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Data berhasil diekspor ke Excel!');
    } catch (error) {
      console.error('Gagal export Excel:', error);
      alert('Gagal export Excel. Pastikan backend Anda memiliki endpoint /api/personalia/export/excel.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/personalia/export/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_personalia.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Data berhasil dicetak ke PDF!');
    } catch (error) {
      console.error('Gagal cetak PDF:', error);
      alert('Gagal cetak PDF. Pastikan backend Anda memiliki endpoint /api/personalia/export/pdf.');
    } finally {
      setPrinting(false);
    }
  };

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
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: { xs: 2, sm: 0 } }}>
            Data Personalia PT Kereta Api Indonesia
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1} 
            sx={{ mt: { xs: 2, sm: 0 } }}
            justifyContent="flex-end" 
          >
            <Button 
              variant="contained" 
              onClick={() => setShowAddModal(true)} 
              sx={{ bgcolor: 'success.main', width: { xs: '100%', sm: 'auto' } }}
            >
              Tambah Data Personalia
            </Button>
            <Button 
              variant="contained" 
              startIcon={printing ? <CircularProgress size={20} color="inherit" /> : <Print />} 
              sx={{ bgcolor: 'primary.light', width: { xs: '100%', sm: 'auto' } }}
              onClick={handlePrint}
              disabled={printing}
            >
              {printing ? 'Mencetak...' : 'Cetak'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <FileDownload />} 
              sx={{ bgcolor: 'primary.light', width: { xs: '100%', sm: 'auto' } }}
              onClick={handleExportExcel}
              disabled={exporting}
            >
              {exporting ? 'Mengekspor...' : 'Export Excel'}
            </Button>
          </Stack>
        </Box>
        
        <Box sx={{ p: 3 }}>
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
                  setPage(0);
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
                      setPage(0);
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
                      setPage(0);
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography ml={2}>Memuat data...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'error.main' }}>
                      <Typography variant="h6">Terjadi Kesalahan:</Typography>
                      <Typography>{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <TableRow
                      key={item.personalia_id}
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
                        {/* Tombol Delete baru */}
                        <Tooltip title="Hapus Data">
                          <IconButton 
                            color="error" 
                            size="small" 
                            sx={{ ml: 1 }}
                            onClick={(event) => handleDeleteClick(item, event)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                    {selectedEmployee.nip}
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
                <Box> 
                  <Typography variant="body2" color="text.secondary">
                    Detail tambahan tentang pegawai bisa ditampilkan di sini, seperti kontak, riwayat pelatihan, dll.
                  </Typography>
                </Box>
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
          <Button 
            onClick={handleSaveAdd} 
            variant="contained" 
            color="success" 
            startIcon={<Edit />} 
            disabled={!isAddFormValid}
          >
            Simpan
          </Button>
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
                    {editFormData.nip}
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
          <Button 
            variant="contained" 
            startIcon={<Edit />} 
            onClick={handleSaveEdit}
            disabled={!isEditFormValid}
          >
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1">
            Apakah Anda yakin ingin menghapus data pegawai dengan NIP: 
            <Typography component="span" fontWeight="bold" color="error.main" sx={{ ml: 0.5 }}>
              {employeeToDelete ? employeeToDelete.nip : ''}
            </Typography>
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setShowDeleteConfirmModal(false)} variant="outlined">
            Batal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error" 
            startIcon={<Delete />}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Personalia;