"use client";

import { Hotel } from "@/app/types/travel";
import { Grid } from "@mui/material";

import { HotelCard } from "./HotelCard";

interface HotelListProps {
  hotels: Hotel[];
}

export function HotelList({ hotels }: HotelListProps) {
  return (
    <Grid container spacing={3}>
      {hotels.map((hotel, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <HotelCard hotel={hotel} />
        </Grid>
      ))}
    </Grid>
  );
}
