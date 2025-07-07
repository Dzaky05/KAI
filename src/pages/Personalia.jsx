import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Card, CardContent, Tabs, Tab, TextField,
  Button, Divider, List, ListItem, ListItemIcon, ListItemText, IconButton,
  Paper, Badge, Grid, Tooltip, useTheme
} from '@mui/material';
import {
  Person, Email, Phone, LocationOn, Edit, Save, Lock, Notifications,
  Security, Work, School, Event
} from '@mui/icons-material';

const Profile = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Asep Hidayat S.Kom M.Kom',
    position: 'Production Manager',
    email: 'john.doe@kai.co.id',
    phone: '+62 812-3456-7890',
    address: 'Jl. Kereta Api No. 1, Jakarta',
    bio: 'Professional with 10+ years experience in railway production management',
    education: [
      { id: 1, degree: 'Bachelor of Engineering', university: 'Institut Teknologi Bandung', year: '2005-2009' },
      { id: 2, degree: 'Master of Business Administration', university: 'Universitas Indonesia', year: '2011-2013' }
    ],
    experience: [
      { id: 1, position: 'Production Supervisor', company: 'PT KAI', period: '2010-2015' },
      { id: 2, position: 'Production Manager', company: 'PT KAI Balai Yasa', period: '2015-Present' }
    ]
  });

  const handleChangeTab = (_, newValue) => setTabValue(newValue);
  const handleEditProfile = () => setEditMode(!editMode);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const renderInput = (label, name, icon, value) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={handleInputChange}
      disabled={!editMode}
      sx={{ mb: 2 }}
      InputProps={{
        startAdornment: (
          <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
            {icon}
          </Box>
        ),
      }}
    />
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        👤 My Profile
      </Typography>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Edit Photo">
                    <IconButton size="small" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar sx={{ width: 100, height: 100, fontSize: '2rem', bgcolor: 'primary.main' }}>
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Badge>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  {profileData.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {profileData.position}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleEditProfile}
              variant="contained"
              startIcon={editMode ? <Save /> : <Edit />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: editMode ? 'success.main' : 'primary.main',
                '&:hover': {
                  bgcolor: editMode ? 'success.dark' : 'primary.dark',
                },
              }}
            >
              {editMode ? 'Save' : 'Edit'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Tabs value={tabValue} onChange={handleChangeTab} textColor="primary" indicatorColor="primary">
            <Tab icon={<Person />} label="Personal Info" />
            <Tab icon={<School />} label="Education" />
            <Tab icon={<Work />} label="Experience" />
            <Tab icon={<Security />} label="Security" />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {renderInput("Full Name", "name", <Person fontSize="small" />, profileData.name)}
                  {renderInput("Email", "email", <Email fontSize="small" />, profileData.email)}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderInput("Phone", "phone", <Phone fontSize="small" />, profileData.phone)}
                  {renderInput("Address", "address", <LocationOn fontSize="small" />, profileData.address)}
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                disabled={!editMode}
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ mt: 3 }}>
              {profileData.education.map((edu) => (
                <Paper key={edu.id} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 2 }}>
                  <Typography variant="h6" fontWeight="bold">{edu.degree}</Typography>
                  <Typography>{edu.university}</Typography>
                  <Typography variant="body2" color="text.secondary">{edu.year}</Typography>
                </Paper>
              ))}
              <Button variant="outlined" startIcon={<Edit />}>Edit Education</Button>
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ mt: 3 }}>
              {profileData.experience.map((exp) => (
                <Paper key={exp.id} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 2 }}>
                  <Typography variant="h6" fontWeight="bold">{exp.position}</Typography>
                  <Typography>{exp.company}</Typography>
                  <Typography variant="body2" color="text.secondary">{exp.period}</Typography>
                </Paper>
              ))}
              <Button variant="outlined" startIcon={<Edit />}>Edit Experience</Button>
            </Box>
          )}

          {tabValue === 3 && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lock sx={{ mr: 1 }} />
                  <Box>
                    <Typography fontWeight="bold">Change Password</Typography>
                    <Typography variant="body2" color="text.secondary">Update your account password</Typography>
                  </Box>
                </Box>
                <Button variant="outlined">Change</Button>
              </Paper>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Notifications sx={{ mr: 1 }} />
                  <Box>
                    <Typography fontWeight="bold">Notification Settings</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your notification preferences</Typography>
                  </Box>
                </Box>
                <Button variant="outlined">Settings</Button>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>📋 Recent Activities</Typography>
          <List>
            {[
              { id: 1, icon: <Event />, text: 'Updated production schedule', time: '2 hours ago' },
              { id: 2, icon: <Work />, text: 'Completed monthly report', time: '1 day ago' },
              { id: 3, icon: <Person />, text: 'Profile information updated', time: '3 days ago' },
              { id: 4, icon: <Security />, text: 'Changed password', time: '1 week ago' }
            ].map((activity) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  py: 1,
                  borderRadius: 2,
                  transition: '0.2s',
                  '&:hover': { bgcolor: theme.palette.action.hover }
                }}
              >
                <ListItemIcon>{activity.icon}</ListItemIcon>
                <ListItemText primary={activity.text} secondary={activity.time} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
