"use client";

import React from "react";
import { Paper, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import "dayjs/locale/tr";

interface DateSelectorProps {
  date: Date | null;
  onDateChange: (date: dayjs.Dayjs | null) => void;
  error?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ date, onDateChange, error }) => (
  <Paper elevation={3} sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ mb: 3 }}>
      Ne Zaman Yola Çıkmak İstersiniz?
    </Typography>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <DatePicker
        value={date ? dayjs(date) : null}
        onChange={onDateChange}
        slotProps={{
          textField: {
            fullWidth: true,
            error: !!error,
            helperText: error,
          },
        }}
      />
    </LocalizationProvider>
  </Paper>
);
