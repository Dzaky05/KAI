import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Button, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert,
  CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton // Tambahkan IconButton dan Tooltip
} from "@mui/material";
import {
  Build as BuildIcon, Add, Code, Engineering, Settings, BarChart, Assignment, Handyman,
  Edit, Visibility, Delete // Tambahkan ikon Edit, Visibility, Delete
} from "@mui/icons-material";


// Helper function for TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Rekayasa() {
  const [value, setValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddProjectDialog, setOpenAddProjectDialog] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    status: 'Perencanaan',
    team: '',
    deadline: '',
    progress: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // NEW STATES for Edit, Detail, Delete
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
  const [editProjectData, setEditProjectData] = useState(null);
  const [openDetailProjectDialog, setOpenDetailProjectDialog] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState(null);
  const [openConfirmDeleteProjectDialog, setOpenConfirmDeleteProjectDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);


  // URL dasar API dari .env
  const API_BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    // Fetch data saat komponen dimuat
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Pastikan URL konsisten dengan backend, gunakan trailing slash
        const response = await axios.get(`${API_BASE_URL}/api/rekayasa/`); 
        const data = response.data;
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.warn('Data dari API bukan array:', data);
          setProjects([]);
        }
      } catch (err) {
        console.error('Gagal fetch data:', err);
        // Log respons error dari backend jika ada
        if (err.response) {
          console.error('Error Response Data (GET):', err.response.data); // <--- LOG BARU
          console.error('Error Response Status (GET):', err.response.status);
        } else if (err.request) {
          console.error('Error Request (GET):', err.request);
        } else {
          console.error('Error Message (GET):', err.message);
        }
        setProjects([]);
        setSnackbar({ open: true, message: `Gagal memuat data: ${err.response?.data?.error || err.message}`, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [API_BASE_URL]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handler untuk perubahan input di form tambah proyek
  const handleNewProjectInputChange = (e) => {
    const { name, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [name]: value }));
  };

  // Handler untuk menyimpan proyek baru
  const handleSaveNewProject = async () => {
    if (!newProjectData.name || !newProjectData.deadline || !newProjectData.team) {
      setSnackbar({ open: true, message: 'Nama Proyek, Deadline, dan Tim wajib diisi.', severity: 'error' });
      return;
    }

    const projectToSave = {
      name: newProjectData.name,
      status: newProjectData.status,
      team: newProjectData.team.split(',').map(s => s.trim()).filter(s => s !== ''), // Tetap kirim array string
      deadline: newProjectData.deadline,
      progress: parseInt(newProjectData.progress),
    };

    try {
      // Pastikan URL konsisten dengan backend, gunakan trailing slash
      const response = await axios.post(`${API_BASE_URL}/api/rekayasa/`, projectToSave);
      setProjects(prev => [...prev, response.data]);
      setSnackbar({ open: true, message: 'Proyek berhasil ditambahkan!', severity: 'success' });
      setOpenAddProjectDialog(false);
      setNewProjectData({
        name: '',
        status: 'Perencanaan',
        team: '',
        deadline: '',
        progress: 0,
      });
    } catch (error) {
      console.error('Gagal menambahkan proyek:', error);
      // Log respons error dari backend jika ada
      if (error.response) {
        console.error('Error Response Data (POST):', error.response.data); // <--- LOG BARU
        console.error('Error Response Status (POST):', error.response.status);
        console.error('Error Response Headers (POST):', error.response.headers);
        setSnackbar({ open: true, message: `Gagal menambahkan proyek: ${error.response.data.error || error.message}`, severity: 'error' });
      } else if (error.request) {
        // Permintaan dibuat tapi tidak ada respons
        console.error('Error Request (POST):', error.request);
        setSnackbar({ open: true, message: 'Gagal menambahkan proyek: Tidak ada respons dari server.', severity: 'error' });
      } else {
        // Kesalahan lain
        console.error('Error Message (POST):', error.message);
        setSnackbar({ open: true, message: `Gagal menambahkan proyek: ${error.message}`, severity: 'error' });
      }
    }
  };

  // NEW: Handler untuk membuka dialog detail proyek
  const handleOpenDetailProject = (project) => {
    setSelectedProjectForDetail(project);
    setOpenDetailProjectDialog(true);
  };

  // NEW: Handler untuk membuka dialog edit proyek
  const handleOpenEditProject = (project) => {
    setEditProjectData({
      ...project,
      team: Array.isArray(project.team) ? project.team.join(', ') : '' // Ubah array tim menjadi string untuk TextField
    });
    setOpenEditProjectDialog(true);
  };

  // NEW: Handler untuk perubahan input di form edit proyek
  const handleEditProjectInputChange = (e) => {
    const { name, value } = e.target;
    setEditProjectData(prev => ({ ...prev, [name]: value }));
  };

  // NEW: Handler untuk menyimpan perubahan proyek yang diedit
  const handleSaveEditProject = async () => {
    if (!editProjectData.name || !editProjectData.deadline || !editProjectData.team) {
      setSnackbar({ open: true, message: 'Nama Proyek, Deadline, dan Tim wajib diisi.', severity: 'error' });
      return;
    }

    const projectToUpdate = {
      ...editProjectData,
      team: editProjectData.team.split(',').map(s => s.trim()).filter(s => s !== ''),
      progress: parseInt(editProjectData.progress),
    };

    try {
      // Pastikan URL konsisten dengan backend
      const response = await axios.put(`${API_BASE_URL}/api/rekayasa/${editProjectData.id}`, projectToUpdate);
      setProjects(prev => prev.map(p => (p.id === response.data.id ? response.data : p)));
      setSnackbar({ open: true, message: 'Proyek berhasil diperbarui!', severity: 'success' });
      setOpenEditProjectDialog(false);
    } catch (error) {
      console.error('Gagal memperbarui proyek:', error);
      if (error.response) {
        console.error('Error Response Data (PUT):', error.response.data); // <--- LOG BARU
        setSnackbar({ open: true, message: `Gagal memperbarui proyek: ${error.response.data.error || error.message}`, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: `Gagal memperbarui proyek: ${error.message}`, severity: 'error' });
      }
    }
  };

  // NEW: Handler untuk membuka dialog konfirmasi hapus proyek
  const handleOpenConfirmDeleteProject = (project) => {
    setProjectToDelete(project);
    setOpenConfirmDeleteProjectDialog(true);
  };

  // NEW: Handler untuk menghapus proyek
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // Pastikan URL konsisten dengan backend
      await axios.delete(`${API_BASE_URL}/api/rekayasa/${projectToDelete.id}`);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setSnackbar({ open: true, message: 'Proyek berhasil dihapus!', severity: 'success' });
      setOpenConfirmDeleteProjectDialog(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Gagal menghapus proyek:', error);
      if (error.response) {
        console.error('Error Response Data (DELETE):', error.response.data); // <--- LOG BARU
        setSnackbar({ open: true, message: `Gagal menghapus proyek: ${error.response.data.error || error.message}`, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: `Gagal menghapus proyek: ${error.message}`, severity: 'error' });
      }
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BuildIcon fontSize="large" sx={{ color: '#3F51B5', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Departemen Rekayasa
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="engineering department tabs"
          centered
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
            },
          }}
        >
          <Tab label="Proyek" icon={<Assignment />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Alat" icon={<Handyman />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Progres" icon={<LinearProgress sx={{ transform: 'scale(0.6)' }} />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Statistik" icon={<BarChart />} iconPosition="start" {...a11yProps(3)} />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                Daftar Proyek Rekayasa
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddProjectDialog(true)}
                sx={{
                  backgroundColor: '#3F51B5',
                  '&:hover': { backgroundColor: '#303F9F', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(63, 81, 181, 0.3)'
                }}
              >
                Tambah Proyek
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table aria-label="project table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#eef2f6' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Nama Proyek</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Tim</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Deadline</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Progres</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Aksi</TableCell> {/* NEW: Kolom Aksi */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center"> {/* Update colspan */}
                        <CircularProgress />
                        <Typography>Memuat proyek...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center"> {/* Update colspan */}
                        <Typography color="text.secondary">Tidak ada proyek ditemukan.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow
                        key={project.id} // Gunakan project.id sebagai key
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                          '&:hover': { backgroundColor: '#e0e7ed', transition: 'background-color 0.3s ease' },
                        }}
                      >
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            color={
                              project.status === "Selesai" ? "success" :
                                project.status === "Dalam Pengerjaan" ? "warning" : "info"
                            }
                            variant="filled"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* Pastikan project.team adalah array sebelum map */}
                            {project.team && Array.isArray(project.team) && project.team.map((member, i) => (
                              <Avatar
                                key={i}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  fontSize: 12,
                                  bgcolor: '#3F51B5',
                                  ml: i > 0 ? -1 : 0,
                                  border: '1px solid white'
                                }}
                              >
                                {member.charAt(0).toUpperCase()}
                              </Avatar>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>{project.deadline}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={project.progress}
                              sx={{
                                width: 100,
                                height: 8,
                                borderRadius: 4,
                                mr: 1,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: '#3F51B5',
                                }
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">{project.progress}%</Typography>
                          </Box>
                        </TableCell>
                        {/* NEW: Kolom Aksi */}
                        <TableCell>
                          <Tooltip title="Lihat Detail">
                            <IconButton size="small" onClick={() => handleOpenDetailProject(project)}>
                              <Visibility color="info" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Proyek">
                            <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => handleOpenEditProject(project)}>
                              <Edit color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Proyek">
                            <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => handleOpenConfirmDeleteProject(project)}>
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#555' }}>
              Daftar Alat Rekayasa
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, display: 'flex', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }}>
                  <Avatar sx={{ bgcolor: '#3F51B5', mr: 2, width: 50, height: 50 }}>
                    <Code sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Software CAD</Typography>
                    <Typography variant="body2" color="text.secondary">Versi 2023.2</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, display: 'flex', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }}>
                  <Avatar sx={{ bgcolor: '#3F51B5', mr: 2, width: 50, height: 50 }}>
                    <Engineering sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Simulator Produksi</Typography>
                    <Typography variant="body2" color="text.secondary">Versi 2.1.5</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 2, display: 'flex', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }}>
                  <Avatar sx={{ bgcolor: '#3F51B5', mr: 2, width: 50, height: 50 }}>
                    <Settings sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Analisis Data</Typography>
                    <Typography variant="body2" color="text.secondary">Versi 1.0.3</Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#555' }}>
              Progres Proyek
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#eef2f6' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Nama Proyek</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#333' }}>Progres</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow
                      key={project.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                        '&:hover': { backgroundColor: '#e0e7ed', transition: 'background-color 0.3s ease' },
                      }}
                    >
                      <TableCell>{project.name}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ mr: 1, minWidth: '35px' }}>{project.progress}%</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{
                              width: 120,
                              height: 8,
                              borderRadius: 3,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                backgroundColor: '#3F51B5'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#555' }}>
              Statistik Rekayasa
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'rgba(63, 81, 181, 0.1)',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(63, 81, 181, 0.2)' }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#3F51B5', mb: 1 }}>
                    {projects.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Total Proyek</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)' }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1 }}>
                    {projects.filter(p => p.status === "Selesai").length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Proyek Selesai</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(255, 152, 0, 0.2)' }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FF9800', mb: 1 }}>
                    {projects.filter(p => p.status === "Dalam Pengerjaan").length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Proyek Dalam Pengerjaan</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(33, 150, 243, 0.2)' }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2196F3', mb: 1 }}>
                    {projects.filter(p => p.status === "Perencanaan").length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Proyek Perencanaan</Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialog untuk Tambah Proyek Baru */}
      <Dialog open={openAddProjectDialog} onClose={() => setOpenAddProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Proyek Baru</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Proyek"
                name="name"
                value={newProjectData.name}
                onChange={handleNewProjectInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tim (pisahkan dengan koma, cth: John, Jane, Doe)"
                name="team"
                value={newProjectData.team}
                onChange={handleNewProjectInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deadline"
                name="deadline"
                type="date"
                value={newProjectData.deadline}
                onChange={handleNewProjectInputChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Progres (%)"
                name="progress"
                type="number"
                value={newProjectData.progress}
                onChange={handleNewProjectInputChange}
                inputProps={{ min: 0, max: 100 }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newProjectData.status}
                  label="Status"
                  onChange={handleNewProjectInputChange}
                >
                  <MenuItem value="Perencanaan">Perencanaan</MenuItem>
                  <MenuItem value="Dalam Pengerjaan">Dalam Pengerjaan</MenuItem>
                  <MenuItem value="Selesai">Selesai</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddProjectDialog(false)} color="primary">Batal</Button>
          <Button
            variant="contained"
            onClick={handleSaveNewProject}
            startIcon={<Add />}
            disabled={!newProjectData.name || !newProjectData.deadline || !newProjectData.team}
          >
            Simpan Proyek
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Dialog untuk Lihat Detail Proyek */}
      <Dialog open={openDetailProjectDialog} onClose={() => setOpenDetailProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Proyek: {selectedProjectForDetail?.name}</DialogTitle>
        <DialogContent dividers>
          {selectedProjectForDetail && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Nama Proyek:</strong> {selectedProjectForDetail.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Status:</strong> {selectedProjectForDetail.status}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Tim:</strong> {Array.isArray(selectedProjectForDetail.team) ? selectedProjectForDetail.team.join(', ') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Deadline:</strong> {selectedProjectForDetail.deadline}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Progres:</strong> {selectedProjectForDetail.progress}%</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailProjectDialog(false)} color="primary">Tutup</Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              setOpenDetailProjectDialog(false); // Tutup dialog detail
              handleOpenEditProject(selectedProjectForDetail); // Buka dialog edit
            }}
          >
            Edit Proyek
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Dialog untuk Edit Proyek */}
      <Dialog open={openEditProjectDialog} onClose={() => setOpenEditProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Proyek: {editProjectData?.name}</DialogTitle>
        <DialogContent dividers>
          {editProjectData && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nama Proyek"
                  name="name"
                  value={editProjectData.name || ''}
                  onChange={handleEditProjectInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tim (pisahkan dengan koma, cth: John, Jane, Doe)"
                  name="team"
                  value={editProjectData.team || ''}
                  onChange={handleEditProjectInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deadline"
                  name="deadline"
                  type="date"
                  value={editProjectData.deadline || ''}
                  onChange={handleEditProjectInputChange}
                  InputLabelProps={{ shrink: true }}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Progres (%)"
                  name="progress"
                  type="number"
                  value={editProjectData.progress || 0}
                  onChange={handleEditProjectInputChange}
                  inputProps={{ min: 0, max: 100 }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editProjectData.status || ''}
                    label="Status"
                    onChange={handleEditProjectInputChange}
                  >
                    <MenuItem value="Perencanaan">Perencanaan</MenuItem>
                    <MenuItem value="Dalam Pengerjaan">Dalam Pengerjaan</MenuItem>
                    <MenuItem value="Selesai">Selesai</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProjectDialog(false)} color="primary">Batal</Button>
          <Button
            variant="contained"
            onClick={handleSaveEditProject}
            startIcon={<Edit />}
            disabled={!editProjectData?.name || !editProjectData?.deadline || !editProjectData?.team}
          >
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Dialog Konfirmasi Hapus Proyek */}
      <Dialog open={openConfirmDeleteProjectDialog} onClose={() => setOpenConfirmDeleteProjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Konfirmasi Penghapusan Proyek</DialogTitle>
        <DialogContent dividers>
          {projectToDelete && (
            <Typography variant="body1">
              Apakah Anda yakin ingin menghapus proyek "<strong>{projectToDelete.name}</strong>" (ID: {projectToDelete.id})?
              Tindakan ini tidak dapat dibatalkan.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDeleteProjectDialog(false)} color="primary">Batal</Button>
          <Button
            variant="contained"
            onClick={handleDeleteProject}
            startIcon={<Delete />}
            color="error"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
