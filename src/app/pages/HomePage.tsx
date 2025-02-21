"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { Loader2, Crown as MapPin, User as UserIcon, UserPlus2 as UserPlus2Icon } from "lucide-react";

import { theme } from "../../theme";
import { usePlaces, type Place } from "../hooks/usePlaces";

import "dayjs/locale/tr";

import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

import { AI_PROMPT, budgetOptions, commonIconStyle, companionOptions } from "../constants/options";
import { useTravelPlan } from "../hooks/useTravelPlan";
import { chatSession } from "../Service/AIService";
import { db } from "../Service/firebaseConfig";
import { TravelFormState } from "../types/TravelFormState";

export default function Home(): JSX.Element {
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { isLoaded, predictions, inputValue, setInput, getPlaceDetails, handleSelect } = usePlaces({
    country: "TR",
    types: ["(cities)"],
    debounceMs: 300,
  });
  const { user, isLoaded: isUserLoaded } = useUser();
  const { saveTravelPlan, isLoading: isSaving, error: saveError } = useTravelPlan();

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

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = () => {
    const errors: {
      city?: string;
      days?: string;
      startDate?: string;
      budget?: string;
      companion?: string;
    } = {};

    if (!formState.city) {
      errors.city = "Lütfen bir şehir seçin";
    }

    if (formState.days < 1) {
      errors.days = "Gün sayısı en az 1 olmalıdır";
    }

    if (!formState.startDate) {
      errors.startDate = "Lütfen bir tarih seçin";
    } else if (dayjs(formState.startDate).isBefore(dayjs(), "day")) {
      errors.startDate = "Geçmiş bir tarih seçemezsiniz";
    }

    if (!formState.budget) {
      errors.budget = "Lütfen bir bütçe seçin";
    }

    if (!formState.companion) {
      errors.companion = "Lütfen seyahat arkadaşınızı seçin";
    }

    return errors;
  };

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
    setFormErrors(prev => ({ ...prev, city: undefined }));
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
    setFormErrors(prev => ({ ...prev, budget: undefined }));
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
    setFormErrors(prev => ({ ...prev, companion: undefined }));
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
    setFormErrors(prev => ({ ...prev, days: undefined }));
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
      setFormErrors(prev => ({ ...prev, startDate: undefined }));
    }
  };

  const handleCreatePlan = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!user) {
      setSnackbar({
        open: true,
        message: "Lütfen seyahat planı oluşturmak için giriş yapın",
        severity: "error",
      });
      return;
    }

    setIsCreatingPlan(true);

    try {
      const FINAL_PROMPT = AI_PROMPT.replace(
        "{location}",
        formState.city ? `${formState.city.mainText}, ${formState.city.secondaryText}` : "Belirtilmedi"
      )
        .replace("{totalDays}", `${formState.days}` || "1")
        .replace("{traveller}", formState.companion?.title || "Belirtilmedi")
        .replace("{budget}", formState.budget?.title || "Belirtilmedi");

      const aiResponse = await chatSession.sendMessage(FINAL_PROMPT);
      const aiItinerary = await aiResponse?.response?.text();

      const travelPlanData = {
        id: new Date().getTime().toString(),
        destination: formState.city ? `${formState.city.mainText}, ${formState.city.secondaryText}` : "Not selected",
        duration: `${formState.days} days`,
        startDate: formState.startDate ? dayjs(formState.startDate).format("DD/MM/YYYY") : "Not selected",
        budget: formState.budget?.title || "Not selected",
        groupType: formState.companion?.title || "Not selected",
        numberOfPeople: formState.companion?.people || "Not specified",
        itinerary: aiItinerary,
        bestTimeToVisit: "Not specified",
        hotelOptions: [],
      };

      const savedPlanId = await saveTravelPlan(travelPlanData);

      if (savedPlanId) {
        setSnackbar({
          open: true,
          message: "Seyahat planınız başarıyla oluşturuldu!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error creating travel plan:", error);
      setSnackbar({
        open: true,
        message: "Seyahat planı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        severity: "error",
      });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  if (!isLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
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
                disabled={isCreatingPlan}
                sx={{
                  py: 3,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  position: "relative",
                }}
              >
                {isCreatingPlan ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Seyahat Planı Oluşturuluyor...
                  </>
                ) : (
                  "Seyahat Planını Oluştur"
                )}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: theme => theme.zIndex.drawer + 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        open={isCreatingPlan}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" component="div">
          Seyahat Planınız Oluşturuluyor...
        </Typography>
        <Typography variant="body2" color="inherit">
          Bu işlem birkaç saniye sürebilir
        </Typography>
      </Backdrop>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
