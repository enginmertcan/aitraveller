"use client";

import { TravelOverviewProps } from "@/app/types/TravelOverviewProps";
import { CalendarToday, Group, LocationOn } from "@mui/icons-material";
import { Box, Grid, Paper, Typography } from "@mui/material";

export function TravelOverview({ plan }: TravelOverviewProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {plan.destination}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday fontSize="small" />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">{plan.duration}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Group fontSize="small" />
                <Typography variant="body2">{plan.numberOfPeople}</Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Best Time to Visit
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {plan.bestTimeToVisit}
            </Typography>
          </Box>

          {plan.budget && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Budget
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.budget}
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            height: 300,
            backgroundImage: `url(${
              typeof plan.hotelOptions === "string"
                ? "/placeholder.jpg"
                : plan.hotelOptions[0]?.hotelImageUrl || plan.hotelOptions[0]?.imageUrl || "/placeholder.jpg"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 1,
          }}
        />
      </Grid>
    </Grid>
  );
}
