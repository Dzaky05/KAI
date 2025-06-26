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
  Button, 
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { 
  Factory as FactoryIcon, 
  Add, 
  CheckCircle, 
  Warning, 
  Error,
  Close,
  Save,
  ArrowForward,
  ArrowBack
} from "@mui/icons-material";
import Frame from "../components/Frame";

const initialProductionData = [
  { 
    id: "PRD-001", 
    name: "Radio Lokomotif", 
    target: 100, 
    completed: 82, 
    status: "Dalam Proses", 
    startDate: "2023-11-01",
    endDate: "2023-12-15",
    workItems: ["Assembly", "Testing", "Quality Check"],
    personnel: ["Team A", "Team B"],
    materials: ["Komponen A", "Komponen B", "Komponen C"],
    progress: [
      { date: "2023-11-10", completed: 20, notes: "Assembly 20%" },
      { date: "2023-11-20", completed: 50, notes: "Testing dimulai" },
      { date: "2023-11-30", completed: 82, notes: "Quality Check 32%" }
    ]
  },
  { 
    id: "PRD-002", 
    name: "Way Station", 
    target: 50, 
    completed: 45, 
    status: "Dalam Proses", 
    startDate: "2023-11-10",
    endDate: "2023-11-30",
    workItems: ["Installasi", "Konfigurasi", "Testing"],
    personnel: ["Team C"],
    materials: ["Modul X", "Modul Y"],
    progress: [
      { date: "2023-11-15", completed: 30, notes: "Installasi selesai" },
      { date: "2023-11-25", completed: 45, notes: "Konfigurasi 50%" }
    ]
  }
];

const steps = [
  "Input Nama Produksi",
  "Input Target Produksi",
  "Input Item Pekerjaan",
  "Input Personel",
  "Input Material",
  "Konfirmasi"
];

