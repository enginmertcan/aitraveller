"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import {
  Crown as CrownIcon,
  DollarSign,
  MapPin,
  Tent,
  User as UserIcon,
  UserPlus2 as UserPlus2Icon,
  Users,
  Wallet,
} from "lucide-react";

import { theme } from "../../theme";
import { usePlaces, type Place } from "../hooks/usePlaces";
import { TravelFormState } from "../types/travel";

import "dayjs/locale/tr";

const commonIconStyle = { width: "2.5rem", height: "2.5rem", strokeWidth: 1.5 };

const companionOptions = [
  {
    title: "Tek Başına",
    description: "Özgür bir keşif deneyimi",
    icon: <UserIcon style={{ ...commonIconStyle, color: "#3B82F6" }} />,
    value: "solo",
    people: "1 Kişi",
  },
  {
    title: "Çift",
    description: "Romantik bir kaçamak",
    icon: <Users style={{ ...commonIconStyle, color: "#EC4899" }} />,
    value: "couple",
    people: "2 Kişi",
  },
  {
    title: "Aile",
    description: "Unutulmaz aile macerası",
    icon: <UserPlus2Icon style={{ ...commonIconStyle, color: "#10B981" }} />,
    value: "family",
    people: "3-5 Kişi",
  },
  {
    title: "Arkadaşlar",
    description: "Eğlenceli grup seyahati",
    icon: <Tent style={{ ...commonIconStyle, color: "#F59E0B" }} />,
    value: "friends",
    people: "5-10 Kişi",
  },
];

const budgetOptions = [
  {
    title: "Ekonomik",
    description: "Bütçe dostu seyahat",
    icon: <Wallet style={{ ...commonIconStyle, color: "#10B981" }} />,
    value: "cheap",
  },
  {
    title: "Standart",
    description: "Dengeli harcama",
    icon: <DollarSign style={{ ...commonIconStyle, color: "#F59E0B" }} />,
    value: "moderate",
  },
  {
    title: "Lüks",
    description: "Premium deneyim",
    icon: <CrownIcon style={{ ...commonIconStyle, color: "#6366F1" }} />,
    value: "luxury",
  },
];

