import React from "react";
import { Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button } from "@mui/material";
import { Search, Add, FilterAlt, Inventory as InventoryIcon } from "@mui/icons-material";
import Frame from "../components/Frame";

export default function Inventory() {
  const inventoryData = [
    { id: 1, name: "Rel Kereta", quantity: 150, location: "Gudang A", status: "Tersedia" },
    { id: 2, name: "Baut Khusus", quantity: 1200, location: "Gudang B", status: "Tersedia" },
    { id: 3, name: "Panel Kontrol", quantity: 25, location: "Gudang C", status: "Limit" },
    { id: 4, name: "Kabel Listrik", quantity: 500, location: "Gudang A", status: "Tersedia" },
    { id: 5, name: "Bearing", quantity: 80, location: "Gudang B", status: "Limit" },
    { id: 6, name: "Sistem Hidrolik", quantity: 12, location: "Gudang C", status: "Habis" },
  ];

  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <InventoryIcon fontSize="large" sx={{ color: '#FF8C00', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Manajemen Inventory
          </Typography>
        </Box>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Cari inventory..."
                InputProps={{
                  startAdornment: <Search sx={{ color: '#999', mr: 1 }} />
                }}
                sx={{ width: 300 }}
              />
              <Box>
                <Button variant="outlined" startIcon={<FilterAlt />} sx={{ mr: 2 }}>
                  Filter
                </Button>
                <Button variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#FF8C00', '&:hover': { backgroundColor: '#FF6D00' } }}>
                  Tambah Item
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nama Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Jumlah</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>
                        <Box sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 
                            row.status === 'Tersedia' ? 'rgba(76, 175, 80, 0.1)' :
                            row.status === 'Limit' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          color: 
                            row.status === 'Tersedia' ? '#4CAF50' :
                            row.status === 'Limit' ? '#FF9800' : '#F44336',
                          fontWeight: 'bold'
                        }}>
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button size="small" sx={{ color: '#FF8C00' }}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Frame>
  );
}