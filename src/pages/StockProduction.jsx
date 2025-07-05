import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress,
  Divider
} from "@mui/material";
import { Storage as StorageIcon } from "@mui/icons-material";
import Frame from '../components/Frame';

const StockProduction = () => {
  // Sample data matching your reference image
  const productionData = [
    { 
      title: "Overhaul Point Machine", 
      progress: 65, 
      note: "Custom",
      details: "Pengerjaan rutin maintenance point machine"
    },
    { 
      title: "Stock Production", 
      progress: 78, 
      note: "Custom",
      details: "Manajemen stock untuk produksi harian"
    },
    { 
      title: "RingKasan Produksi", 
      progress: 75, 
      note: "Total Progress: 75%",
      subNote: "Note: V2B progress actuals are not actual locations in data collected and cannot detect remote."
    },
    { 
      title: "Produksi Radio Lokomotif", 
      progress: 81, 
      note: "Custom",
      details: "Produksi komponen radio untuk lokomotif"
    },
    { 
      title: "Personalia", 
      progress: 92, 
      note: "Custom",
      details: "Pengelolaan SDM produksi"
    },
    { 
      title: "Products! Way Station", 
      progress: 63, 
      note: "Custom",
      details: "Produksi komponen way station"
    },
    { 
      title: "Quality Control", 
      progress: 81, 
      note: "Custom",
      details: "Quality control produk akhir"
    }
  ];

  return (
    <Frame>
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <StorageIcon fontSize="large" sx={{ color: '#FF6D00', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Stock Production
          </Typography>
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
                borderRadius: 2,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {item.title}
                </Typography>
                
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
                          backgroundColor: '#FF6D00'
                        }
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.progress}%
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.note}
                </Typography>
                
                {item.subNote && (
                  <Typography variant="caption" color="text.secondary">
                    {item.subNote}
                  </Typography>
                )}
                
                {item.details && (
                  <>
                    <Divider sx={{ my: 1 }} />
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              Aktivitas Terkini
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Product Terteggi: Personalis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Notebook 90% perspecsation dengan performatoritask.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Frame>
  );
};

export default StockProduction;