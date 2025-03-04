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
  CircularProgress,
  Alert,
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
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Sun,
} from "lucide-react";
import { useThemeContext } from '../../context/ThemeContext';

import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { TravelPlan } from "../../types/travel";
import { fetchTravelPlanById } from "../../Services/travel-plans";
import { getWeatherForecast, WeatherData } from "../../Services/weather-service";
import dayjs from "dayjs";

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
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();

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

        // Hava durumu verilerini yükle
        if (travelPlan.destination && travelPlan.startDate) {
          // Gün sayısını belirle
          const days = parseInt(travelPlan.duration?.split(' ')[0] || '1');
          
          // Başlangıç tarihinden itibaren tüm günler için hava durumu verilerini al
          const weatherPromises = Array.from({ length: days }, (_, index) => {
            const date = dayjs(travelPlan.startDate, "DD/MM/YYYY").add(index, 'day');
            return getWeatherForecast(travelPlan.destination, date.toDate());
          });

          const weatherResults = await Promise.all(weatherPromises);
          // Her günün ilk tahminini al ve birleştir
          const combinedWeatherData = weatherResults.map(result => result[0]);
          setWeatherData(combinedWeatherData);
        }
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
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || "Seyahat planı bulunamadı."}
        </Alert>
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

  // Hava durumu kartı bileşeni
  const WeatherCard = ({ weather }: { weather: WeatherData }) => (
    <Card
      elevation={0}
      sx={{
        p: 2,
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <img
          src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          style={{ width: 50, height: 50 }}
        />
        <Box>
          <Typography variant="h6" color="primary">
            {new Date(weather.date).toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {weather.description}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Thermometer size={20} style={{ color: "#2563eb" }} />
            <Typography variant="body2">
              {weather.temperature}°C
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Cloud size={20} style={{ color: "#7c3aed" }} />
            <Typography variant="body2">
              {weather.feelsLike}°C
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Droplets size={20} style={{ color: "#2563eb" }} />
            <Typography variant="body2">
              %{weather.humidity}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Wind size={20} style={{ color: "#7c3aed" }} />
            <Typography variant="body2">
              {weather.windSpeed} m/s
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)',
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
                background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
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
                        <Typography variant="subtitle2" 
                          sx={{ 
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                          }}
                        >
                          Konum
                        </Typography>
                        <Typography variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {plan.destination}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Calendar size={24} style={{ color: "#7c3aed" }} />
                      <Box>
                        <Typography variant="subtitle2" 
                          sx={{ 
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                          }}
                        >
                          Tarih
                        </Typography>
                        <Typography variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
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
                        <Typography variant="subtitle2" 
                          sx={{ 
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                          }}
                        >
                          Süre
                        </Typography>
                        <Typography variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {formattedDuration}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Users size={24} style={{ color: "#7c3aed" }} />
                      <Box>
                        <Typography variant="subtitle2" 
                          sx={{ 
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                          }}
                        >
                          Kiminle
                        </Typography>
                        <Typography variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {formattedGroupType}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Wallet size={24} style={{ color: "#2563eb" }} />
                      <Box>
                        <Typography variant="subtitle2" 
                          sx={{ 
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                          }}
                        >
                          Bütçe
                        </Typography>
                        <Typography variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {formattedBudget}
                        </Typography>
                      </Box>
                    </Box>

                    {plan.bestTimeToVisit && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                          }}
                        >
                          <Sun size={24} />
                          <Typography variant="body1" color="text.secondary">
                            {plan.bestTimeToVisit}
                          </Typography>
                        </Box>
                      </>
                    )}
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
                      <Typography variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Planlanan Aktiviteler
                      </Typography>
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
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Günlük Gezi Tavsiyeleri */}
            {plan.itinerary && Object.entries(plan.itinerary).length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                  <Activity size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Günlük Gezi Tavsiyeleri
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {Object.entries(plan.itinerary).map(([dayKey, day], dayIndex) => {
                    const activities = formatItineraryDay(day);
                    return (
                      <Box key={dayIndex}>
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 2,
                            fontWeight: 700,
                            color: isDarkMode ? '#93c5fd' : '#2563eb',
                            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            pb: 1,
                          }}
                        >
                          {getDayTitle(dayKey, dayIndex)}
                        </Typography>
                        <Grid container spacing={3}>
                          {activities.map((activity: any, activityIndex: number) => (
                            <Grid item xs={12} sm={6} md={4} key={activityIndex}>
                              <Card
                                sx={{
                                  height: '100%',
                                  background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                  borderRadius: '12px',
                                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                  },
                                }}
                              >
                                <CardContent>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      mb: 1,
                                      fontWeight: 600,
                                      color: isDarkMode ? '#93c5fd' : '#2563eb',
                                    }}
                                  >
                                    {activity.placeName || activity.name || activity.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                      mb: 2,
                                      minHeight: '3em',
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    {activity.description || "Açıklama bulunmuyor."}
                                  </Typography>
                                  <Stack spacing={1} sx={{ mt: 'auto' }}>
                                    {activity.time && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Clock size={16} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                            fontWeight: 500,
                                          }}
                                        >
                                          Saat: {activity.time}
                                        </Typography>
                                      </Box>
                                    )}
                                    {activity.timeRange && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Clock size={16} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                            fontWeight: 500,
                                          }}
                                        >
                                          {activity.timeRange.start} - {activity.timeRange.end}
                                        </Typography>
                                      </Box>
                                    )}
                                    {activity.budget && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Wallet size={16} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                          }}
                                        >
                                          {typeof activity.budget === 'number'
                                            ? new Intl.NumberFormat('tr-TR', {
                                                style: 'currency',
                                                currency: 'TRY',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                              }).format(activity.budget)
                                            : activity.budget}
                                        </Typography>
                                      </Box>
                                    )}
                                    {activity.bestTimeToVisit && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Sun size={16} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                          }}
                                        >
                                          {activity.bestTimeToVisit}
                                        </Typography>
                                      </Box>
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
                </Box>
              </Paper>
            )}

            {/* Aktiviteler İçin En İyi Ziyaret Zamanı */}
            {plan.itinerary && Object.entries(plan.itinerary).length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                  <Sun size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Aktiviteler İçin En İyi Ziyaret Zamanı
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {Object.entries(plan.itinerary).map(([dayKey, day], dayIndex) => {
                    const activities = formatItineraryDay(day);
                    return activities.map((activity: any, activityIndex: number) => (
                      activity.bestTimeToVisit && (
                        <Grid item xs={12} sm={6} md={3} key={`${dayIndex}-${activityIndex}`}>
                          <Card
                            sx={{
                              p: 2,
                              height: '100%',
                              background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '12px',
                              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                              },
                            }}
                          >
                            <Typography variant="subtitle1" 
                              sx={{ 
                                color: isDarkMode ? '#93c5fd' : '#2563eb',
                                fontWeight: 600,
                                fontSize: '1rem',
                                letterSpacing: '0.01em',
                                mb: 1
                              }}
                            >
                              {activity.placeName || activity.name || activity.title}
                            </Typography>
                            <Typography variant="body2" 
                              sx={{ 
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                fontSize: '0.875rem',
                                lineHeight: 1.5
                              }}
                            >
                              {activity.bestTimeToVisit}
                            </Typography>
                          </Card>
                        </Grid>
                      )
                    ));
                  })}
                </Grid>
              </Paper>
            )}

            {/* Oteller İçin En İyi Ziyaret Zamanı */}
            {plan.hotelOptions && plan.hotelOptions.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                  <Sun size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Oteller İçin En İyi Ziyaret Zamanı
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {plan.hotelOptions.map((hotel, index) => (
                    hotel.bestTimeToVisit && (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                          sx={{
                            p: 2,
                            height: '100%',
                            background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                            },
                          }}
                        >
                          <Typography variant="subtitle1" 
                            sx={{ 
                              color: isDarkMode ? '#93c5fd' : '#2563eb',
                              fontWeight: 600,
                              fontSize: '1rem',
                              letterSpacing: '0.01em',
                              mb: 1
                            }}
                          >
                            {hotel.hotelName}
                          </Typography>
                          <Typography variant="body2" 
                            sx={{ 
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                              fontSize: '0.875rem',
                              lineHeight: 1.5
                            }}
                          >
                            {hotel.bestTimeToVisit}
                          </Typography>
                        </Card>
                      </Grid>
                    )
                  ))}
                </Grid>
              </Paper>
            )}

            {plan.hotelOptions && plan.hotelOptions.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                  <Hotel size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      color: isDarkMode ? '#fff' : 'inherit',
                      background: isDarkMode 
                        ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)',
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
                          background: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                          borderRadius: "12px",
                          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isDarkMode 
                              ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
                              : '0 4px 20px rgba(0, 0, 0, 0.1)',
                          },
                          display: "flex",
                          flexDirection: "column",
                          backdropFilter: "blur(10px)",
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
                                background: isDarkMode
                                  ? "linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
                                  : "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
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
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                letterSpacing: '-0.01em',
                                color: isDarkMode ? '#93c5fd' : '#2563eb',
                              }}
                            >
                              {hotel.hotelName}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <MapPin size={18} style={{ color: isDarkMode ? '#a78bfa' : '#7c3aed' }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                {hotel.hotelAddress}
                              </Typography>
                            </Box>

                            {hotel.rating && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Rating 
                                  value={hotel.rating} 
                                  precision={0.1} 
                                  readOnly 
                                  sx={{
                                    '& .MuiRating-iconFilled': {
                                      color: isDarkMode ? '#93c5fd' : '#2563eb',
                                    },
                                    '& .MuiRating-iconEmpty': {
                                      color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                                    },
                                  }}
                                />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {hotel.rating.toFixed(1)}
                                </Typography>
                              </Box>
                            )}

                            <Typography
                              variant="body2"
                              sx={{
                                p: 1,
                                borderRadius: "8px",
                                backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                                color: isDarkMode ? '#93c5fd' : '#2563eb',
                                display: "inline-block",
                                alignSelf: "flex-start",
                                border: `1px solid ${isDarkMode ? 'rgba(37, 99, 235, 0.3)' : 'transparent'}`,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            >
                              {hotel.priceRange}
                            </Typography>

                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                flex: 1,
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                              }}
                            >
                              {hotel.description}
                            </Typography>

                            {hotel.geoCoordinates && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Navigation size={16} />}
                                onClick={() => {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${hotel.geoCoordinates?.latitude},${hotel.geoCoordinates?.longitude}`;
                                  window.open(url, "_blank");
                                }}
                                sx={{
                                  mt: 'auto',
                                  borderColor: isDarkMode ? '#93c5fd' : '#2563eb',
                                  color: isDarkMode ? '#93c5fd' : '#2563eb',
                                  "&:hover": {
                                    borderColor: isDarkMode ? '#60a5fa' : '#1d4ed8',
                                    backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
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

            {/* Hava Durumu Bölümü */}
            {weatherData.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 4,
                  background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                  <Cloud size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      color: isDarkMode ? '#fff' : 'inherit',
                      background: isDarkMode 
                        ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Hava Durumu
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {weatherData.map((weather, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 3,
                          height: "100%",
                          background: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                          borderRadius: "12px",
                          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isDarkMode 
                              ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
                              : '0 4px 20px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                          <Box
                            component="img"
                            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                            alt={weather.description}
                            sx={{
                              width: 50,
                              height: 50,
                              filter: isDarkMode ? 'brightness(1.2)' : 'none',
                            }}
                          />
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: isDarkMode ? '#93c5fd' : '#2563eb',
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                letterSpacing: '-0.01em',
                              }}
                            >
                              {new Date(weather.date).toLocaleDateString("tr-TR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                fontSize: '1rem',
                                lineHeight: 1.5,
                              }}
                            >
                              {weather.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Thermometer size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                {Math.round(weather.temperature)}°C
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Cloud size={20} style={{ color: isDarkMode ? '#a78bfa' : '#7c3aed' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                Hissedilen: {Math.round(weather.feelsLike)}°C
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Droplets size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                Nem: %{weather.humidity}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Wind size={20} style={{ color: isDarkMode ? '#a78bfa' : '#7c3aed' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                Rüzgar: {Math.round(weather.windSpeed)} km/s
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Cloud size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                Yağış: %{Math.round(weather.precipitationProbability || 0)}
                              </Typography>
                            </Box>
                          </Grid>
                          
                        </Grid>
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