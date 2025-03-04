"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Rating,
  Chip,
  Stack,
  Divider,
  Alert
} from "@mui/material";
import {
  CalendarToday,
  People,
  AccessTime,
  AccountBalance,
  LocationOn,
  AttachMoney
} from "@mui/icons-material";
import { TravelPlan, Hotel, Activity, DayPlan } from "@/app/types/travel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface TravelPlansListProps {
  plans: TravelPlan[];
}

export function TravelPlansList({ plans }: TravelPlansListProps) {
  const [selectedTabs, setSelectedTabs] = useState<{ [key: string]: number }>({});

  const handleTabChange = (planId: string) => (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabs(prev => ({
      ...prev,
      [planId]: newValue
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parse(dateString, "dd/MM/yyyy", new Date());
      return format(date, "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const normalizeItineraryData = (plan: TravelPlan) => {
    if (typeof plan.itinerary === 'string') {
      try {
        const parsedData = JSON.parse(plan.itinerary);
        let normalizedItinerary = [];

        // İstanbul formatı - Array içinde day ve plan
        if (Array.isArray(parsedData.itinerary)) {
          normalizedItinerary = parsedData.itinerary;
        }
        // Kars formatı - itinerary içinde day1, day2 şeklinde
        else if (parsedData.itinerary && typeof parsedData.itinerary === 'object') {
          normalizedItinerary = Object.entries(parsedData.itinerary).map(([dayKey, dayData]: [string, any]) => ({
            day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1).replace(/(\d+)/, ' $1'),
            plan: dayData.map((activity: any) => ({
              time: activity.timeToSpend || activity.timeEstimate || "Flexible",
              placeName: activity.placeName,
              placeDetails: activity.placeDetails,
              placeImageUrl: activity.placeImageUrl || "",
              geoCoordinates: activity.geoCoordinates || { latitude: 0, longitude: 0 },
              ticketPricing: activity.ticketPricing || "Contact for pricing"
            }))
          }));
        }
        // Giresun formatı - doğrudan day1, day2 şeklinde ve theme içeren
        else if (parsedData.day1 || parsedData.day2 || parsedData.day3) {
          normalizedItinerary = Object.entries(parsedData)
            .filter(([key]) => key.startsWith('day'))
            .map(([dayKey, dayData]: [string, any]) => ({
              day: `${dayKey.charAt(0).toUpperCase() + dayKey.slice(1).replace(/(\d+)/, ' $1')}${dayData.theme ? ` - ${dayData.theme}` : ''}`,
              plan: (dayData.activities || []).map((activity: any) => ({
                time: activity.timeEstimate || "Flexible",
                placeName: activity.name,
                placeDetails: activity.description,
                placeImageUrl: activity.imageUrl || "",
                geoCoordinates: activity.geoCoordinates || { latitude: 0, longitude: 0 },
                ticketPricing: activity.ticketPricing || "Contact for pricing"
              }))
            }));
        }

        return {
          ...plan,
          bestTimeToVisit: parsedData.bestTimeToVisit || plan.bestTimeToVisit,
          hotelOptions: parsedData.hotelOptions || [],
          itinerary: normalizedItinerary
        };
      } catch (error) {
        console.error('Error parsing itinerary:', error);
        return {
          ...plan,
          hotelOptions: [],
          itinerary: []
        };
      }
    }
    return plan;
  };

  return (
    <Stack spacing={3}>
      {plans.map((originalPlan: TravelPlan) => {
        const plan = normalizeItineraryData(originalPlan);
        const currentTab = selectedTabs[plan.id] || 0;

        return (
          <Card key={plan.id} elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {plan.destination}
                  </Typography>
                  <Typography color="text.secondary">{plan.groupType}</Typography>
                </Box>
                <Chip label={plan.duration} color="primary" />
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs 
                  value={currentTab} 
                  onChange={handleTabChange(plan.id)} 
                  aria-label="travel plan tabs"
                >
                  <Tab label="Overview" />
                  <Tab label="Hotels" />
                  <Tab label="Itinerary" />
                </Tabs>
              </Box>

              <TabPanel value={currentTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography>
                        {formatDate(plan.startDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <People fontSize="small" color="action" />
                      <Typography>{plan.numberOfPeople}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography>{plan.bestTimeToVisit}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalance fontSize="small" color="action" />
                      <Typography>{plan.budget}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <Stack spacing={2}>
                  {plan.hotelOptions && plan.hotelOptions.length > 0 ? (
                    plan.hotelOptions.map((hotel: Hotel, index: number) => (
                      <Paper key={index} elevation={1} sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="h6">{hotel.hotelName}</Typography>
                          <Rating value={hotel.rating} readOnly precision={0.1} />
                        </Box>
                        <Typography color="text.secondary" paragraph>
                          {hotel.description}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">{hotel.hotelAddress}</Typography>
                        </Box>
                        <Typography color="primary" variant="subtitle2">
                          {hotel.priceRange}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Alert severity="info">No hotel options available</Alert>
                  )}
                </Stack>
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <Stack spacing={3}>
                  {Array.isArray(plan.itinerary) && plan.itinerary.length > 0 ? (
                    plan.itinerary.map((day: DayPlan, index: number) => (
                      <Box key={index}>
                        <Typography variant="h6" gutterBottom>
                          {day.day}
                        </Typography>
                        <Stack spacing={2}>
                          {day.plan?.map((activity: Activity, actIndex: number) => (
                            <Paper key={actIndex} elevation={1} sx={{ p: 2 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {activity.placeName}
                                </Typography>
                                <Typography color="text.secondary">
                                  {activity.time}
                                </Typography>
                              </Box>
                              <Typography color="text.secondary" paragraph>
                                {activity.placeDetails}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <AttachMoney fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {activity.ticketPricing || activity.cost || "Price not specified"}
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Stack>
                        {index < (plan.itinerary?.length || 0) - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    ))
                  ) : (
                    <Alert severity="info">No itinerary available</Alert>
                  )}
                </Stack>
              </TabPanel>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}