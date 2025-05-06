"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  Grid,
  IconButton,
  Modal,
  Paper,
  Rating,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bus,
  Calendar,
  Camera,
  Clock,
  X as CloseIcon,
  Cloud,
  CreditCard,
  Download,
  Droplets,
  FileCheck,
  Globe2,
  HeartPulse,
  Hotel,
  MapPin,
  MessageSquare as MessageCircle,
  Navigation,
  Phone,
  Star,
  Star as StarOutline,
  Sun,
  Thermometer,
  Users,
  Wallet,
  Wind,
} from "lucide-react";

import TripComments from "../../components/trips/trip-comments";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { useThemeContext } from "../../context/ThemeContext";
import { fetchTravelPlanById, toggleRecommendation } from "../../Services/travel-plans";
import { getWeatherForecast, WeatherData } from "../../Services/weather-service";
import { TravelPlan } from "../../types/travel";

function formatItineraryItem(item: any) {
  // Eğer item bir string ise, doğrudan döndür
  if (typeof item === "string") return item;

  // Eğer item bir obje değilse veya null ise, boş string döndür
  if (typeof item !== "object" || item === null) return "";

  // Farklı olası alanları kontrol et
  if (item.title) return item.title;
  if (item.name) return item.name;
  if (item.placeName) return item.placeName;
  if (item.activity) return item.activity;
  if (item.description && typeof item.description === "string" && item.description.length < 50) {
    return item.description;
  }
  if (item.placeDetails && typeof item.placeDetails === "string" && item.placeDetails.length < 50) {
    return item.placeDetails;
  }

  // Hiçbir uygun alan bulunamazsa, "Aktivite" döndür
  return "Aktivite";
}

function getItineraryItems(itinerary: any): string[] {
  const items: string[] = [];
  console.log("Getting itinerary items from:", typeof itinerary, itinerary);

  if (!itinerary) return items;

  // Eğer itinerary bir string ise, JSON olarak parse etmeyi dene
  let itineraryData = itinerary;
  if (typeof itinerary === "string") {
    try {
      itineraryData = JSON.parse(itinerary);
      console.log("Parsed itinerary from string");
    } catch (error) {
      console.error("Error parsing itinerary string:", error);
      return items;
    }
  }

  // Eğer itinerary bir array ise
  if (Array.isArray(itineraryData)) {
    console.log("Itinerary is an array with length:", itineraryData.length);
    itineraryData.forEach(day => {
      // Eğer day.plan varsa ve array ise
      if (day.plan && Array.isArray(day.plan)) {
        day.plan.forEach((item: any) => {
          const formattedItem = formatItineraryItem(item);
          if (formattedItem && !items.includes(formattedItem)) {
            items.push(formattedItem);
          }
        });
      }
      // Eğer day.activities varsa ve array ise
      else if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach((item: any) => {
          const formattedItem = formatItineraryItem(item);
          if (formattedItem && !items.includes(formattedItem)) {
            items.push(formattedItem);
          }
        });
      }
      // Eğer day kendisi bir aktivite ise
      else if (typeof day === "object" && (day.placeName || day.activity || day.title || day.name)) {
        const formattedItem = formatItineraryItem(day);
        if (formattedItem && !items.includes(formattedItem)) {
          items.push(formattedItem);
        }
      }
    });
  }
  // Eğer itinerary bir obje ise
  else if (typeof itineraryData === "object" && itineraryData !== null) {
    console.log("Itinerary is an object with keys:", Object.keys(itineraryData));

    // Eğer itinerary.itinerary varsa ve array ise (nested format)
    if (itineraryData.itinerary && Array.isArray(itineraryData.itinerary)) {
      console.log("Found nested itinerary array");
      return getItineraryItems(itineraryData.itinerary);
    }

    // Günlük planlar için objeyi döngüye al
    Object.values(itineraryData).forEach(day => {
      // Eğer day bir array ise
      if (Array.isArray(day)) {
        day.forEach(item => {
          const formattedItem = formatItineraryItem(item);
          if (formattedItem && !items.includes(formattedItem)) {
            items.push(formattedItem);
          }
        });
      }
      // Eğer day bir obje ise
      else if (typeof day === "object" && day !== null) {
        const dayObj = day as Record<string, any>;
        // Eğer day.plan varsa ve array ise
        if (dayObj.plan && Array.isArray(dayObj.plan)) {
          dayObj.plan.forEach((item: any) => {
            const formattedItem = formatItineraryItem(item);
            if (formattedItem && !items.includes(formattedItem)) {
              items.push(formattedItem);
            }
          });
        }
        // Eğer day.activities varsa ve array ise
        else if (dayObj.activities && Array.isArray(dayObj.activities)) {
          dayObj.activities.forEach((item: any) => {
            const formattedItem = formatItineraryItem(item);
            if (formattedItem && !items.includes(formattedItem)) {
              items.push(formattedItem);
            }
          });
        }
        // Eğer day kendisi bir aktivite ise
        else if (dayObj.placeName || dayObj.activity || dayObj.title || dayObj.name) {
          const formattedItem = formatItineraryItem(dayObj);
          if (formattedItem && !items.includes(formattedItem)) {
            items.push(formattedItem);
          }
        }
      }
    });
  }

  console.log("Found itinerary items:", items);
  return items;
}

function formatItineraryDay(day: any) {
  // Eğer day bir array ise, doğrudan döndür
  if (Array.isArray(day)) return day;

  // Eğer day bir obje ise
  if (typeof day === "object" && day !== null) {
    // Eğer plan alanı varsa ve array ise
    if (Array.isArray(day.plan)) return day.plan;

    // Eğer activities alanı varsa ve array ise
    if (Array.isArray(day.activities)) return day.activities;

    // Eğer plan alanı varsa ama array değilse
    if (day.plan) return [day.plan];

    // Eğer activities alanı varsa ama array değilse
    if (day.activities) return [day.activities];

    // Eğer day kendisi bir aktivite ise (placeName, activity, placeDetails gibi alanlar varsa)
    if (day.placeName || day.activity || day.placeDetails || day.description) {
      return [day];
    }

    // Diğer durumlar için boş objeyi aktivite olarak döndür
    return [day];
  }

  // Eğer day bir string ise, onu bir aktivite olarak döndür
  if (typeof day === "string") {
    return [{ description: day }];
  }

  // Hiçbir koşul sağlanmazsa boş array döndür
  return [];
}

