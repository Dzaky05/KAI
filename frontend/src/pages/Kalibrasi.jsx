import React, { useState } from 'react';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box, Typography, Card, CardContent, Grid, Stepper, Step, StepLabel,
  Button, Divider, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  Science as ScienceIcon, CheckCircle, Schedule, Error
} from "@mui/icons-material";

const steps = [
  'Penerimaan Alat',
  'Pemeriksaan Awal',
  'Proses Kalibrasi',
  'Verifikasi Hasil',
  'Sertifikasi'
];

export default function Kalibrasi() {
  const [activeStep, setActiveStep] = React.useState(2);

  const calibrationData = [
    { id: 1, name: "Multimeter Digital", status: "Dalam Proses", progress: 2, dueDate: "2023-12-15" },
    { id: 2, name: "Oscilloscope", status: "Selesai", progress: 5, dueDate: "2023-11-30" },
    { id: 3, name: "Signal Generator", status: "Belum Dimulai", progress: 0, dueDate: "2024-01-10" },
    { id: 4, name: "Power Supply", status: "Dalam Proses", progress: 3, dueDate: "2023-12-05" },
  ];

  const [newTool, setNewTool] = useState({ name: '', dueDate: '' });
  const [openDialog, setOpenDialog] = useState(false);

  const handleAddTool = () => {
    if (!newTool.name || !newTool.dueDate) {
      alert("Nama dan Tanggal wajib diisi!");
      return;
    }

    axios.post("http://localhost:8080/api/calibration", {
      name: newTool.name,
      status: "Belum Dimulai",
      progress: 0,
      dueDate: newTool.dueDate
    })
      .then(res => {
        alert("Alat berhasil ditambahkan");
        setOpenDialog(false);
        setNewTool({ name: '', dueDate: '' });
        // Optional: refresh data dari backend
      })
      .catch(err => {
        console.error(err);
        alert("Gagal menambahkan alat");
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ScienceIcon fontSize="large" sx={{ color: '#9C27B0', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Sistem Kalibrasi Alat
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Proses Kalibrasi
              </Typography>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Daftar Alat yang Dikalibrasi
              </Typography>
              <Grid container spacing={2}>
                {calibrationData.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Chip
                          label={item.status}
                          icon={
                            item.status === "Selesai" ? <CheckCircle /> :
                              item.status === "Dalam Proses" ? <Schedule /> : <Error />
                          }
                          color={
                            item.status === "Selesai" ? "success" :
                              item.status === "Dalam Proses" ? "warning" : "error"
                          }
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Target Selesai: {item.dueDate}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(item.progress / steps.length) * 100}
                        sx={{
                          height: 8,
                          mt: 2,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: '#9C27B0'
                          }
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Statistik Kalibrasi
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(156, 39, 176, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                      4
                    </Typography>
                    <Typography variant="body2">Total Alat</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      1
                    </Typography>
                    <Typography variant="body2">Selesai</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                      2
                    </Typography>
                    <Typography variant="body2">Dalam Proses</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                      1
                    </Typography>
                    <Typography variant="body2">Belum Dimulai</Typography>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              backgroundColor: '#9C27B0',
              '&:hover': { backgroundColor: '#7B1FA2' },
              py: 1.5,
              borderRadius: 2
            }}
            onClick={() => setOpenDialog(true)}
          >
            Tambah Alat Baru
          </Button>
        </Grid>
      </Grid>

      {/* Dialog Tambah Alat */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Alat Kalibrasi</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nama Alat"
            fullWidth
            value={newTool.name}
            onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Tanggal Target Selesai"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTool.dueDate}
            onChange={(e) => setNewTool({ ...newTool, dueDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button variant="contained" onClick={handleAddTool} sx={{ bgcolor: '#9C27B0' }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
