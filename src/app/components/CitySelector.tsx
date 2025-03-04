"use client";

import React from "react";
import { Box, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { MapPin } from "lucide-react";

import { Place } from "../hooks/usePlaces";

interface CitySelectorProps {
  inputValue: string;
  predictions: Place[];
  onInputChange: (value: string) => void;
  onPlaceSelect: (place: Place) => void;
  error?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  inputValue,
  predictions,
  onInputChange,
  onPlaceSelect,
  error,
}) => (
  <Paper elevation={3} sx={{ p: 3, position: "relative" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <MapPin color="#1976d2" size={24} />
      <Typography variant="h6">Nereyi Keşfetmek İstersiniz?</Typography>
    </Box>
    <TextField
      fullWidth
      value={inputValue}
      onChange={e => onInputChange(e.target.value)}
      placeholder="Şehir ara..."
      error={!!error}
      helperText={error}
    />
    {predictions.length > 0 && (
      <Paper
        elevation={2}
        sx={{
          position: "absolute",
          width: "100%",
          left: 0,
          mt: 1,
          maxHeight: 300,
          overflow: "auto",
          zIndex: 1000,
        }}
      >
        <List>
          {predictions.map(prediction => (
            <ListItem
              key={prediction.placeId}
              onClick={() => onPlaceSelect(prediction)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemText primary={prediction.mainText} secondary={prediction.secondaryText} />
            </ListItem>
          ))}
        </List>
      </Paper>
    )}
  </Paper>
);
