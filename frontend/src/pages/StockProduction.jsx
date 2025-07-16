import React from 'react';
import axios from 'axios';
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
  Chip,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
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
  
  const [productionData, setProductionData] = React.useState([]);
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  axios.get('/api/stockproduction/')
    .then((res) => {
      console.log("API RESPONSE:", res.data); 
      console.log("RESPONSE TYPE:", typeof res.data); // ⬅️ penting!
      console.log("RESPONSE RAW:", res.data);   // Tambahkan ini
       if (Array.isArray(res.data)) {
        setProductionData(res.data);
      } else {
        console.error("❌ Bukan array! Data:", res.data);
        setProductionData([]); // fallback aman
      }
    }) // Pastikan ini array
    .catch((err) => {
      console.error("Gagal mengambil data produksi:", err);
      setProductionData([]); // fallback biar nggak error
    })
    .finally(() => {
      setLoading(false);
      setLastRefreshed(new Date());
    });
}, []);


  // Filter data for the table as requested
 const tabulasiData = Array.isArray(productionData)
  ? productionData.filter(item =>
      item.title === "Stock Production" || 
      item.title === "Overhaul Point Machine" || 
      item.title === "Produksi Radio Lokomotif"
    )
  : [];



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
  if (loading) {
  return (
    <Box sx={{ 
      p: 5, 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      flexDirection: 'column',
      gap: 2
    }}>
      <LinearProgress sx={{ width: '100%' }} />
      <Typography variant="body2" color="text.secondary">Memuat data Stock Production...</Typography>
    </Box>
  );
}



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

      {/* Tabulasi Section */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        mb: 4,
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ fontWeight: '600', mb: 2 }}>
            Ringkasan Produksi Kunci
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nama Produksi</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tabulasiData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.title}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={row.progress} 
                          sx={{ 
                            width: 100,
                            height: 8,
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: getProgressColor(row.progress)
                            }
                          }} 
                        />
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: getProgressColor(row.progress)
                        }}>
                          {row.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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