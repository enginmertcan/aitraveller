"use client";

import React, { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import {
  CrownIcon,
  DollarSign,
  Mountain,
  PalmtreeIcon,
  Tent,
  UserIcon,
  UserPlus2Icon,
  Users,
  Wallet,
} from "lucide-react";

import "dayjs/locale/tr";

const destinations = [
  { label: "Sakarya, Türkiye", value: "sakarya" },
  { label: "İstanbul, Türkiye", value: "istanbul" },
  { label: "Antalya, Türkiye", value: "antalya" },
  { label: "Kapadokya, Türkiye", value: "cappadocia" },
  { label: "Bodrum, Türkiye", value: "bodrum" },
  { label: "Fethiye, Türkiye", value: "fethiye" },
];
const commonIconStyle = { width: "3rem", height: "3rem" }; // Ortak stil tanımlandı

const companionOptions = [
  {
    title: "Tek Başına",
    description: "Özgür bir keşif deneyimi",
    icon: <UserIcon style={{ ...commonIconStyle, color: "#3b82f6" }} />, // Uçuş mavisi
    value: "solo",
  },
  {
    title: "Çift",
    description: "Romantik bir kaçamak",
    icon: <Users style={{ ...commonIconStyle, color: "#ec4899" }} />, // Pembe ton
    value: "couple",
  },
  {
    title: "Aile",
    description: "Unutulmaz aile macerası",
    icon: <UserPlus2Icon style={{ ...commonIconStyle, color: "#22c55e" }} />, // Doğal yeşil tonu
    value: "family",
  },
  {
    title: "Arkadaşlar",
    description: "Eğlenceli grup seyahati",
    icon: <Tent style={{ ...commonIconStyle, color: "#eab308" }} />, // Sıcak sarı
    value: "friends",
  },
];

export default function Home(): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [destination, setDestination] = useState<string | null>(null);
  const [days, setDays] = useState<string>("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);

  const budgetOptions = [
    {
      title: "Ekonomik",
      description: "Bütçe dostu seyahat",
      icon: <Wallet style={{ ...commonIconStyle, color: "#22c55e" }} />, // Daha net bir yeşil
      value: "cheap",
    },
    {
      title: "Standart",
      description: "Dengeli harcama",
      icon: <DollarSign style={{ ...commonIconStyle, color: "#eab308" }} />, // Altın sarısı
      value: "moderate",
    },
    {
      title: "Lüks",
      description: "Premium deneyim",
      icon: <CrownIcon style={{ ...commonIconStyle, color: "#ffd700" }} />, // Altın sarısı renk ile
      value: "luxury",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            borderRadius: "24px",
            p: { xs: 3, md: 4 },
            mb: 4,
            color: "white",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(124, 58, 237, 0.1)",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            }}
          >
            Seyahat Tercihlerinizi Belirleyin
            <Mountain style={{ width: "2.5rem", height: "2.5rem" }} />
            <PalmtreeIcon style={{ width: "2.5rem", height: "2.5rem" }} />
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              opacity: 0.9,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Sizin için özel olarak hazırlanacak seyahat planınız için birkaç detay paylaşın
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: "20px",
            bgcolor: "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1e293b" }}>
                Nereyi Keşfetmek İstersiniz?
              </Typography>
              <Autocomplete
                options={destinations}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder="Gitmek İstediğiniz Yeri Seçiniz"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: "#f1f5f9",
                        },
                      },
                    }}
                  />
                )}
                onChange={(_, newValue) => setDestination(newValue?.value || null)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1e293b" }}>
                Kaç Gün Sürecek
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setDays(prev => String(Math.max(1, Number(prev) - 1)))}
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    color: "#1e293b",
                    borderColor: "#cbd5e1",
                    "&:hover": {
                      borderColor: "#64748b",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  -
                </Button>
                <Typography variant="h6" sx={{ minWidth: "30px", textAlign: "center" }}>
                  {days || 1}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setDays(prev => String(Number(prev) + 1))}
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    color: "#1e293b",
                    borderColor: "#cbd5e1",
                    "&:hover": {
                      borderColor: "#64748b",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1e293b" }}>
                Ne Zaman Yola Çıkmak İstersiniz?
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                <DatePicker
                  value={startDate}
                  onChange={newValue => setStartDate(newValue)}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#1e293b" }}>
                Bütçeniz Nedir?
              </Typography>
              <Grid container spacing={3}>
                {budgetOptions.map(option => (
                  <Grid item xs={12} md={4} key={option.value}>
                    <Card
                      onClick={() => setSelectedBudget(option.value)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.3s",
                        transform: selectedBudget === option.value ? "scale(1.02)" : "scale(1)",
                        border: selectedBudget === option.value ? "2px solid #4F46E5" : "1px solid #e2e8f0",
                        borderRadius: "16px",
                        backgroundColor: selectedBudget === option.value ? "#f8fafc" : "white",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          p: 3,
                        }}
                      >
                        {option.icon}
                        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600, color: "#1e293b" }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {option.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#1e293b" }}>
                Kimlerle Seyahat Edeceksiniz?
              </Typography>
              <Grid container spacing={2}>
                {companionOptions.map(option => (
                  <Grid item xs={12} sm={6} md={3} key={option.value}>
                    <Card
                      onClick={() => setSelectedCompanion(option.value)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.3s",
                        transform: selectedCompanion === option.value ? "scale(1.02)" : "scale(1)",
                        border: selectedCompanion === option.value ? "2px solid #4F46E5" : "1px solid #e2e8f0",
                        borderRadius: "16px",
                        backgroundColor: selectedCompanion === option.value ? "#f8fafc" : "white",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          p: 3,
                        }}
                      >
                        {option.icon}
                        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600, color: "#1e293b" }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {option.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  mt: 2,
                  bgcolor: "#4F46E5",
                  borderRadius: "12px",
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)",
                  "&:hover": {
                    bgcolor: "#4338CA",
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 35px rgba(79, 70, 229, 0.4)",
                  },
                }}
              >
                Seyahat Planını Oluştur
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
