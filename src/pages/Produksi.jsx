import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, LinearProgress,
  List, ListItem, ListItemText, Divider, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  Snackbar, Alert, TextField, Grid, Tooltip,
  Paper // <--- Pastikan Paper diimpor di sini
} from '@mui/material';
import {
  Add, CheckCircle, Warning, Error, Visibility, Delete,
  KeyboardArrowLeft, KeyboardArrowRight, Inventory2, Group, Build
} from '@mui/icons-material';
import { format } from 'date-fns'; // Untuk format tanggal

const initialProductionData = [
  {
    id: "PRD-001",
    name: "Radio Lokomotif",
    target: 100,
    completed: 82,
    status: "Dalam Proses",
    startDate: "2023-11-01",
    endDate: "2024-07-30", // Tanggal diperbarui agar lebih relevan dengan saat ini
    workItems: ["Assembly Komponen Elektronik", "Testing Fungsional", "Quality Check Akhir", "Pengepakan"],
    personnel: ["Team A (Elektronik)", "Team B (QC)"],
    materials: ["Modul RF", "Casing Polimer", "Kabel Koaksial", "Antena"],
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
    endDate: "2024-07-28", // Tanggal diperbarui
    workItems: ["Instalasi Perangkat Keras", "Konfigurasi Sistem Jaringan", "Integrasi Software", "Uji Coba Lapangan"],
    personnel: ["Team C (Instalasi)", "Team D (Jaringan)"],
    materials: ["Unit CPU Industri", "Router Jaringan", "Kabel Fiber Optik", "Sensor Lingkungan"],
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
    workItems: ["Desain Sistem", "Manufaktur Komponen", "Instalasi Lapangan", "Sertifikasi"],
    personnel: ["Team E (Desain)", "Team F (Manufaktur)"],
    materials: ["Mikrokontroler", "Transistor Daya", "Relai Solid State"],
    progress: [
      { date: "2024-02-01", completed: 50, notes: "Desain dan Manufaktur selesai" },
      { date: "2024-03-31", completed: 100, notes: "Proyek selesai dan disertifikasi" }
    ]
  }
];

