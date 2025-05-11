"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Rating,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Globe,
  Info,
  MapPin,
  Navigation,
  X,
} from "lucide-react";

import { Hotel } from "@/app/types/travel";
import { useThemeContext } from "@/app/context/ThemeContext";

interface HotelDetailModalProps {
  open: boolean;
  hotel: Hotel | null;
  onClose: () => void;
}

export function HotelDetailModal({ open, hotel, onClose }: HotelDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  if (!hotel) return null;

  // Process hotel images
  const hotelImages: { url: string; caption?: string }[] = [];

  // Add main image if available
  if (hotel.imageUrl) {
    hotelImages.push({ url: hotel.imageUrl });
  } else if (hotel.hotelImageUrl) {
    hotelImages.push({ url: hotel.hotelImageUrl });
  }

  // Add additional images if available
  if (hotel.additionalImages && Array.isArray(hotel.additionalImages)) {
    hotel.additionalImages.forEach((img) => {
      if (img && typeof img === "string") {
        hotelImages.push({ url: img });
      } else if (img && typeof img === "object" && img.url) {
        hotelImages.push(img);
      }
    });
  }

  // If no images available, add a placeholder
  if (hotelImages.length === 0) {
    hotelImages.push({
      url: "https://via.placeholder.com/800x600/4c669f/ffffff?text=No+Hotel+Image",
    });
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : hotelImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < hotelImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, md: 3 },
          background: isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
          overflow: "hidden",
          maxHeight: "90vh",
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
          {hotel.hotelName}
        </Typography>
        <IconButton onClick={onClose} edge="end" aria-label="close">
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Image Gallery */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", height: { xs: 300, md: "100%" } }}>
              <Box
                component="img"
                src={hotelImages[selectedImageIndex]?.url}
                alt={`${hotel.hotelName} - Photo ${selectedImageIndex + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Navigation Arrows */}
              {hotelImages.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}

              {/* Image Counter */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 4,
                  fontSize: "0.875rem",
                }}
              >
                {selectedImageIndex + 1} / {hotelImages.length}
              </Box>
            </Box>
          </Grid>

          {/* Hotel Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, height: "100%", overflowY: "auto" }}>
              {/* Rating */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Rating value={hotel.rating} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
                  {hotel.rating ? `${hotel.rating} / 5` : "No rating"}
                </Typography>
              </Box>

              {/* Address */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                <MapPin size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: 4 }} />
                <Typography variant="body1">{hotel.hotelAddress}</Typography>
              </Box>

              {/* Price */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                <DollarSign size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: 4 }} />
                <Typography variant="body1">{hotel.priceRange || hotel.price || "Price not specified"}</Typography>
              </Box>

              {/* Best Time to Visit */}
              {hotel.bestTimeToVisit && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                  <Clock size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: 4 }} />
                  <Typography variant="body1">{hotel.bestTimeToVisit}</Typography>
                </Box>
              )}

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">{hotel.description}</Typography>
              </Box>

              {/* Features */}
              {hotel.features && hotel.features.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Features
                  </Typography>
                  <Grid container spacing={1}>
                    {hotel.features.map((feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Check size={16} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Surroundings */}
              {hotel.surroundings && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Surroundings
                  </Typography>
                  <Typography variant="body1">{hotel.surroundings}</Typography>
                </Box>
              )}

              {/* Map Button */}
              <Button
                variant="outlined"
                startIcon={<Navigation size={16} />}
                onClick={() => {
                  // Otel adı ile doğrudan arama yap
                  const searchQuery = encodeURIComponent(`${hotel.hotelName} hotel`);
                  const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                  window.open(url, "_blank");
                }}
                sx={{ mt: 2 }}
              >
                View on Map
              </Button>
            </Box>
          </Grid>

          {/* Thumbnails */}
          {hotelImages.length > 1 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  p: 2,
                  gap: 1,
                  borderTop: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                }}
              >
                {hotelImages.map((image, index) => (
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
                      src={image.url}
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
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
