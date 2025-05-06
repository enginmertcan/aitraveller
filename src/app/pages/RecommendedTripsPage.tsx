"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, Calendar, Clock, Heart, MapPin, Plane, Star, Users, Wallet } from "lucide-react";

import { borderRadius, colors, shadows } from "../components/ThemeRegistry/theme";
import { useThemeContext } from "../context/ThemeContext";
import { fetchRecommendedTravelPlans, toggleLike } from "../Services/travel-plans";
import { TravelPlan } from "../types/travel";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: theme.palette.mode === "dark" ? colors.dark.card : colors.light.card,
  backdropFilter: "blur(10px)",
  borderRadius: borderRadius.lg,
  border: `1px solid ${theme.palette.mode === "dark" ? colors.dark.border : colors.light.border}`,
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.palette.mode === "dark" ? shadows.dark.lg : shadows.lg,
  },
  position: "relative",
}));

const RecommendationBadge = styled(Box)({
  position: "absolute",
  top: 16,
  right: 16,
  backgroundColor: "rgba(255, 215, 0, 0.9)",
  color: "#000",
  padding: "6px 12px",
  borderRadius: borderRadius.md,
  display: "flex",
  alignItems: "center",
  gap: "6px",
  zIndex: 1,
  fontWeight: 600,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const NoTripsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  background: theme.palette.mode === "dark" ? colors.dark.section : colors.light.section,
  backdropFilter: "blur(10px)",
  borderRadius: borderRadius.lg,
  border: `1px solid ${theme.palette.mode === "dark" ? colors.dark.border : colors.light.border}`,
  marginTop: theme.spacing(4),
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
}));

// Helper function to format date strings
const formatDate = (dateString: string) => {
  if (!dateString) return "Tarih belirtilmemiş";

  // If the date is already in DD/MM/YYYY format, return it as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  // Try to parse the date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // If parsing fails, return the original string
    }

    // Format as DD/MM/YYYY
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Like Button Component
const LikeButton = styled(IconButton)(({ theme, isLiked }: { theme?: any; isLiked: boolean }) => ({
  position: "absolute",
  top: 16,
  left: 16,
  backgroundColor: isLiked ? "rgba(233, 30, 99, 0.1)" : "rgba(255, 255, 255, 0.2)",
  color: isLiked ? "#e91e63" : "#fff",
  zIndex: 2,
  "&:hover": {
    backgroundColor: isLiked ? "rgba(233, 30, 99, 0.2)" : "rgba(255, 255, 255, 0.3)",
  },
}));

// Like Count Badge
const LikeCountBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 16,
  right: 16,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: "#000",
  padding: "4px 8px",
  borderRadius: borderRadius.md,
  display: "flex",
  alignItems: "center",
  gap: "4px",
  zIndex: 1,
  fontWeight: 600,
  fontSize: "0.75rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
}));