export default function Home(): JSX.Element {
  const { isLoaded, predictions, inputValue, setInput, getPlaceDetails, handleSelect } = usePlaces({
    country: "TR",
    types: ["(cities)"],
    debounceMs: 300,
  });

  const [formState, setFormState] = useState<TravelFormState>({
    city: null,
    days: 1,
    startDate: null,
    budget: null,
    companion: null,
  });

  const [formErrors, setFormErrors] = useState<{
    city?: string;
    days?: string;
    startDate?: string;
    budget?: string;
    companion?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      city?: string;
      days?: string;
      startDate?: string;
      budget?: string;
      companion?: string;
    } = {};

    // Validate city selection
    if (!formState.city) {
      errors.city = "Lütfen bir şehir seçin";
    }

    // Validate days
    if (formState.days < 1) {
      errors.days = "Gün sayısı en az 1 olmalıdır";
    }

    // Validate start date
    if (!formState.startDate) {
      errors.startDate = "Lütfen bir tarih seçin";
    } else if (dayjs(formState.startDate).isBefore(dayjs(), "day")) {
      errors.startDate = "Geçmiş bir tarih seçemezsiniz";
    }

    // Validate budget
    if (!formState.budget) {
      errors.budget = "Lütfen bir bütçe seçin";
    }

    // Validate companion
    if (!formState.companion) {
      errors.companion = "Lütfen seyahat arkadaşınızı seçin";
    }

    return errors;
  };

  // Log state changes
  useEffect(() => {
    console.log("Current Travel Plan:", {
      city: formState.city ? `${formState.city.mainText}, ${formState.city.secondaryText}` : null,
      days: formState.days,
      startDate: formState.startDate,
      budget: formState.budget?.title,
      companion: formState.companion
        ? {
        type: formState.companion.title,
        people: formState.companion.people,
          }
        : null,
    });
  }, [formState]);

  const handlePlaceSelect = async (place: Place) => {
    handleSelect(place);
    await getPlaceDetails(place.placeId);
    setFormState(prev => ({
      ...prev,
      city: {
        mainText: place.mainText,
        secondaryText: place.secondaryText,
        placeId: place.placeId,
      },
    }));
    setFormErrors(prev => ({ ...prev, city: undefined })); // Hata mesajını temizler
  };

  const handleBudgetSelect = (option: (typeof budgetOptions)[0]) => {
    setFormState(prev => ({
      ...prev,
      budget: {
        value: option.value,
        title: option.title,
        description: option.description,
      },
    }));
    setFormErrors(prev => ({ ...prev, budget: undefined })); // Hata mesajını temizler
  };

  const handleCompanionSelect = (option: (typeof companionOptions)[0]) => {
    setFormState(prev => ({
      ...prev,
      companion: {
        value: option.value,
        title: option.title,
        description: option.description,
        people: option.people,
      },
    }));
    setFormErrors(prev => ({ ...prev, companion: undefined })); // Hata mesajını temizler
  };
  const handleDaysChange = (newDays: number) => {
    if (newDays < 1) {
      setFormErrors(prev => ({ ...prev, days: "Gün sayısı en az 1 olmalıdır" }));
      return;
    }
    if (newDays > 5) {
      setFormErrors(prev => ({ ...prev, days: "En fazla 5 günlük plan yapılır" }));
      return;
    }
    setFormState(prev => ({
      ...prev,
      days: newDays,
    }));
    setFormErrors(prev => ({ ...prev, days: undefined })); // Hata mesajını temizler
  };
  useEffect(() => {
    if (formState.startDate && dayjs(formState.startDate).isBefore(dayjs(), "day")) {
      setFormErrors(prev => ({ ...prev, startDate: "Geçmiş bir tarih seçemezsiniz" }));
    }
  }, [formState.startDate]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setFormState(prev => ({
      ...prev,
      startDate: date ? date.toDate() : null,
    }));
    if (date && !dayjs(date).isBefore(dayjs(), "day")) {
      setFormErrors(prev => ({ ...prev, startDate: undefined })); // Hata mesajını temizler
    }
  };

  const handleCreatePlan = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    console.log("Final Travel Plan:", {
      destination: formState.city ? `${formState.city.mainText}, ${formState.city.secondaryText}` : "Not selected",
      duration: `${formState.days} days`,
      startDate: formState.startDate ? dayjs(formState.startDate).format("DD/MM/YYYY") : "Not selected",
      budget: formState.budget?.title || "Not selected",
      groupType: formState.companion?.title || "Not selected",
      numberOfPeople: formState.companion?.people || "Not specified",
    });
  };

  if (!isLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h1" sx={{ color: "primary.main", mb: 2 }}>
              Seyahat Planı Oluştur
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "600px", mx: "auto" }}>
              Hayalinizdeki tatili planlamak için aşağıdaki adımları takip edin
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* City Selection Grid */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <MapPin style={{ color: theme.palette.primary.main, ...commonIconStyle }} />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      Nereyi Keşfetmek İstersiniz?
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    value={inputValue}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Şehir ara..."
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.paper",
                      },
                    }}
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                  />
                  {predictions.length > 0 && (
                    <Paper
                      elevation={2}
                      sx={{
                        mt: 1,
                        maxHeight: "300px",
                        overflow: "auto",
                        borderRadius: 3,
                      }}
                    >
                      {predictions.map(prediction => (
                        <Box
                          key={prediction.placeId}
                          onClick={() => handlePlaceSelect(prediction)}
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "primary.light",
                              color: "white",
                            },
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={500}>
                            {prediction.mainText}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {prediction.secondaryText}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Days Selection Grid */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Kaç Gün Sürecek?
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleDaysChange(formState.days - 1)}
                      sx={{ minWidth: 56, height: 56, borderRadius: "50%" }}
                    >
                      -
                    </Button>
                    <Typography variant="h4" sx={{ minWidth: 60, textAlign: "center", fontWeight: 600 }}>
                      {formState.days}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleDaysChange(formState.days + 1)}
                      sx={{ minWidth: 56, height: 56, borderRadius: "50%" }}
                    >
                      +
                    </Button>
                  </Box>
                  {formErrors.days && (
                    <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                      {formErrors.days}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Date Selection Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Ne Zaman Yola Çıkmak İstersiniz?
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                    <DatePicker
                      value={formState.startDate ? dayjs(formState.startDate) : null}
                      onChange={handleDateChange}
                      sx={{ width: "100%" }}
                      slotProps={{
                        textField: {
                          placeholder: "Tarih seçin",
                          error: !!formErrors.startDate,
                          helperText: formErrors.startDate,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </CardContent>
              </Card>
            </Grid>

            {/* Budget Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Bütçeniz Nedir?
              </Typography>
              {formErrors.budget && (
                <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
                  {formErrors.budget}
                </Typography>
              )}
              <Grid container spacing={3}>
                {budgetOptions.map(option => (
                  <Grid item xs={12} md={4} key={option.value}>
                    <Card
                      onClick={() => handleBudgetSelect(option)}
                      sx={{
                        cursor: "pointer",
                        border:
                          formState.budget?.value === option.value ? `2px solid ${theme.palette.primary.main}` : "none",
                        boxShadow: formErrors.budget ? "0 0 10px rgba(255,0,0,0.3)" : "inherit",
                      }}
                    >
                      <CardContent sx={{ p: 4, textAlign: "center" }}>
                        {option.icon}
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Companion Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Kimlerle Seyahat Edeceksiniz?
              </Typography>
              {formErrors.companion && (
                <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
                  {formErrors.companion}
                </Typography>
              )}
              <Grid container spacing={3}>
                {companionOptions.map(option => (
                  <Grid item xs={6} sm={3} key={option.value}>
                    <Card
                      onClick={() => handleCompanionSelect(option)}
                      sx={{
                        cursor: "pointer",
                        border:
                          formState.companion?.value === option.value
                            ? `2px solid ${theme.palette.primary.main}`
                            : "none",
                        boxShadow: formErrors.companion ? "0 0 10px rgba(255,0,0,0.3)" : "inherit",
                      }}
                    >
                      <CardContent sx={{ p: 4, textAlign: "center" }}>
                        {option.icon}
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                          {option.people}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Create Plan Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCreatePlan}
                sx={{
                  py: 3,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                }}
              >
                Seyahat Planını Oluştur
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
