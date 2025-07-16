import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Button, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab
} from "@mui/material";
import { Build as BuildIcon, Add, Code, Engineering, Settings, BarChart, Assignment, Handyman } from "@mui/icons-material"; // Added icons


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

  useEffect(() => {
  axios.get('/api/qc/rekayasa')
    .then((res) => {
      const data = res.data;
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.warn('Data dari API bukan array:', data);
        setProjects([]); // fallback biar aman
      }
    })
    .catch((err) => {
      console.error('Gagal fetch data:', err);
      setProjects([]);
    })
    .finally(() => setLoading(false));
}, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
                      <TableCell>
                        <Chip
                          label={project.status}
                          color={
                            project.status === "Selesai" ? "success" :
                              project.status === "Dalam Pengerjaan" ? "warning" : "info"
                          }
                          variant="filled" // Changed to filled for more prominence
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {project.team.map((member, i) => (
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
                              {member}
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
                    </TableRow>
                  ))}
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
              <Table size="medium"> {/* Changed size to medium for better readability */}
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
                          <Typography variant="body2" sx={{ mr: 1, minWidth: '35px' }}>{project.progress}%</Typography> {/* Added minWidth */}
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{
                              width: 120, // Increased width
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
            <Grid container spacing={3}> {/* Increased spacing */}
              <Grid item xs={12} sm={6}>
                <Card sx={{
                  p: 3, // Increased padding
                  textAlign: 'center',
                  backgroundColor: 'rgba(63, 81, 181, 0.1)',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(63, 81, 181, 0.2)' }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#3F51B5', mb: 1 }}> {/* Increased font size */}
                    {projects.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Total Proyek</Typography> {/* Changed to body1 */}
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
                  <Typography variant="body1" color="text.secondary">Proyek Selesai</Typography> {/* More descriptive */}
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
    </Box>
  );
}