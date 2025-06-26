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

// Data awal dipisahkan untuk kemudahan maintenance
const initialProductionData = [
  {
    id: 1,
    name: "Produksi Radio Lokomotif",
    progress: 0,
    location: "Gudang SAB",
    materials: [],
    target: 100,
    completed: 0,
    type: "produksi"
  },
  // Data lainnya tetap sama...
];

// Komponen ProjectForm dipisahkan
const ProjectForm = ({ 
  open, 
  handleClose, 
  handleSave, 
  currentProject, 
  setCurrentProject,
  editMode 
}) => (
  <Dialog open={open} onClose={handleClose}>
    <DialogTitle>
      {editMode ? 'Edit Proyek Produksi' : 'Tambah Proyek Produksi'}
    </DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2, minWidth: 400 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Nama Proyek"
          fullWidth
          value={currentProject.name}
          onChange={(e) => setCurrentProject({...currentProject, name: e.target.value})}
          sx={{ mb: 2 }}
          required
        />
        {/* Field lainnya... */}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Batal</Button>
      <Button 
        onClick={handleSave}
        variant="contained"
        disabled={!currentProject.name || !currentProject.location || currentProject.target <= 0}
      >
        Simpan
      </Button>
    </DialogActions>
  </Dialog>
);

// Komponen utama yang disederhanakan
export default function Overhaul() {
  const [productionData, setProductionData] = useState(initialProductionData);
  const [selectedProject, setSelectedProject] = useState('');
  const [materialInput, setMaterialInput] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openOverhaulDialog, setOpenOverhaulDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // State untuk form dipisahkan
  const [currentProject, setCurrentProject] = useState({
    id: 0,
    name: '',
    location: '',
    target: 0,
    type: "produksi"
  });

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

  // Kolom untuk DataGrid dipisahkan
  const productionColumns = [
    // Konfigurasi kolom tetap sama...
  ];

  const overhaulColumns = [
    // Konfigurasi kolom tetap sama...
  ];

  // Fungsi-fungsi handler dipisahkan
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
    setEditMode(false);
    setCurrentProject({
      id: 0,
      name: '',
      location: '',
      target: 0,
      type: "produksi"
    });
  };

  // Fungsi lainnya tetap sama...

  // Filter data
  const productionProjects = productionData.filter(item => item.type === "produksi");
  const overhaulProjects = productionData.filter(item => item.type === "overhaul");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
        Sistem Manajemen Produksi & Overhaul
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Produksi" />
        <Tab label="Overhaul Point Machine" />
      </Tabs>

      {/* Konten utama dipisahkan berdasarkan tab */}
      {tabValue === 0 ? (
        <ProductionContent 
          productionProjects={productionProjects}
          productionColumns={productionColumns}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          materialInput={materialInput}
          setMaterialInput={setMaterialInput}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddMaterial={handleAddMaterial}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          handleDeleteSelected={handleDeleteSelected}
          handleClickOpen={handleClickOpen}
        />
      ) : (
        <OverhaulContent 
          overhaulProjects={overhaulProjects}
          overhaulColumns={overhaulColumns}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          materialInput={materialInput}
          setMaterialInput={setMaterialInput}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddMaterial={handleAddMaterial}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          handleDeleteSelected={handleDeleteSelected}
          handleClickOpenOverhaul={handleClickOpenOverhaul}
        />
      )}

      {/* Ringkasan dipisahkan menjadi komponen terpisah */}
      <SummarySection 
        productionProjects={productionProjects}
        overhaulProjects={overhaulProjects}
      />

      {/* Dialog dipisahkan menjadi komponen terpisah */}
      <ProjectForm 
        open={openDialog}
        handleClose={handleClose}
        handleSave={handleSaveProject}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        editMode={editMode}
      />

      <OverhaulForm 
        open={openOverhaulDialog}
        handleClose={handleClose}
        handleSave={handleSaveOverhaul}
        currentOverhaul={currentOverhaul}
        setCurrentOverhaul={setCurrentOverhaul}
        editMode={editMode}
      />
    </Box>
  );
}

// Komponen-komponen tambahan yang dipisahkan
const ProductionContent = ({ /* props */ }) => {
  return (
    <Grid container spacing={3}>
      {/* Konten produksi */}
    </Grid>
  );
};

const OverhaulContent = ({ /* props */ }) => {
  return (
    <Grid container spacing={3}>
      {/* Konten overhaul */}
    </Grid>
  );
};

const SummarySection = ({ productionProjects, overhaulProjects }) => {
  return (
    <Card sx={{ mt: 3, boxShadow: 3 }}>
      <CardContent>
        {/* Konten ringkasan */}
      </CardContent>
    </Card>
  );
};

const OverhaulForm = ({ 
  open, 
  handleClose, 
  handleSave, 
  currentOverhaul, 
  setCurrentOverhaul,
  editMode 
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      {/* Konten form overhaul */}
    </Dialog>
  );
};