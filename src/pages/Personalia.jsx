import React, { useState } from 'react';
import { 
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Badge,
  Grid
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Lock,
  Notifications,
  Security,
  Work,
  School,
  Event
} from '@mui/icons-material';

const Profile = () => {
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

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        My Profile
      </Typography>

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton size="small" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100,
                    fontSize: '2.5rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Badge>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {profileData.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {profileData.position}
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              startIcon={editMode ? <Save /> : <Edit />}
              onClick={handleEditProfile}
              sx={{ 
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              {editMode ? 'Save Profile' : 'Edit Profile'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Tabs value={tabValue} onChange={handleChangeTab} sx={{ mb: 2 }}>
            <Tab label="Personal Info" icon={<Person />} />
            <Tab label="Education" icon={<School />} />
            <Tab label="Experience" icon={<Work />} />
            <Tab label="Security" icon={<Security />} />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <Person sx={{ color: 'action.active', mr: 1 }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <Email sx={{ color: 'action.active', mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <Phone sx={{ color: 'action.active', mr: 1 }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ color: 'action.active', mr: 1 }} />
                      ),
                    }}
                  />
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
                rows={4}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              <List>
                {profileData.education.map((edu) => (
                  <ListItem key={edu.id} sx={{ p: 0, mb: 2 }}>
                    <Paper sx={{ p: 2, width: '100%', boxShadow: 2 }}>
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {edu.degree}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body1">{edu.university}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {edu.year}
                            </Typography>
                          </>
                        }
                      />
                    </Paper>
                  </ListItem>
                ))}
              </List>
              <Button 
                variant="outlined" 
                startIcon={<Edit />}
                sx={{ mt: 2 }}
              >
                Edit Education
              </Button>
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 2 }}>
              <List>
                {profileData.experience.map((exp) => (
                  <ListItem key={exp.id} sx={{ p: 0, mb: 2 }}>
                    <Paper sx={{ p: 2, width: '100%', boxShadow: 2 }}>
                      <ListItemIcon>
                        <Work color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {exp.position}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body1">{exp.company}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {exp.period}
                            </Typography>
                          </>
                        }
                      />
                    </Paper>
                  </ListItem>
                ))}
              </List>
              <Button 
                variant="outlined" 
                startIcon={<Edit />}
                sx={{ mt: 2 }}
              >
                Edit Experience
              </Button>
            </Box>
          )}

          {tabValue === 3 && (
            <Box sx={{ p: 2 }}>
              <List>
                <ListItem sx={{ p: 0, mb: 2 }}>
                  <Paper sx={{ p: 2, width: '100%', boxShadow: 2 }}>
                    <ListItemIcon>
                      <Lock color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Change Password
                        </Typography>
                      }
                      secondary="Update your account password"
                    />
                    <Button variant="outlined">Change</Button>
                  </Paper>
                </ListItem>
                <ListItem sx={{ p: 0, mb: 2 }}>
                  <Paper sx={{ p: 2, width: '100%', boxShadow: 2 }}>
                    <ListItemIcon>
                      <Notifications color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Notification Settings
                        </Typography>
                      }
                      secondary="Manage your notification preferences"
                    />
                    <Button variant="outlined">Settings</Button>
                  </Paper>
                </ListItem>
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Recent Activities
          </Typography>
          <List>
            {[
              { id: 1, icon: <Event />, text: 'Updated production schedule', time: '2 hours ago' },
              { id: 2, icon: <Work />, text: 'Completed monthly report', time: '1 day ago' },
              { id: 3, icon: <Person />, text: 'Profile information updated', time: '3 days ago' },
              { id: 4, icon: <Security />, text: 'Changed password', time: '1 week ago' }
            ].map((activity) => (
              <ListItem key={activity.id} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {activity.icon}
                </ListItemIcon>
                <ListItemText
                  primary={activity.text}
                  secondary={activity.time}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;