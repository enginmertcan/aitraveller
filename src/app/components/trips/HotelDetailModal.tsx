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
  Rating,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import { CheckCircle } from "@mui/icons-material";

import { Hotel } from "@/app/types/travel";
import { useThemeContext } from "@/app/context/ThemeContext";
import HotelPhotosService from "@/app/Service/HotelPhotosService";
import AIHotelPhotosService from "@/app/Service/AIHotelPhotosService";

interface HotelDetailModalProps {
  open: boolean;
  hotel: Hotel | null;
  onClose: () => void;
}

export function HotelDetailModal({ open, hotel, onClose }: HotelDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [enhancedHotel, setEnhancedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Otel fotoğraflarını yükle
  useEffect(() => {
    const loadHotelPhotos = async () => {
      if (!hotel || !open) return;

      // Eğer zaten yeterli fotoğraf varsa, işlem yapma
      const existingImages = hotel.additionalImages || [];
      const validExistingImages = existingImages.filter((img) =>
        img && (typeof img === 'string' ? img.trim() !== '' : (img.url && img.url.trim() !== ''))
      );

      if (validExistingImages.length >= 5) {
        setEnhancedHotel(hotel);
        return;
      }

      setLoading(true);
      try {
        // Otelin bulunduğu şehri belirle
        const city = hotel.city || hotel.location || '';

        // Otelin AI tarafından önerilip önerilmediğini kontrol et
        if (hotel.isAIRecommended) {
          const enhancedHotelData = await AIHotelPhotosService.enhanceHotelWithPhotos(hotel, city);
          setEnhancedHotel(enhancedHotelData);
        } else {
          const enhancedHotelData = await HotelPhotosService.enhanceHotelWithPhotos(hotel, city);
          setEnhancedHotel(enhancedHotelData);
        }
      } catch (error) {
        console.error("Otel fotoğrafları yükleme hatası:", error);
        setEnhancedHotel(hotel); // Hata durumunda orijinal oteli kullan
      } finally {
        setLoading(false);
      }
    };

    loadHotelPhotos();
  }, [hotel, open]);

  if (!hotel) return null;

  // Görüntülenecek otel verisini belirle
  const displayHotel = enhancedHotel || hotel;

  // Process hotel images
  const hotelImages: { url: string; caption?: string }[] = [];

  // Add main image if available
  if (displayHotel.imageUrl) {
    hotelImages.push({ url: displayHotel.imageUrl });
  } else if (displayHotel.hotelImageUrl) {
    hotelImages.push({ url: displayHotel.hotelImageUrl });
  }

  // Add additional images if available
  if (displayHotel.additionalImages && Array.isArray(displayHotel.additionalImages)) {
    displayHotel.additionalImages.forEach((img) => {
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
          {displayHotel.hotelName}
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
              {loading ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isDarkMode ? "rgba(17, 24, 39, 0.7)" : "rgba(229, 231, 235, 0.7)",
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Box
                  component="img"
                  src={hotelImages[selectedImageIndex]?.url}
                  alt={`${displayHotel.hotelName} - Photo ${selectedImageIndex + 1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}

              {/* Navigation Arrows */}
              {hotelImages.length > 1 && (
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
                <Rating value={displayHotel.rating} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
                  {displayHotel.rating ? `${displayHotel.rating} / 5` : "No rating"}
                </Typography>
              </Box>

              {/* Address */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                <MapPin size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: 4 }} />
                <Typography variant="body1">{displayHotel.hotelAddress}</Typography>
              </Box>

              {/* Price */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                <DollarSign size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: 4 }} />
                <Typography variant="body1">{displayHotel.priceRange || displayHotel.price || "Price not specified"}</Typography>
              </Box>

              {/* Best Time to Visit */}
              {displayHotel.bestTimeToVisit && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                  <Clock size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: 4 }} />
                  <Typography variant="body1">{displayHotel.bestTimeToVisit}</Typography>
                </Box>
              )}

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">{displayHotel.description}</Typography>
              </Box>

              {/* Features */}
              {displayHotel.features && displayHotel.features.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Features
                  </Typography>
                  <Grid container spacing={1}>
                    {displayHotel.features.map((feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Surroundings */}
              {displayHotel.surroundings && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Surroundings
                  </Typography>
                  <Typography variant="body1">{displayHotel.surroundings}</Typography>
                </Box>
              )}

              {/* Map Button */}
              <Button
                variant="outlined"
                startIcon={<Navigation size={16} />}
                onClick={() => {
                  // Otel adı ile doğrudan arama yap
                  const searchQuery = encodeURIComponent(`${displayHotel.hotelName} hotel`);
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
