"use client";
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { TravelPlan } from '../types/TravelPlan';
import { useTravelPlan } from '../hooks/useTravelPlan';
import TravelPlansList from '../components/TravelPlansList';

export default function ReservationsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getUserTravelPlans, isLoading, error } = useTravelPlan();
  const [plans, setPlans] = useState<(TravelPlan & { id: string })[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false); // State to track if data is already fetched

  useEffect(() => {
    const fetchPlans = async () => {
      if (user && !isDataFetched) {  // Check if the data has been already fetched
        setIsFetching(true);
        try {
          const userPlans = await getUserTravelPlans();
          setPlans(userPlans);
          setIsDataFetched(true); // Mark data as fetched
        } catch (fetchError) {
          console.error('Failed to fetch travel plans', fetchError);
        } finally {
          setIsFetching(false);
        }
      }
    };

    if (isUserLoaded && user) {
      fetchPlans();
    }
  }, [user, isUserLoaded, getUserTravelPlans, isDataFetched]); // Include isDataFetched to prevent multiple fetches

  const isLoadingContent = !isUserLoaded || isLoading || isFetching;

  if (isLoadingContent) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          Please sign in to view your reservations
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Your Travel Reservations
      </Typography>
      
      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading travel plans: {error}
        </Typography>
      ) : plans.length === 0 ? (
        <Typography variant="body1" align="center">
          No travel plans found
        </Typography>
      ) : (
        <TravelPlansList plans={plans} />
      )}
    </Container>
  );
}
