import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Save, Print, Delete, Add, Edit, Build, Settings } from '@mui/icons-material';

// Data awal untuk overhaul
const initialOverhaulData = [
  {
    id: 1,
    name: "Overhaul Point Machine KA-101",
    progress: 0,
    location: "Stasiun Gambir",
    machineType: "Point Machine Type-A",
    lastMaintenance: "2023-01-15",
    nextMaintenance: "2023-07-15",
    materials: [],
    target: 1,
    completed: 0,
    type: "overhaul"
  },
  {
    id: 2,
    name: "Overhaul Point Machine KA-202",
    progress: 0,
    location: "Stasiun Bandung",
    machineType: "Point Machine Type-B",
    lastMaintenance: "2023-02-20",
    nextMaintenance: "2023-08-20",
    materials: [],
    target: 1,
    completed: 0,
    type: "overhaul"
  }
];

const Overhaul = () => {
  const [overhaulData, setOverhaulData] = useState(initialOverhaulData);
  const [selectedProject, setSelectedProject] = useState(null);
  const [materialInput, setMaterialInput] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [currentOverhaul, setCurrentOverhaul] = useState({
    id: 0,
    name: '',
    location: '',
    machineType: '',
    lastMaintenance: '',
    nextMaintenance: '',
    target: 1,
    type: "overhaul"
  });

  // Kolom untuk DataGrid Overhaul
  const overhaulColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nama Proyek', width: 250 },
    { field: 'location', headerName: 'Lokasi', width: 150 },
    { field: 'machineType', headerName: 'Tipe Mesin', width: 150 },
    { field: 'lastMaintenance', headerName: 'Maintenance Terakhir', width: 180 },
    { field: 'nextMaintenance', headerName: 'Maintenance Berikutnya', width: 180 },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={params.row.progress} 
            sx={{ height: 8, borderRadius: 4 }} 
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {params.row.progress}%
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditOverhaul(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDeleteOverhaul(params.row.id)}>
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleClickOpenOverhaul = () => {
    setOpenDialog(true);
    setEditMode(false);
    setCurrentOverhaul({
      id: 0,
      name: '',
      location: '',
      machineType: '',
      lastMaintenance: '',
      nextMaintenance: '',
      target: 1,
      type: "overhaul"
    });
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleSaveOverhaul = () => {
    if (editMode) {
      // Update existing overhaul
      setOverhaulData(overhaulData.map(item => 
        item.id === currentOverhaul.id ? currentOverhaul : item
      ));
    } else {
      // Add new overhaul
      const newId = Math.max(...overhaulData.map(item => item.id)) + 1;
      setOverhaulData([...overhaulData, {
        ...currentOverhaul,
        id: newId,
        progress: 0,
        materials: [],
        completed: 0
      }]);
    }
    handleClose();
  };

  const handleEditOverhaul = (overhaul) => {
    setCurrentOverhaul(overhaul);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteOverhaul = (id) => {
    setOverhaulData(overhaulData.filter(item => item.id !== id));
  };

  const handleAddMaterial = () => {
    if (!selectedProject || !materialInput) return;
    
    const updatedData = overhaulData.map(item => {
      if (item.id === selectedProject.id) {
        const newMaterial = {
          name: materialInput,
          quantity: quantity
        };
        return {
          ...item,
          materials: [...item.materials, newMaterial]
        };
      }
      return item;
    });
    
    setOverhaulData(updatedData);
    setMaterialInput('');
    setQuantity(1);
  };

  const handleDeleteSelected = () => {
    setOverhaulData(overhaulData.filter(item => !selectedRows.includes(item.id)));
    setSelectedRows([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
        Sistem Manajemen Overhaul Point Machine
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Daftar Proyek Overhaul</Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={handleClickOpenOverhaul}
                    sx={{ mr: 1 }}
                  >
                    Tambah
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Delete />}
                    onClick={handleDeleteSelected}
                    disabled={selectedRows.length === 0}
                    color="error"
                  >
                    Hapus
                  </Button>
                </Box>
              </Box>
              
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={overhaulData}
                  columns={overhaulColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  checkboxSelection
                  onSelectionModelChange={(newSelection) => {
                    setSelectedRows(newSelection);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detail Proyek
              </Typography>
              
              {selectedProject ? (
                <>
                  <Typography variant="subtitle1">
                    <strong>Nama:</strong> {selectedProject.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Lokasi:</strong> {selectedProject.location}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Tipe Mesin:</strong> {selectedProject.machineType}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Maintenance Terakhir:</strong> {selectedProject.lastMaintenance}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Maintenance Berikutnya:</strong> {selectedProject.nextMaintenance}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1">
                    <strong>Progress:</strong>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedProject.progress} 
                    sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                  />
                  
                  <Typography variant="subtitle1">
                    <strong>Material:</strong>
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {selectedProject.materials.map((material, index) => (
                      <Chip 
                        key={index}
                        label={`${material.name} (${material.quantity})`}
                        sx={{ mr: 1, mb: 1 }}
                        onDelete={() => {}}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Material"
                      fullWidth
                      size="small"
                      value={materialInput}
                      onChange={(e) => setMaterialInput(e.target.value)}
                    />
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      sx={{ width: 80 }}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                    <Button 
                      variant="contained"
                      onClick={handleAddMaterial}
                      disabled={!materialInput}
                    >
                      Tambah
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Pilih proyek untuk melihat detail
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Form Overhaul */}
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>
          {editMode ? 'Edit Proyek Overhaul' : 'Tambah Proyek Overhaul'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nama Proyek"
              fullWidth
              value={currentOverhaul.name}
              onChange={(e) => setCurrentOverhaul({...currentOverhaul, name: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              margin="dense"
              label="Lokasi"
              fullWidth
              value={currentOverhaul.location}
              onChange={(e) => setCurrentOverhaul({...currentOverhaul, location: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipe Mesin</InputLabel>
              <Select
                value={currentOverhaul.machineType}
                label="Tipe Mesin"
                onChange={(e) => setCurrentOverhaul({...currentOverhaul, machineType: e.target.value})}
                required
              >
                <MenuItem value="Point Machine Type-A">Type-A</MenuItem>
                <MenuItem value="Point Machine Type-B">Type-B</MenuItem>
                <MenuItem value="Point Machine Type-C">Type-C</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Maintenance Terakhir"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={currentOverhaul.lastMaintenance}
              onChange={(e) => setCurrentOverhaul({...currentOverhaul, lastMaintenance: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              margin="dense"
              label="Maintenance Berikutnya"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={currentOverhaul.nextMaintenance}
              onChange={(e) => setCurrentOverhaul({...currentOverhaul, nextMaintenance: e.target.value})}
              sx={{ mb: 2 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button 
            onClick={handleSaveOverhaul}
            variant="contained"
            disabled={!currentOverhaul.name || !currentOverhaul.location || !currentOverhaul.machineType}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Overhaul;