"use client";

import { Hotel } from "@/app/types/travel";
import { Card, CardContent, CardMedia, Typography, Box, Rating } from "@mui/material";
import { MapPin, DollarSign, Info } from "lucide-react";

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={hotel.hotelImageUrl}
        alt={hotel.hotelName}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            {hotel.hotelName}
          </Typography>
          <Rating value={hotel.rating} precision={0.5} readOnly />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <MapPin size={18} />
          <Typography variant="body2">
            {hotel.hotelAddress}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <DollarSign size={18} />
          <Typography variant="body2">
            {hotel.priceRange}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, color: 'text.secondary', mt: 'auto' }}>
          <Info size={18} style={{ marginTop: '2px' }} />
          <Typography variant="body2">
            {hotel.description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}