function getDayTitle(dayKey: string, index: number) {
  // Eğer dayKey bir gün bilgisi içeriyorsa (örn: "1. Gün: Pamukkale ve Travertenler Ziyareti")
  if (dayKey.includes("Gün:")) {
    return dayKey; // Doğrudan kullan
  }

  // Eğer dayKey "day" ile başlıyorsa (örn: "day1", "day2")
  if (dayKey.toLowerCase().startsWith("day")) {
    const dayNumber = dayKey.replace(/\D/g, ""); // Sadece sayıyı al
    if (dayNumber) {
      return `${dayNumber}. Gün`;
    }
    return `${index + 1}. Gün`;
  }

  // Eğer dayKey bir sayı ise (örn: "1", "2")
  if (!isNaN(Number(dayKey))) {
    return `${dayKey}. Gün`;
  }

  // Eğer dayKey "theme" ise
  if (dayKey === "theme") return "Tema";

  // Diğer durumlar için
  return `${index + 1}. Gün`;
}

export default function TripDetailsPage() {
  const [plan, setPlan] = useState<Partial<TravelPlan> | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const tripId = params?.id as string;
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<{ url: string; location?: string } | null>(null);

  // Sayfa yüklenirken id parametresini kontrol et
  console.log("Trip ID:", tripId);

  useEffect(() => {
    async function loadTravelPlan() {
      if (!isLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        setError(null);
        // Daha önce tanımladığımız tripId değişkenini kullan
        if (!tripId) {
          console.error("Trip ID is missing");
          setError("Seyahat planı ID'si bulunamadı.");
          return;
        }
        const travelPlan = await fetchTravelPlanById(tripId);
        setPlan(travelPlan);

        // Hava durumu verilerini yükle
        if (travelPlan.destination && travelPlan.startDate) {
          const days = parseInt(travelPlan.duration?.split(" ")[0] || "1");
          const startDate = travelPlan.startDate as string;

          console.log(`Fetching weather for ${days} days starting from ${startDate}`);

          // Tarih formatını kontrol et ve doğru şekilde parse et
          let parsedStartDate;

          // Tarih formatını kontrol et (30 Nisan 2025 veya DD/MM/YYYY)
          if (startDate.includes("/")) {
            // DD/MM/YYYY formatı
            parsedStartDate = dayjs(startDate, "DD/MM/YYYY");
          } else {
            // Türkçe tarih formatı (30 Nisan 2025)
            parsedStartDate = dayjs(startDate, "D MMMM YYYY", "tr");
          }

          // Geçerli bir tarih mi kontrol et
          if (!parsedStartDate.isValid()) {
            console.warn("Invalid date format:", startDate);
            parsedStartDate = dayjs(); // Bugünün tarihi
          }

          console.log(`Parsed start date: ${parsedStartDate.format("YYYY-MM-DD")}`);

          const weatherPromises = Array.from({ length: days }, (_, index) => {
            // Tarihi bir gün ileri al (zaman dilimi farkını düzeltmek için)
            const date = parsedStartDate.add(index, "day");
            console.log(`Fetching weather for day ${index + 1}: ${date.format("YYYY-MM-DD")}`);
            return getWeatherForecast(travelPlan.destination!, date.toDate());
          });

          const weatherResults = await Promise.all(weatherPromises);
          // Her günün ilk tahminini al ve birleştir
          const combinedWeatherData = weatherResults.map(result => result[0]);
          console.log(`Received weather data for ${combinedWeatherData.length} days`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoaded, router, params.id]);

  // PDF oluşturma fonksiyonu
  const generatePDF = async () => {
    if (!contentRef.current || !plan) return;

    try {
      setIsLoading(true);

      const pdf = new jsPDF("p", "mm", "a4");
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
        windowHeight: content.scrollHeight,
      });

      // Canvas'ı PDF boyutuna uygun hale getir
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");

      // İçeriği sayfalara böl
      let heightLeft = imgHeight;
      let pageNumber = 1;

      // İlk sayfayı ekle
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);

      // Gerekli sayıda yeni sayfa ekle
      while (heightLeft > pageHeight) {
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, "PNG", margin, -(pageHeight * (pageNumber - 1)) + margin, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // PDF'i indir
      pdf.save(`${plan.destination}-seyahat-plani.pdf`);
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      setError("PDF oluşturulurken bir hata oluştu.");
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
    ? typeof plan.budget === "number"
      ? new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(plan.budget)
      : plan.budget
    : "Belirtilmemiş";

  // Format group type
  const formattedGroupType = plan?.groupType?.includes("Kişi")
    ? plan.groupType
    : plan?.numberOfPeople
      ? `${plan.numberOfPeople} `
      : plan?.groupType || "Belirtilmemiş";

  // Note: The weather card component is now directly used in the JSX below

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: isDarkMode
          ? "linear-gradient(135deg, #111827 0%, #1f2937 100%)"
          : "linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Button
                onClick={() => router.back()}
                startIcon={<ArrowLeft />}
                sx={{
                  color: isDarkMode ? "#e5e7eb" : "text.primary",
                  "&:hover": { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" },
                }}
              >
                Seyahatlerime Dön
              </Button>

              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Öner Butonu */}
                <Button
                  onClick={async () => {
                    try {
                      const newRecommendedStatus = !(plan.isRecommended || false);
                      // Daha önce tanımladığımız tripId değişkenini kullan
                      if (!tripId) {
                        console.error("Trip ID is missing");
                        alert("Seyahat planı ID'si bulunamadı.");
                        return;
                      }
                      const success = await toggleRecommendation(tripId, newRecommendedStatus);

                      if (success) {
                        setPlan({
                          ...plan,
                          isRecommended: newRecommendedStatus,
                        });

                        alert(
                          newRecommendedStatus
                            ? "Seyahat planınız başarıyla önerilenlere eklendi."
                            : "Seyahat planınız önerilerden kaldırıldı."
                        );
                      } else {
                        alert("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
                      }
                    } catch (error) {
                      console.error("Öneri durumu değiştirme hatası:", error);
                      alert("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
                    }
                  }}
                  startIcon={plan.isRecommended ? <Star /> : <StarOutline />}
                  variant={plan.isRecommended ? "contained" : "outlined"}
                  sx={{
                    borderRadius: "12px",
                    px: 3,
                    py: 1,
                    ...(plan.isRecommended
                      ? {
                          background: "linear-gradient(45deg, #f59e0b, #d97706)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #d97706, #b45309)",
                          },
                        }
                      : {
                          borderColor: "#f59e0b",
                          color: "#f59e0b",
                          "&:hover": {
                            borderColor: "#d97706",
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                          },
                        }),
                  }}
                >
                  {plan.isRecommended ? "Önerildi" : "Öner"}
                </Button>

                {/* PDF İndir Butonu */}
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
                  {isLoading ? "PDF Oluşturuluyor..." : "PDF Olarak İndir"}
                </Button>
              </Box>
            </Box>

            <div ref={contentRef}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                }}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        letterSpacing: "-0.02em",
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
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: isDarkMode ? "#e5e7eb" : "text.secondary",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              letterSpacing: "0.01em",
                            }}
                          >
                            Konum
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              letterSpacing: "-0.01em",
                              color: isDarkMode ? "#f3f4f6" : "text.primary",
                            }}
                          >
                            {plan.destination}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Calendar size={24} style={{ color: "#7c3aed" }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: isDarkMode ? "#e5e7eb" : "text.secondary",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              letterSpacing: "0.01em",
                            }}
                          >
                            Tarih
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              letterSpacing: "-0.01em",
                              color: isDarkMode ? "#f3f4f6" : "text.primary",
                            }}
                          >
                            {(() => {
                              // Tarih formatını kontrol et ve doğru şekilde parse et
                              let date;
                              const startDate = plan.startDate as string;

                              // Tarih formatını kontrol et (30 Nisan 2025 veya DD/MM/YYYY)
                              if (startDate.includes("/")) {
                                // DD/MM/YYYY formatı
                                const [day, month, year] = startDate.split("/").map(Number);
                                date = new Date(year, month - 1, day); // Ay 0-11 arasında olduğu için -1
                              } else {
                                // Doğrudan parse etmeyi dene
                                date = new Date(startDate);
                              }

                              // Geçerli bir tarih mi kontrol et
                              if (isNaN(date.getTime())) {
                                return startDate; // Orijinal string'i göster
                              }

                              return date.toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              });
                            })()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Clock size={24} style={{ color: "#2563eb" }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: isDarkMode ? "#e5e7eb" : "text.secondary",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              letterSpacing: "0.01em",
                            }}
                          >
                            Süre
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              letterSpacing: "-0.01em",
                              color: isDarkMode ? "#f3f4f6" : "text.primary",
                            }}
                          >
                            {formattedDuration}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Users size={24} style={{ color: "#7c3aed" }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: isDarkMode ? "#e5e7eb" : "text.secondary",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              letterSpacing: "0.01em",
                            }}
                          >
                            Kiminle
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              letterSpacing: "-0.01em",
                              color: isDarkMode ? "#f3f4f6" : "text.primary",
                            }}
                          >
                            {formattedGroupType}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Wallet size={24} style={{ color: "#2563eb" }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: isDarkMode ? "#e5e7eb" : "text.secondary",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              letterSpacing: "0.01em",
                            }}
                          >
                            Bütçe
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              letterSpacing: "-0.01em",
                              color: isDarkMode ? "#f3f4f6" : "text.primary",
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
                              color: isDarkMode ? "#e5e7eb" : "text.secondary",
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
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.25rem",
                            letterSpacing: "-0.01em",
                            color: isDarkMode ? "#f3f4f6" : "text.primary",
                          }}
                        >
                          Planlanan Aktiviteler
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {(() => {
                          // Aktiviteleri al
                          let activities: string[] = [];

                          if (plan.itinerary) {
                            // Eğer itinerary bir string ise, parse etmeyi dene
                            if (typeof plan.itinerary === "string") {
                              try {
                                const parsedItinerary = JSON.parse(plan.itinerary);
                                activities = getItineraryItems(parsedItinerary);
                              } catch (error) {
                                console.error("Error parsing itinerary for activities:", error);
                              }
                            } else {
                              // Doğrudan obje olarak kullan
                              activities = getItineraryItems(plan.itinerary);
                            }
                          }

                          // Eğer aktivite yoksa, varsayılan aktiviteler göster
                          if (activities.length === 0 && plan.destination) {
                            // Destinasyona göre varsayılan aktiviteler
                            const defaultActivities = [
                              `${plan.destination} Turu`,
                              "Müze Ziyareti",
                              "Yerel Lezzetler",
                              "Tarihi Yerler",
                              "Doğa Yürüyüşü",
                              "Fotoğraf Çekimi",
                            ];
                            activities = defaultActivities;
                          }

                          return activities.map((activity, index) => (
                            <Chip
                              key={index}
                              label={activity}
                              sx={{
                                backgroundColor: index % 2 === 0 ? "rgba(37, 99, 235, 0.1)" : "rgba(124, 58, 237, 0.1)",
                                color: index % 2 === 0 ? "#2563eb" : "#7c3aed",
                                borderRadius: "8px",
                                p: 0.5,
                                m: 0.5,
                                "&:hover": {
                                  backgroundColor:
                                    index % 2 === 0 ? "rgba(37, 99, 235, 0.2)" : "rgba(124, 58, 237, 0.2)",
                                },
                              }}
                            />
                          ));
                        })()}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Günlük Gezi Tavsiyeleri */}
              {(() => {
                // Parse itinerary if it's a string
                let itineraryData = null;

                if (plan.itinerary) {
                  if (typeof plan.itinerary === "string") {
                    try {
                      itineraryData = JSON.parse(plan.itinerary);
                      console.log("itinerary parsed from string");
                    } catch (error) {
                      console.error("Error parsing itinerary:", error);
                      itineraryData = null;
                    }
                  } else if (typeof plan.itinerary === "object") {
                    itineraryData = plan.itinerary;
                  }
                }

                // Eğer itinerary verisi yoksa veya boşsa, gösterme
                if (!itineraryData) return null;

                // Mobil uygulamadan gelen itinerary formatını kontrol et
                let itineraryItems = [];

                console.log("Itinerary data type:", typeof itineraryData);
                if (itineraryData) {
                  console.log("Itinerary data keys:", Object.keys(itineraryData));
                }

                // Eğer itinerary bir array ise (mobil uygulamadan gelen format)
                if (Array.isArray(itineraryData)) {
                  console.log("Itinerary is an array with length:", itineraryData.length);
                  itineraryItems = itineraryData;
                }
                // Eğer itinerary.itinerary bir array ise (nested format)
                else if (itineraryData && itineraryData.itinerary && Array.isArray(itineraryData.itinerary)) {
                  console.log("Itinerary has nested itinerary array with length:", itineraryData.itinerary.length);
                  itineraryItems = itineraryData.itinerary;
                }
                // Eğer itinerary bir obje ise ve içinde günlük planlar varsa (mobil uygulamadan gelen yeni format)
                else if (
                  typeof itineraryData === "object" &&
                  !Array.isArray(itineraryData) &&
                  Object.keys(itineraryData).some(key => key.includes("Gün"))
                ) {
                  console.log("Itinerary is an object with day keys");
                  // Günleri sıralamak için
                  const sortedKeys = Object.keys(itineraryData).sort((a, b) => {
                    // Gün numaralarını çıkar
                    const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
                    const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
                    return aNum - bNum;
                  });

                  itineraryItems = sortedKeys.map(key => {
                    const dayData = itineraryData[key];
                    return {
                      day: key,
                      plan: Array.isArray(dayData) ? dayData : dayData.plan || [],
                    };
                  });
                }
                // Eğer itinerary bir obje ise (eski format)
                else if (typeof itineraryData === "object" && !Array.isArray(itineraryData)) {
                  console.log("Itinerary is a generic object");
                  itineraryItems = Object.entries(itineraryData).map(([key, value]) => ({
                    day: key,
                    plan: Array.isArray(value) ? value : [value],
                  }));
                }

                // Eğer itinerary öğeleri yoksa veya boşsa, gösterme
                if (!itineraryItems || itineraryItems.length === 0) return null;

                return (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      mt: 4,
                      background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "16px",
                      border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                    }}
                  >
                    <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                      <Activity size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "1.75rem", md: "2rem" },
                          letterSpacing: "-0.02em",
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
                      {itineraryItems.map((dayItem: any, dayIndex: number) => {
                        // Günün başlığını ve aktivitelerini belirle
                        let dayTitle = "";
                        let activities = [];

                        // Mobil uygulamadan gelen format (day ve plan alanları)
                        if (dayItem.day && dayItem.plan) {
                          dayTitle = dayItem.day;
                          activities = Array.isArray(dayItem.plan) ? dayItem.plan : [dayItem.plan];
                        }
                        // Eski format (key-value çifti)
                        else if (dayItem[0] && dayItem[1]) {
                          dayTitle = dayItem[0];
                          activities = formatItineraryDay(dayItem[1]);
                        }
                        // Diğer formatlar - mobil uygulamadan gelen yeni format
                        else {
                          // Eğer dayItem içinde day bilgisi varsa
                          if (typeof dayItem === "object" && "day" in dayItem) {
                            dayTitle = dayItem.day;

                            // Eğer plan alanı varsa
                            if ("plan" in dayItem && Array.isArray(dayItem.plan)) {
                              activities = dayItem.plan;
                            }
                            // Eğer activities alanı varsa
                            else if ("activities" in dayItem && Array.isArray(dayItem.activities)) {
                              activities = dayItem.activities;
                            }
                            // Diğer durumlar
                            else {
                              activities = [];
                            }
                          }
                          // Eğer dayItem kendisi bir aktivite ise
                          else if (
                            typeof dayItem === "object" &&
                            ("placeName" in dayItem || "activity" in dayItem || "placeDetails" in dayItem)
                          ) {
                            dayTitle = `${dayIndex + 1}. Gün`;
                            activities = [dayItem];
                          }
                          // Son çare
                          else {
                            dayTitle = `${dayIndex + 1}. Gün`;
                            activities = Array.isArray(dayItem) ? dayItem : [dayItem];
                          }
                        }

                        return (
                          <Box key={dayIndex}>
                            <Typography
                              variant="h5"
                              sx={{
                                mb: 2,
                                fontWeight: 700,
                                color: isDarkMode ? "#93c5fd" : "#2563eb",
                                borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                pb: 1,
                              }}
                            >
                              {getDayTitle(dayTitle, dayIndex)}
                            </Typography>
                            <Grid container spacing={3}>
                              {activities.map((activity: any, activityIndex: number) => (
                                <Grid item xs={12} sm={6} md={4} key={activityIndex}>
                                  <Card
                                    sx={{
                                      height: "100%",
                                      background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                      borderRadius: "12px",
                                      border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: isDarkMode
                                          ? "0 4px 20px rgba(0, 0, 0, 0.6)"
                                          : "0 4px 20px rgba(0, 0, 0, 0.1)",
                                      },
                                    }}
                                  >
                                    <CardContent>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          mb: 1,
                                          fontWeight: 600,
                                          color: isDarkMode ? "#93c5fd" : "#2563eb",
                                        }}
                                      >
                                        {(() => {
                                          // Aktivite başlığını belirle
                                          if (activity.placeName) return activity.placeName;
                                          if (activity.activity) return activity.activity;
                                          if (activity.title) return activity.title;
                                          if (activity.name) return activity.name;
                                          return "Aktivite";
                                        })()}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                          mb: 2,
                                          minHeight: "3em",
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        {(() => {
                                          // Aktivite detaylarını belirle
                                          if (activity.placeDetails) return activity.placeDetails;
                                          if (activity.description) return activity.description;
                                          if (activity.details) return activity.details;
                                          if (activity.info) return activity.info;
                                          return "";
                                        })()}
                                      </Typography>

                                      {/* Tavsiyeler */}
                                      {activity.tips && activity.tips.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                          <Typography
                                            variant="subtitle2"
                                            sx={{
                                              color: isDarkMode ? "#93c5fd" : "#2563eb",
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
                                                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                                  fontSize: "0.875rem",
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
                                                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                                  fontSize: "0.875rem",
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
                                              color: isDarkMode ? "#93c5fd" : "#2563eb",
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
                                                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                                  fontSize: "0.875rem",
                                                  mb: 0.5,
                                                }}
                                              >
                                                {alternative}
                                              </Typography>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}

                                      <Stack spacing={1} sx={{ mt: "auto" }}>
                                        {activity.time && (
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Clock size={16} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                                fontWeight: 500,
                                              }}
                                            >
                                              {activity.time}
                                            </Typography>
                                          </Box>
                                        )}
                                        {(activity.cost || activity.ticketPricing) && (
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Wallet size={16} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                              }}
                                            >
                                              {activity.cost || activity.ticketPricing}
                                            </Typography>
                                          </Box>
                                        )}
                                        {activity.timeToTravel && (
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Navigation
                                              size={16}
                                              style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}
                                            />
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
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
                );
              })()}

              {/* Oteller İçin En İyi Ziyaret Zamanı */}
              {(() => {
                // Parse hotelOptions if it's a string
                let hotelOptionsArray = [];

                if (plan.hotelOptions) {
                  if (typeof plan.hotelOptions === "string") {
                    try {
                      hotelOptionsArray = JSON.parse(plan.hotelOptions);
                      console.log("hotelOptions parsed from string");
                    } catch (error) {
                      console.error("Error parsing hotelOptions:", error);
                      hotelOptionsArray = [];
                    }
                  } else if (Array.isArray(plan.hotelOptions)) {
                    hotelOptionsArray = plan.hotelOptions;
                  }
                }

                if (hotelOptionsArray.length > 0) {
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mt: 4,
                        background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      }}
                    >
                      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                        <Sun size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.75rem", md: "2rem" },
                            letterSpacing: "-0.02em",
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
                        {hotelOptionsArray.map(
                          (hotel: any, index: number) =>
                            hotel.bestTimeToVisit && (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                  sx={{
                                    p: 2,
                                    height: "100%",
                                    background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "12px",
                                    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      transform: "translateY(-4px)",
                                      boxShadow: isDarkMode
                                        ? "0 4px 20px rgba(0, 0, 0, 0.6)"
                                        : "0 4px 20px rgba(0, 0, 0, 0.1)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      color: isDarkMode ? "#93c5fd" : "#2563eb",
                                      fontWeight: 600,
                                      fontSize: "1rem",
                                      letterSpacing: "0.01em",
                                      mb: 1,
                                    }}
                                  >
                                    {hotel.hotelName}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                      fontSize: "0.875rem",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {hotel.bestTimeToVisit}
                                  </Typography>
                                </Card>
                              </Grid>
                            )
                        )}
                      </Grid>
                    </Paper>
                  );
                }
                return null;
              })()}

              {/* Önerilen Oteller */}
              {(() => {
                // Parse hotelOptions if it's a string
                let hotelOptionsArray = [];

                if (plan.hotelOptions) {
                  if (typeof plan.hotelOptions === "string") {
                    try {
                      hotelOptionsArray = JSON.parse(plan.hotelOptions);
                      console.log("hotelOptions parsed from string");
                    } catch (error) {
                      console.error("Error parsing hotelOptions:", error);
                      hotelOptionsArray = [];
                    }
                  } else if (Array.isArray(plan.hotelOptions)) {
                    hotelOptionsArray = plan.hotelOptions;
                  }
                }

                if (hotelOptionsArray.length > 0) {
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mt: 4,
                        background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      }}
                    >
                      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                        <Hotel size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.75rem", md: "2rem" },
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            color: isDarkMode ? "#fff" : "inherit",
                            background: isDarkMode
                              ? "linear-gradient(45deg, #93c5fd, #a78bfa)"
                              : "linear-gradient(45deg, #2563eb, #7c3aed)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Önerilen Oteller
                        </Typography>
                      </Box>

                      <Grid container spacing={3}>
                        {hotelOptionsArray.map((hotel: any, index: number) => (
                          <Grid item xs={12} md={6} lg={4} key={index}>
                            <Card
                              elevation={0}
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: isDarkMode
                                    ? "0 4px 20px rgba(0, 0, 0, 0.6)"
                                    : "0 4px 20px rgba(0, 0, 0, 0.1)",
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
                                      fontSize: "1.25rem",
                                      letterSpacing: "-0.01em",
                                      color: isDarkMode ? "#93c5fd" : "#2563eb",
                                    }}
                                  >
                                    {hotel.hotelName}
                                  </Typography>

                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <MapPin size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                        fontSize: "0.875rem",
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
                                          "& .MuiRating-iconFilled": {
                                            color: isDarkMode ? "#93c5fd" : "#2563eb",
                                          },
                                          "& .MuiRating-iconEmpty": {
                                            color: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                                          },
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                                          fontSize: "0.875rem",
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
                                      backgroundColor: isDarkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
                                      color: isDarkMode ? "#93c5fd" : "#2563eb",
                                      display: "inline-block",
                                      alignSelf: "flex-start",
                                      border: `1px solid ${isDarkMode ? "rgba(37, 99, 235, 0.3)" : "transparent"}`,
                                      fontSize: "0.875rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {hotel.priceRange}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                      flex: 1,
                                      fontSize: "0.875rem",
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
                                        mt: "auto",
                                        borderColor: isDarkMode ? "#93c5fd" : "#2563eb",
                                        color: isDarkMode ? "#93c5fd" : "#2563eb",
                                        "&:hover": {
                                          borderColor: isDarkMode ? "#60a5fa" : "#1d4ed8",
                                          backgroundColor: isDarkMode
                                            ? "rgba(37, 99, 235, 0.2)"
                                            : "rgba(37, 99, 235, 0.1)",
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
                  );
                }
                return null;
              })()}

              {/* Hava Durumu Bölümü */}
              {weatherData.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                  }}
                >
                  <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                    <Cloud size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.75rem", md: "2rem" },
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        color: isDarkMode ? "#fff" : "inherit",
                        background: isDarkMode
                          ? "linear-gradient(45deg, #93c5fd, #a78bfa)"
                          : "linear-gradient(45deg, #2563eb, #7c3aed)",
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
                            background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                            borderRadius: "12px",
                            border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: isDarkMode ? "0 4px 20px rgba(0, 0, 0, 0.6)" : "0 4px 20px rgba(0, 0, 0, 0.1)",
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
                                filter: isDarkMode ? "brightness(1.2)" : "none",
                              }}
                            />
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: isDarkMode ? "#93c5fd" : "#2563eb",
                                  fontWeight: 700,
                                  fontSize: "1.25rem",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {(() => {
                                  // Tarih formatını kontrol et (DD/MM/YYYY veya YYYY-MM-DD)
                                  let date;
                                  if (weather.date.includes("/")) {
                                    // DD/MM/YYYY formatı
                                    const [day, month, year] = weather.date.split("/").map(Number);
                                    date = new Date(year, month - 1, day); // Ay 0-11 arasında olduğu için -1
                                  } else {
                                    // YYYY-MM-DD formatı (API'den gelen)
                                    date = new Date(weather.date);
                                  }

                                  return date.toLocaleDateString("tr-TR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                  });
                                })()}
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                  fontSize: "1rem",
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
                                <Thermometer size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {Math.round(weather.temperature)}°C
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Cloud size={20} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed" }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  Hissedilen: {Math.round(weather.feelsLike)}°C
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Droplets size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  Nem: %{weather.humidity}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Wind size={20} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed" }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  Rüzgar: {Math.round(weather.windSpeed)} km/s
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Cloud size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                    fontSize: "0.875rem",
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
              {(plan.culturalDifferences ||
                plan.lifestyleDifferences ||
                plan.foodCultureDifferences ||
                plan.socialNormsDifferences) && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 4,
                    background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                  }}
                >
                  <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                    <Globe2 size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.75rem", md: "2rem" },
                        letterSpacing: "-0.02em",
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
                    {(() => {
                      // Kültürel farklılıklar verilerini hazırla
                      let culturalData: any = {};

                      // Eğer culturalDifferences bir string ise, JSON olarak parse etmeyi dene
                      if (plan.culturalDifferences && typeof plan.culturalDifferences === "string") {
                        try {
                          const parsedData = JSON.parse(plan.culturalDifferences);
                          if (parsedData && typeof parsedData === "object") {
                            culturalData = parsedData;
                            console.log("culturalDifferences JSON olarak parse edildi");
                          } else {
                            // Eğer parse edilen veri bir obje değilse, temel alan olarak kullan
                            culturalData.culturalDifferences = plan.culturalDifferences;
                          }
                        } catch (error) {
                          console.error("culturalDifferences parse hatası:", error);
                          // Parse edilemezse, doğrudan string olarak kullan
                          culturalData.culturalDifferences = plan.culturalDifferences;
                        }
                      } else if (plan.culturalDifferences && typeof plan.culturalDifferences === "object") {
                        // Zaten obje ise doğrudan kullan
                        culturalData = plan.culturalDifferences;
                      }

                      // Diğer kültürel alanları da ekle (eğer culturalData içinde yoksa)
                      if (plan.lifestyleDifferences && !culturalData.lifestyleDifferences) {
                        culturalData.lifestyleDifferences = plan.lifestyleDifferences;
                      }

                      if (plan.foodCultureDifferences && !culturalData.foodCultureDifferences) {
                        culturalData.foodCultureDifferences = plan.foodCultureDifferences;
                      }

                      if (plan.socialNormsDifferences && !culturalData.socialNormsDifferences) {
                        culturalData.socialNormsDifferences = plan.socialNormsDifferences;
                      }

                      // Kültürel farklılıklar kartlarını oluştur
                      const cards = [];

                      // Temel Kültürel Farklılıklar
                      if (culturalData.culturalDifferences) {
                        cards.push(
                          <Grid item xs={12} md={6} key="culturalDifferences">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Temel Kültürel Farklılıklar
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.culturalDifferences === "string"
                                    ? culturalData.culturalDifferences
                                    : JSON.stringify(culturalData.culturalDifferences, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Yaşam Tarzı Farklılıkları
                      if (culturalData.lifestyleDifferences) {
                        cards.push(
                          <Grid item xs={12} md={6} key="lifestyleDifferences">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Günlük Yaşam Alışkanlıkları
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.lifestyleDifferences === "string"
                                    ? culturalData.lifestyleDifferences
                                    : JSON.stringify(culturalData.lifestyleDifferences, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Yeme-İçme Kültürü
                      if (culturalData.foodCultureDifferences) {
                        cards.push(
                          <Grid item xs={12} md={6} key="foodCultureDifferences">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Yeme-İçme Kültürü
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.foodCultureDifferences === "string"
                                    ? culturalData.foodCultureDifferences
                                    : JSON.stringify(culturalData.foodCultureDifferences, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Sosyal Davranış Normları
                      if (culturalData.socialNormsDifferences) {
                        cards.push(
                          <Grid item xs={12} md={6} key="socialNormsDifferences">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Sosyal Davranış Normları
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.socialNormsDifferences === "string"
                                    ? culturalData.socialNormsDifferences
                                    : JSON.stringify(culturalData.socialNormsDifferences, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Dini ve Kültürel Hassasiyetler
                      if (culturalData.religiousAndCulturalSensitivities) {
                        cards.push(
                          <Grid item xs={12} md={6} key="religiousAndCulturalSensitivities">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Dini ve Kültürel Hassasiyetler
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.religiousAndCulturalSensitivities === "string"
                                    ? culturalData.religiousAndCulturalSensitivities
                                    : JSON.stringify(culturalData.religiousAndCulturalSensitivities, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Yerel Gelenekler ve Görenekler
                      if (culturalData.localTraditionsAndCustoms) {
                        cards.push(
                          <Grid item xs={12} md={6} key="localTraditionsAndCustoms">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Yerel Gelenekler ve Görenekler
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.localTraditionsAndCustoms === "string"
                                    ? culturalData.localTraditionsAndCustoms
                                    : JSON.stringify(culturalData.localTraditionsAndCustoms, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Kültürel Etkinlikler ve Festivaller
                      if (culturalData.culturalEventsAndFestivals) {
                        cards.push(
                          <Grid item xs={12} md={6} key="culturalEventsAndFestivals">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Kültürel Etkinlikler ve Festivaller
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.culturalEventsAndFestivals === "string"
                                    ? culturalData.culturalEventsAndFestivals
                                    : JSON.stringify(culturalData.culturalEventsAndFestivals, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Yerel Halkla İletişim Önerileri
                      if (culturalData.localCommunicationTips) {
                        cards.push(
                          <Grid item xs={12} md={6} key="localCommunicationTips">
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Yerel Halkla İletişim Önerileri
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                >
                                  {typeof culturalData.localCommunicationTips === "string"
                                    ? culturalData.localCommunicationTips
                                    : JSON.stringify(culturalData.localCommunicationTips, null, 2)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      }

                      // Diğer kültürel alanlar
                      Object.entries(culturalData)
                        .filter(
                          ([key]) =>
                            ![
                              "culturalDifferences",
                              "lifestyleDifferences",
                              "foodCultureDifferences",
                              "socialNormsDifferences",
                              "religiousAndCulturalSensitivities",
                              "localTraditionsAndCustoms",
                              "culturalEventsAndFestivals",
                              "localCommunicationTips",
                            ].includes(key)
                        )
                        .forEach(([key, value]) => {
                          if (value) {
                            cards.push(
                              <Grid item xs={12} md={6} key={key}>
                                <Card
                                  sx={{
                                    height: "100%",
                                    background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "12px",
                                    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                  }}
                                >
                                  <CardContent>
                                    <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", whiteSpace: "pre-wrap" }}
                                    >
                                      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          }
                        });

                      return cards;
                    })()}
                  </Grid>
                </Paper>
              )}

              {/* Vize ve Seyahat Bilgileri */}
              {(() => {
                // visaInfo'yu parse et
                let visaInfo = null;

                if (plan.visaInfo && typeof plan.visaInfo === "string") {
                  try {
                    visaInfo = JSON.parse(plan.visaInfo);
                  } catch (error) {
                    console.error("Error parsing visaInfo:", error);
                  }
                } else if (plan.visaInfo && typeof plan.visaInfo === "object") {
                  visaInfo = plan.visaInfo;
                }

                // Eski format için destek
                const hasOldFormatVisa =
                  plan.visaRequirements || plan.visaApplicationProcess || plan.visaFees || plan.travelDocumentChecklist;

                if (visaInfo || hasOldFormatVisa) {
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mt: 4,
                        background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      }}
                    >
                      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                        <FileCheck size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.75rem", md: "2rem" },
                            letterSpacing: "-0.02em",
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
                        {/* Yeni format - visaInfo objesi */}
                        {visaInfo && visaInfo.visaRequirement && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Vize Gereklilikleri
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {visaInfo.visaRequirement}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {visaInfo && visaInfo.visaApplicationProcess && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Vize Başvuru Süreci
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {visaInfo.visaApplicationProcess}
                                </Typography>
                                {visaInfo.visaFee && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: isDarkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
                                      borderRadius: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 1 }}
                                    >
                                      Vize Ücreti:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}
                                    >
                                      {visaInfo.visaFee}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {visaInfo && visaInfo.requiredDocuments && (
                          <Grid item xs={12}>
                            <Card
                              sx={{
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Gerekli Belgeler
                                </Typography>
                                {Array.isArray(visaInfo.requiredDocuments) ? (
                                  <Box component="ul" sx={{ pl: 2 }}>
                                    {visaInfo.requiredDocuments.map((item: string, index: number) => (
                                      <Typography
                                        key={index}
                                        component="li"
                                        variant="body2"
                                        sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", mb: 1 }}
                                      >
                                        {item}
                                      </Typography>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                    {visaInfo.requiredDocuments}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Eski format için destek */}
                        {!visaInfo && plan.visaRequirements && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Vize Gereklilikleri
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {typeof plan.visaRequirements === "string" ? plan.visaRequirements : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {!visaInfo && plan.visaApplicationProcess && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Vize Başvuru Süreci
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {typeof plan.visaApplicationProcess === "string" ? plan.visaApplicationProcess : ""}
                                </Typography>
                                {plan.visaFees && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: isDarkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
                                      borderRadius: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 1 }}
                                    >
                                      Vize Ücreti:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}
                                    >
                                      {typeof plan.visaFees === "string" ? plan.visaFees : ""}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {!visaInfo && plan.travelDocumentChecklist && (
                          <Grid item xs={12}>
                            <Card
                              sx={{
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                  Seyahat Belgeleri Kontrol Listesi
                                </Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {typeof plan.travelDocumentChecklist === "string" ? plan.travelDocumentChecklist : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  );
                }

                return null;
              })()}

              {/* Yerel Yaşam Önerileri */}
              {(() => {
                // localTips'i kontrol et ve doğru formatı bul
                let localTipsData = null;
                let hasLocalTipsData = false;

                // String olarak geldiyse parse et
                if (plan.localTips && typeof plan.localTips === "string") {
                  try {
                    localTipsData = JSON.parse(plan.localTips);
                    console.log("localTips JSON olarak parse edildi");
                    hasLocalTipsData = true;
                  } catch (error) {
                    console.error("localTips parse hatası:", error);
                    // String olarak kullan
                    localTipsData = { localTips: plan.localTips };
                    hasLocalTipsData = true;
                  }
                }
                // Direkt obje olarak geldiyse kullan
                else if (plan.localTips && typeof plan.localTips === "object") {
                  localTipsData = plan.localTips;
                  hasLocalTipsData = true;
                }

                // Eski format için destek
                const hasLocalTransportationGuide =
                  plan.localTransportationGuide || (localTipsData && localTipsData.localTransportationGuide);
                const hasEmergencyContacts =
                  plan.emergencyContacts || (localTipsData && localTipsData.emergencyContacts);
                const hasCurrencyAndPayment =
                  plan.currencyAndPayment || (localTipsData && localTipsData.currencyAndPayment);
                const hasHealthcareInfo = plan.healthcareInfo || (localTipsData && localTipsData.healthcareInfo);
                const hasCommunicationInfo =
                  plan.communicationInfo || (localTipsData && localTipsData.communicationInfo);
                const hasLocalCuisineAndFoodTips =
                  plan.localCuisineAndFoodTips || (localTipsData && localTipsData.localCuisineAndFoodTips);
                const hasSafetyTips = plan.safetyTips || (localTipsData && localTipsData.safetyTips);
                const hasLocalLanguageAndCommunicationTips =
                  plan.localLanguageAndCommunicationTips ||
                  (localTipsData && localTipsData.localLanguageAndCommunicationTips);

                // Herhangi bir yerel ipucu verisi varsa bölümü göster
                if (
                  hasLocalTipsData ||
                  hasLocalTransportationGuide ||
                  hasEmergencyContacts ||
                  hasCurrencyAndPayment ||
                  hasHealthcareInfo ||
                  hasCommunicationInfo ||
                  hasLocalCuisineAndFoodTips ||
                  hasSafetyTips ||
                  hasLocalLanguageAndCommunicationTips
                ) {
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mt: 4,
                        background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      }}
                    >
                      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                        <Globe2 size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.75rem", md: "2rem" },
                            letterSpacing: "-0.02em",
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
                        {/* Yerel Ulaşım Rehberi - Obje içinden veya direkt */}
                        {hasLocalTransportationGuide && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <Bus size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Yerel Ulaşım Rehberi
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.localTransportationGuide
                                    ? localTipsData.localTransportationGuide
                                    : typeof plan.localTransportationGuide === "string"
                                      ? plan.localTransportationGuide
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Acil Durum Numaraları - Obje içinden veya direkt */}
                        {hasEmergencyContacts && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <Phone size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Acil Durum Numaraları
                                  </Typography>
                                </Box>
                                {localTipsData && localTipsData.emergencyContacts ? (
                                  typeof localTipsData.emergencyContacts === "string" ? (
                                    <Typography
                                      variant="body2"
                                      sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}
                                    >
                                      {localTipsData.emergencyContacts}
                                    </Typography>
                                  ) : (
                                    <Box>
                                      {Object.entries(localTipsData.emergencyContacts).map(([key, value]) => (
                                        <Box key={key} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", fontWeight: 500 }}
                                          >
                                            {key}:
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}
                                          >
                                            {String(value)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  )
                                ) : (
                                  <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                    {typeof plan.emergencyContacts === "string" ? plan.emergencyContacts : ""}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Para Birimi ve Ödeme - Obje içinden veya direkt */}
                        {hasCurrencyAndPayment && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <CreditCard size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Para Birimi ve Ödeme
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.currencyAndPayment
                                    ? localTipsData.currencyAndPayment
                                    : typeof plan.currencyAndPayment === "string"
                                      ? plan.currencyAndPayment
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Sağlık Hizmetleri - Obje içinden veya direkt */}
                        {hasHealthcareInfo && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <HeartPulse size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Sağlık Hizmetleri
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.healthcareInfo
                                    ? localTipsData.healthcareInfo
                                    : typeof plan.healthcareInfo === "string"
                                      ? plan.healthcareInfo
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* İletişim ve İnternet - Obje içinden veya direkt */}
                        {hasCommunicationInfo && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <Phone size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    İletişim ve İnternet
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.communicationInfo
                                    ? localTipsData.communicationInfo
                                    : typeof plan.communicationInfo === "string"
                                      ? plan.communicationInfo
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Yerel Mutfak ve Yemek Önerileri */}
                        {hasLocalCuisineAndFoodTips && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <CreditCard size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Yerel Mutfak ve Yemek Önerileri
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.localCuisineAndFoodTips
                                    ? localTipsData.localCuisineAndFoodTips
                                    : typeof plan.localCuisineAndFoodTips === "string"
                                      ? plan.localCuisineAndFoodTips
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Güvenlik Önerileri */}
                        {hasSafetyTips && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <AlertCircle size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Güvenlik Önerileri
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.safetyTips
                                    ? localTipsData.safetyTips
                                    : typeof plan.safetyTips === "string"
                                      ? plan.safetyTips
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Yerel Dil ve İletişim İpuçları */}
                        {hasLocalLanguageAndCommunicationTips && (
                          <Grid item xs={12} md={6}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                  <Globe2 size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                  <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }}>
                                    Yerel Dil ve İletişim İpuçları
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                  {localTipsData && localTipsData.localLanguageAndCommunicationTips
                                    ? localTipsData.localLanguageAndCommunicationTips
                                    : typeof plan.localLanguageAndCommunicationTips === "string"
                                      ? plan.localLanguageAndCommunicationTips
                                      : ""}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}

                        {/* Diğer yerel ipuçları - Obje içindeki diğer alanlar */}
                        {localTipsData &&
                          Object.entries(localTipsData)
                            .filter(
                              ([key]) =>
                                ![
                                  "localTransportationGuide",
                                  "emergencyContacts",
                                  "currencyAndPayment",
                                  "healthcareInfo",
                                  "communicationInfo",
                                  "localCuisineAndFoodTips",
                                  "safetyTips",
                                  "localLanguageAndCommunicationTips",
                                ].includes(key)
                            )
                            .map(([key, value]: [string, any]) => (
                              <Grid item xs={12} md={6} key={key}>
                                <Card
                                  sx={{
                                    height: "100%",
                                    background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                    borderRadius: "12px",
                                    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                  }}
                                >
                                  <CardContent>
                                    <Typography variant="h6" sx={{ color: isDarkMode ? "#93c5fd" : "#2563eb", mb: 2 }}>
                                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}
                                    >
                                      {typeof value === "string" ? value : JSON.stringify(value)}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                      </Grid>
                    </Paper>
                  );
                }
                return null;
              })()}

              {/* Trip Photos Gallery - Sadece planı oluşturan kullanıcı görebilir */}
              {(() => {
                // Parse tripPhotos if it's a string
                let tripPhotosArray = [];

                // Kullanıcı kontrolü - sadece planı oluşturan kullanıcı görebilir
                if (!user || plan.userId !== user.id) {
                  return null;
                }

                if (plan.tripPhotos) {
                  if (typeof plan.tripPhotos === "string") {
                    try {
                      tripPhotosArray = JSON.parse(plan.tripPhotos);
                      console.log("tripPhotos parsed from string");
                    } catch (error) {
                      console.error("Error parsing tripPhotos:", error);
                      tripPhotosArray = [];
                    }
                  } else if (Array.isArray(plan.tripPhotos)) {
                    tripPhotosArray = plan.tripPhotos;
                  }
                }

                // Fotoğrafa tıklama işlemi
                const handlePhotoClick = (photo: any) => {
                  const photoUrl = photo.imageData ? `data:image/jpeg;base64,${photo.imageData}` : photo.imageUrl;

                  setSelectedPhotoForModal({
                    url: photoUrl,
                    location: photo.location,
                  });
                  setModalOpen(true);
                };

                if (tripPhotosArray.length > 0) {
                  return (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mt: 4,
                        background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      }}
                    >
                      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                        <Camera size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.75rem", md: "2rem" },
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Seyahat Fotoğrafları
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        {tripPhotosArray.map((photo: any, index: number) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: isDarkMode
                                    ? "0 4px 20px rgba(0, 0, 0, 0.6)"
                                    : "0 4px 20px rgba(0, 0, 0, 0.1)",
                                },
                                overflow: "hidden",
                                cursor: "pointer",
                              }}
                              onClick={() => handlePhotoClick(photo)}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  height: 240,
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  component="img"
                                  src={photo.imageData ? `data:image/jpeg;base64,${photo.imageData}` : photo.imageUrl}
                                  alt={`Trip photo - ${photo.location || "No location"}`}
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                />
                              </Box>
                              <CardContent>
                                {photo.location && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <MapPin size={16} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {photo.location}
                                    </Typography>
                                  </Box>
                                )}
                                {photo.uploadedAt && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Calendar size={16} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {(() => {
                                        try {
                                          const date = new Date(photo.uploadedAt);
                                          return date.toLocaleDateString("tr-TR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          });
                                        } catch {
                                          return photo.uploadedAt;
                                        }
                                      })()}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  );
                }
                return null;
              })()}

              {/* Yorumlar ve Deneyimler */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mt: 6, // Üst kısımdan daha fazla ayırmak için margin-top değerini artırdık
                  mb: 4,
                  borderRadius: "16px",
                  background: isDarkMode ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
                  boxShadow: isDarkMode ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "0 8px 32px rgba(0, 0, 0, 0.1)", // Daha belirgin gölge ekledik
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3, justifyContent: "center" }}>
                  <MessageCircle size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb", marginRight: "12px" }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.75rem", md: "2rem" },
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Yorumlar ve Deneyimler
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3, borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }} />

                <TripComments travelPlanId={plan.id || ""} />
              </Paper>
            </div>
          </Box>
        </Fade>
      </Container>

      {/* Fotoğraf Büyütme Modalı */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="photo-modal-title"
        aria-describedby="photo-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90%",
            maxHeight: "90%",
            outline: "none",
            bgcolor: "rgba(0, 0, 0, 0.85)",
            p: 2,
            borderRadius: 2,
            boxShadow: 24,
            animation: "fadeIn 0.3s ease-in-out",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: "scale(0.95)",
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          {selectedPhotoForModal && (
            <>
              <img
                src={selectedPhotoForModal.url}
                alt="Büyütülmüş fotoğraf"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: "4px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                }}
              />
              {selectedPhotoForModal.location && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    backgroundColor: "rgba(76, 102, 159, 0.85)",
                    color: "white",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  <MapPin size={18} style={{ marginRight: "8px" }} />
                  <Typography variant="body2">{selectedPhotoForModal.location}</Typography>
                </Box>
              )}
              <IconButton
                aria-label="close"
                onClick={() => setModalOpen(false)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "white",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
