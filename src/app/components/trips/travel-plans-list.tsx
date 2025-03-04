"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import { MoreVertical, MapPin, Calendar, Users, Wallet } from "lucide-react";

import { TravelPlan } from "../../types/travel";

interface TravelPlansListProps {
  plans: TravelPlan[];
}

export function TravelPlansList({ plans }: TravelPlansListProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, plan: TravelPlan) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };

  const handleViewDetails = () => {
    if (selectedPlan) {
      router.push(`/trips/${selectedPlan.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    // Silme işlemi burada yapılacak
    handleMenuClose();
  };

  return (
    <Grid container spacing={3}>
      {plans.map((plan, index) => (
        <Grid item xs={12} md={6} key={plan.id}>
          <Fade in timeout={500 + index * 100}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {plan.destination}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, plan)}
                    sx={{
                      '&:hover': {
                        backgroundColor: "rgba(37, 99, 235, 0.1)",
                      }
                    }}
                  >
                    <MoreVertical size={20} />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <MapPin size={18} style={{ color: "#2563eb" }} />
                    <Typography variant="body2" color="text.secondary">
                      {plan.destination}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Calendar size={18} style={{ color: "#7c3aed" }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(plan.startDate).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" - "}
                      {plan.days} gün
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Users size={18} style={{ color: "#2563eb" }} />
                    <Typography variant="body2" color="text.secondary">
                      {plan.companion}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Wallet size={18} style={{ color: "#7c3aed" }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(plan.budget)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {plan.activities?.slice(0, 3).map((activity, index) => (
                    <Chip
                      key={index}
                      label={activity}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(37, 99, 235, 0.1)",
                        color: "#2563eb",
                        borderRadius: "8px",
                        '&:hover': {
                          backgroundColor: "rgba(37, 99, 235, 0.2)",
                        }
                      }}
                    />
                  ))}
                  {plan.activities?.length > 3 && (
                    <Chip
                      label={`+${plan.activities.length - 3}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(124, 58, 237, 0.1)",
                        color: "#7c3aed",
                        borderRadius: "8px",
                        '&:hover': {
                          backgroundColor: "rgba(124, 58, 237, 0.2)",
                        }
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "12px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            overflow: "visible",
            mt: 1.5,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
              borderRadius: "8px",
              mx: 0.5,
              my: 0.25,
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.1)",
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleViewDetails}>Detayları Görüntüle</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>Seyahati Sil</MenuItem>
      </Menu>
    </Grid>
  );
}