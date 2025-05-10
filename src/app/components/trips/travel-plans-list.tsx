"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Grid, Paper, Typography, ImageList, ImageListItem } from "@mui/material";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";

import { useThemeContext } from "../../context/ThemeContext";
import { TravelPlan, Hotel } from "../../types/travel";

interface TravelPlansListProps {
  plans: Partial<TravelPlan>[];
}

export function TravelPlansList({ plans }: TravelPlansListProps) {
  const router = useRouter();
  const { isDarkMode } = useThemeContext();

  return (
    <Grid container spacing={3}>
      {plans.map(plan => (
        <Grid item xs={12} sm={6} md={4} key={plan.id || `plan-${Math.random()}`}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              background: isDarkMode ? "rgba(45, 45, 45, 0.8)" : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.3)" : "0 8px 30px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: isDarkMode ? "#fff" : "inherit",
                }}
              >
                {plan.destination || "Bilinmeyen Destinasyon"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  mb: 1,
                }}
              >
                <MapPin size={16} />
                <Typography variant="body2">{plan.destination || "Bilinmeyen Destinasyon"}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  mb: 1,
                }}
              >
                <Calendar size={16} />
                <Typography variant="body2">{plan.startDate || "Tarih belirtilmemiş"}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  mb: 1,
                }}
              >
                <Users size={16} />
                <Typography variant="body2">
                  {plan.groupType || "Belirtilmemiş"} {plan.numberOfPeople ? `(${plan.numberOfPeople})` : ""}
                </Typography>
              </Box>
              {plan.budget && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  }}
                >
                  <DollarSign size={16} />
                  <Typography variant="body2">{plan.budget}</Typography>
                </Box>
              )}
            </Box>

            {/* Hotel Images Section - Display hotel images instead of hotel names */}
            {plan.hotelOptions && typeof plan.hotelOptions !== 'string' && plan.hotelOptions.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <ImageList sx={{ width: "100%", height: 120, m: 0 }} cols={3} rowHeight={120} gap={4}>
                  {plan.hotelOptions.slice(0, 3).map((hotel: Hotel, index: number) => (
                    <ImageListItem key={index} sx={{ overflow: "hidden", borderRadius: "8px" }}>
                      <img
                        src={hotel.hotelImageUrl || hotel.imageUrl || '/placeholder-hotel.jpg'}
                        alt={hotel.hotelName}
                        loading="lazy"
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover"
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            <Box sx={{ mt: "auto", pt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => plan.id && router.push(`/trips/${plan.id}`)}
                disabled={!plan.id}
                sx={{
                  background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                  borderRadius: "12px",
                  textTransform: "none",
                  py: 1,
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                  },
                }}
              >
                Detayları Görüntüle
              </Button>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
