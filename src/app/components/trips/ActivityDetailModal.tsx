"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  X,
} from "lucide-react";
import ActivityPhotosService from "@/app/Service/ActivityPhotosService";
import { useThemeContext } from "@/app/context/ThemeContext";

interface ActivityDetailModalProps {
  open: boolean;
  activity: any;
  city: string;
  onClose: () => void;
}

export function ActivityDetailModal({ open, activity, city, onClose }: ActivityDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activityPhotos, setActivityPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchActivityPhotos = async () => {
      if (!activity || !activity.placeName) return;

      setLoading(true);
      try {
        const photos = await ActivityPhotosService.loadActivityPhotos(activity.placeName, city);
        setActivityPhotos(photos);
      } catch (error) {
        console.error("Aktivite fotoğrafları yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && activity) {
      fetchActivityPhotos();
    }
  }, [open, activity, city]);

  if (!activity) return null;

  const activityName = activity.placeName || activity.activity || activity.title || activity.name || "Aktivite";

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : activityPhotos.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < activityPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {activityName}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: isDarkMode ? "grey.400" : "grey.600" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Image Gallery */}
          {activityPhotos.length > 0 && (
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative", height: { xs: 300, md: "100%" } }}>
                <Box
                  component="img"
                  src={activityPhotos[selectedImageIndex]?.imageUrl}
                  alt={`${activityName} - Photo ${selectedImageIndex + 1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {activityPhotos.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        width: 40,
                        height: 40,
                        zIndex: 10,
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
                      }}
                    >
                      <ChevronLeft size={24} />
                    </IconButton>
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        width: 40,
                        height: 40,
                        zIndex: 10,
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
                      }}
                    >
                      <ChevronRight size={24} />
                    </IconButton>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        bgcolor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                      }}
                    >
                      {selectedImageIndex + 1} / {activityPhotos.length}
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          )}

          {/* Activity Details */}
          <Grid item xs={12} md={activityPhotos.length > 0 ? 6 : 12}>
            <Box sx={{ p: 3 }}>
              {activity.time && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Clock size={18} style={{ marginRight: 8 }} />
                  <Typography variant="body2">{activity.time}</Typography>
                </Box>
              )}

              {activity.placeDetails && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Detaylar
                  </Typography>
                  <Typography variant="body2">{activity.placeDetails}</Typography>
                </Box>
              )}

              {activity.ticketPricing && (
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <DollarSign size={18} style={{ marginRight: 8, marginTop: 4 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Bilet Bilgisi
                    </Typography>
                    <Typography variant="body2">{activity.ticketPricing}</Typography>
                  </Box>
                </Box>
              )}

              {activity.timeToTravel && (
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <MapPin size={18} style={{ marginRight: 8, marginTop: 4 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Ulaşım Süresi
                    </Typography>
                    <Typography variant="body2">{activity.timeToTravel}</Typography>
                  </Box>
                </Box>
              )}

              {activity.timeToSpend && (
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <Clock size={18} style={{ marginRight: 8, marginTop: 4 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Tahmini Ziyaret Süresi
                    </Typography>
                    <Typography variant="body2">{activity.timeToSpend}</Typography>
                  </Box>
                </Box>
              )}

              {/* Thumbnails */}
              {activityPhotos.length > 1 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Fotoğraflar
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      overflowX: "auto",
                      gap: 1,
                      pb: 1,
                    }}
                  >
                    {activityPhotos.map((photo, index) => (
                      <Box
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        sx={{
                          width: 80,
                          height: 60,
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: "hidden",
                          cursor: "pointer",
                          border: selectedImageIndex === index ? `2px solid ${theme.palette.primary.main}` : "none",
                          opacity: selectedImageIndex === index ? 1 : 0.7,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={photo.imageUrl}
                          alt={`Thumbnail ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityDetailModal;
