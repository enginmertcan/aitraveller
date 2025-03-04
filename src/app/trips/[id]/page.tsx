"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Fade,
  useTheme,
  Card,
  CardContent,
  Rating,
  Stack,
} from "@mui/material";
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  ArrowLeft,
  Clock,
  Activity,
  Hotel,
  Navigation,
} from "lucide-react";

import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { TravelPlan } from "../../types/travel";
import { fetchTravelPlanById } from "../../Services/travel-plans";

function formatItineraryItem(item: any) {
  if (typeof item === "string") return item;
  if (item.title) return item.title;
  if (item.name) return item.name;
  if (item.placeName) return item.placeName;
  return "Aktivite";
}

function getItineraryItems(itinerary: any[]): string[] {
  const items: string[] = [];
  
  itinerary.forEach(day => {
    if (Array.isArray(day.plan)) {
      day.plan.forEach((item: any) => {
        items.push(formatItineraryItem(item));
      });
    } else if (Array.isArray(day.activities)) {
      day.activities.forEach((item: any) => {
        items.push(formatItineraryItem(item));
      });
    } else if (typeof day === "object") {
      items.push(formatItineraryItem(day));
    }
  });

  return items;
}

function formatItineraryDay(day: any) {
  if (Array.isArray(day.plan)) return day.plan;
  if (Array.isArray(day.activities)) return day.activities;
  if (typeof day === "object" && !Array.isArray(day)) {
    const activities = day.activities || [];
    return Array.isArray(activities) ? activities : [activities];
  }
  return [];
}

function getDayTitle(dayKey: string, index: number) {
  if (dayKey.toLowerCase().startsWith("day")) return `${index + 1}. Gün`;
  if (dayKey === "theme") return "Tema";
  return `${index + 1}. Gün`;
}

