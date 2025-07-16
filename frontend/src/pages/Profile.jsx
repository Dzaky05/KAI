// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Box, Typography, Avatar, Card, CardContent, Divider, List,
  ListItemIcon, ListItemText, Paper, Stack, alpha, useTheme, Grid, TextField, Button
} from '@mui/material';
import {
  Person, Work, Event, Notifications, AssignmentInd, Phone, Email, LocationOn, Edit, Save
} from '@mui/icons-material';

const Profile = () => {

  const theme = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Asep Hidayat S.Kom M.Kom', 
    nip: '198003012005011001',
    email: 'asep.hidayat@kai.co.id',
    phoneNumber: '0812-3456-7890', // Hanya satu nomor telepon
    address: 'Jl. Stasiun Timur No. 12, Bandung, Jawa Barat'
  });
 useEffect(() => {
  axios.get('/api/profile')
    .then((res) => {
      setProfileData(res.data);
    })
    .catch((err) => {
      console.error("Gagal mengambil data profil:", err);
    });
}, []);
  // Handle changes in the editable form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle edit mode and save changes
  const handleEditSaveToggle = () => {
  if (editMode) {
    // mode edit sedang aktif → sekarang kita mau simpan
    axios.put('/api/profile', profileData)
      .then(() => {
        console.log('Data berhasil disimpan ke server!');
        setEditMode(false);
      })
      .catch((err) => {
        console.error('Gagal menyimpan data:', err);
      });
  } else {
    // belum mode edit → aktifkan edit mode
    setEditMode(true);
  }
};

  const recentActivities = [
    { id: 1, icon: <Event />, text: 'Updated production schedule', time: '2 hours ago' },
    { id: 2, icon: <Work />, text: 'Completed monthly report', time: '1 day ago' },
    { id: 3, icon: <Person />, text: 'Profile information updated', time: '3 days ago' },
    { id: 4, icon: <Notifications />, text: 'Reviewed pending approvals', time: '1 week ago' }
  ];

  return (
    <React.Fragment>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.grey[50], minHeight: '100vh' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          👤 My Profile
        </Typography>

        <Card sx={{
          mb: 4,
          borderRadius: 4,
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden'
        }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              position: 'relative',
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3}>
              <Avatar sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'white',
                color: 'primary.main',
                border: `4px solid ${alpha(theme.palette.common.white, 0.5)}`,
                boxShadow: `0 0 0 6px ${alpha(theme.palette.common.white, 0.3)}`,
              }}>
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" fontWeight="bold">
                  {profileData.name}
                </Typography>
              </Box>
            </Stack>
            <Button
              onClick={handleEditSaveToggle}
              variant="contained"
              startIcon={editMode ? <Save /> : <Edit />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: editMode ? 'success.main' : 'primary.light',
                '&:hover': {
                  bgcolor: editMode ? 'success.dark' : 'primary.dark',
                },
                color: 'primary.contrastText'
              }}
            >
              {editMode ? 'Simpan' : 'Edit'}
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Informasi Pribadi
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {/* NIP - Always displayed as a disabled TextField for consistent look */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NIP"
                  name="nip"
                  value={profileData.nip}
                  disabled // NIP is not editable
                  InputProps={{
                    startAdornment: <AssignmentInd sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  variant="standard" // Standard variant for a cleaner, non-editable look
                  size="small"
                />
              </Grid>

              {/* Email - Editable */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  variant={editMode ? "outlined" : "standard"}
                  size="small"
                />
              </Grid>

              {/* Phone Number - Editable */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nomor Telepon"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  variant={editMode ? "outlined" : "standard"}
                  size="small"
                />
              </Grid>

              {/* Address - Editable, now placed next to Phone Number on larger screens */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Alamat"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  variant={editMode ? "outlined" : "standard"}
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{
          borderRadius: 4,
          boxShadow: `0 8px 24px ${alpha(theme.palette.grey[400], 0.1)}`,
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                📋 Recent Activities
              </Typography>
            </Stack>
            <List disablePadding>
              {recentActivities.map((activity) => (
                <Paper
                  key={activity.id}
                  elevation={1}
                  sx={{
                    mb: 1.5,
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    {activity.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body1" fontWeight="medium">{activity.text}</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary">{activity.time}</Typography>}
                  />
                </Paper>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </React.Fragment>
  );
};

export default Profile;