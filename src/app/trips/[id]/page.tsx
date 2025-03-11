"use client";

import { useEffect, useState, useRef } from "react";
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
  Download,
  Globe2,
  FileCheck,
  Bus,
  Phone,
  AlertCircle,
  CreditCard,
  HeartPulse,
} from "lucide-react";
import { useThemeContext } from '../../context/ThemeContext';

import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { TravelPlan } from "../../types/travel";
import { fetchTravelPlanById } from "../../Services/travel-plans";
import { getWeatherForecast, WeatherData } from "../../Services/weather-service";
import dayjs from "dayjs";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function formatItineraryItem(item: any) {
  if (typeof item === "string") return item;
  if (item.title) return item.title;
  if (item.name) return item.name;
  if (item.placeName) return item.placeName;
  return "Aktivite";
}

function getItineraryItems(itinerary: any): string[] {
  const items: string[] = [];
  
  if (!itinerary) return items;

  if (Array.isArray(itinerary)) {
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
  } else if (typeof itinerary === "object") {
    Object.values(itinerary).forEach(day => {
      if (Array.isArray(day)) {
        day.forEach(item => {
          items.push(formatItineraryItem(item));
        });
      } else if (typeof day === "object" && day !== null) {
        const dayPlan = day as { plan?: any[], activities?: any[] };
        if (Array.isArray(dayPlan.plan)) {
          dayPlan.plan.forEach((item: any) => {
            items.push(formatItineraryItem(item));
          });
        } else if (Array.isArray(dayPlan.activities)) {
          dayPlan.activities.forEach((item: any) => {
            items.push(formatItineraryItem(item));
          });
        }
      }
    });
  }

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
  const [plan, setPlan] = useState<Partial<TravelPlan> | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const contentRef = useRef<HTMLDivElement>(null);

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
          const days = parseInt(travelPlan.duration?.split(' ')[0] || '1');
          const startDate = travelPlan.startDate as string;
          
          const weatherPromises = Array.from({ length: days }, (_, index) => {
            const date = dayjs(startDate, "DD/MM/YYYY").add(index, 'day');
            return getWeatherForecast(travelPlan.destination!, date.toDate());
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

  // PDF oluşturma fonksiyonu
  const generatePDF = async () => {
    if (!contentRef.current || !plan) return;

    try {
      setIsLoading(true);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const content = contentRef.current;

      // PDF sayfa boyutları
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // kenar boşluğu (mm)

      // Canvas oluştur
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight
      });

      // Canvas'ı PDF boyutuna uygun hale getir
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // İçeriği sayfalara böl
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // İlk sayfayı ekle
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

      // Gerekli sayıda yeni sayfa ekle
      while (heightLeft > pageHeight) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, 'PNG', margin, -(pageHeight * (pageNumber - 1)) + margin, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // PDF'i indir
      pdf.save(`${plan.destination}-seyahat-plani.pdf`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      setError('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

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
          ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'
          : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button
                onClick={() => router.back()}
                startIcon={<ArrowLeft />}
                sx={{
                  color: isDarkMode ? '#e5e7eb' : 'text.primary',
                  "&:hover": { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                }}
              >
                Seyahatlerime Dön
              </Button>

              <Button
                onClick={generatePDF}
                startIcon={<Download />}
                variant="contained"
                disabled={isLoading}
                sx={{
                  background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                  borderRadius: "12px",
                  px: 3,
                  py: 1,
                  "&:hover": {
                    background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                  },
                }}
              >
                {isLoading ? 'PDF Oluşturuluyor...' : 'PDF Olarak İndir'}
              </Button>
            </Box>

            <div ref={contentRef}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
                              color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                              color: isDarkMode ? '#f3f4f6' : 'text.primary',
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
                              color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                              color: isDarkMode ? '#f3f4f6' : 'text.primary',
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
                              color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                              color: isDarkMode ? '#f3f4f6' : 'text.primary',
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
                              color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                              color: isDarkMode ? '#f3f4f6' : 'text.primary',
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
                              color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                              color: isDarkMode ? '#f3f4f6' : 'text.primary',
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
                              color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                            color: isDarkMode ? '#f3f4f6' : 'text.primary',
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
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
                                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.6)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
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
                                      {activity.placeName || activity.activity}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isDarkMode ? '#e5e7eb' : 'text.secondary',
                                        mb: 2,
                                        minHeight: '3em',
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {activity.placeDetails || activity.description}
                                    </Typography>

                                    {/* Tavsiyeler */}
                                    {activity.tips && activity.tips.length > 0 && (
                                      <Box sx={{ mb: 2 }}>
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            color: isDarkMode ? '#93c5fd' : '#2563eb',
                                            fontWeight: 600,
                                            mb: 1,
                                          }}
                                        >
                                          Tavsiyeler
                                        </Typography>
                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                          {activity.tips.map((tip: string, index: number) => (
                                            <Typography
                                              key={index}
                                              component="li"
                                              variant="body2"
                                              sx={{
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                                fontSize: '0.875rem',
                                                mb: 0.5,
                                              }}
                                            >
                                              {tip}
                                            </Typography>
                                          ))}
                                        </Box>
                                      </Box>
                                    )}

                                    {/* Uyarılar */}
                                    {activity.warnings && activity.warnings.length > 0 && (
                                      <Box sx={{ mb: 2 }}>
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            color: theme.palette.warning.main,
                                            fontWeight: 600,
                                            mb: 1,
                                          }}
                                        >
                                          Dikkat Edilmesi Gerekenler
                                        </Typography>
                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                          {activity.warnings.map((warning: string, index: number) => (
                                            <Typography
                                              key={index}
                                              component="li"
                                              variant="body2"
                                              sx={{
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                                fontSize: '0.875rem',
                                                mb: 0.5,
                                              }}
                                            >
                                              {warning}
                                            </Typography>
                                          ))}
                                        </Box>
                                      </Box>
                                    )}

                                    {/* Alternatifler */}
                                    {activity.alternatives && activity.alternatives.length > 0 && (
                                      <Box sx={{ mb: 2 }}>
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            color: isDarkMode ? '#93c5fd' : '#2563eb',
                                            fontWeight: 600,
                                            mb: 1,
                                          }}
                                        >
                                          Alternatif Aktiviteler
                                        </Typography>
                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                          {activity.alternatives.map((alternative: string, index: number) => (
                                            <Typography
                                              key={index}
                                              component="li"
                                              variant="body2"
                                              sx={{
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                                fontSize: '0.875rem',
                                                mb: 0.5,
                                              }}
                                            >
                                              {alternative}
                                            </Typography>
                                          ))}
                                        </Box>
                                      </Box>
                                    )}

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
                                            {activity.time}
                                          </Typography>
                                        </Box>
                                      )}
                                      {(activity.cost || activity.ticketPricing) && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Wallet size={16} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                            }}
                                          >
                                            {activity.cost || activity.ticketPricing}
                                          </Typography>
                                        </Box>
                                      )}
                                      {activity.timeToTravel && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Navigation size={16} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                            }}
                                          >
                                            Ulaşım: {activity.timeToTravel}
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

              {/* Oteller İçin En İyi Ziyaret Zamanı */}
              {plan.hotelOptions && plan.hotelOptions.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
                              background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                              borderRadius: '12px',
                              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.6)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
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
                                color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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

              {/* Oteller İçin En İyi Ziyaret Zamanı */}
              {plan.hotelOptions && plan.hotelOptions.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: "12px",
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: isDarkMode 
                                ? '0 4px 20px rgba(0, 0, 0, 0.6)' 
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
                                    color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                                  color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: "12px",
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: isDarkMode 
                                ? '0 4px 20px rgba(0, 0, 0, 0.6)' 
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
                                  color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                                    color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                                    color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                                    color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                                    color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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
                                    color: isDarkMode ? '#e5e7eb' : 'text.secondary',
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

              {/* Kültürel Farklılıklar ve Öneriler */}
              {(plan.culturalDifferences || plan.lifestyleDifferences || plan.foodCultureDifferences || plan.socialNormsDifferences) && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  }}
                >
                  <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                    <Globe2 size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
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
                      Kültürel Farklılıklar ve Öneriler
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {plan.culturalDifferences && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Temel Kültürel Farklılıklar
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.culturalDifferences === 'string' ? plan.culturalDifferences : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {plan.lifestyleDifferences && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Günlük Yaşam Alışkanlıkları
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.lifestyleDifferences === 'string' ? plan.lifestyleDifferences : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {plan.foodCultureDifferences && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Yeme-İçme Kültürü
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.foodCultureDifferences === 'string' ? plan.foodCultureDifferences : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {plan.socialNormsDifferences && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Sosyal Davranış Normları
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.socialNormsDifferences === 'string' ? plan.socialNormsDifferences : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* Vize ve Seyahat Bilgileri */}
              {(plan.visaRequirements || plan.visaApplicationProcess || plan.visaFees || plan.travelDocumentChecklist) && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  }}
                >
                  <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                    <FileCheck size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
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
                      Vize ve Seyahat Bilgileri
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {plan.visaRequirements && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Vize Gereklilikleri
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.visaRequirements === 'string' ? plan.visaRequirements : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {plan.visaApplicationProcess && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Vize Başvuru Süreci
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.visaApplicationProcess === 'string' ? plan.visaApplicationProcess : ''}
                            </Typography>
                            {plan.visaFees && (
                              <Box sx={{ mt: 2, p: 2, bgcolor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 1 }}>
                                  Vize Ücreti:
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                                  {typeof plan.visaFees === 'string' ? plan.visaFees : ''}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {plan.travelDocumentChecklist && (
                      <Grid item xs={12}>
                        <Card
                          sx={{
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb', mb: 2 }}>
                              Seyahat Belgeleri Kontrol Listesi
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.travelDocumentChecklist === 'string' ? plan.travelDocumentChecklist : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* Yerel Yaşam Önerileri */}
              {(plan.localTransportationGuide || plan.emergencyContacts || plan.currencyAndPayment || plan.healthcareInfo || plan.communicationInfo) && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  }}
                >
                  <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                    <Globe2 size={28} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
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
                      Yerel Yaşam Önerileri
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {plan.localTransportationGuide && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Bus size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                                Yerel Ulaşım Rehberi
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.localTransportationGuide === 'string' ? plan.localTransportationGuide : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {plan.emergencyContacts && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Phone size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                                Acil Durum Numaraları
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.emergencyContacts === 'string' ? plan.emergencyContacts : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {plan.currencyAndPayment && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <CreditCard size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                                Para Birimi ve Ödeme
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.currencyAndPayment === 'string' ? plan.currencyAndPayment : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {plan.healthcareInfo && (
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: '100%',
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <HeartPulse size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                                Sağlık Hizmetleri
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.healthcareInfo === 'string' ? plan.healthcareInfo : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {plan.communicationInfo && (
                      <Grid item xs={12}>
                        <Card
                          sx={{
                            background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Phone size={20} style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }} />
                              <Typography variant="h6" sx={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                                İletişim ve İnternet
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }}>
                              {typeof plan.communicationInfo === 'string' ? plan.communicationInfo : ''}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}
            </div>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
} 