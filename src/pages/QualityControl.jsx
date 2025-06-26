import React from "react";
import { Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from "@mui/material";
import { Science as ScienceIcon, Add, CheckCircle, Warning, Error } from "@mui/icons-material";
import Frame from "../components/Frame";

const qcData = [
  { 
    id: "QC-001", 
    product: "Radio Lokomotif", 
    batch: "BATCH-2023-11", 
    status: "Lulus", 
    tested: 25, 
    passed: 25,
    date: "2023-11-05"
  },
  { 
    id: "QC-002", 
    product: "Way Station", 
    batch: "BATCH-2023-10", 
    status: "Lulus", 
    tested: 30, 
    passed: 28,
    date: "2023-10-28"
  },
  { 
    id: "QC-003", 
    product: "Sentranik", 
    batch: "BATCH-2023-11", 
    status: "Dalam Proses", 
    tested: 15, 
    passed: 12,
    date: "2023-11-12"
  },
  { 
    id: "QC-004", 
    product: "Gentanik", 
    batch: "BATCH-2023-09", 
    status: "Tidak Lulus", 
    tested: 20, 
    passed: 15,
    date: "2023-09-20"
  },
];

export default function QualityControl() {
  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ScienceIcon fontSize="large" sx={{ color: '#9C27B0', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Quality Control
          </Typography>
        </Box>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                sx={{ 
                  backgroundColor: '#9C27B0',
                  '&:hover': { backgroundColor: '#7B1FA2' },
                  borderRadius: 2
                }}
              >
                Tambah QC
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID QC</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Produk</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tested/Passed</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Pass Rate</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qcData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.product}</TableCell>
                      <TableCell>{row.batch}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={
                            row.status === "Lulus" ? "success" :
                            row.status === "Dalam Proses" ? "warning" : "error"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {row.tested} / {row.passed}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={(row.passed / row.tested) * 100}
                            sx={{
                              width: '100%',
                              mr: 1,
                              height: 8,
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: 
                                  row.status === "Lulus" ? '#4CAF50' :
                                  row.status === "Dalam Proses" ? '#FF9800' : '#F44336'
                              }
                            }}
                          />
                          <Typography variant="body2">
                            {Math.round((row.passed / row.tested) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Button size="small" sx={{ color: '#9C27B0' }}>Detail</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Statistik QC
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(156, 39, 176, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                        {qcData.length}
                      </Typography>
                      <Typography variant="body2">Total QC</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                        {qcData.filter(q => q.status === "Lulus").length}
                      </Typography>
                      <Typography variant="body2">Lulus</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                        {qcData.filter(q => q.status === "Tidak Lulus").length}
                      </Typography>
                      <Typography variant="body2">Tidak Lulus</Typography>
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
                  Pass Rate Keseluruhan
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (qcData.reduce((sum, item) => sum + item.passed, 0) / 
                    qcData.reduce((sum, item) => sum + item.tested, 0)) * 100
                  }
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      backgroundColor: '#9C27B0'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Total Tested: {qcData.reduce((sum, item) => sum + item.tested, 0)}
                  </Typography>
                  <Typography variant="body2">
                    Total Passed: {qcData.reduce((sum, item) => sum + item.passed, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {Math.round(
                      (qcData.reduce((sum, item) => sum + item.passed, 0) / 
                      qcData.reduce((sum, item) => sum + item.tested, 0)) * 100
                    )}% Pass Rate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Frame>
  );
}