export default function RecommendedTripsPage() {
  const [recommendedTrips, setRecommendedTrips] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const router = useRouter();
  const { isDarkMode } = useThemeContext();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const loadRecommendedTrips = async () => {
      try {
        setLoading(true);
        const trips = await fetchRecommendedTravelPlans();
        setRecommendedTrips(trips as TravelPlan[]);
      } catch (error) {
        console.error("Error loading recommended trips:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendedTrips();
  }, []);

  const handleTripClick = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  // Handle like button click
  const handleLike = async (event: React.MouseEvent, tripId: string) => {
    event.stopPropagation(); // Prevent card click

    if (!isLoaded || !user) {
      setAlertMessage("Beğeni yapabilmek için giriş yapmalısınız.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    try {
      // Find the trip in the current state
      const tripIndex = recommendedTrips.findIndex(trip => trip.id === tripId);
      if (tripIndex === -1) return;

      const trip = recommendedTrips[tripIndex];
      const isCurrentlyLiked = trip.likedBy?.includes(user.id) || false;
      const currentLikes = trip.likes || 0;

      // Create a new likedBy array
      const newLikedBy = [...(trip.likedBy || [])];

      if (isCurrentlyLiked) {
        // Remove user from likedBy
        const index = newLikedBy.indexOf(user.id);
        if (index > -1) {
          newLikedBy.splice(index, 1);
        }
      } else {
        // Add user to likedBy
        newLikedBy.push(user.id);
      }

      // Create a new trips array with the updated trip
      const updatedTrips = [...recommendedTrips];
      updatedTrips[tripIndex] = {
        ...trip,
        likes: isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1,
        likedBy: newLikedBy
      };

      // Update the state immediately for responsive UI
      setRecommendedTrips(updatedTrips);

      // Then perform the actual API call in the background
      const success = await toggleLike(tripId, user.id);

      if (success) {
        setAlertMessage("Beğeni durumu güncellendi.");
        setAlertSeverity("success");
        setAlertOpen(true);
      } else {
        // If the API call fails, revert the UI change
        setRecommendedTrips(recommendedTrips);
        setAlertMessage("Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setAlertMessage("Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  // Check if the current user has liked a trip
  const isLikedByUser = (trip: TravelPlan) => {
    if (!isLoaded || !user) return false;
    return trip.likedBy?.includes(user.id) || false;
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Function to get a random gradient for the card header
  const getRandomGradient = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #3b82f6, #2563eb)",
      "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      "linear-gradient(135deg, #ec4899, #db2777)",
      "linear-gradient(135deg, #f97316, #ea580c)",
      "linear-gradient(135deg, #10b981, #059669)",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          background: isDarkMode ? colors.dark.section : colors.light.section,
          backdropFilter: "blur(10px)",
          borderRadius: borderRadius.lg,
          border: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
          p: 3,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          sx={{
            mr: 2,
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
            },
          }}
          aria-label="Geri dön"
        >
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Önerilen Seyahatler
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
              mt: 1,
            }}
          >
            Diğer kullanıcıların önerdiği seyahat planlarını keşfedin. Bu planlar, kullanıcıların memnun kaldıkları ve
            başkalarına tavsiye ettikleri seyahatlerdir.
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            my: 8,
            gap: 2,
          }}
        >
          <CircularProgress size={40} sx={{ color: isDarkMode ? colors.primary.light : colors.primary.main }} />
          <Typography variant="body1" sx={{ color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted }}>
            Önerilen seyahatler yükleniyor...
          </Typography>
        </Box>
      ) : recommendedTrips.length > 0 ? (
        <Grid container spacing={4}>
          {recommendedTrips.map((trip, index) => (
            <Grid item key={trip.id} xs={12} sm={6} md={4}>
              <StyledCard onClick={() => handleTripClick(trip.id)}>
                <RecommendationBadge>
                  <Star size={16} />
                  <Typography variant="caption" fontWeight="bold">
                    Önerilen
                  </Typography>
                </RecommendationBadge>

                {/* Card Header with Gradient */}
                <Box
                  sx={{
                    background: getRandomGradient(index),
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Like Button */}
                  <LikeButton
                    isLiked={isLikedByUser(trip)}
                    onClick={(e) => handleLike(e, trip.id)}
                    size="small"
                  >
                    <Heart size={18} fill={isLikedByUser(trip) ? "#e91e63" : "none"} />
                  </LikeButton>

                  {/* Like Count Badge */}
                  <LikeCountBadge>
                    <Heart size={14} color="#e91e63" fill="#e91e63" />
                    <Typography variant="caption" fontWeight="bold">
                      {trip.likes || 0}
                    </Typography>
                  </LikeCountBadge>

                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      opacity: 0.2,
                      transform: "rotate(15deg)",
                    }}
                  >
                    <Plane size={80} color="#ffffff" />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "#ffffff",
                      mb: 1,
                    }}
                  >
                    {trip.destination}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <MapPin size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {trip.destination}
                    </Typography>
                  </Box>
                </Box>

                <StyledCardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Calendar size={16} color={isDarkMode ? colors.primary.light : colors.primary.main} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(trip.startDate)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Clock size={16} color={isDarkMode ? colors.secondary.light : colors.secondary.main} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
                            fontWeight: 500,
                          }}
                        >
                          {trip.duration || `${trip.days} gün`}
                        </Typography>
                      </Box>
                    </Grid>

                    {trip.budget && (
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Wallet size={16} color={isDarkMode ? colors.primary.light : colors.primary.main} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
                              fontWeight: 500,
                            }}
                          >
                            {trip.budget}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {trip.groupType && (
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Users size={16} color={isDarkMode ? colors.secondary.light : colors.secondary.main} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
                              fontWeight: 500,
                            }}
                          >
                            {trip.groupType}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  <ChipContainer>
                    {trip.isDomestic !== undefined && (
                      <Chip
                        icon={<MapPin size={14} />}
                        label={trip.isDomestic ? "Yurtiçi" : "Yurtdışı"}
                        size="small"
                        variant="outlined"
                        color={trip.isDomestic ? "success" : "primary"}
                        sx={{
                          borderRadius: borderRadius.md,
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </ChipContainer>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleTripClick(trip.id)}
                    endIcon={<ArrowRight size={16} />}
                    sx={{
                      mt: 3,
                      background: colors.gradients.primary,
                      borderRadius: borderRadius.md,
                      textTransform: "none",
                      py: 1,
                      fontWeight: 600,
                      "&:hover": {
                        background: colors.gradients.primaryHover,
                      },
                    }}
                  >
                    Detayları Görüntüle
                  </Button>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoTripsContainer>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: colors.gradients.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: isDarkMode ? shadows.dark.lg : shadows.lg,
            }}
          >
            <Star size={40} color="#ffffff" />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Henüz önerilen seyahat planı bulunmuyor
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
              maxWidth: "600px",
            }}
          >
            Kullanıcılar seyahat planlarını önerdikçe burada görünecekler. Siz de kendi seyahat planınızı oluşturabilir
            ve başkalarıyla paylaşabilirsiniz.
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push("/")}
            startIcon={<Plane size={18} />}
            sx={{
              py: 1.5,
              px: 4,
              background: colors.gradients.primary,
              borderRadius: borderRadius.md,
              boxShadow: isDarkMode ? shadows.dark.md : shadows.md,
              transition: "all 0.3s ease",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: colors.gradients.primaryHover,
                transform: "translateY(-3px)",
                boxShadow: isDarkMode ? shadows.dark.lg : shadows.lg,
              },
            }}
          >
            Yeni Seyahat Planı Oluştur
          </Button>
        </NoTripsContainer>
      )}

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
