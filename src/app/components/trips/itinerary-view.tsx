"use client";

import { AccessTime, LocalActivity } from "@mui/icons-material";
import { Box, Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";

import { DayPlan } from "../../types/travel";

interface ItineraryViewProps {
  itinerary: DayPlan[];
}

export function ItineraryView({ itinerary }: ItineraryViewProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {itinerary.map((day, dayIndex) => (
        <Box key={dayIndex}>
          <Typography variant="h5" gutterBottom>
            {day.day}
          </Typography>
          <Grid container spacing={3}>
            {day.activities?.map((activity, actIndex) => (
              <Grid item xs={12} md={4} key={actIndex}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={activity.placeImageUrl}
                    alt={activity.placeName}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {activity.time}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {activity.placeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {activity.placeDetails}
                    </Typography>
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocalActivity sx={{ fontSize: 20 }} />
                        <Typography variant="body2">{activity.ticketPricing}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccessTime sx={{ fontSize: 20 }} />
                        <Typography variant="body2">{activity.timeToTravel}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
