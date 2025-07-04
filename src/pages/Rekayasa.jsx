import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Button, Avatar, Chip } from "@mui/material";
import { Build as BuildIcon, Add, Code, Engineering, Settings } from "@mui/icons-material";
import Frame from "../components/Frame";

const projects = [
  { 
    id: 1, 
    name: "Pengembangan Sistem Kontrol", 
    status: "Dalam Pengerjaan", 
    team: ["BS", "AW", "CD"], 
    deadline: "2023-12-31",
    progress: 65
  },
  { 
    id: 2, 
    name: "Optimasi Produksi", 
    status: "Selesai", 
    team: ["DP", "ES"], 
    deadline: "2023-10-15",
    progress: 100
  },
  { 
    id: 3, 
    name: "Desain Komponen Baru", 
    status: "Perencanaan", 
    team: ["BS", "ES"], 
    deadline: "2024-02-28",
    progress: 15
  },
];

export default function Rekayasa() {
  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BuildIcon fontSize="large" sx={{ color: '#3F51B5', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Departemen Rekayasa
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Proyek Rekayasa
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    sx={{ 
                      backgroundColor: '#3F51B5',
                      '&:hover': { backgroundColor: '#303F9F' },
                      borderRadius: 2
                    }}
                  >
                    Tambah Proyek
                  </Button>
                </Box>
                <List sx={{ width: '100%' }}>
                  {projects.map((project, index) => (
                    <React.Fragment key={project.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {project.name}
                              </Typography>
                              <Chip
                                label={project.status}
                                color={
                                  project.status === "Selesai" ? "success" :
                                  project.status === "Dalam Pengerjaan" ? "warning" : "info"
                                }
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography component="span" variant="body2" color="text.primary" sx={{ mr: 2 }}>
                                  Deadline: {project.deadline}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {project.team.map((member, i) => (
                                    <Avatar 
                                      key={i} 
                                      sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        fontSize: 12, 
                                        bgcolor: '#3F51B5',
                                        ml: i > 0 ? -1 : 0
                                      }}
                                    >
                                      {member}
                                    </Avatar>
                                  ))}
                                </Box>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{
                                  height: 8,
                                  mt: 1,
                                  borderRadius: 4,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: '#3F51B5'
                                  }
                                }}
                              />
                              <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right' }}>
                                {project.progress}% selesai
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < projects.length - 1 && <Divider variant="inset" component="li" sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Alat Rekayasa
                </Typography>
                <List>
                  <ListItem>
                    <Avatar sx={{ bgcolor: '#3F51B5', mr: 2 }}>
                      <Code />
                    </Avatar>
                    <ListItemText primary="Software CAD" secondary="Versi 2023.2" />
                  </ListItem>
                  <ListItem>
                    <Avatar sx={{ bgcolor: '#3F51B5', mr: 2 }}>
                      <Engineering />
                    </Avatar>
                    <ListItemText primary="Simulator Produksi" secondary="Versi 2.1.5" />
                  </ListItem>
                  <ListItem>
                    <Avatar sx={{ bgcolor: '#3F51B5', mr: 2 }}>
                      <Settings />
                    </Avatar>
                    <ListItemText primary="Analisis Data" secondary="Versi 1.0.3" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Statistik Rekayasa
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(63, 81, 181, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3F51B5' }}>
                        {projects.length}
                      </Typography>
                      <Typography variant="body2">Total Proyek</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        {projects.filter(p => p.status === "Selesai").length}
                      </Typography>
                      <Typography variant="body2">Selesai</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                        {projects.filter(p => p.status === "Dalam Pengerjaan").length}
                      </Typography>
                      <Typography variant="body2">Dalam Pengerjaan</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        {projects.filter(p => p.status === "Perencanaan").length}
                      </Typography>
                      <Typography variant="body2">Perencanaan</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Frame>
  );
}