const steps = [
  "Informasi Umum",
  "Item Pekerjaan",
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
    target: "", // Ubah ke string untuk TextField
    startDate: format(new Date(), 'yyyy-MM-dd'),
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
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Summary data for cards
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

  const handleRemoveItem = (listName, index) => {
    setNewProduction(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    // Basic validation for each step
    switch (activeStep) {
      case 0: // Informasi Umum
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
      case 1: // Item Pekerjaan
        if (newProduction.workItems.length === 0) {
          setSnackbar({ open: true, message: "Harap tambahkan setidaknya satu item pekerjaan.", severity: "error" });
          return;
        }
        break;
      case 2: // Personel
        if (newProduction.personnel.length === 0) {
          setSnackbar({ open: true, message: "Harap tambahkan setidaknya satu personel.", severity: "error" });
          return;
        }
        break;
      case 3: // Material
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
      workItems: newProduction.workItems,
      personnel: newProduction.personnel,
      materials: newProduction.materials,
      progress: []
    };
    setProductionData(prev => [...prev, newItem]);
    setOpenAddDialog(false);
    setActiveStep(0);
    setNewProduction({
      name: "", target: "", startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: "", workItems: [], personnel: [], materials: [],
      currentWorkItem: "", currentPersonnel: "", currentMaterial: ""
    });
    setSnackbar({ open: true, message: "Produksi berhasil ditambahkan!", severity: "success" });
  };

  const getStatusInfo = (status) => {
    if (status === "Selesai") return { color: "success", icon: <CheckCircle fontSize="small" /> };
    if (status === "Dalam Proses") return { color: "warning", icon: <Warning fontSize="small" /> };
    return { color: "error", icon: <Error fontSize="small" /> }; // Misalnya untuk status "Tertunda" atau "Dibatalkan"
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
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Item Pekerjaan</Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                sx={{ flexGrow: 1 }}
                label="Tambahkan Item Pekerjaan"
                value={newProduction.currentWorkItem}
                onChange={(e) => setNewProduction({ ...newProduction, currentWorkItem: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem("workItems", "currentWorkItem")}
              />
              <Button variant="contained" onClick={() => handleAddItem("workItems", "currentWorkItem")} startIcon={<Add />}>
                Tambah
              </Button>
            </Box>
            <List dense>
              {newProduction.workItems.length === 0 ? (
                <Typography color="text.secondary">Belum ada item pekerjaan ditambahkan.</Typography>
              ) : (
                newProduction.workItems.map((w, i) => (
                  <ListItem
                    key={i}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleRemoveItem("workItems", i)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={w} />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        );
      case 2:
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
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Material Digunakan</Typography>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                sx={{ flexGrow: 1 }}
                label="Tambahkan Material"
                value={newProduction.currentMaterial}
                onChange={(e) => setNewProduction({ ...newProduction, currentMaterial: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem("materials", "currentMaterial")}
              />
              <Button variant="contained" onClick={() => handleAddItem("materials", "currentMaterial")} startIcon={<Add />}>
                Tambah
              </Button>
            </Box>
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
                    <ListItemText primary={m} />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        );
      case 4:
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
                <Typography variant="body1"><strong>Item Pekerjaan:</strong></Typography>
                <List dense>
                  {newProduction.workItems.length > 0 ? newProduction.workItems.map((item, idx) => <ListItemText key={idx} primary={`- ${item}`} />) : <ListItemText primary="- Tidak ada" />}
                </List>
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
                  {newProduction.materials.length > 0 ? newProduction.materials.map((item, idx) => <ListItemText key={idx} primary={`- ${item}`} />) : <ListItemText primary="- Tidak ada" />}
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

      {/* Ringkasan Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ backgroundColor: '#e3f2fd' }}>
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
          <Card elevation={3} sx={{ backgroundColor: '#fff3e0' }}>
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
          <Card elevation={3} sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">Selesai</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.dark">{completedProductions}</Typography>
            </CardContent>
          </Card> {/* <--- Penutup tag yang salah, harusnya </Card> */}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Aksi Utama */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: '#007BFF', '&:hover': { bgcolor: '#0056b3' } }}
          onClick={() => setOpenAddDialog(true)}
        >
          Buat Produksi Baru
        </Button>
      </Box>

      {/* Daftar Produksi */}
      <Grid container spacing={3}>
        {productionData.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Belum ada data produksi.</Typography>
              <Typography variant="body2" color="text.secondary">Klik "Buat Produksi Baru" untuk memulai.</Typography>
            </Paper>
          </Grid>
        ) : (
          productionData.map((item) => {
            const progressPercentage = calculateProgressPercentage(item.completed, item.target);
            const statusInfo = getStatusInfo(item.status);
            const isCompleted = item.status === "Selesai";

            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" color="text.secondary">{item.id}</Typography>
                      <Chip
                        label={item.status}
                        color={statusInfo.color}
                        icon={statusInfo.icon}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold" mb={1}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {item.target} unit | Selesai: {item.completed} unit
                    </Typography>
                    <Box mt={2} mb={1}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercentage}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isCompleted ? '#4caf50' : '#2196f3',
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" align="right" mt={0.5}>
                        {progressPercentage}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Periode: {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenDetail(item)}
                    >
                      Lihat Detail
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

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
            sx={{ bgcolor: '#007BFF', '&:hover': { bgcolor: '#0056b3' } }}
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
                <Typography variant="h6" gutterBottom mt={2}>
                  <Build sx={{ verticalAlign: 'middle', mr: 1 }} />Item Pekerjaan
                </Typography>
                <List dense>
                  {selectedProduction.workItems.length > 0 ? (
                    selectedProduction.workItems.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`- ${item}`} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem><ListItemText primary="Tidak ada item pekerjaan." /></ListItem>
                  )}
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
                        <ListItemText primary={`- ${m}`} />
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

      {/* Snackbar Notifikasi */}
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