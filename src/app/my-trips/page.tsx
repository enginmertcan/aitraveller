"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Map, Container } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { TravelPlan } from "../types/travel";
import { fetchUserTravelPlans } from "../Services/travel-plans";
import { Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { TravelPlansList } from "../components/trips/travel-plans-list";
import { LoadingSpinner } from "../components/ui/loading-spinner";

export default function TripsPage() {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Kayıtlı şehirlerin listesini almak
  const cityOptions = Array.from(new Set(plans.map((plan) => plan.destination)));

  // Kullanıcının kayıtlı gezilerini Firebase'den çekmek
  useEffect(() => {
    async function loadTravelPlans() {
      if (!isLoaded) return;
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      try {
        setError(null);
        const userPlans = await fetchUserTravelPlans(user.id);
        console.log('Fetched plans:', userPlans);
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
      <Container className="py-8">
        <div className="text-center text-red-500">{error}</div>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 mx-auto block"
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Trips</h1>
          <p className="text-muted-foreground">
            Manage and view your travel plans
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Trip
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No trips planned yet</h2>
          <p className="text-muted-foreground mb-6">
            Start planning your next adventure!
          </p>
          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            Plan Your First Trip
          </Button>
        </div>
      ) : (
        <div>
          {/* Şehir seçme kutusu */}
          <FormControl fullWidth className="mb-6">
            <InputLabel id="city-select-label">Select a City</InputLabel>
            <Select
              labelId="city-select-label"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cityOptions.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Şehir seçildiğinde ilgili gezileri göster */}
          <TravelPlansList
            plans={selectedCity ? plans.filter((plan) => plan.destination === selectedCity) : plans}
          />
        </div>
      )}
    </Container>
  );
}
