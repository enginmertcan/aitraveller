"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Container,
  Divider,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import { Heart, Map, MapPin, PlusCircle } from "lucide-react";

import { TravelPlansList } from "../components/trips/travel-plans-list";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { useThemeContext } from "../context/ThemeContext";
import { fetchUserTravelPlans, fetchFavoriteTravelPlans } from "../Services/travel-plans";
import { TravelPlan } from "../types/travel";

export default function TripsPage() {
  const [plans, setPlans] = useState<Partial<TravelPlan>[]>([]);
  const [favoritePlans, setFavoritePlans] = useState<Partial<TravelPlan>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();

  const cityOptions = Array.from(new Set(plans.map(plan => plan.destination)));
  const favoriteCityOptions = Array.from(new Set(favoritePlans.map(plan => plan.destination)));

  // Tab change is now handled directly by button clicks

  useEffect(() => {
    async function loadTravelPlans() {
      if (!isLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Tüm seyahat planlarını yükle
        const userPlans = await fetchUserTravelPlans(user.id);
        setPlans(userPlans);

        // Favori seyahat planlarını yükle
        const userFavoritePlans = await fetchFavoriteTravelPlans(user.id);
        setFavoritePlans(userFavoritePlans);

        console.log("Fetched plans:", userPlans);
        console.log("Fetched favorite plans:", userFavoritePlans);
      } catch (error) {
        console.error("Error loading travel plans:", error);
        setError("Failed to load travel plans. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTravelPlans();
  }, [user, isLoaded, router]);

  if (!isLoaded || isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            background: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
          }}
        >
          <Typography color="error" variant="h6" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            onClick={() => window.location.reload()}
            variant="contained"
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
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)", // Navbar height
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
          : "linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                background: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Seyahatlerim
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                    }}
                  >
                    Seyahat planlarınızı yönetin ve görüntüleyin
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => router.push("/")}
                  startIcon={<PlusCircle />}
                  sx={{
                    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                    borderRadius: "12px",
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": {
                      background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                    },
                  }}
                >
                  Yeni Seyahat Oluştur
                </Button>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                background: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant={activeTab === 0 ? "contained" : "outlined"}
                  onClick={() => setActiveTab(0)}
                  startIcon={<Map size={18} />}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    ...(activeTab === 0
                      ? {
                          background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                          },
                        }
                      : {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          },
                        }),
                  }}
                >
                  Tüm Seyahatlerim
                </Button>
                <Button
                  variant={activeTab === 1 ? "contained" : "outlined"}
                  onClick={() => setActiveTab(1)}
                  startIcon={<Heart size={18} />}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    ...(activeTab === 1
                      ? {
                          background: 'linear-gradient(45deg, #ec4899, #be185d)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #db2777, #9d174d)',
                          },
                        }
                      : {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          },
                        }),
                  }}
                >
                  Favorilerim
                </Button>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {activeTab === 0 && (
                <>
                  {plans.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Map
                        size={64}
                        className="mx-auto mb-4"
                        style={{ color: isDarkMode ? "#fff" : theme.palette.text.secondary }}
                      />
                      <Typography
                        variant="h4"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Henüz planlanmış seyahat yok
                      </Typography>
                      <Typography
                        sx={{
                          mb: 4,
                          fontSize: "1.1rem",
                          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                        }}
                      >
                        Yeni bir maceraya hazır mısın?
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => router.push("/")}
                        startIcon={<PlusCircle />}
                        sx={{
                          background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                          borderRadius: "12px",
                          px: 4,
                          py: 1.5,
                          textTransform: "none",
                          fontSize: "1rem",
                          fontWeight: 600,
                          "&:hover": {
                            background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                          },
                        }}
                      >
                        İlk Seyahatini Planla
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <FormControl
                        fullWidth
                        sx={{
                          mb: 4,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "white",
                            "&:hover": {
                              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#f8fafc",
                            },
                          },
                        }}
                      >
                        <InputLabel
                          id="city-select-label"
                          sx={{
                            color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                          }}
                        >
                          Şehir Seçin
                        </InputLabel>
                        <Select
                          labelId="city-select-label"
                          value={selectedCity}
                          onChange={e => setSelectedCity(e.target.value)}
                          label="Şehir Seçin"
                          startAdornment={
                            <MapPin
                              size={20}
                              style={{
                                marginRight: 8,
                                color: isDarkMode ? "#fff" : theme.palette.primary.main,
                              }}
                            />
                          }
                        >
                          <MenuItem value="">Tümü</MenuItem>
                          {cityOptions.map(city => (
                            <MenuItem key={city} value={city}>
                              {city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TravelPlansList
                        plans={selectedCity ? plans.filter(plan => plan.destination === selectedCity) : plans}
                      />
                    </>
                  )}
                </>
              )}

              {activeTab === 1 && (
                <>
                  {favoritePlans.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Heart
                        size={64}
                        className="mx-auto mb-4"
                        style={{ color: isDarkMode ? "#ec4899" : "#ec4899" }}
                      />
                      <Typography
                        variant="h4"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          background: "linear-gradient(45deg, #ec4899, #be185d)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Henüz favori seyahatiniz yok
                      </Typography>
                      <Typography
                        sx={{
                          mb: 4,
                          fontSize: "1.1rem",
                          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                        }}
                      >
                        Seyahat detay sayfasında &quot;Favorilere Ekle&quot; butonunu kullanarak seyahatlerinizi favorilerinize ekleyebilirsiniz.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <FormControl
                        fullWidth
                        sx={{
                          mb: 4,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "white",
                            "&:hover": {
                              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#f8fafc",
                            },
                          },
                        }}
                      >
                        <InputLabel
                          id="favorite-city-select-label"
                          sx={{
                            color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                          }}
                        >
                          Şehir Seçin
                        </InputLabel>
                        <Select
                          labelId="favorite-city-select-label"
                          value={selectedCity}
                          onChange={e => setSelectedCity(e.target.value)}
                          label="Şehir Seçin"
                          startAdornment={
                            <MapPin
                              size={20}
                              style={{
                                marginRight: 8,
                                color: isDarkMode ? "#fff" : theme.palette.primary.main,
                              }}
                            />
                          }
                        >
                          <MenuItem value="">Tümü</MenuItem>
                          {favoriteCityOptions.map(city => (
                            <MenuItem key={city} value={city}>
                              {city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TravelPlansList
                        plans={selectedCity ? favoritePlans.filter(plan => plan.destination === selectedCity) : favoritePlans}
                      />
                    </>
                  )}
                </>
              )}
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
