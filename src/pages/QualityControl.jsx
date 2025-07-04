import React from 'react';
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
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Add,
} from '@mui/icons-material';
import Frame from '../components/Frame';

const qcData = [
  { id: "QC-001", product: "Radio Lokomotif", batch: "BATCH-2023-11", status: "Lulus", tested: 25, passed: 25, date: "2023-11-05" },
  { id: "QC-002", product: "Way Station", batch: "BATCH-2023-10", status: "Lulus", tested: 30, passed: 28, date: "2023-10-28" },
  { id: "QC-003", product: "Sentranik", batch: "BATCH-2023-11", status: "Dalam Proses", tested: 15, passed: 12, date: "2023-11-12" },
  { id: "QC-004", product: "Gentanik", batch: "BATCH-2023-09", status: "Tidak Lulus", tested: 20, passed: 15, date: "2023-09-20" },
];

export default function QualityControl() {
  const totalTested = qcData.reduce((acc, item) => acc + item.tested, 0);
  const totalPassed = qcData.reduce((acc, item) => acc + item.passed, 0);
  const overallPassRate = Math.round((totalPassed / totalTested) * 100);

  return (
    <Frame>
      <Box sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ScienceIcon sx={{ color: '#9C27B0', mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">Quality Control</Typography>
        </Box>

        {/* Add QC Button */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                backgroundColor: '#9C27B0',
                '&:hover': { backgroundColor: '#7B1FA2' },
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
              }}
            >
              Tambah QC
            </Button>
          </CardContent>
        </Card>

        {/* QC Table */}
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    {['ID QC', 'Produk', 'Batch', 'Status', 'Tested/Passed', 'Pass Rate', 'Tanggal', 'Aksi'].map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 'bold' }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qcData.map((row) => {
                    const passRate = Math.round((row.passed / row.tested) * 100);
                    const colorMap = {
                      "Lulus": '#4CAF50',
                      "Dalam Proses": '#FF9800',
                      "Tidak Lulus": '#F44336'
                    };
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.product}</TableCell>
                        <TableCell>{row.batch}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            variant="outlined"
                            color={
                              row.status === "Lulus" ? "success" :
                              row.status === "Dalam Proses" ? "warning" : "error"
                            }
                          />
                        </TableCell>
                        <TableCell>{row.tested} / {row.passed}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={passRate}
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: colorMap[row.status],
                                  borderRadius: 4,
                                }
                              }}
                            />
                            <Typography variant="body2">{passRate}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          <Button size="small" sx={{ color: '#9C27B0', textTransform: 'none' }}>
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

        {/* Statistik dan Ringkasan */}
        <Grid container spacing={3}>
          {/* Statistik */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>Statistik QC</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Total QC", value: qcData.length, color: "#9C27B0", bg: 'rgba(156, 39, 176, 0.1)' },
                    { label: "Lulus", value: qcData.filter(q => q.status === "Lulus").length, color: "#4CAF50", bg: 'rgba(76, 175, 80, 0.1)' },
                    { label: "Tidak Lulus", value: qcData.filter(q => q.status === "Tidak Lulus").length, color: "#F44336", bg: 'rgba(244, 67, 54, 0.1)' }
                  ].map((stat, i) => (
                    <Grid item xs={4} key={i}>
                      <Card sx={{ textAlign: 'center', backgroundColor: stat.bg, p: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography>
                        <Typography variant="body2">{stat.label}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Ringkasan Pass Rate */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>Pass Rate Keseluruhan</Typography>
                <LinearProgress
                  variant="determinate"
                  value={overallPassRate}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#9C27B0',
                      borderRadius: 6
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tested: {totalTested}</Typography>
                  <Typography variant="body2">Passed: {totalPassed}</Typography>
                  <Typography variant="body2" fontWeight="bold">{overallPassRate}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Frame>
  );
}
