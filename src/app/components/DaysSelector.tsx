"use client";

import React from 'react';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import { Minus, Plus } from 'lucide-react';

interface DaysSelectorProps {
  days: number;
  onDaysChange: (days: number) => void;
  error?: string;
}

export const DaysSelector: React.FC<DaysSelectorProps> = ({
  days,
  onDaysChange,
  error,
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Kaç Gün Sürecek?</Typography>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3
      }}>
        <IconButton 
          onClick={() => onDaysChange(days - 1)}
          sx={{ 
            width: 56,
            height: 56,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Minus />
        </IconButton>
        <Typography variant="h4" sx={{ minWidth: 60, textAlign: 'center' }}>
          {days}
        </Typography>
        <IconButton
          onClick={() => onDaysChange(days + 1)}
          sx={{ 
            width: 56,
            height: 56,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Plus />
        </IconButton>
      </Box>
      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
};