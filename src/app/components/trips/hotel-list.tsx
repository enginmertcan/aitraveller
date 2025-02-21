"use client";

import { Grid, Card, CardContent, CardMedia, Typography, Box, Rating } from "@mui/material";
import { LocationOn, AttachMoney, Info } from "@mui/icons-material";
import { Hotel } from "../../types/travel";

interface HotelListProps {
  hotels: Hotel[];
}

export function HotelList({ hotels }: HotelListProps) {
  return (
    <Grid container spacing={3}>
      {hotels.map((hotel, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
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
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  {hotel.hotelAddress}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <AttachMoney fontSize="small" />
                <Typography variant="body2">
                  {hotel.priceRange}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, color: 'text.secondary', mt: 'auto' }}>
                <Info fontSize="small" sx={{ mt: '2px' }} />
                <Typography variant="body2">
                  {hotel.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}