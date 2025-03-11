"use client";

import React from "react";
import { Box, List, ListItem, ListItemText, Paper, TextField, Typography, InputAdornment, CircularProgress } from "@mui/material";
import { MapPin, Search } from "lucide-react";
import { useThemeContext } from "../context/ThemeContext";

import { Place } from "../hooks/usePlaces";

interface CitySelectorProps {
  inputValue: string;
  predictions: Place[];
  onInputChange: (value: string) => void;
  onPlaceSelect: (place: Place) => void;
  error?: string;
  isLoading?: boolean;
  placeholder?: string;
  isDomestic?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  inputValue,
  predictions,
  onInputChange,
  onPlaceSelect,
  error,
  isLoading = false,
  placeholder = "Şehir ara...",
  isDomestic = true,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Box sx={{ position: "relative" }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <MapPin 
            size={24} 
            style={{ 
              color: isDarkMode ? '#93c5fd' : '#2563eb',
              background: isDarkMode ? 'rgba(147, 197, 253, 0.1)' : 'rgba(37, 99, 235, 0.1)',
              padding: '8px',
              borderRadius: '12px',
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.01em',
              color: isDarkMode ? '#fff' : 'inherit',
            }}
          >
            Nereyi Keşfetmek İstersiniz?
          </Typography>
        </Box>
        <TextField
          fullWidth
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search 
                  size={20} 
                  style={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  }} 
                />
              </InputAdornment>
            ),
            endAdornment: isLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: isDarkMode ? '#93c5fd' : '#2563eb',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
            },
            '& .MuiInputBase-input': {
              color: isDarkMode ? '#fff' : 'inherit',
              '&::placeholder': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                opacity: 1,
              },
            },
          }}
        />
      </Paper>

      {predictions.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            width: "100%",
            maxHeight: "240px",
            overflow: "hidden",
            mt: 1,
            zIndex: 1000,
            background: isDarkMode ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <List
            sx={{
              maxHeight: "240px",
              overflowY: "auto",
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
              },
            }}
          >
            {predictions.map((prediction, index) => (
              <ListItem
                key={prediction.placeId}
                onClick={() => onPlaceSelect(prediction)}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  },
                  borderBottom: index < predictions.length - 1 
                    ? `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` 
                    : 'none',
                }}
              >
                <ListItemText 
                  primary={
                    <Typography
                      sx={{
                        color: isDarkMode ? '#fff' : 'inherit',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        mb: 0.5,
                      }}
                    >
                      {prediction.mainText}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {prediction.secondaryText}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};
