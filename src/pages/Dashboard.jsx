import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Factory as FactoryIcon,
  SettingsInputAntenna as AntennaIcon,
  Train as TrainIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Science as ScienceIcon,
  Build as BuildIcon,
  Assessment as ReportIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Frame from "../components/Frame";

const ProductionCard = styled(motion(Card))(({ theme }) => ({
  minWidth: 275,
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  height: "100%",
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
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProductionItem, setSelectedProductionItem] = useState(null);

  const productionData = [
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
  ];

  const handleCardClick = (item) => {
    setSelectedProductionItem(item);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedProductionItem(null);
  };

  const averageProgress = Math.round(
    productionData.reduce((acc, curr) => acc + curr.progress, 0) / productionData.length
  );

  const highestProduction = productionData.reduce((max, item) =>
    max.progress > item.progress ? max : item
  );

  return (
    <Frame>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1800px", mx: "auto" }}>
        <Box sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard Produksi
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Progress terkini dari seluruh lini produksi
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {productionData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ProductionCard
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(item)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Tooltip title={item.name} placement="top">
                    <IconWrapper color={item.color}>
                      {React.cloneElement(item.icon, { fontSize: "large" })}
                    </IconWrapper>
                  </Tooltip>
                  <Typography variant="h6" fontWeight="bold">
                    {item.name}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      Progress: <b style={{ color: item.color }}>{item.progress}%</b>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{
                        mt: 1,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#eee",
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          backgroundColor:
                            item.progress > 75 ? '#4CAF50' : item.progress > 50 ? '#FF9800' : '#F44336',
                        },
                      }}
                    />
                    <Chip
                      label={item.progress > 75 ? "On Track" : item.progress > 50 ? "Moderate" : "Delayed"}
                      color={item.progress > 75 ? "success" : item.progress > 50 ? "warning" : "error"}
                      size="small"
                      sx={{ mt: 1.5 }}
                    />
                  </Box>
                </CardContent>
              </ProductionCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <ProductionCard whileHover={{ scale: 1.01 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <IconWrapper color="#FF8C00">
                    <ReportIcon fontSize="large" />
                  </IconWrapper>
                  <Typography variant="h6" fontWeight="bold" ml={2}>
                    Ringkasan Produksi
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Total Progress: <b style={{ color: "#FF8C00" }}>{averageProgress}%</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Rata-rata progress seluruh lini produksi berdasarkan data terkini dari semua departemen.
                </Typography>
              </CardContent>
            </ProductionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ProductionCard whileHover={{ scale: 1.01 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <IconWrapper color="#4CAF50">
                    <BuildIcon fontSize="large" />
                  </IconWrapper>
                  <Typography variant="h6" fontWeight="bold" ml={2}>
                    Aktivitas Terkini
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Produksi Tertinggi: <b style={{ color: "#4CAF50" }}>{highestProduction.name}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Mencapai {highestProduction.progress}% penyelesaian dengan performa terbaik.
                </Typography>
              </CardContent>
            </ProductionCard>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProductionItem?.name} Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailDialog}
            sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProductionItem && (
            <Box>
              <Typography variant="h6" mb={2}>
                Current Progress: {selectedProductionItem.progress}%
              </Typography>
              <Typography variant="body1">
                {selectedProductionItem.details}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                href={selectedProductionItem.link}
                target="_blank"
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