export default function TripDetailsPage() {
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const theme = useTheme();

  useEffect(() => {
    async function loadTravelPlan() {
      if (!isLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        setError(null);
        const tripId = params.id as string;
        const travelPlan = await fetchTravelPlanById(tripId);
        setPlan(travelPlan);
      } catch (error) {
        console.error("Error loading travel plan:", error);
        setError("Seyahat planı yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTravelPlan();
  }, [user, isLoaded, router, params.id]);

  if (!isLoaded || isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !plan) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography color="error" variant="h6" sx={{ mb: 3 }}>
            {error || "Seyahat planı bulunamadı."}
          </Typography>
          <Button
            onClick={() => router.back()}
            variant="contained"
            startIcon={<ArrowLeft />}
            sx={{
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
              },
            }}
          >
            Geri Dön
          </Button>
        </Paper>
      </Container>
    );
  }

  // Format duration to always show "gün"
  const formattedDuration = plan?.days 
    ? `${plan.days} gün`
    : plan?.duration?.toLowerCase().includes("day")
    ? plan.duration.replace("days", "gün").replace("day", "gün")
    : "Belirtilmemiş";

  // Format budget with proper currency
  const formattedBudget = plan?.budget 
    ? typeof plan.budget === 'number'
      ? new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(plan.budget)
      : plan.budget
    : "Belirtilmemiş";

  // Format group type
  const formattedGroupType = plan?.groupType?.includes("Kişi")
    ? plan.groupType
    : plan?.numberOfPeople 
    ? `${plan.numberOfPeople} `
    : plan?.groupType || "Belirtilmemiş";

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            <Button
              onClick={() => router.back()}
              startIcon={<ArrowLeft />}
              sx={{
                mb: 3,
                color: "text.primary",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" },
              }}
            >
              Seyahatlerime Dön
            </Button>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {plan.destination}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <MapPin size={24} style={{ color: "#2563eb" }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Destinasyon
                        </Typography>
                        <Typography variant="h6">{plan.destination}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Calendar size={24} style={{ color: "#7c3aed" }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tarih
                        </Typography>
                        <Typography variant="h6">
                          {new Date(plan.startDate).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Clock size={24} style={{ color: "#2563eb" }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Süre
                        </Typography>
                        <Typography variant="h6">{formattedDuration}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Users size={24} style={{ color: "#7c3aed" }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Kiminle
                        </Typography>
                        <Typography variant="h6">{formattedGroupType}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Wallet size={24} style={{ color: "#2563eb" }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bütçe
                        </Typography>
                        <Typography variant="h6">
                          {formattedBudget}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Activity size={24} style={{ color: "#7c3aed" }} />
                      <Typography variant="h6">Planlanan Aktiviteler</Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {plan.itinerary && getItineraryItems(plan.itinerary).map((activity, index) => (
                        <Chip
                          key={index}
                          label={activity}
                          sx={{
                            backgroundColor: index % 2 === 0 ? "rgba(37, 99, 235, 0.1)" : "rgba(124, 58, 237, 0.1)",
                            color: index % 2 === 0 ? "#2563eb" : "#7c3aed",
                            borderRadius: "8px",
                            p: 0.5,
                            "&:hover": {
                              backgroundColor: index % 2 === 0 ? "rgba(37, 99, 235, 0.2)" : "rgba(124, 58, 237, 0.2)",
                            },
                          }}
                        />
                      ))}
                    </Box>

                    {plan.bestTimeToVisit && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            En İyi Ziyaret Zamanı
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {plan.bestTimeToVisit}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Detailed Activities Section */}
            {plan.itinerary && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                  <Activity size={28} style={{ color: "#2563eb" }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Gezi Programı
                  </Typography>
                </Box>

                {Object.entries(plan.itinerary)
                  .filter(([key, data]) => {
                    const activities = formatItineraryDay(data);
                    return activities.length > 0 && key.toLowerCase() !== "theme";
                  })
                  .map(([dayKey, dayData], dayIndex) => {
                    const activities = formatItineraryDay(dayData);

                    return (
                      <Box 
                        key={dayKey} 
                        sx={{ 
                          mb: 4, 
                          "&:last-child": { mb: 0 },
                          p: 3,
                          borderRadius: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                          border: "1px solid rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 3,
                            fontWeight: 600,
                            color: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Calendar size={24} style={{ color: "#7c3aed" }} />
                          {getDayTitle(dayKey, dayIndex)}
                        </Typography>

                        <Grid container spacing={3}>
                          {activities.map((activity: any, activityIndex: number) => (
                            <Grid item xs={12} md={6} key={activityIndex}>
                              <Card
                                elevation={0}
                                sx={{
                                  height: "100%",
                                  background: "rgba(255, 255, 255, 0.9)",
                                  borderRadius: "12px",
                                  border: "1px solid rgba(0, 0, 0, 0.1)",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  },
                                }}
                              >
                                {activity.imageUrl && !activity.imageUrl.includes("sample-image-url") && (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 200,
                                      backgroundImage: `url(${activity.imageUrl})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                      borderTopLeftRadius: "12px",
                                      borderTopRightRadius: "12px",
                                      position: "relative",
                                      "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "50%",
                                        background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                                        borderBottomLeftRadius: "12px",
                                        borderBottomRightRadius: "12px",
                                      },
                                    }}
                                  />
                                )}
                                <CardContent sx={{ p: 3 }}>
                                  <Stack spacing={2}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: 600,
                                          color: "#2563eb",
                                          flex: 1,
                                        }}
                                      >
                                        {activity.name || activity.placeName || activity.title}
                                      </Typography>
                                      {activity.time && (
                                        <Chip
                                          label={activity.time}
                                          size="small"
                                          sx={{
                                            backgroundColor: "rgba(124, 58, 237, 0.1)",
                                            color: "#7c3aed",
                                            fontWeight: 500,
                                            flexShrink: 0,
                                          }}
                                        />
                                      )}
                                    </Box>

                                    {(activity.description || activity.placeDetails) && (
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        {activity.description || activity.placeDetails}
                                      </Typography>
                                    )}

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                      {activity.timeEstimate && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Clock size={16} style={{ color: "#7c3aed" }} />
                                          <Typography variant="body2" color="text.secondary">
                                            {activity.timeEstimate}
                                          </Typography>
                                        </Box>
                                      )}

                                      {activity.ticketPricing && (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: "8px",
                                            backgroundColor: "rgba(37, 99, 235, 0.1)",
                                            color: "#2563eb",
                                            display: "inline-flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Wallet size={16} style={{ marginRight: "6px" }} />
                                          {activity.ticketPricing}
                                        </Typography>
                                      )}
                                    </Box>

                                    {activity.geoCoordinates && (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Navigation size={16} />}
                                        onClick={() => {
                                          const url = `https://www.google.com/maps/search/?api=1&query=${activity.geoCoordinates.latitude},${activity.geoCoordinates.longitude}`;
                                          window.open(url, "_blank");
                                        }}
                                        sx={{
                                          mt: 1,
                                          borderColor: "#2563eb",
                                          color: "#2563eb",
                                          "&:hover": {
                                            borderColor: "#1d4ed8",
                                            backgroundColor: "rgba(37, 99, 235, 0.1)",
                                          },
                                        }}
                                      >
                                        Haritada Göster
                                      </Button>
                                    )}
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    );
                  })}
              </Paper>
            )}

            {plan.hotelOptions && plan.hotelOptions.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                  <Hotel size={28} style={{ color: "#2563eb" }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Önerilen Oteller
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {plan.hotelOptions.map((hotel, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          background: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "12px",
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          },
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {hotel.imageUrl && !hotel.imageUrl.includes("sample-image-url") && (
                          <Box
                            sx={{
                              width: "100%",
                              height: 200,
                              backgroundImage: `url(${hotel.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderTopLeftRadius: "12px",
                              borderTopRightRadius: "12px",
                              position: "relative",
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "50%",
                                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                                borderBottomLeftRadius: "12px",
                                borderBottomRightRadius: "12px",
                              },
                            }}
                          />
                        )}
                        <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                          <Stack spacing={2}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: "#2563eb",
                              }}
                            >
                              {hotel.hotelName}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <MapPin size={18} style={{ color: "#7c3aed" }} />
                              <Typography variant="body2" color="text.secondary">
                                {hotel.hotelAddress}
                              </Typography>
                            </Box>

                            {hotel.rating && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Rating value={hotel.rating} precision={0.1} readOnly />
                                <Typography variant="body2" color="text.secondary">
                                  {hotel.rating.toFixed(1)}
                                </Typography>
                              </Box>
                            )}

                            <Typography
                              variant="body2"
                              sx={{
                                p: 1,
                                borderRadius: "8px",
                                backgroundColor: "rgba(37, 99, 235, 0.1)",
                                color: "#2563eb",
                                display: "inline-block",
                                alignSelf: "flex-start",
                              }}
                            >
                              {hotel.priceRange}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {hotel.description}
                            </Typography>

                            {hotel.geoCoordinates && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Navigation size={16} />}
                                onClick={() => {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${hotel.geoCoordinates.latitude},${hotel.geoCoordinates.longitude}`;
                                  window.open(url, "_blank");
                                }}
                                sx={{
                                  mt: 1,
                                  borderColor: "#2563eb",
                                  color: "#2563eb",
                                  "&:hover": {
                                    borderColor: "#1d4ed8",
                                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                                  },
                                }}
                              >
                                Haritada Göster
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
} 