export default function Produksi() {
  const [productionData, setProductionData] = useState(initialProductionData);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newProduction, setNewProduction] = useState({
    name: "",
    target: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    workItems: [],
    personnel: [],
    materials: [],
    currentWorkItem: "",
    currentPersonnel: "",
    currentMaterial: ""
  });
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddWorkItem = () => {
    if (newProduction.currentWorkItem) {
      setNewProduction(prev => ({
        ...prev,
        workItems: [...prev.workItems, prev.currentWorkItem],
        currentWorkItem: ""
      }));
    }
  };

  const handleAddPersonnel = () => {
    if (newProduction.currentPersonnel) {
      setNewProduction(prev => ({
        ...prev,
        personnel: [...prev.personnel, prev.currentPersonnel],
        currentPersonnel: ""
      }));
    }
  };

  const handleAddMaterial = () => {
    if (newProduction.currentMaterial) {
      setNewProduction(prev => ({
        ...prev,
        materials: [...prev.materials, prev.currentMaterial],
        currentMaterial: ""
      }));
    }
  };

  const handleRemoveItem = (listName, index) => {
    setNewProduction(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduction = () => {
    const newId = `PRD-${(productionData.length + 1).toString().padStart(3, '0')}`;
    const newItem = {
      id: newId,
      name: newProduction.name,
      target: parseInt(newProduction.target),
      completed: 0,
      status: "Dalam Proses",
      startDate: newProduction.startDate,
      endDate: newProduction.endDate,
      workItems: newProduction.workItems,
      personnel: newProduction.personnel,
      materials: newProduction.materials,
      progress: []
    };
    
    setProductionData([...productionData, newItem]);
    setOpenDialog(false);
    setActiveStep(0);
    setNewProduction({
      name: "",
      target: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      workItems: [],
      personnel: [],
      materials: [],
      currentWorkItem: "",
      currentPersonnel: "",
      currentMaterial: ""
    });
    showSnackbar("Produksi baru berhasil ditambahkan", "success");
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

  const handleOpenDetail = (item) => {
    setSelectedProduction(item);
    setOpenDetailDialog(true);
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case "Selesai":
        return { color: "success", icon: <CheckCircle /> };
      case "Dalam Proses":
        return { color: "warning", icon: <Warning /> };
      default:
        return { color: "error", icon: <Error /> };
    }
  };

  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FactoryIcon fontSize="large" sx={{ color: '#FF9800', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Manajemen Produksi
          </Typography>
        </Box>

        {/* Add Production Button */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ 
                  backgroundColor: '#FF9800',
                  '&:hover': { backgroundColor: '#F57C00' },
                  borderRadius: 2
                }}
              >
                Tambah Produksi
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Production Table */}
        <Card sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID Produksi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nama Produksi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Selesai</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tanggal Mulai</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tanggal Selesai</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productionData.map((row) => {
                    const statusInfo = getStatusInfo(row.status);
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                        <TableCell>{row.target}</TableCell>
                        <TableCell>{row.completed}</TableCell>
                        <TableCell>
                          <Chip
                            icon={statusInfo.icon}
                            label={row.status}
                            color={statusInfo.color}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={(row.completed / row.target) * 100}
                              sx={{
                                width: '100%',
                                mr: 1,
                                height: 8,
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: '#FF9800'
                                }
                              }}
                            />
                            <Typography variant="body2">
                              {Math.round((row.completed / row.target) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{row.startDate}</TableCell>
                        <TableCell>{row.endDate}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            sx={{ color: '#FF9800' }}
                            onClick={() => handleOpenDetail(row)}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Statistik Produksi
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                        {productionData.length}
                      </Typography>
                      <Typography variant="body2">Total Proyek</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        {productionData.filter(p => p.status === "Selesai").length}
                      </Typography>
                      <Typography variant="body2">Selesai</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                        {productionData.filter(p => p.status === "Dalam Proses").length}
                      </Typography>
                      <Typography variant="body2">Dalam Proses</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Progress Keseluruhan
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (productionData.reduce((sum, item) => sum + item.completed, 0) / 
                    productionData.reduce((sum, item) => sum + item.target, 0)) * 100
                  }
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      backgroundColor: '#FF9800'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Total Produksi: {productionData.reduce((sum, item) => sum + item.completed, 0)} / {productionData.reduce((sum, item) => sum + item.target, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {Math.round(
                      (productionData.reduce((sum, item) => sum + item.completed, 0) / 
                      productionData.reduce((sum, item) => sum + item.target, 0)) * 100
                    )}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Production Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {activeStep === steps.length - 1 ? 'Konfirmasi Produksi Baru' : steps[activeStep]}
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Input Nama Produksi */}
            {activeStep === 0 && (
              <Box>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nama Produksi"
                  name="name"
                  value={newProduction.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Tanggal Mulai"
                  type="date"
                  name="startDate"
                  value={newProduction.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Tanggal Selesai"
                  type="date"
                  name="endDate"
                  value={newProduction.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Box>
            )}

            {/* Step 2: Input Target Produksi */}
            {activeStep === 1 && (
              <Box>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Target Produksi"
                  name="target"
                  type="number"
                  value={newProduction.target}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Box>
            )}

            {/* Step 3: Input Item Pekerjaan */}
            {activeStep === 2 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Item Pekerjaan"
                    name="currentWorkItem"
                    value={newProduction.currentWorkItem}
                    onChange={handleInputChange}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddWorkItem}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Tambah
                  </Button>
                </Box>
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {newProduction.workItems.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleRemoveItem('workItems', index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Step 4: Input Personel */}
            {activeStep === 3 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Personel/Tim"
                    name="currentPersonnel"
                    value={newProduction.currentPersonnel}
                    onChange={handleInputChange}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddPersonnel}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Tambah
                  </Button>
                </Box>
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {newProduction.personnel.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleRemoveItem('personnel', index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Step 5: Input Material */}
            {activeStep === 4 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Material/Bahan"
                    name="currentMaterial"
                    value={newProduction.currentMaterial}
                    onChange={handleInputChange}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddMaterial}
                    sx={{ mt: 2, height: '56px' }}
                  >
                    Tambah
                  </Button>
                </Box>
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {newProduction.materials.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleRemoveItem('materials', index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Step 6: Konfirmasi */}
            {activeStep === 5 && (
              <Box>
                <Typography variant="h6" gutterBottom>Ringkasan Produksi</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Nama Produksi:</Typography>
                    <Typography>{newProduction.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Target Produksi:</Typography>
                    <Typography>{newProduction.target}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Tanggal Mulai:</Typography>
                    <Typography>{newProduction.startDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Tanggal Selesai:</Typography>
                    <Typography>{newProduction.endDate}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Item Pekerjaan:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {newProduction.workItems.map((item, index) => (
                        <Chip key={index} label={item} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Personel:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {newProduction.personnel.map((item, index) => (
                        <Chip key={index} label={item} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Material:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {newProduction.materials.map((item, index) => (
                        <Chip key={index} label={item} />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={activeStep === 0 ? () => setOpenDialog(false) : handleBack}
              startIcon={<ArrowBack />}
            >
              {activeStep === 0 ? 'Batal' : 'Kembali'}
            </Button>
            <Button 
              onClick={activeStep === steps.length - 1 ? handleSaveProduction : handleNext}
              variant="contained"
              color="primary"
              endIcon={activeStep === steps.length - 1 ? <Save /> : <ArrowForward />}
              disabled={
                (activeStep === 0 && (!newProduction.name || !newProduction.startDate || !newProduction.endDate)) ||
                (activeStep === 1 && !newProduction.target) ||
                (activeStep === steps.length - 1 && 
                  (!newProduction.name || !newProduction.target || 
                   !newProduction.startDate || !newProduction.endDate))
              }
            >
              {activeStep === steps.length - 1 ? 'Simpan' : 'Lanjut'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Production Detail Dialog */}
        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
          {selectedProduction && (
            <>
              <DialogTitle>
                Detail Produksi: {selectedProduction.name}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Informasi Dasar</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">ID Produksi:</Typography>
                        <Typography>{selectedProduction.id}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">Status:</Typography>
                        <Chip
                          label={selectedProduction.status}
                          color={getStatusInfo(selectedProduction.status).color}
                          icon={getStatusInfo(selectedProduction.status).icon}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">Target:</Typography>
                        <Typography>{selectedProduction.target}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">Selesai:</Typography>
                        <Typography>{selectedProduction.completed}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">Tanggal Mulai:</Typography>
                        <Typography>{selectedProduction.startDate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle1">Tanggal Selesai:</Typography>
                        <Typography>{selectedProduction.endDate}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress
                          variant="determinate"
                          value={(selectedProduction.completed / selectedProduction.target) * 100}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            mt: 1,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: '#FF9800'
                            }
                          }}
                        />
                        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                          Progress: {Math.round((selectedProduction.completed / selectedProduction.target) * 100)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Item Pekerjaan</Typography>
                    <List dense>
                      {selectedProduction.workItems.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Personel</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedProduction.personnel.map((item, index) => (
                        <Chip key={index} label={item} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Material</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedProduction.materials.map((item, index) => (
                        <Chip key={index} label={item} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Progress Pekerjaan</Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tanggal</TableCell>
                            <TableCell>Selesai</TableCell>
                            <TableCell>Catatan</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedProduction.progress.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.completed}</TableCell>
                              <TableCell>{item.notes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
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