import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Button, // For filters
  Dialog, // For detailed view
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Factory as FactoryIcon,
  AdfScanner as AdfScannerIcon,
  Category as CategoryIcon,
  SettingsInputAntenna as AntennaIcon,
  Train as TrainIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Science as ScienceIcon,
  Build as BuildIcon,
  Assessment as ReportIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Frame from "../components/Frame";

// Import a charting library component (e.g., Recharts)
// import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

const ProductionCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
  transition: "transform 0.3s, box-shadow 0.3s",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer", // Indicate clickable
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 24px 0 rgba(255,140,0,0.2)",
  },
}));

const IconWrapper = styled("div")(({ theme, color }) => ({
  display: "inline-flex",
  padding: theme.spacing(1.5),
  borderRadius: "50%",
  background: color,
  color: "white",
  marginBottom: theme.spacing(2),
}));

export default function Dashboard() {
  const [productionData, setProductionData] = useState([
    {
      name: "Overhaul Point Machine",
      progress: 65,
      icon: <TrainIcon />,
      color: "#3a7bd5",
      link: "/overhaul",
      details: "Detailed report for Point Machine overhaul...",
    },
    {
      name: "Produksi Radio Lokomotif",
      progress: 82,
      icon: <AntennaIcon />,
      color: "#8E2DE2",
      link: "/produksi",
      details: "Current status of locomotive radio production...",
    },
    {
      name: "Produksi Way Station",
      progress: 45,
      icon: <FactoryIcon />,
      color: "#f46b45",
      link: "/produksi",
      details: "Way station manufacturing progress...",
    },
    {
      name: "Stock Production",
      progress: 78,
      icon: <StorageIcon />,
      color: "#11998e",
      link: "/stock-production",
      details: "Inventory and stock levels for production components...",
    },
    {
      name: "Personalia",
      progress: 92,
      icon: <PeopleIcon />,
      color: "#ff416c",
      link: "/personalia",
      details: "Human resources allocation and availability...",
    },
    {
      name: "Quality Control",
      progress: 88,
      icon: <ScienceIcon />,
      color: "#9C27B0",
      link: "/quality-control",
      details: "Quality assurance checks and defect rates...",
    },
  ]);

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProductionItem, setSelectedProductionItem] = useState(null);

  // Simulate real-time updates (for demonstration)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProductionData(prevData =>
  //       prevData.map(item => ({
  //         ...item,
  //         progress: Math.min(100, item.progress + Math.floor(Math.random() * 5)), // Increment randomly
  //       }))
  //     );
  //   }, 5000); // Update every 5 seconds
  //   return () => clearInterval(interval);
  // }, []);

  const handleCardClick = (item) => {
    setSelectedProductionItem(item);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedProductionItem(null);
  };

  const averageProgress = Math.round(
    productionData.reduce((acc, curr) => acc + curr.progress, 0) /
      productionData.length
  );

  const highestProduction = productionData.reduce((max, item) =>
    max.progress > item.progress ? max : item
  );

  return (
    <Frame>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          maxWidth: "1800px",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            mb: { xs: 3, md: 4 },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 1,
            }}
          >
            Dashboard Produksi
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#666",
              maxWidth: "800px",
              mx: { xs: "auto", md: 0 },
            }}
          >
            Progress terkini dari seluruh lini produksi
          </Typography>
        </Box>

        {/* Production Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {productionData.map((item, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ProductionCard onClick={() => handleCardClick(item)}>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <IconWrapper color={item.color}>
                      {React.cloneElement(item.icon, { fontSize: "large" })}
                    </IconWrapper>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: "auto" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          mr: 1,
                          fontWeight: "medium",
                        }}
                      >
                        Progress:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#FF8C00",
                        }}
                      >
                        {item.progress}%
                      </Typography>
                    </Box>

                    {/* Replace LinearProgress with a Chart Component here */}
                    {/* Example using a conceptual PieChart component: */}
                    {/* <ResponsiveContainer width="100%" height={100}>
                      <PieChart>
                        <Pie
                          data={[{ name: 'Completed', value: item.progress }, { name: 'Remaining', value: 100 - item.progress }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={40}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell key={`cell-0`} fill={item.progress > 75 ? '#4CAF50' : item.progress > 50 ? '#FF9800' : '#F44336'} />
                          <Cell key={`cell-1`} fill="#e0e0e0" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer> */}
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.08)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          backgroundColor:
                            item.progress > 75
                              ? "#4CAF50"
                              : item.progress > 50
                              ? "#FF9800"
                              : "#F44336",
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </ProductionCard>
            </Grid>
          ))}
        </Grid>

        {/* Summary Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ProductionCard>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <IconWrapper color="#FF8C00">
                    <ReportIcon fontSize="large" />
                  </IconWrapper>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      ml: 2,
                    }}
                  >
                    Ringkasan Produksi
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1.5,
                    fontSize: "1.1rem",
                  }}
                >
                  Total Progress:{" "}
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#FF8C00",
                      fontSize: "1.2rem",
                    }}
                  >
                    {averageProgress}%
                  </span>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.6,
                  }}
                >
                  Rata-rata progress seluruh lini produksi berdasarkan data
                  terkini dari semua departemen.
                </Typography>
                {/* Potentially add a gauge chart here */}
              </CardContent>
            </ProductionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ProductionCard>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <IconWrapper color="#4CAF50">
                    <BuildIcon fontSize="large" />
                  </IconWrapper>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      ml: 2,
                    }}
                  >
                    Aktivitas Terkini
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1.5,
                    fontSize: "1.1rem",
                  }}
                >
                  Produksi Tertinggi:{" "}
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#4CAF50",
                      fontSize: "1.2rem",
                    }}
                  >
                    {highestProduction.name}
                  </span>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.6,
                  }}
                >
                  Mencapai {highestProduction.progress}% penyelesaian dengan
                  performa terbaik di antara semua departemen.
                </Typography>
              </CardContent>
            </ProductionCard>
          </Grid>
        </Grid>
      </Box>

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProductionItem?.name} Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProductionItem && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Current Progress: {selectedProductionItem.progress}%
              </Typography>
              {/* You could embed a more detailed chart here, e.g., a line graph of historical progress */}
              {/* <ResponsiveContainer width="100%" height={200}>
                <LineChart data={selectedProductionItem.historicalData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="progress" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer> */}
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedProductionItem.details || "No further details available."}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                href={selectedProductionItem.link}
                target="_blank" // Open in new tab
              >
                Go to {selectedProductionItem.name} Page
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Frame>
  );
}