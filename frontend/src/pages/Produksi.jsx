import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, LinearProgress,
  List, ListItem, ListItemText, Divider, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  Snackbar, Alert, TextField, Grid, Tooltip,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Add, CheckCircle, Warning, Error, Visibility, Delete,
  KeyboardArrowLeft, KeyboardArrowRight, Inventory2, Group, Build
} from '@mui/icons-material';
import { format } from 'date-fns';

const initialProductionData = [
  {
    id: "PRD-001",
    name: "Radio Lokomotif",
    target: 100,
    completed: 82,
    status: "Dalam Proses",
    startDate: "2023-11-01",
    endDate: "2024-07-30",
    personnel: ["Tim Produksi"],
    materials: [
      { name: "Modul RF", qty: 100, harga: 50000, satuan: "unit" },
      { name: "Casing Polimer", qty: 100, harga: 20000, satuan: "unit" },
      { name: "Kabel Koaksial", qty: 200, harga: 5000, satuan: "meter" },
      { name: "Antena", qty: 100, harga: 15000, satuan: "unit" }
    ],
    progress: [
      { date: "2024-07-01", completed: 20, notes: "Assembly 20% selesai" },
      { date: "2024-07-10", completed: 50, notes: "Testing dimulai, 30 unit lolos" },
      { date: "2024-07-20", completed: 82, notes: "Quality Check tahap 1 selesai untuk 82 unit" }
    ]
  },
  {
    id: "PRD-002",
    name: "Way Station KRL",
    target: 50,
    completed: 45,
    status: "Dalam Proses",
    startDate: "2024-06-15",
    endDate: "2024-07-28",
    personnel: ["Tim Produksi"],
    materials: [
      { name: "Unit CPU Industri", qty: 50, harga: 500000, satuan: "unit" },
      { name: "Router Jaringan", qty: 50, harga: 100000, satuan: "unit" },
      { name: "Kabel Fiber Optik", qty: 500, harga: 10000, satuan: "meter" },
      { name: "Sensor Lingkungan", qty: 50, harga: 30000, satuan: "unit" }
    ],
    progress: [
      { date: "2024-06-25", completed: 30, notes: "Instalasi perangkat keras selesai" },
      { date: "2024-07-05", completed: 45, notes: "Konfigurasi sistem 50% rampung" }
    ]
  },
  {
    id: "PRD-003",
    name: "Sistem Persinyalan Baru",
    target: 5,
    completed: 5,
    status: "Selesai",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    personnel: ["Tim Produksi"],
    materials: [
      { name: "Mikrokontroler", qty: 5, harga: 100000, satuan: "unit" },
      { name: "Transistor Daya", qty: 10, harga: 5000, satuan: "buah" },
      { name: "Relai Solid State", qty: 5, harga: 20000, satuan: "unit" }
    ],
    progress: [
      { date: "2024-02-01", completed: 50, notes: "Desain dan Manufaktur selesai" },
      { date: "2024-03-31", completed: 100, notes: "Proyek selesai dan disertifikasi" }
    ]
  },
  {
    id: "PRD-004",
    name: "Way Station KRL Upgrade",
    target: 50,
    completed: 45,
    status: "Dalam Proses",
    startDate: "2024-06-15",
    endDate: "2024-07-28",
    personnel: ["Tim Produksi"],
    materials: [
      { name: "Unit CPU Industri", qty: 50, harga: 500000, satuan: "unit" },
      { name: "Router Jaringan", qty: 50, harga: 100000, satuan: "unit" },
      { name: "Kabel Fiber Optik", qty: 500, harga: 10000, satuan: "meter" },
      { name: "Sensor Lingkungan", qty: 50, harga: 30000, satuan: "unit" }
    ],
    progress: [
      { date: "2024-06-25", completed: 30, notes: "Instalasi perangkat keras selesai" },
      { date: "2024-07-05", completed: 45, notes: "Konfigurasi sistem 50% rampung" }
    ]
  },
];

const steps = [
  "Informasi Umum",
  "Personel",
  "Material",
  "Konfirmasi"
];

