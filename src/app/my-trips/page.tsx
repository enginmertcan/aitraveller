"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { Map, PlusCircle } from "lucide-react";

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
      <Container sx={{ py: 8 }}>
        <div className="text-center text-red-500">{error}</div>
        <Button onClick={() => window.location.reload()} sx={{ mt: 4, mx: "auto", display: "block" }}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 8 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            My Trips
          </Typography>
          <Typography color="text.secondary">Manage and view your travel plans</Typography>
        </Box>
        <Button variant="contained" onClick={() => router.push("/")} startIcon={<PlusCircle />}>
          Create New Trip
        </Button>
      </Box>

      {plans.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <Typography variant="h4" sx={{ mb: 2 }}>
            No trips planned yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 6 }}>
            Start planning your next adventure!
          </Typography>
          <Button variant="contained" onClick={() => router.push("/")}>
            Plan Your First Trip
          </Button>
        </Box>
      ) : (
        <Box>
          <FormControl fullWidth sx={{ mb: 6 }}>
            <InputLabel id="city-select-label">Select a City</InputLabel>
            <Select
              labelId="city-select-label"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              label="Select a City"
            >
              <MenuItem value="">All Cities</MenuItem>
              {cityOptions.map(city => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TravelPlansList plans={selectedCity ? plans.filter(plan => plan.destination === selectedCity) : plans} />
        </Box>
      )}
    </Container>
  );
}
