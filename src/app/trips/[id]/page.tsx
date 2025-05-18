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
  CircularProgress,
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
  ChevronLeft,
  ChevronRight,
  Clock,
  X as CloseIcon,
  Cloud,
  CreditCard,
  Download,
  Droplets,
  FileCheck,
  Globe2,
  Heart,
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
import RecommendationModal from "../../components/trips/RecommendationModal";

import TripComments from "../../components/trips/trip-comments";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { useThemeContext } from "../../context/ThemeContext";
import {
  fetchTravelPlanById,
  toggleLike,
  toggleRecommendation,
  toggleFavorite,
  getBudgetByTravelPlanId
} from "../../Services/travel-plans";
import { getWeatherForecast, WeatherData } from "../../Services/weather-service";
import HotelPhotosService from "../../Service/HotelPhotosService";
// import HotelLocationService from "../../Service/HotelLocationService";
import { ActivityPhoto, TravelPlan } from "../../types/travel";
import { Budget } from "../../types/budget";
import CurrencyService from "../../Services/currency.service";

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
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<{ url: string; location?: string; photos?: ActivityPhoto[]; currentIndex?: number; loading?: boolean } | null>(null);
  const [selectedHotelForModal, setSelectedHotelForModal] = useState<any | null>(null);
  const [activityPhotos, setActivityPhotos] = useState<{[key: string]: ActivityPhoto[]}>({});
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  // Favorite modal is not used in this component

  // Sayfa yüklenirken id parametresini kontrol et
  console.log("Trip ID:", tripId);

  // Modal açıldığında çağrılacak
  const handleModalOpen = async (hotel: any) => {
    try {
      // Önce otel fotoğraflarını yükle
      if (hotel.hotelName && plan?.destination) {
        console.log("Modal açılıyor, otel fotoğrafları yükleniyor:", hotel.hotelName);
        const photos = await HotelPhotosService.fetchHotelPhotos(hotel.hotelName, plan.destination);
        if (photos && photos.length > 0) {
          // Fotoğrafı hotel nesnesine ekle
          hotel.hotelImageUrl = photos[0];
        }
      }
    } catch (error) {
      console.error("Otel fotoğrafları yükleme hatası:", error);
    }

    // Sonra modalı aç
    setSelectedHotelForModal(hotel);
    setModalOpen(true);

    // Modal açıldıktan sonra önizleme fotoğraflarını yükle
    setTimeout(() => {
      const container = document.getElementById("hotelPhotosContainer");
      if (container && hotel.hotelName && plan?.destination) {
        console.log("hotelPhotosContainer bulundu, fotoğraflar yükleniyor");
        HotelPhotosService.displayHotelPhotos(
          hotel.hotelName,
          plan.destination,
          "hotelPhotosContainer",
          isDarkMode
        );
      } else {
        console.error("hotelPhotosContainer bulunamadı");
      }
    }, 300);
  };

  // Otel detay modalı açıldığında fotoğrafları yükle
  useEffect(() => {
    if (selectedHotelForModal && modalOpen) {
      // Otel fotoğraflarını yükle
      const city = plan?.destination || "";
      const hotelName = selectedHotelForModal.hotelName;

      if (hotelName && city) {
        console.log(`Otel fotoğrafları yükleniyor: ${hotelName}, ${city}`);

        // DOM'un hazır olmasını bekle
        setTimeout(() => {
          const container = document.getElementById("hotelPhotosContainer");
          if (container) {
            console.log("hotelPhotosContainer bulundu, fotoğraflar yükleniyor");

            // Load and display hotel photos (up to 25 photos)
            const loadHotelPhotos = async () => {
              try {
                // First try to fetch photos using the service
                const photos = await HotelPhotosService.fetchHotelPhotos(hotelName, city);

                if (photos && photos.length > 0) {
                  // Display photos using the service
                  HotelPhotosService.displayHotelPhotos(hotelName, city, "hotelPhotosContainer", isDarkMode);
                } else {
                  // If no photos found, show a message
                  container.innerHTML = `
                    <div style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 200px;
                      color: ${isDarkMode ? "#9ca3af" : "#6b7280"};
                      text-align: center;
                      font-style: italic;
                    ">
                      Bu otel için fotoğraf bulunamadı
                    </div>
                  `;
                }
              } catch (error) {
                console.error("Error loading hotel photos:", error);
                container.innerHTML = `
                  <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 200px;
                    color: ${isDarkMode ? "#9ca3af" : "#6b7280"};
                    text-align: center;
                    font-style: italic;
                  ">
                    Fotoğraflar yüklenirken bir hata oluştu
                  </div>
                `;
              }
            };

            loadHotelPhotos();
          } else {
            console.error("hotelPhotosContainer bulunamadı");
          }
        }, 500);
      }
    }
  }, [selectedHotelForModal, modalOpen, plan?.destination, isDarkMode]);

  // Aktivite fotoğraflarını yükle - sayfa yüklendiğinde hemen yükle
  useEffect(() => {
    async function loadActivityPhotos() {
      if (!plan || !plan.destination) return;

      try {
        // Aktiviteleri al
        const activities = getItineraryItems(plan.itinerary);
        if (!activities || activities.length === 0) return;

        console.log("Aktivite fotoğrafları yükleniyor...");
        const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;

        // Tüm aktiviteler için fotoğrafları önceden yükle
        const activityNames = activities.map(activity => {
          // Aktivite bir string olabilir veya bir obje olabilir
          if (typeof activity === 'string') {
            return activity;
          }
          // Obje ise, placeName, activity, title veya name özelliklerinden birini kullan
          return (activity as any).placeName || (activity as any).activity || (activity as any).title || (activity as any).name || "";
        }).filter(name => name !== "");

        // Önce boş bir state oluştur ve yükleniyor durumunu göster
        const initialPhotosMap: {[key: string]: any} = {};
        activityNames.forEach(name => {
          // Her aktivite için boş bir array oluştur (yükleniyor durumunu göstermek için)
          initialPhotosMap[name] = [];
        });

        // Yükleniyor durumunu göstermek için state'i güncelle
        setActivityPhotos(initialPhotosMap);

        // Tüm aktiviteler için paralel olarak fotoğrafları yükle
        const photosPromises = activityNames.map(async (activityName) => {
          try {
            // Önce önbellekte var mı kontrol et
            const cacheKey = `photos_${activityName}_${plan.destination}`;
            const cachedPhotos = sessionStorage.getItem(cacheKey);

            if (cachedPhotos) {
              // Her aktivite yüklendiğinde hemen state'i güncelle
              const photos = JSON.parse(cachedPhotos);
              setActivityPhotos(prev => ({
                ...prev,
                [activityName]: photos
              }));
              return { activityName, photos };
            }

            // Yoksa API'den yükle
            const photos = await ActivityPhotosService.loadActivityPhotos(activityName, plan.destination || "");

            // Her aktivite yüklendiğinde hemen state'i güncelle
            setActivityPhotos(prev => ({
              ...prev,
              [activityName]: photos
            }));

            return { activityName, photos };
          } catch (error) {
            console.error(`${activityName} fotoğrafları yüklenirken hata:`, error);

            // Hata durumunda kategorize edilmiş yedek fotoğrafları kullan
            const dummyUrls = ActivityPhotosService.getDummyPhotos(activityName, plan.destination || "");
            const dummyPhotos = dummyUrls.map((url: string, index: number) => ({
              imageUrl: url,
              location: activityName,
              description: `${activityName} - ${plan.destination} - Fotoğraf ${index + 1}`
            }));

            // Hata durumunda da state'i güncelle
            setActivityPhotos(prev => ({
              ...prev,
              [activityName]: dummyPhotos
            }));

            return { activityName, photos: dummyPhotos };
          }
        });

        // Tüm fotoğrafların yüklenmesini bekle (arka planda)
        Promise.all(photosPromises).then(results => {
          // Sonuçları birleştir
          const finalPhotosMap: {[key: string]: any} = {};
          results.forEach(result => {
            if (result && result.activityName) {
              finalPhotosMap[result.activityName] = result.photos;
            }
          });

          // Son state'i güncelle
          setActivityPhotos(finalPhotosMap);
          console.log("Tüm aktivite fotoğrafları yüklendi:", Object.keys(finalPhotosMap).length);
        }).catch(error => {
          console.error("Fotoğraf yükleme işlemi tamamlanırken hata:", error);
        });
      } catch (error) {
        console.error("Aktivite fotoğrafları yüklenirken hata:", error);
      }
    }

    loadActivityPhotos();
  }, [plan]);

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

        // Bütçe bilgisini getir
        try {
          setLoadingBudget(true);
          const budgetData = await getBudgetByTravelPlanId(tripId);
          setBudget(budgetData as Budget);
        } catch (budgetError) {
          console.error("Bütçe bilgisi alınamadı:", budgetError);
        } finally {
          setLoadingBudget(false);
        }

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
            // Web uygulamasında tarih bir gün geriden geldiği için bir gün ileri alıyoruz
            const date = parsedStartDate.add(1, "day").add(index, "day");
            console.log(`Fetching weather for day ${index + 1}: ${date.format("YYYY-MM-DD")} (1 gün ileri alındı)`);
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
                {/* Butonlar - Sadece plan sahibi görebilir */}
                {plan.userId === user?.id && (
                  <Stack direction="row" spacing={2}>
                    {/* Öner Butonu */}
                    <Button
                      onClick={() => setRecommendationModalOpen(true)}
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
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                              },
                              transition: "all 0.2s ease",
                            }
                          : {
                              borderColor: "#f59e0b",
                              color: "#f59e0b",
                              "&:hover": {
                                borderColor: "#d97706",
                                backgroundColor: "rgba(245, 158, 11, 0.1)",
                                transform: "translateY(-2px)",
                              },
                              transition: "all 0.2s ease",
                            }),
                      }}
                    >
                      {plan.isRecommended ? "Önerildi" : "Öner"}
                    </Button>

                    {/* Favorilere Ekle/Çıkar Butonu */}
                    <Button
                      onClick={async () => {
                        try {
                          if (!user?.id) {
                            console.error("Kullanıcı ID'si bulunamadı");
                            return;
                          }
                          const success = await toggleFavorite(tripId, user.id);
                          if (success) {
                            setPlan({
                              ...plan,
                              isFavorite: !plan.isFavorite,
                            });
                          }
                        } catch (error) {
                          console.error("Favori durumu değiştirme hatası:", error);
                        }
                      }}
                      startIcon={plan.isFavorite ? <Heart fill="#ec4899" /> : <Heart />}
                      variant={plan.isFavorite ? "contained" : "outlined"}
                      sx={{
                        borderRadius: "12px",
                        px: 3,
                        py: 1,
                        ...(plan.isFavorite
                          ? {
                              background: "linear-gradient(45deg, #ec4899, #be185d)",
                              "&:hover": {
                                background: "linear-gradient(45deg, #db2777, #9d174d)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
                              },
                              transition: "all 0.2s ease",
                            }
                          : {
                              borderColor: "#ec4899",
                              color: "#ec4899",
                              "&:hover": {
                                borderColor: "#db2777",
                                backgroundColor: "rgba(236, 72, 153, 0.1)",
                                transform: "translateY(-2px)",
                              },
                              transition: "all 0.2s ease",
                            }),
                      }}
                    >
                      {plan.isFavorite ? "Favorilerimde" : "Favorilere Ekle"}
                    </Button>
                  </Stack>
                )}

                {/* Beğeni Butonu ve Sayısı - Önerilen planlarda göster */}
                {plan.isRecommended && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        borderRadius: '20px',
                        padding: '6px 12px',
                        marginRight: 1,
                      }}
                    >
                      <Heart size={16} color="#e91e63" fill="#e91e63" />
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 1,
                          fontWeight: 'bold',
                          color: '#e91e63'
                        }}
                      >
                        {plan.likes || 0}
                      </Typography>
                    </Box>

                    {/* Beğeni Butonu */}
                    <IconButton
                      onClick={async () => {
                        try {
                          if (!user) {
                            alert("Beğeni yapabilmek için giriş yapmalısınız.");
                            return;
                          }

                          if (!tripId) {
                            console.error("Trip ID is missing");
                            alert("Seyahat planı ID'si bulunamadı.");
                            return;
                          }

                          // Optimistic UI update - immediately update the UI
                          const isCurrentlyLiked = plan.likedBy?.includes(user.id) || false;
                          const currentLikes = plan.likes || 0;

                          // Create a new likedBy array
                          const newLikedBy = [...(plan.likedBy || [])];

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

                          // Update the plan state immediately for responsive UI
                          setPlan({
                            ...plan,
                            likes: isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1,
                            likedBy: newLikedBy
                          });

                          // Then perform the actual API call in the background
                          const success = await toggleLike(tripId, user.id);

                          if (!success) {
                            // If the API call fails, revert the UI change
                            setPlan({
                              ...plan,
                              likes: currentLikes,
                              likedBy: plan.likedBy || []
                            });
                            alert("Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
                          }
                        } catch (error) {
                          console.error("Beğeni hatası:", error);
                          alert("Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
                        }
                      }}
                      sx={{
                        color: plan.likedBy?.includes(user?.id || '') ? "#e91e63" : "#666",
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        "&:hover": {
                          backgroundColor: 'rgba(233, 30, 99, 0.2)',
                        },
                      }}
                    >
                      <Heart
                        size={20}
                        fill={plan.likedBy?.includes(user?.id || '') ? "#e91e63" : "none"}
                      />
                    </IconButton>
                  </Box>
                )}

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

                // Beklenen gün sayısını belirle
                let expectedDays = 1;
                if (plan.days && typeof plan.days === 'number') {
                  expectedDays = plan.days;
                } else if (plan.duration) {
                  // "3 days" gibi string'den sayıyı çıkar
                  const durationMatch = String(plan.duration).match(/\d+/);
                  if (durationMatch) {
                    expectedDays = parseInt(durationMatch[0], 10);
                  }
                }

                console.log(`İtinerary gün sayısı: ${itineraryItems.length}, Beklenen gün sayısı: ${expectedDays}`);

                // Eksik günleri tamamla
                if (itineraryItems.length < expectedDays) {
                  console.log(`Eksik günler ekleniyor (${itineraryItems.length} -> ${expectedDays})...`);

                  for (let i = itineraryItems.length + 1; i <= expectedDays; i++) {
                    itineraryItems.push({
                      day: `${i}. Gün`,
                      plan: [
                        {
                          time: "09:00 - 17:00",
                          placeName: `${plan.destination} Keşfi - Gün ${i}`,
                          placeDetails: "Bu gün için özel bir plan bulunmamaktadır. Şehri keşfedebilir veya rehberli turlara katılabilirsiniz.",
                          placeImageUrl: "",
                          geoCoordinates: { latitude: 0, longitude: 0 },
                          ticketPricing: "Değişken",
                          timeToTravel: "Değişken",
                          tips: [
                            "Yerel rehberlerden bilgi alabilirsiniz.",
                            "Hava durumuna göre giyinin.",
                            "Yanınızda su bulundurun."
                          ],
                          warnings: ["Değerli eşyalarınıza dikkat edin."],
                          alternatives: ["Müze ziyareti", "Yerel pazarları gezme", "Şehir turu"]
                        }
                      ]
                    });
                  }
                }

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
                                      cursor: "pointer",
                                      overflow: "hidden",
                                    }}
                                    onClick={async () => {
                                      const activityName = (() => {
                                        if (activity.placeName) return activity.placeName;
                                        if (activity.activity) return activity.activity;
                                        if (activity.title) return activity.title;
                                        if (activity.name) return activity.name;
                                        return "Aktivite";
                                      })();

                                      // Önceden yüklenmiş fotoğrafları kontrol et
                                      const city = plan?.destination || "";
                                      let preloadedPhotos = null;

                                      if (activityPhotos[activityName] && activityPhotos[activityName].length > 0) {
                                        preloadedPhotos = activityPhotos[activityName];
                                      }

                                      // Eğer önceden yüklenmiş fotoğraflar varsa, hemen göster
                                      if (preloadedPhotos && preloadedPhotos.length > 0) {
                                        const photoUrl = preloadedPhotos[0].imageData
                                          ? `data:image/jpeg;base64,${preloadedPhotos[0].imageData}`
                                          : preloadedPhotos[0].imageUrl;

                                        setSelectedPhotoForModal({
                                          url: photoUrl,
                                          location: activityName,
                                          photos: preloadedPhotos,
                                          currentIndex: 0,
                                          loading: false
                                        });
                                        setModalOpen(true);

                                        // Arka planda daha fazla fotoğraf yükle
                                        setTimeout(async () => {
                                          try {
                                            const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                            const morePhotos = await ActivityPhotosService.loadActivityPhotos(activityName, city);

                                            // Eğer daha fazla fotoğraf yüklendiyse, state'i güncelle
                                            if (morePhotos.length > preloadedPhotos.length) {
                                              setSelectedPhotoForModal(prev => {
                                                if (prev) {
                                                  return {
                                                    ...prev,
                                                    photos: morePhotos
                                                  };
                                                }
                                                return {
                                                  url: "",
                                                  photos: morePhotos,
                                                  loading: false
                                                };
                                              });

                                              // ActivityPhotos state'ini de güncelle
                                              setActivityPhotos(prev => ({
                                                ...prev,
                                                [activityName]: morePhotos
                                              }));
                                            }
                                          } catch (error) {
                                            console.error('Arka planda fotoğraf yükleme hatası:', error);
                                          }
                                        }, 500);

                                        return;
                                      }

                                      // Yükleniyor modalını göster - Gerçek bir yükleme göstergesi
                                      setSelectedPhotoForModal({
                                        url: "",
                                        location: `${activityName} - Fotoğraflar yükleniyor...`,
                                        photos: [],
                                        currentIndex: 0,
                                        loading: true // Yükleniyor durumunu belirt
                                      });
                                      setModalOpen(true);

                                      // ActivityPhotosService'i kullanarak fotoğrafları yükle
                                      let photos: ActivityPhoto[] = [];

                                      try {
                                        // Eğer aktivitenin kendi fotoğrafları varsa, onları kullan
                                        if (activity.photos && activity.photos.length > 0) {
                                          console.log('Aktivitenin kendi fotoğrafları kullanılıyor:', activity.photos.length);
                                          photos = activity.photos;
                                        } else {
                                          console.log('Aktivite fotoğrafları API\'den yükleniyor...');
                                          // ActivityPhotosService'i kullanarak fotoğrafları yükle
                                          const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                          photos = await ActivityPhotosService.loadActivityPhotos(activityName, city);
                                          console.log('Yüklenen fotoğraflar:', photos.length);

                                          // ActivityPhotos state'ini güncelle
                                          setActivityPhotos(prev => ({
                                            ...prev,
                                            [activityName]: photos
                                          }));
                                        }

                                        // Eğer hala fotoğraf yoksa, aktivite adına göre kategorize edilmiş fotoğraflar kullan
                                        if (!photos || photos.length === 0) {
                                          console.log('Fotoğraf bulunamadı, kategorize edilmiş fotoğraflar kullanılıyor');

                                          const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                          const dummyUrls = ActivityPhotosService.getDummyPhotos(activityName, city);

                                          photos = dummyUrls.map((url: string, index: number) => ({
                                            imageUrl: url,
                                            location: activityName,
                                            description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
                                          }));

                                          // ActivityPhotos state'ini güncelle
                                          setActivityPhotos(prev => ({
                                            ...prev,
                                            [activityName]: photos
                                          }));
                                        }

                                        // İlk fotoğrafı göster
                                        const photoUrl = photos[0].imageData
                                          ? `data:image/jpeg;base64,${photos[0].imageData}`
                                          : photos[0].imageUrl;

                                        setSelectedPhotoForModal({
                                          url: photoUrl,
                                          location: activityName,
                                          photos,
                                          currentIndex: 0,
                                          loading: false // Yükleme tamamlandı
                                        });
                                      } catch (error) {
                                        console.error("Aktivite fotoğrafları gösterme hatası:", error);

                                        // Hata durumunda aktivite adına göre kategorize edilmiş fotoğraflar kullan
                                        const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                        const dummyUrls = ActivityPhotosService.getDummyPhotos(activityName, city);

                                        photos = dummyUrls.map((url: string, index: number) => ({
                                          imageUrl: url,
                                          location: activityName,
                                          description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
                                        }));

                                        // ActivityPhotos state'ini güncelle
                                        setActivityPhotos(prev => ({
                                          ...prev,
                                          [activityName]: photos
                                        }));

                                        setSelectedPhotoForModal({
                                          url: photos[0].imageUrl,
                                          location: activityName,
                                          photos,
                                          currentIndex: 0,
                                          loading: false
                                        });
                                      }
                                    }}
                                  >
                                    {/* Aktivite Fotoğrafı - Her zaman göster */}
                                    <Box
                                      sx={{
                                        width: "100%",
                                        height: 160,
                                        position: "relative",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {(() => {
                                        // Aktivite adını belirle
                                        const activityName = activity.placeName || activity.activity || activity.title || activity.name || "";

                                        // Fotoğraf URL'sini belirle
                                        let photoUrl = null;
                                        let isLoading = false;

                                        // Önceden yüklenmiş fotoğrafları kontrol et
                                        if (activityPhotos[activityName]) {
                                          // Eğer fotoğraflar yüklendiyse
                                          if (activityPhotos[activityName].length > 0) {
                                            const photo = activityPhotos[activityName][0];
                                            if (photo.imageData) {
                                              photoUrl = `data:image/jpeg;base64,${photo.imageData}`;
                                            } else if (photo.imageUrl) {
                                              photoUrl = photo.imageUrl;
                                            }
                                          }
                                          // Eğer fotoğraflar henüz yüklenmemişse (boş array)
                                          else {
                                            isLoading = true;
                                          }
                                        }
                                        // Aktivitenin kendi fotoğrafları varsa kullan
                                        else if (activity.photos && activity.photos.length > 0) {
                                          if (activity.photos[0].imageData) {
                                            photoUrl = `data:image/jpeg;base64,${activity.photos[0].imageData}`;
                                          } else if (activity.photos[0].imageUrl) {
                                            photoUrl = activity.photos[0].imageUrl;
                                          }
                                        }
                                        // Fotoğraf yoksa ve aktivite adı varsa, yükleniyor durumunda göster
                                        else if (activityName) {
                                          isLoading = true;
                                        }

                                        // Yükleniyor durumunda veya fotoğraf yoksa, aktivite adına göre kategorize edilmiş varsayılan fotoğraflar
                                        if ((isLoading || !photoUrl) && activityName) {
                                          const activityNameLower = activityName.toLowerCase();

                                          // Müze veya tarihi yer
                                          if (activityNameLower.includes('müze') ||
                                              activityNameLower.includes('müzesi') ||
                                              activityNameLower.includes('tarihi') ||
                                              activityNameLower.includes('antik')) {
                                            photoUrl = 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800';
                                          }
                                          // Plaj veya deniz
                                          else if (activityNameLower.includes('plaj') ||
                                                  activityNameLower.includes('deniz') ||
                                                  activityNameLower.includes('sahil')) {
                                            photoUrl = 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800';
                                          }
                                          // Park veya bahçe
                                          else if (activityNameLower.includes('park') ||
                                                  activityNameLower.includes('bahçe') ||
                                                  activityNameLower.includes('doğa')) {
                                            photoUrl = 'https://images.pexels.com/photos/1319515/pexels-photo-1319515.jpeg?auto=compress&cs=tinysrgb&w=800';
                                          }
                                          // Cami veya dini yapı
                                          else if (activityNameLower.includes('cami') ||
                                                  activityNameLower.includes('kilise') ||
                                                  activityNameLower.includes('katedral')) {
                                            photoUrl = 'https://images.pexels.com/photos/1537086/pexels-photo-1537086.jpeg?auto=compress&cs=tinysrgb&w=800';
                                          }
                                          // Varsayılan
                                          else {
                                            photoUrl = 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800';
                                          }
                                        }
                                        // Hiçbir şey yoksa varsayılan görsel
                                        else if (!photoUrl) {
                                          photoUrl = 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800';
                                        }

                                        return (
                                          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Box
                                              component="img"
                                              src={photoUrl}
                                              alt={(() => {
                                                if (activity.placeName) return activity.placeName;
                                                if (activity.activity) return activity.activity;
                                                if (activity.title) return activity.title;
                                                if (activity.name) return activity.name;
                                                return "Aktivite";
                                              })()}
                                              sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                transition: "transform 0.3s ease",
                                                filter: isLoading ? "brightness(0.8)" : "none",
                                                "&:hover": {
                                                  transform: "scale(1.05)",
                                                },
                                              }}
                                              onError={(e) => {
                                                // Görsel yüklenemezse, basit bir yedek görsel kullan
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; // Sonsuz döngüyü önle
                                                target.src = "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800";
                                              }}
                                            />

                                            {/* Yükleniyor göstergesi */}
                                            {isLoading && (
                                              <Box
                                                sx={{
                                                  position: 'absolute',
                                                  top: 0,
                                                  left: 0,
                                                  width: '100%',
                                                  height: '100%',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                  zIndex: 1,
                                                }}
                                              >
                                                <CircularProgress size={30} sx={{ color: 'white' }} />
                                              </Box>
                                            )}
                                          </Box>
                                        );
                                      })()}
                                      <Box
                                        sx={{
                                          position: "absolute",
                                          top: 8,
                                          right: 8,
                                          backgroundColor: "rgba(37, 99, 235, 0.8)",
                                          color: "white",
                                          width: 32,
                                          height: 32,
                                          borderRadius: "50%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                        }}
                                      >
                                        <Camera size={18} />
                                      </Box>
                                    </Box>
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

                                        {/* Butonlar için container */}
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                                          {/* Fotoğrafları Gör Butonu - Her zaman göster */}
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Camera size={16} />}
                                            sx={{
                                              borderColor: isDarkMode ? "#93c5fd" : "#2563eb",
                                              color: isDarkMode ? "#93c5fd" : "#2563eb",
                                              borderRadius: "8px",
                                              textTransform: "none",
                                              fontWeight: 600,
                                              fontSize: "0.75rem",
                                              py: 0.5,
                                              "&:hover": {
                                                borderColor: isDarkMode ? "#60a5fa" : "#1d4ed8",
                                                backgroundColor: isDarkMode
                                                  ? "rgba(37, 99, 235, 0.2)"
                                                  : "rgba(37, 99, 235, 0.1)",
                                              },
                                            }}
                                            onClick={async (e) => {
                                              e.stopPropagation(); // Kart tıklamasını engelle

                                              const activityName = (() => {
                                                if (activity.placeName) return activity.placeName;
                                                if (activity.activity) return activity.activity;
                                                if (activity.title) return activity.title;
                                                if (activity.name) return activity.name;
                                                return "Aktivite";
                                              })();

                                              // Önceden yüklenmiş fotoğrafları kontrol et
                                              const city = plan?.destination || "";
                                              let preloadedPhotos = null;

                                              if (activityPhotos[activityName] && activityPhotos[activityName].length > 0) {
                                                preloadedPhotos = activityPhotos[activityName];
                                              }

                                              // Eğer önceden yüklenmiş fotoğraflar varsa, hemen göster
                                              if (preloadedPhotos && preloadedPhotos.length > 0) {
                                                const photoUrl = preloadedPhotos[0].imageData
                                                  ? `data:image/jpeg;base64,${preloadedPhotos[0].imageData}`
                                                  : preloadedPhotos[0].imageUrl;

                                                setSelectedPhotoForModal({
                                                  url: photoUrl,
                                                  location: activityName,
                                                  photos: preloadedPhotos,
                                                  currentIndex: 0,
                                                  loading: false
                                                });
                                                setModalOpen(true);

                                                // Arka planda daha fazla fotoğraf yükle
                                                setTimeout(async () => {
                                                  try {
                                                    const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                                    const morePhotos = await ActivityPhotosService.loadActivityPhotos(activityName, city);

                                                    // Eğer daha fazla fotoğraf yüklendiyse, state'i güncelle
                                                    if (morePhotos.length > preloadedPhotos.length) {
                                                      setSelectedPhotoForModal(prev => {
                                                        if (prev) {
                                                          return {
                                                            ...prev,
                                                            photos: morePhotos
                                                          };
                                                        }
                                                        return {
                                                          url: "",
                                                          photos: morePhotos,
                                                          loading: false
                                                        };
                                                      });

                                                      // ActivityPhotos state'ini de güncelle
                                                      setActivityPhotos(prev => ({
                                                        ...prev,
                                                        [activityName]: morePhotos
                                                      }));
                                                    }
                                                  } catch (error) {
                                                    console.error('Arka planda fotoğraf yükleme hatası:', error);
                                                  }
                                                }, 500);

                                                return;
                                              }

                                              // Önceden yüklenmiş fotoğraf yoksa, yükleniyor modalını göster
                                              setSelectedPhotoForModal({
                                                url: "",
                                                location: `${activityName} - Fotoğraflar yükleniyor...`,
                                                photos: [],
                                                currentIndex: 0,
                                                loading: true // Yükleniyor durumunu belirt
                                              });
                                              setModalOpen(true);

                                              // ActivityPhotosService'i kullanarak fotoğrafları yükle
                                              let photos: ActivityPhoto[] = [];

                                              try {
                                                // Aktivitenin kendi fotoğrafları varsa, onları kullan
                                                if (activity.photos && activity.photos.length > 0) {
                                                  console.log('Aktivitenin kendi fotoğrafları kullanılıyor:', activity.photos.length);
                                                  photos = activity.photos;
                                                } else {
                                                  console.log('Aktivite fotoğrafları API\'den yükleniyor...');
                                                  // ActivityPhotosService'i kullanarak fotoğrafları yükle
                                                  const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                                  photos = await ActivityPhotosService.loadActivityPhotos(activityName, city);
                                                  console.log('Yüklenen fotoğraflar:', photos.length);

                                                  // ActivityPhotos state'ini güncelle
                                                  setActivityPhotos(prev => ({
                                                    ...prev,
                                                    [activityName]: photos
                                                  }));
                                                }

                                                // Eğer hala fotoğraf yoksa, aktivite adına göre kategorize edilmiş fotoğraflar kullan
                                                if (!photos || photos.length === 0) {
                                                  console.log('Fotoğraf bulunamadı, kategorize edilmiş fotoğraflar kullanılıyor');

                                                  const ActivityPhotosService = (await import('../../Service/ActivityPhotosService')).default;
                                                  const dummyUrls = ActivityPhotosService.getDummyPhotos(activityName, city);

                                                  photos = dummyUrls.map((url: string, index: number) => ({
                                                    imageUrl: url,
                                                    location: activityName,
                                                    description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
                                                  }));
                                                }

                                                console.log('Gösterilecek fotoğraflar:', photos);

                                                // İlk fotoğrafı göster
                                                const photoUrl = photos[0].imageData
                                                  ? `data:image/jpeg;base64,${photos[0].imageData}`
                                                  : photos[0].imageUrl;

                                                console.log('İlk fotoğraf URL:', photoUrl);

                                                // Fotoğraf URL'lerinin geçerliliğini kontrol et
                                                const validatedPhotos = photos.map(photo => {
                                                  // Eğer imageData varsa, base64 olarak kullan
                                                  if (photo.imageData) {
                                                    return {
                                                      ...photo,
                                                      imageUrl: `data:image/jpeg;base64,${photo.imageData}`
                                                    };
                                                  }
                                                  // Eğer imageUrl yoksa veya geçersizse, yedek fotoğraf kullan
                                                  if (!photo.imageUrl || photo.imageUrl.includes('undefined') || photo.imageUrl.includes('null')) {
                                                    return {
                                                      ...photo,
                                                      imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800'
                                                    };
                                                  }
                                                  return photo;
                                                });

                                                setSelectedPhotoForModal({
                                                  url: photoUrl,
                                                  location: activityName,
                                                  photos: validatedPhotos,
                                                  currentIndex: 0,
                                                  loading: false // Yükleme tamamlandı
                                                });
                                              } catch (error) {
                                                console.error("Aktivite fotoğrafları gösterme hatası:", error);

                                                // Hata durumunda basit bir hata mesajı göster
                                                photos = [
                                                  {
                                                    imageUrl: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
                                                    location: activityName,
                                                    description: `${activityName} - ${city} - Fotoğraf 1`
                                                  },
                                                  {
                                                    imageUrl: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
                                                    location: activityName,
                                                    description: `${activityName} - ${city} - Fotoğraf 2`
                                                  },
                                                  {
                                                    imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800',
                                                    location: activityName,
                                                    description: `${activityName} - ${city} - Fotoğraf 3`
                                                  },
                                                  {
                                                    imageUrl: 'https://images.pexels.com/photos/2245436/pexels-photo-2245436.png?auto=compress&cs=tinysrgb&w=800',
                                                    location: activityName,
                                                    description: `${activityName} - ${city} - Fotoğraf 4`
                                                  },
                                                  {
                                                    imageUrl: 'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=800',
                                                    location: activityName,
                                                    description: `${activityName} - ${city} - Fotoğraf 5`
                                                  }
                                                ];

                                                setSelectedPhotoForModal({
                                                  url: photos[0].imageUrl,
                                                  location: activityName,
                                                  photos,
                                                  currentIndex: 0,
                                                  loading: false // Yükleme tamamlandı
                                                });
                                              }
                                            }}
                                          >
                                            Fotoğrafları Gör
                                          </Button>

                                          {/* Haritada Göster Butonu */}
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Navigation size={16} />}
                                            sx={{
                                              borderColor: isDarkMode ? "#a78bfa" : "#7c3aed",
                                              color: isDarkMode ? "#a78bfa" : "#7c3aed",
                                              borderRadius: "8px",
                                              textTransform: "none",
                                              fontWeight: 600,
                                              fontSize: "0.75rem",
                                              py: 0.5,
                                              "&:hover": {
                                                borderColor: isDarkMode ? "#8b5cf6" : "#6d28d9",
                                                backgroundColor: isDarkMode
                                                  ? "rgba(124, 58, 237, 0.2)"
                                                  : "rgba(124, 58, 237, 0.1)",
                                                transform: "translateY(-2px)",
                                                transition: "transform 0.2s ease",
                                              },
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation(); // Kart tıklamasını engelle

                                              // Aktivite adını belirle
                                              const activityName = (() => {
                                                if (activity.placeName) return activity.placeName;
                                                if (activity.activity) return activity.activity;
                                                if (activity.title) return activity.title;
                                                if (activity.name) return activity.name;
                                                return "Aktivite";
                                              })();

                                              // Konum bilgisini belirle
                                              const locationQuery = encodeURIComponent(`${activityName} ${plan?.destination || ''}`);
                                              const url = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
                                              window.open(url, "_blank");
                                            }}
                                          >
                                            Haritada Göster
                                          </Button>
                                        </Box>
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

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {hotelOptionsArray.map((hotel: any, index: number) => (
                          <Box key={index} sx={{ width: { xs: '100%', md: 'calc(50% - 24px)', lg: 'calc(33.333% - 24px)' } }}>
                            <Card
                              elevation={0}
                              onClick={() => handleModalOpen(hotel)}
                              sx={{
                                height: "100%",
                                background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "translateY(-6px)",
                                  boxShadow: isDarkMode
                                    ? "0 8px 30px rgba(0, 0, 0, 0.7)"
                                    : "0 8px 30px rgba(0, 0, 0, 0.15)",
                                },
                                display: "flex",
                                flexDirection: "column",
                                backdropFilter: "blur(10px)",
                                overflow: "hidden",
                                boxShadow: isDarkMode
                                  ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                                  : "0 4px 12px rgba(0, 0, 0, 0.08)",
                              }}
                            >
                              {/* Otel Görseli - Daha büyük ve dikkat çekici */}
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 240, // Daha büyük görsel
                                  position: "relative",
                                  overflow: "hidden",
                                  borderTopLeftRadius: "12px",
                                  borderTopRightRadius: "12px",
                                }}
                              >
                                <Box
                                  component="img"
                                  src={
                                    (hotel.imageUrl || hotel.hotelImageUrl) &&
                                    !(hotel.imageUrl?.includes("sample-image") || hotel.hotelImageUrl?.includes("sample-image") ||
                                      hotel.imageUrl?.includes("placeholder") || hotel.hotelImageUrl?.includes("placeholder"))
                                    ? (hotel.hotelImageUrl || hotel.imageUrl)
                                    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
                                  }
                                  alt={hotel.hotelName}
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.5s ease",
                                    "&:hover": {
                                      transform: "scale(1.08)",
                                    },
                                    filter: "brightness(0.95)",
                                  }}
                                  onError={(e) => {
                                    // Fotoğraf yüklenemezse yedek fotoğraf kullan
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
                                  }}
                                />
                                {/* Otel adı görselin üzerinde */}
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3), transparent)",
                                    padding: "30px 16px 16px",
                                    pointerEvents: "none",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: "white",
                                      fontWeight: 700,
                                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                      fontSize: "1.25rem",
                                      mb: 0.5,
                                      letterSpacing: "-0.01em",
                                    }}
                                  >
                                    {hotel.hotelName}
                                  </Typography>

                                  {hotel.rating && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <Rating
                                        value={hotel.rating}
                                        precision={0.1}
                                        readOnly
                                        size="small"
                                        sx={{
                                          "& .MuiRating-iconFilled": {
                                            color: "#FFD700",
                                          },
                                          "& .MuiRating-iconEmpty": {
                                            color: "rgba(255, 255, 255, 0.5)",
                                          },
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "white",
                                          fontWeight: 600,
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        {hotel.rating.toFixed(1)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                              <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                                <Stack spacing={2}>
                                  {/* Adres */}
                                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                    <MapPin size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed", marginTop: "2px" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {hotel.hotelAddress}
                                    </Typography>
                                  </Box>

                                  {/* Fiyat Aralığı */}
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Wallet size={18} style={{ color: isDarkMode ? "#a78bfa" : "#7c3aed" }} />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        p: 1,
                                        borderRadius: "8px",
                                        backgroundColor: isDarkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
                                        color: isDarkMode ? "#93c5fd" : "#2563eb",
                                        display: "inline-block",
                                        border: `1px solid ${isDarkMode ? "rgba(37, 99, 235, 0.3)" : "transparent"}`,
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        boxShadow: isDarkMode ? "0 2px 6px rgba(0, 0, 0, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.05)",
                                      }}
                                    >
                                      {hotel.priceRange}
                                    </Typography>
                                  </Box>

                                  {/* Açıklama - Daha kısa */}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: isDarkMode ? "#e5e7eb" : "text.secondary",
                                      flex: 1,
                                      fontSize: "0.875rem",
                                      lineHeight: 1.6,
                                      // Maksimum 3 satır göster
                                      display: "-webkit-box",
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      mt: 0.5,
                                      mb: 0.5,
                                    }}
                                  >
                                    {hotel.description}
                                  </Typography>

                                  {/* Haritada Göster ve Detayları Gör Butonları */}
                                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: "auto", pt: 1 }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Navigation size={16} />}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Kart tıklamasını engelle
                                        // Otel adı ve şehir ile doğrudan arama yap
                                        const searchQuery = encodeURIComponent(`${hotel.hotelName} hotel ${plan?.destination || ''}`);
                                        const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                                        window.open(url, "_blank");
                                      }}
                                      sx={{
                                        borderColor: isDarkMode ? "#93c5fd" : "#2563eb",
                                        color: isDarkMode ? "#93c5fd" : "#2563eb",
                                        borderRadius: "8px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        boxShadow: isDarkMode ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.05)",
                                        "&:hover": {
                                          borderColor: isDarkMode ? "#60a5fa" : "#1d4ed8",
                                          backgroundColor: isDarkMode
                                            ? "rgba(37, 99, 235, 0.2)"
                                            : "rgba(37, 99, 235, 0.1)",
                                          transform: "translateY(-2px)",
                                          transition: "transform 0.2s ease",
                                        },
                                      }}
                                    >
                                      Haritada Göster
                                    </Button>

                                    {/* Detayları Gör Butonu */}
                                    <Button
                                      variant="contained"
                                      size="small"
                                      sx={{
                                        background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                                        borderRadius: "8px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        boxShadow: isDarkMode ? "0 4px 8px rgba(0, 0, 0, 0.3)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
                                        "&:hover": {
                                          background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                                          transform: "translateY(-2px)",
                                          transition: "transform 0.2s ease",
                                          boxShadow: isDarkMode ? "0 6px 12px rgba(0, 0, 0, 0.4)" : "0 6px 12px rgba(0, 0, 0, 0.15)",
                                        },
                                      }}
                                    >
                                      Detayları Gör
                                    </Button>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Box>
                        ))}
                      </Box>
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

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {weatherData.map((weather, index) => (
                      <Box key={index} sx={{ width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.333% - 24px)' } }}>
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

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ width: 'calc(50% - 8px)' }}>
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
                            </Box>
                            <Box sx={{ width: 'calc(50% - 8px)' }}>
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
                            </Box>
                            <Box sx={{ width: 'calc(50% - 8px)' }}>
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
                            </Box>
                            <Box sx={{ width: 'calc(50% - 8px)' }}>
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
                            </Box>
                            <Box sx={{ width: 'calc(50% - 8px)' }}>
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
                            </Box>
                          </Box>
                        </Card>
                      </Box>
                    ))}
                  </Box>
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

              {/* Bütçe Bilgileri */}
              {(() => {
                if (budget) {
                  // Toplam harcama miktarını hesapla
                  const totalSpent = budget.categories?.reduce((total, category) => total + (category.spentAmount || 0), 0) || 0;

                  // Bütçe kullanım yüzdesini hesapla
                  const budgetUsagePercentage = budget.totalBudget ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0;

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
                        <Wallet size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
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
                          Bütçe Bilgileri
                        </Typography>
                      </Box>

                      <Grid container spacing={3}>
                        {/* Bütçe Özeti */}
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
                                Bütçe Özeti
                              </Typography>

                              <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", mb: 1 }}>
                                  Toplam Bütçe: {CurrencyService.formatCurrency(budget.totalBudget, budget.currency)}
                                </Typography>

                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", mb: 1 }}>
                                  Harcanan: {CurrencyService.formatCurrency(totalSpent, budget.currency)} ({budgetUsagePercentage.toFixed(0)}%)
                                </Typography>

                                <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', borderRadius: 1, mb: 2 }}>
                                  <Box
                                    sx={{
                                      width: `${budgetUsagePercentage}%`,
                                      bgcolor: budgetUsagePercentage > 90 ? '#ef4444' : budgetUsagePercentage > 70 ? '#f59e0b' : '#22c55e',
                                      height: 8,
                                      borderRadius: 1,
                                    }}
                                  />
                                </Box>

                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", fontWeight: 'bold' }}>
                                  Kalan: {CurrencyService.formatCurrency(budget.totalBudget - totalSpent, budget.currency)}
                                </Typography>
                              </Box>

                              <Button
                                variant="contained"
                                onClick={() => router.push(`/budget/${budget.id}`)}
                                sx={{
                                  background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                                  borderRadius: "8px",
                                  "&:hover": {
                                    background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                                  },
                                  width: '100%',
                                }}
                              >
                                Bütçe Detaylarını Görüntüle
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Kategori Dağılımı */}
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
                                Kategori Dağılımı
                              </Typography>

                              {budget.categories && budget.categories.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {budget.categories.map((category) => {
                                    const categoryPercentage = totalSpent > 0 ? (category.spentAmount / totalSpent) * 100 : 0;

                                    return (
                                      <Box key={category.id}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                              sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: category.color
                                              }}
                                            />
                                            <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                              {category.name}
                                            </Typography>
                                          </Box>
                                          <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary" }}>
                                            {CurrencyService.formatCurrency(category.spentAmount, budget.currency)}
                                          </Typography>
                                        </Box>

                                        <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', borderRadius: 1 }}>
                                          <Box
                                            sx={{
                                              width: `${categoryPercentage}%`,
                                              bgcolor: category.color,
                                              height: 6,
                                              borderRadius: 1,
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Typography variant="body2" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", textAlign: 'center', py: 2 }}>
                                  Henüz kategori bulunmuyor
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                } else if (loadingBudget) {
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                        <CircularProgress size={40} />
                      </Box>
                    </Paper>
                  );
                } else {
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
                        <Wallet size={28} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
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
                          Bütçe Oluştur
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'center', py: 2, mb: 4 }}>
                        <Typography variant="body1" sx={{ color: isDarkMode ? "#e5e7eb" : "text.secondary", mb: 3 }}>
                          Bu seyahat planı için henüz bir bütçe oluşturulmamış. Harcamalarınızı takip etmek için bir bütçe oluşturabilirsiniz.
                        </Typography>

                        <Button
                          variant="contained"
                          onClick={() => router.push(`/travel-plan/${resolvedParams.id}/create-budget`)}
                          sx={{
                            background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                            borderRadius: "8px",
                            px: 4,
                            py: 1.5,
                            "&:hover": {
                              background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                            },
                          }}
                        >
                          Bütçe Oluştur
                        </Button>
                      </Box>
                    </Paper>
                  );
                }

                return null;
              })()}

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
                let tripPhotosArray: any[] = [];

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
                const handlePhotoClick = (photo: any, index: number) => {
                  const photoUrl = photo.imageData ? `data:image/jpeg;base64,${photo.imageData}` : photo.imageUrl;

                  setSelectedPhotoForModal({
                    url: photoUrl,
                    location: photo.location,
                    photos: tripPhotosArray,
                    currentIndex: index
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
                              onClick={() => handlePhotoClick(photo, index)}
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
                                  onError={(e) => {
                                    // Fotoğraf yüklenemezse yedek fotoğraf kullan
                                    const target = e.target as HTMLImageElement;
                                    console.error("Seyahat fotoğrafı yüklenemedi:", target.src);
                                    target.onerror = null; // Sonsuz döngüyü önle
                                    target.src = "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800";
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

      {/* Fotoğraf veya Otel Detay Modalı - Geliştirilmiş */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPhotoForModal(null);
          setSelectedHotelForModal(null);
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90%",
            maxHeight: "90%",
            outline: "none",
            bgcolor: isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
            p: 3,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
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
            overflowY: "auto",
          }}
        >
          {/* Fotoğraf Detayı */}
          {selectedPhotoForModal && (
            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
              {selectedPhotoForModal.loading ? (
                // Yükleniyor göstergesi
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: 4
                  }}
                >
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: `3px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      borderTop: `3px solid ${isDarkMode ? "#93c5fd" : "#2563eb"}`,
                      animation: "spin 1s linear infinite",
                      mb: 3,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: isDarkMode ? "#e5e7eb" : "text.primary",
                      textAlign: 'center'
                    }}
                  >
                    Fotoğraflar yükleniyor...
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                      textAlign: 'center',
                      mt: 1
                    }}
                  >
                    Google Places API&apos;den fotoğraflar getiriliyor
                  </Typography>
                  <style jsx global>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </Box>
              ) : (
                // Fotoğraf Konteyneri - Geliştirilmiş
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                    background: "#000",
                    minHeight: "60vh",
                  }}
                >
                  <img
                    src={selectedPhotoForModal.url}
                    alt={selectedPhotoForModal.location || "Aktivite fotoğrafı"}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                    }}
                    onError={(e) => {
                      // Fotoğraf yüklenemezse yedek fotoğraf göster
                      const target = e.target as HTMLImageElement;
                      console.error("Fotoğraf yüklenemedi:", target.src);
                      target.onerror = null; // Sonsuz döngüyü önle
                      target.src = "https://images.unsplash.com/photo-1533230050368-fbf55584f782?q=80&w=1000"; // Yedek fotoğraf
                    }}
                  />
                </Box>
              )}

              {/* Fotoğraf Navigasyon Butonları - Birden fazla fotoğraf varsa */}
              {selectedPhotoForModal.photos && selectedPhotoForModal.photos.length > 1 && (
                <>
                  {/* Önceki Fotoğraf Butonu - Geliştirilmiş */}
                  <IconButton
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      width: "48px",
                      height: "48px",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        transform: "translateY(-50%) scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedPhotoForModal.currentIndex !== undefined && selectedPhotoForModal.photos) {
                        const newIndex = (selectedPhotoForModal.currentIndex - 1 + selectedPhotoForModal.photos.length) % selectedPhotoForModal.photos.length;
                        const photo = selectedPhotoForModal.photos[newIndex];
                        const photoUrl = photo.imageData
                          ? `data:image/jpeg;base64,${photo.imageData}`
                          : photo.imageUrl;

                        setSelectedPhotoForModal({
                          ...selectedPhotoForModal,
                          url: photoUrl,
                          location: photo.location || selectedPhotoForModal.location,
                          currentIndex: newIndex
                        });
                      }
                    }}
                  >
                    <ChevronLeft size={24} />
                  </IconButton>

                  {/* Sonraki Fotoğraf Butonu - Geliştirilmiş */}
                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      width: "48px",
                      height: "48px",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        transform: "translateY(-50%) scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedPhotoForModal.currentIndex !== undefined && selectedPhotoForModal.photos) {
                        const newIndex = (selectedPhotoForModal.currentIndex + 1) % selectedPhotoForModal.photos.length;
                        const photo = selectedPhotoForModal.photos[newIndex];
                        const photoUrl = photo.imageData
                          ? `data:image/jpeg;base64,${photo.imageData}`
                          : photo.imageUrl;

                        setSelectedPhotoForModal({
                          ...selectedPhotoForModal,
                          url: photoUrl,
                          location: photo.location || selectedPhotoForModal.location,
                          currentIndex: newIndex
                        });
                      }
                    }}
                  >
                    <ChevronRight size={24} />
                  </IconButton>

                  {/* Fotoğraf Sayacı - Geliştirilmiş */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      zIndex: 10,
                    }}
                  >
                    <Camera size={16} />
                    {selectedPhotoForModal.currentIndex !== undefined && selectedPhotoForModal.photos ?
                      `${selectedPhotoForModal.currentIndex + 1} / ${selectedPhotoForModal.photos.length}` : ""}
                  </Box>
                </>
              )}

              {/* Konum Bilgisi - Geliştirilmiş */}
              {selectedPhotoForModal.location && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    backgroundColor: "rgba(37, 99, 235, 0.85)",
                    color: "white",
                    px: 2,
                    py: 1,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    maxWidth: "80%",
                    zIndex: 10,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <MapPin size={18} style={{ marginRight: "8px", flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                    }}
                  >
                    {selectedPhotoForModal.location}
                  </Typography>
                </Box>
              )}

              {/* Kapat Butonu - Geliştirilmiş */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                  zIndex: 10,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
                onClick={() => {
                  setModalOpen(false);
                  setSelectedPhotoForModal(null);
                  setSelectedHotelForModal(null);
                }}
              >
                <CloseIcon size={18} />
              </IconButton>
            </Box>
          )}

          {/* Otel Detayı */}
          {selectedHotelForModal && (
            <Box sx={{ width: { xs: "100%", md: "900px" }, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto" }}>
              {/* Otel Görseli - Geliştirilmiş */}
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  mb: 4,
                  boxShadow: isDarkMode ? "0 8px 32px rgba(0, 0, 0, 0.5)" : "0 8px 32px rgba(0, 0, 0, 0.15)",
                }}
              >
                <Box
                  component="img"
                  src={selectedHotelForModal.hotelImageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"}
                  alt={selectedHotelForModal.hotelName}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 10s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                  onError={(e) => {
                    // Fotoğraf yüklenemezse yedek fotoğraf kullan
                    const target = e.target as HTMLImageElement;
                    console.error("Otel fotoğrafı yüklenemedi:", target.src);
                    target.onerror = null; // Sonsuz döngüyü önle
                    target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
                  }}
                />

                {/* Otel adı overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)",
                    padding: "30px 20px 20px",
                    pointerEvents: "none",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {selectedHotelForModal.hotelName}
                  </Typography>
                </Box>
              </Box>

              {/* Otel Bilgileri */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                  {/* Adres */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                    <MapPin size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb", marginTop: "4px" }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: isDarkMode ? "#e5e7eb" : "text.primary",
                        lineHeight: 1.6
                      }}
                    >
                      {selectedHotelForModal.hotelAddress}
                    </Typography>
                  </Box>

                  {/* Fiyat */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                    <CreditCard size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb", marginTop: "4px" }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: isDarkMode ? "#e5e7eb" : "text.primary",
                        lineHeight: 1.6,
                        fontWeight: 500
                      }}
                    >
                      {selectedHotelForModal.priceRange || selectedHotelForModal.price || 'Belirtilmemiş'}
                    </Typography>
                  </Box>

                  {/* Değerlendirme */}
                  {selectedHotelForModal.rating && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Star size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating
                          value={selectedHotelForModal.rating}
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
                            ml: 1,
                            color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          {selectedHotelForModal.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* En İyi Ziyaret Zamanı */}
                  {selectedHotelForModal.bestTimeToVisit && (
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                      <Calendar size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb", marginTop: "4px" }} />
                      <Typography
                        variant="body1"
                        sx={{
                          color: isDarkMode ? "#e5e7eb" : "text.primary",
                          lineHeight: 1.6
                        }}
                      >
                        <strong>En İyi Ziyaret Zamanı:</strong> {selectedHotelForModal.bestTimeToVisit}
                      </Typography>
                    </Box>
                  )}

                  {/* Çevre */}
                  {selectedHotelForModal.surroundings && (
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                      <Globe2 size={20} style={{ color: isDarkMode ? "#93c5fd" : "#2563eb", marginTop: "4px" }} />
                      <Typography
                        variant="body1"
                        sx={{
                          color: isDarkMode ? "#e5e7eb" : "text.primary",
                          lineHeight: 1.6
                        }}
                      >
                        <strong>Çevre:</strong> {selectedHotelForModal.surroundings}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                  {/* Açıklama */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      color: isDarkMode ? "#93c5fd" : "#2563eb",
                      fontWeight: 600
                    }}
                  >
                    Otel Hakkında
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDarkMode ? "#e5e7eb" : "text.primary",
                      lineHeight: 1.8,
                      mb: 3
                    }}
                  >
                    {selectedHotelForModal.description}
                  </Typography>

                  {/* Özellikler */}
                  {selectedHotelForModal.features && selectedHotelForModal.features.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          color: isDarkMode ? "#93c5fd" : "#2563eb",
                          fontWeight: 600
                        }}
                      >
                        Otel Özellikleri
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedHotelForModal.features.map((feature: string, index: number) => (
                          <Chip
                            key={index}
                            label={feature}
                            icon={<Hotel size={16} />}
                            sx={{
                              bgcolor: isDarkMode ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
                              color: isDarkMode ? "#93c5fd" : "#2563eb",
                              borderRadius: "8px",
                              "& .MuiChip-icon": {
                                color: isDarkMode ? "#93c5fd" : "#2563eb",
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Haritada Göster Butonu */}
                  <Button
                    variant="contained"
                    startIcon={<Navigation size={18} />}
                    onClick={async () => {
                      try {
                        // Buton metnini "Yükleniyor..." olarak değiştir
                        const button = document.getElementById('mapButton');
                        if (button) {
                          button.innerHTML = '<span class="MuiCircularProgress-root MuiCircularProgress-indeterminate MuiCircularProgress-colorInherit" style="width: 16px; height: 16px;"></span> Yükleniyor...';
                          button.setAttribute('disabled', 'true');
                        }

                        // Her zaman otel adı ve şehir ile doğrudan arama yap - en güvenilir yöntem
                        const searchQuery = encodeURIComponent(`${selectedHotelForModal.hotelName} hotel ${plan?.destination || ''}`);
                        const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                        window.open(url, "_blank");

                        // Buton metnini geri değiştir
                        if (button) {
                          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation" style="width: 18px; height: 18px;"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg> Haritada Göster';
                          button.removeAttribute('disabled');
                        }
                      } catch (error) {
                        console.error('Harita açma hatası:', error);
                        // Hata durumunda, otel adı ve şehir ile arama yap
                        const searchQuery = encodeURIComponent(`${selectedHotelForModal.hotelName} hotel ${plan?.destination || ''}`);
                        const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                        window.open(url, "_blank");

                        // Buton metnini geri değiştir
                        const button = document.getElementById('mapButton');
                        if (button) {
                          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation" style="width: 18px; height: 18px;"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg> Haritada Göster';
                          button.removeAttribute('disabled');
                        }
                      }
                    }}
                    id="mapButton"
                    sx={{
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      "&:hover": {
                        background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                      },
                    }}
                  >
                    Haritada Göster
                  </Button>
                </Box>
              </Box>

              {/* Otel Fotoğrafları Bölümü - Geliştirilmiş */}
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    color: isDarkMode ? "#93c5fd" : "#2563eb",
                    fontWeight: 600,
                    textAlign: "center",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60px",
                      height: "3px",
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      borderRadius: "3px",
                    }
                  }}
                >
                  Otel Fotoğrafları
                </Typography>

                {/* Ana Fotoğraf Galerisi */}
                <Box
                  id="hotelPhotosContainer"
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: "center",
                    maxHeight: "600px",
                    overflowY: "auto",
                    padding: "20px",
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(241, 245, 249, 0.5)",
                    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                    boxShadow: isDarkMode ? "0 4px 20px rgba(0, 0, 0, 0.3)" : "0 4px 20px rgba(0, 0, 0, 0.1)",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.3)" : "rgba(241, 245, 249, 0.5)",
                      borderRadius: "8px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: isDarkMode ? "rgba(147, 197, 253, 0.5)" : "rgba(37, 99, 235, 0.5)",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "rgba(147, 197, 253, 0.7)" : "rgba(37, 99, 235, 0.7)",
                      },
                    },
                  }}
                >
                  {/* Burada otel fotoğrafları gösterilecek - JavaScript ile doldurulacak */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      padding: "40px 0",
                    }}
                  >
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: `3px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                        borderTop: `3px solid ${isDarkMode ? "#93c5fd" : "#2563eb"}`,
                        animation: "spin 1s linear infinite",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        color: isDarkMode ? "#e5e7eb" : "text.secondary",
                        fontStyle: "italic",
                        textAlign: "center",
                      }}
                    >
                      Fotoğraflar yükleniyor...
                    </Typography>
                    <style jsx global>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 2,
                    color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                    fontStyle: "italic"
                  }}
                >
                  Fotoğraflara tıklayarak tam boyutta görüntüleyebilirsiniz
                </Typography>
              </Box>
            </Box>
          )}

          {/* Kapatma Butonu */}
          <IconButton
            aria-label="close"
            onClick={() => {
              setModalOpen(false);
              setSelectedPhotoForModal(null);
              setSelectedHotelForModal(null);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: isDarkMode ? "white" : "rgba(0, 0, 0, 0.7)",
              bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>

      {/* Önerme/Öneriden Kaldırma Modalı */}
      {plan && (
        <RecommendationModal
          open={recommendationModalOpen}
          onClose={() => setRecommendationModalOpen(false)}
          isCurrentlyRecommended={plan.isRecommended || false}
          planTitle={plan.destination || "Seyahat Planı"}
          onConfirm={async () => {
            try {
              const newRecommendedStatus = !(plan.isRecommended || false);

              if (!tripId) {
                console.error("Trip ID is missing");
                return false;
              }

              // Kullanıcı kontrolü - sadece planı oluşturan kullanıcı değiştirebilir
              if (plan.userId !== user?.id) {
                return false;
              }

              const success = await toggleRecommendation(tripId, newRecommendedStatus, user?.id);

              if (success) {
                setPlan({
                  ...plan,
                  isRecommended: newRecommendedStatus,
                });
                return true;
              }
              return false;
            } catch (error) {
              console.error("Öneri durumu değiştirme hatası:", error);
              return false;
            }
          }}
        />
      )}
    </Box>
  );
}