export default function Produksi() {
  const [productionData, setProductionData] = useState(initialProductionData);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newProduction, setNewProduction] = useState({
    name: "",
    target: "",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: "",
    personnel: [],
    materials: [],
    currentPersonnel: "",
    currentMaterialName: "",
    currentMaterialQty: "",
    currentMaterialHarga: "",
    currentMaterialSatuan: ""
  });
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const totalProductions = productionData.length;
  const inProgressProductions = productionData.filter(p => p.status === "Dalam Proses").length;
  const completedProductions = productionData.filter(p => p.status === "Selesai").length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (field, valueField) => {
    if (newProduction[valueField].trim()) {
      setNewProduction(prev => ({
        ...prev,
        [field]: [...prev[field], prev[valueField].trim()],
        [valueField]: ""
      }));
    } else {
      setSnackbar({ open: true, message: "Input tidak boleh kosong!", severity: "error" });
    }
  };

  const handleAddMaterial = () => {
    const { currentMaterialName, currentMaterialQty, currentMaterialHarga, currentMaterialSatuan } = newProduction;
    if (currentMaterialName.trim() && currentMaterialQty !== "" && currentMaterialHarga !== "" && currentMaterialSatuan.trim()) {
      const newMaterial = {
        name: currentMaterialName.trim(),
        qty: parseInt(currentMaterialQty),
        harga: parseFloat(currentMaterialHarga),
        satuan: currentMaterialSatuan.trim()
      };
      setNewProduction(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
        currentMaterialName: "",
        currentMaterialQty: "",
        currentMaterialHarga: "",
        currentMaterialSatuan: ""
      }));
    } else {
      setSnackbar({ open: true, message: "Harap lengkapi semua detail material!", severity: "error" });
    }
  };

  const handleRemoveItem = (listName, index) => {
    setNewProduction(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    switch (activeStep) {
      case 0: // General Information
        if (!newProduction.name || newProduction.target === "" || !newProduction.startDate || !newProduction.endDate) {
          setSnackbar({ open: true, message: "Harap lengkapi semua informasi umum.", severity: "error" });
          return;
        }
        if (parseInt(newProduction.target) <= 0) {
          setSnackbar({ open: true, message: "Target produksi harus lebih dari 0.", severity: "error" });
          return;
        }
        if (newProduction.startDate > newProduction.endDate) {
          setSnackbar({ open: true, message: "Tanggal mulai tidak boleh setelah tanggal selesai.", severity: "error" });
          return;
        }
        break;
      case 1: // Personnel (formerly case 2)
        if (newProduction.personnel.length === 0) {
          setSnackbar({ open: true, message: "Harap tambahkan setidaknya satu personel.", severity: "error" });
          return;
        }
        break;
      case 2: // Material (formerly case 3)
        if (newProduction.materials.length === 0) {
          setSnackbar({ open: true, message: "Harap tambahkan setidaknya satu material.", severity: "error" });
          return;
        }
        break;
      default:
        break;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

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
      personnel: newProduction.personnel,
      materials: newProduction.materials,
      progress: []
    };
    setProductionData(prev => [...prev, newItem]);
    setOpenAddDialog(false);
    setActiveStep(0);
    setNewProduction({
      name: "", target: "", startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: "", personnel: [], materials: [],
      currentPersonnel: "",
      currentMaterialName: "", currentMaterialQty: "", currentMaterialHarga: "", currentMaterialSatuan: ""
    });
    setSnackbar({ open: true, message: "Produksi berhasil ditambahkan!", severity: "success" });
  };

  const getStatusInfo = (status) => {
    if (status === "Selesai") return { color: "success", icon: <CheckCircle fontSize="small" /> };
    if (status === "Dalam Proses") return { color: "warning", icon: <Warning fontSize="small" /> };
    return { color: "error", icon: <Error fontSize="small" /> };
  };

  const handleOpenDetail = (item) => {
    setSelectedProduction(item);
    setOpenDetailDialog(true);
  };

  const calculateProgressPercentage = (completed, target) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((completed / target) * 100));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Nama Produksi"
                value={newProduction.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="target"
                type="number"
                label="Target Produksi (Unit)"
                value={newProduction.target}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="startDate"
                label="Tanggal Mulai"
                type="date"
                value={newProduction.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="endDate"
                label="Tanggal Selesai (Estimasi)"
                type="date"
                value={newProduction.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        );
      case 1: // This was case 2 (Personel)
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Personel Terlibat</Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                sx={{ flexGrow: 1 }}
                label="Tambahkan Nama Personel"
                value={newProduction.currentPersonnel}
                onChange={(e) => setNewProduction({ ...newProduction, currentPersonnel: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem("personnel", "currentPersonnel")}
              />
              <Button variant="contained" onClick={() => handleAddItem("personnel", "currentPersonnel")} startIcon={<Add />}>
                Tambah
              </Button>
            </Box>
            <List dense>
              {newProduction.personnel.length === 0 ? (
                <Typography color="text.secondary">Belum ada personel ditambahkan.</Typography>
              ) : (
                newProduction.personnel.map((p, i) => (
                  <ListItem
                    key={i}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveItem("personnel", i)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={p} />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        );
      case 2: // This was case 3 (Material)
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Material Digunakan</Typography>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nama Material"
                  value={newProduction.currentMaterialName}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={newProduction.currentMaterialQty}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialQty: e.target.value })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Harga"
                  type="number"
                  value={newProduction.currentMaterialHarga}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialHarga: e.target.value })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Satuan"
                  value={newProduction.currentMaterialSatuan}
                  onChange={(e) => setNewProduction({ ...newProduction, currentMaterialSatuan: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleAddMaterial} startIcon={<Add />}>
                  Tambah Material
                </Button>
              </Grid>
            </Grid>
            <List dense>
              {newProduction.materials.length === 0 ? (
                <Typography color="text.secondary">Belum ada material ditambahkan.</Typography>
              ) : (
                newProduction.materials.map((m, i) => (
                  <ListItem
                    key={i}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveItem("materials", i)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={`${m.name} (${m.qty} ${m.satuan} @ Rp${m.harga})`} />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        );
      case 3: // This was case 4 (Konfirmasi)
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Konfirmasi Data Produksi</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Nama Produksi:</strong> {newProduction.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Target:</strong> {newProduction.target} unit</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Periode:</strong> {format(new Date(newProduction.startDate), 'dd MMM yyyy')} - {format(new Date(newProduction.endDate), 'dd MMM yyyy')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Personel:</strong></Typography>
                <List dense>
                  {newProduction.personnel.length > 0 ? newProduction.personnel.map((item, idx) => <ListItemText key={idx} primary={`- ${item}`} />) : <ListItemText primary="- Tidak ada" />}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Material:</strong></Typography>
                <List dense>
                  {newProduction.materials.length > 0 ? newProduction.materials.map((item, idx) => <ListItemText key={idx} primary={`- ${item.name} (${item.qty} ${item.satuan} @ Rp${item.harga})`} />) : <ListItemText primary="- Tidak ada" />}
                </List>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Inventory2 sx={{ color: '#007BFF', fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight="bold">Manajemen Produksi Barang</Typography>
      </Box>

      {/* Summary Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Inventory2 color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Total Produksi</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">{totalProductions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Dalam Proses</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="warning.dark">{inProgressProductions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Selesai</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.dark">{completedProductions}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Main Action */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
        >
          Buat Produksi Baru
        </Button>
      </Box>

      {/* Production List - Now as a Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="production table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nama Produksi</TableCell>
              <TableCell align="right">Target (Unit)</TableCell>
              <TableCell align="right">Selesai (Unit)</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Periode</TableCell>
              <TableCell>Personel</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productionData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h6" color="text.secondary">Belum ada data produksi.</Typography>
                  <Typography variant="body2" color="text.secondary">Klik "Buat Produksi Baru" untuk memulai.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              productionData.map((item) => {
                const progressPercentage = calculateProgressPercentage(item.completed, item.target);
                const statusInfo = getStatusInfo(item.status);
                const isCompleted = item.status === "Selesai";

                return (
                  <TableRow
                    key={item.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {item.id}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.target}</TableCell>
                    <TableCell align="right">{item.completed}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: isCompleted ? '#4caf50' : '#2196f3',
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">{progressPercentage}%</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={statusInfo.color}
                        icon={statusInfo.icon}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      {item.personnel.length > 0 ? item.personnel.join(', ') : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Lihat Detail">
                        <IconButton onClick={() => handleOpenDetail(item)} size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Buat Produksi Baru */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Buat Produksi Baru</DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<KeyboardArrowLeft />}>
            Kembali
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSaveProduction : handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <KeyboardArrowRight />}
          >
            {activeStep === steps.length - 1 ? 'Selesai & Simpan' : 'Lanjut'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detail Produksi */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduction?.name} <Chip label={selectedProduction?.id} size="small" sx={{ ml: 1 }} /></DialogTitle>
        <DialogContent dividers>
          {selectedProduction && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Informasi Umum</Typography>
                <List dense>
                  <ListItem><ListItemText primary={`Target: ${selectedProduction.target} unit`}/></ListItem>
                  <ListItem><ListItemText primary={`Selesai: ${selectedProduction.completed} unit`}/></ListItem>
                  <ListItem><ListItemText primary={`Status: ${selectedProduction.status}`} /></ListItem>
                  <ListItem><ListItemText primary={`Periode: ${format(new Date(selectedProduction.startDate), 'dd MMM yyyy')} - ${format(new Date(selectedProduction.endDate), 'dd MMM yyyy')}`} /></ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Group sx={{ verticalAlign: 'middle', mr: 1 }} />Personel Terlibat
                </Typography>
                <List dense>
                  {selectedProduction.personnel.length > 0 ? (
                    selectedProduction.personnel.map((p, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`- ${p}`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Tidak ada personel terlibat." /></ListItem>
                  )}
                </List>
                <Typography variant="h6" gutterBottom mt={2}>
                  <Inventory2 sx={{ verticalAlign: 'middle', mr: 1 }} />Material Digunakan
                </Typography>
                <List dense>
                  {selectedProduction.materials.length > 0 ? (
                    selectedProduction.materials.map((m, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`${m.name} (${m.qty} ${m.satuan} @ Rp${m.harga})`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Tidak ada material digunakan." /></ListItem>
                  )}
                </List>
                <Typography variant="h6" gutterBottom mt={2}>Riwayat Progres</Typography>
                <List dense>
                  {selectedProduction.progress.length > 0 ? (
                    selectedProduction.progress.map((p, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${format(new Date(p.date), 'dd MMM yyyy')}: ${p.completed} unit selesai (${calculateProgressPercentage(p.completed, selectedProduction.target)}%)`}
                          secondary={p.notes}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Belum ada riwayat progres." /></ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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