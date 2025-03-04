"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  Typography,
  Paper,
  Fade,
  useTheme
} from "@mui/material";
import { Map, PlusCircle, MapPin, Calendar } from "lucide-react";

import { TravelPlansList } from "../components/trips/travel-plans-list";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { fetchUserTravelPlans } from "../Services/travel-plans";
import { TravelPlan } from "../types/travel";

export default function TripsPage() {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const theme = useTheme();

  const cityOptions = Array.from(new Set(plans.map(plan => plan.destination)));

  useEffect(() => {
    async function loadTravelPlans() {
      if (!isLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        setError(null);
        const userPlans = await fetchUserTravelPlans(user.id);
        console.log("Fetched plans:", userPlans);
        setPlans(userPlans);
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
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
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
              '&:hover': {
                background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
              }
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
        background: "linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)",
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
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: 3,
              }}>
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
                  <Typography color="text.secondary" sx={{ fontSize: "1.1rem" }}>
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
                    '&:hover': {
                      background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                    }
                  }}
                >
                  Yeni Seyahat Oluştur
                </Button>
              </Box>
            </Paper>

            {plans.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                <Map size={64} className="mx-auto mb-4" style={{ color: theme.palette.text.secondary }} />
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
                <Typography color="text.secondary" sx={{ mb: 4, fontSize: "1.1rem" }}>
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
                    '&:hover': {
                      background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                    }
                  }}
                >
                  İlk Seyahatini Planla
                </Button>
              </Paper>
            ) : (
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
                <FormControl
                  fullWidth
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: "12px",
                      backgroundColor: "white",
                      '&:hover': {
                        backgroundColor: "#f8fafc"
                      }
                    }
                  }}
                >
                  <InputLabel id="city-select-label">Şehir Seçin</InputLabel>
                  <Select
                    labelId="city-select-label"
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    label="Şehir Seçin"
                    startAdornment={<MapPin size={20} style={{ marginRight: 8, color: theme.palette.primary.main }} />}
                  >
                    <MenuItem value="">Tüm Şehirler</MenuItem>
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
              </Paper>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
