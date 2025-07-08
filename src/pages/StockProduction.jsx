import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress,
  Divider,
  Tooltip,
  IconButton,
  Badge,
  Avatar,
  Chip
} from "@mui/material";
import { 
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ArrowDropUp as ArrowDropUpIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";

const StockProduction = () => {
  const [activeCard, setActiveCard] = React.useState(null);
  const [lastRefreshed, setLastRefreshed] = React.useState(new Date());
  
  const productionData = [
    { 
      title: "Overhaul Point Machine", 
      progress: 65, 
      note: "Custom",
      details: "Pengerjaan rutin maintenance point machine",
      trend: "up",
      alerts: 2
    },
    { 
      title: "Stock Production", 
      progress: 78, 
      note: "Custom",
      details: "Manajemen stock untuk produksi harian",
      trend: "up",
      alerts: 1
    },
    { 
      title: "RingKasan Produksi", 
      progress: 75, 
      note: "Total Progress: 75%",
      subNote: "Note: V2B progress actuals are not actual locations in data collected and cannot detect remote.",
      trend: "steady",
      alerts: 0
    },
    { 
      title: "Produksi Radio Lokomotif", 
      progress: 81, 
      note: "Custom",
      details: "Produksi komponen radio untuk lokomotif",
      trend: "up",
      alerts: 3
    },
    { 
      title: "Personalia", 
      progress: 92, 
      note: "Custom",
      details: "Pengelolaan SDM produksi",
      trend: "down",
      alerts: 0
    },
    { 
      title: "Products! Way Station", 
      progress: 63, 
      note: "Custom",
      details: "Produksi komponen way station",
      trend: "steady",
      alerts: 1
    },
    { 
      title: "Quality Control", 
      progress: 81, 
      note: "Custom",
      details: "Quality control produk akhir",
      trend: "up",
      alerts: 0
    }
  ];

  const recentActivities = [
    { id: 1, action: "Product Tertinggi: Personalis", time: "5 menit lalu", status: "completed" },
    { id: 2, action: "Notebook perspecsation", time: "12 menit lalu", status: "in-progress" },
    { id: 3, action: "Maintenance schedule update", time: "25 menit lalu", status: "completed" },
    { id: 4, action: "New stock", time: "1 jam lalu", status: "completed" }
  ];

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    // In a real app, you would trigger data refresh here
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return '#4CAF50'; // Green
    if (progress >= 70) return '#FFA000'; // Orange
    if (progress >= 50) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header Section with Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ 
            bgcolor: 'transparent', 
            mr: 2,
            width: 48,
            height: 48,
            '& svg': {
              color: '#FF6D00',
              fontSize: '2rem'
            }
          }}>
            <StorageIcon fontSize="inherit" />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
            Stock Production
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Last refreshed">
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
              {lastRefreshed.toLocaleTimeString()}
            </Typography>
          </Tooltip>
          <IconButton onClick={handleRefresh} color="primary" sx={{ backgroundColor: 'rgba(255,109,0,0.1)' }}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="primary" sx={{ backgroundColor: 'rgba(255,109,0,0.1)' }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Progress Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 3,
          mb: 4
        }}
      >
        {productionData.map((item, index) => (
          <Card 
            key={index} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease-in-out',
              borderLeft: `4px solid ${getProgressColor(item.progress)}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px 0 rgba(0,0,0,0.12)'
              }
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: '600' }}>
                  {item.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.trend === 'up' && (
                    <ArrowDropUpIcon sx={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                  )}
                  {item.trend === 'down' && (
                    <ArrowDropUpIcon sx={{ color: '#F44336', transform: 'rotate(180deg)', fontSize: '1.5rem' }} />
                  )}
                  {item.alerts > 0 && (
                    <Chip 
                      label={item.alerts} 
                      size="small" 
                      color="error" 
                      sx={{ height: 20, fontSize: '0.7rem' }} 
                    />
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.progress} 
                    sx={{ 
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: getProgressColor(item.progress)
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold',
                  color: getProgressColor(item.progress)
                }}>
                  {item.progress}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.note}
                </Typography>
                {activeCard === index && (
                  <Tooltip title={item.details || item.subNote} arrow>
                    <InfoIcon sx={{ color: 'text.secondary', ml: 1, fontSize: '1rem' }} />
                  </Tooltip>
                )}
              </Box>
              
              {item.subNote && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {item.subNote}
                </Typography>
              )}
              
              {item.details && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.details}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Recent Activities Section */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: '600' }}>
              Aktivitas Terkini
            </Typography>
            <Chip label="Live" color="success" size="small" icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} />
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {recentActivities.map((activity) => (
              <Box key={activity.id} sx={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 1,
                borderRadius: 1,
                backgroundColor: activity.status === 'completed' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 193, 7, 0.05)'
              }}>
                <Avatar sx={{ 
                  width: 24, 
                  height: 24,
                  bgcolor: activity.status === 'completed' ? '#4CAF50' : '#FFC107',
                  '& svg': {
                    fontSize: '1rem'
                  }
                }}>
                  {activity.status === 'completed' ? <CheckCircleIcon fontSize="inherit" /> : null}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
                    {activity.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StockProduction;