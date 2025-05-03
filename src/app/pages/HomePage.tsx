"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  Typography,
  MenuItem,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { Loader2, Crown as MapPin, User as UserIcon, UserPlus2 as UserPlus2Icon } from "lucide-react";
import { useThemeContext } from '../context/ThemeContext';

import "dayjs/locale/tr";

import { AI_PROMPT, budgetOptions, commonIconStyle, companionOptions } from "../constants/options";
import { useTravelPlan } from "../hooks/useTravelPlan";
import { chatSession } from "../Service/AIService";
import { TravelFormState } from "../types/TravelFormState";
import { usePlaces, type Place } from "../hooks/usePlaces";
import { CitySelector } from "../components/CitySelector";
import { getCountries } from "../Services/location.service";

export default function Home(): JSX.Element {
  const { isDarkMode } = useThemeContext();
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formState, setFormState] = useState<TravelFormState>({
    isDomestic: true,
    city: null,
    days: 1,
    startDate: null,
    budget: null,
    companion: null,
    residenceCountry: null,
    citizenship: null,
  });

  const [formErrors, setFormErrors] = useState<{
    city?: string;
    days?: string;
    startDate?: string;
    budget?: string;
    companion?: string;
    residenceCountry?: string;
    citizenship?: string;
  }>({});

  const { isLoaded, predictions, inputValue, setInput, getPlaceDetails, handleSelect } = usePlaces({
    country: formState.isDomestic ? "TR" : undefined,
    types: ["(cities)"],
    debounceMs: 300,
  });
  const { user, isLoaded: isUserLoaded } = useUser();
  const { saveTravelPlan, isLoading: isSaving, error: saveError } = useTravelPlan();

  const [countries, setCountries] = useState<Array<{
    name: { common: string; official: string };
    cca2: string;
    flags: { png: string; svg: string };
  }>>([]);

  const [searchText, setSearchText] = useState({ residence: "", citizenship: "" });
  const [filteredCountries, setFilteredCountries] = useState({
    residence: [] as typeof countries,
    citizenship: [] as typeof countries
  });

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
      residenceCountry?: string;
      citizenship?: string;
    } = {};

    if (!formState.city) {
      errors.city = "Lütfen bir şehir seçin";
    }

    if (!formState.residenceCountry) {
      errors.residenceCountry = "Lütfen yaşadığınız ülkeyi seçin";
    }

    if (!formState.citizenship) {
      errors.citizenship = "Lütfen vatandaşlığınızı seçin";
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
    const details = await getPlaceDetails(place.placeId);
    setFormState(prev => ({
      ...prev,
      city: {
        mainText: place.mainText,
        secondaryText: place.secondaryText,
        placeId: place.placeId,
        country: details?.country || (prev.isDomestic ? "Turkey" : "Unknown"),
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

  const handleDomesticToggle = (isDomestic: boolean) => {
    setFormState(prev => ({
      ...prev,
      isDomestic,
      city: null,
      residenceCountry: isDomestic ? "Turkey" : prev.residenceCountry,
      citizenship: isDomestic ? "Turkey" : prev.citizenship,
    }));
    setInput("");
    // Reset search texts when toggling
    setSearchText({ residence: "", citizenship: "" });
  };

  const handleResidenceCountrySelect = (country: string) => {
    setFormState(prev => ({
      ...prev,
      residenceCountry: country
    }));
    setFormErrors(prev => ({ ...prev, residenceCountry: undefined }));
    setSearchText(prev => ({ ...prev, residence: "" })); // Reset search text after selection
  };

  const handleCitizenshipSelect = (country: string) => {
    setFormState(prev => ({
      ...prev,
      citizenship: country
    }));
    setFormErrors(prev => ({ ...prev, citizenship: undefined }));
    setSearchText(prev => ({ ...prev, citizenship: "" })); // Reset search text after selection
  };

  const handleSearch = (type: "residence" | "citizenship", value: string) => {
    setSearchText(prev => ({ ...prev, [type]: value }));

    const searchValue = value.toLowerCase().trim();
    if (!searchValue) {
      setFilteredCountries(prev => ({ ...prev, [type]: countries }));
      return;
    }

    const filtered = countries.filter(country =>
      country.name.common.toLowerCase().includes(searchValue) ||
      country.name.official.toLowerCase().includes(searchValue)
    );

    setFilteredCountries(prev => ({ ...prev, [type]: filtered }));
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
      // Prompt'u Türkçe olarak hazırla
      const FINAL_PROMPT = AI_PROMPT.replace(
        "{location}",
        formState.city ? `${formState.city.mainText}, ${formState.city.secondaryText}` : "Belirtilmedi"
      )
        .replace("{totalDays}", `${formState.days}` || "1")
        .replace("{traveller}", formState.companion?.title || "Belirtilmedi")
        .replace("{budget}", formState.budget?.title || "Belirtilmedi")
        .replace("{residenceCountry}", formState.residenceCountry || "Belirtilmedi")
        .replace("{citizenship}", formState.citizenship || "Belirtilmedi");

      console.log('Gönderilen prompt:', FINAL_PROMPT);

      const aiResponse = await chatSession.sendMessage(FINAL_PROMPT);
      const aiItinerary = await aiResponse?.response?.text();

      const travelPlanData = {
        id: new Date().getTime().toString(),
        destination: formState.city ? `${formState.city.mainText}, ${formState.city.secondaryText}` : "Not selected",
        days: formState.days,
        duration: `${formState.days} days`,
        startDate: formState.startDate ? dayjs(formState.startDate).format("DD/MM/YYYY") : "Not selected",
        budget: formState.budget?.title || "Not selected",
        groupType: formState.companion?.title || "Not selected",
        numberOfPeople: formState.companion?.people || "Not specified",
        itinerary: aiItinerary,
        bestTimeToVisit: "Not specified",
        hotelOptions: [],
        isDomestic: formState.isDomestic,
        country: formState.city?.country || (formState.isDomestic ? "Turkey" : "Not specified"),
        residenceCountry: formState.residenceCountry || "Not specified",
        citizenship: formState.citizenship || "Not specified",
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

  useEffect(() => {
    const fetchCountries = async () => {
      const fetchedCountries = await getCountries();
      setCountries(fetchedCountries);
      setFilteredCountries({
        residence: fetchedCountries,
        citizenship: fetchedCountries
      });
    };
    fetchCountries();
  }, []);

  if (!isLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: isDarkMode
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 4,
                  fontWeight: 700,
                  color: isDarkMode ? '#fff' : 'inherit',
                  background: isDarkMode
                    ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                    : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Seyahat Planı Oluştur
              </Typography>

              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant={formState.isDomestic ? "contained" : "outlined"}
                    onClick={() => handleDomesticToggle(true)}
                    sx={{
                      flex: 1,
                      background: formState.isDomestic ? (isDarkMode
                        ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)') : 'transparent',
                      '&:hover': {
                        background: formState.isDomestic ? (isDarkMode
                          ? 'linear-gradient(45deg, #60a5fa, #8b5cf6)'
                          : 'linear-gradient(45deg, #1d4ed8, #6d28d9)') : 'rgba(37, 99, 235, 0.1)',
                      },
                    }}
                  >
                    TÜRKİYE GEZİSİ
                  </Button>
                  <Button
                    variant={!formState.isDomestic ? "contained" : "outlined"}
                    onClick={() => handleDomesticToggle(false)}
                    sx={{
                      flex: 1,
                      background: !formState.isDomestic ? (isDarkMode
                        ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)') : 'transparent',
                      '&:hover': {
                        background: !formState.isDomestic ? (isDarkMode
                          ? 'linear-gradient(45deg, #60a5fa, #8b5cf6)'
                          : 'linear-gradient(45deg, #1d4ed8, #6d28d9)') : 'rgba(37, 99, 235, 0.1)',
                      },
                    }}
                  >
                    YURT DıŞı GEZİSİ
                  </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Yaşadığınız Ülke"
                        value={formState.residenceCountry || ''}
                        onChange={(e) => handleResidenceCountrySelect(e.target.value)}
                        error={!!formErrors.residenceCountry}
                        helperText={formErrors.residenceCountry}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: !formState.residenceCountry ? (
                            <Box
                              sx={{
                                position: 'sticky',
                                top: 0,
                                bgcolor: isDarkMode ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                p: 1,
                                width: '100%',
                                zIndex: 1,
                                borderBottom: 1,
                                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Ülke ara..."
                                value={searchText.residence}
                                onChange={(e) => handleSearch("residence", e.target.value)}
                                style={{
                                  border: 'none',
                                  padding: '8px',
                                  width: '100%',
                                  background: 'transparent',
                                  color: isDarkMode ? '#fff' : 'inherit',
                                  outline: 'none',
                                  fontSize: '0.9rem',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Box>
                          ) : null,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            '& fieldset': {
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                          },
                          '& .MuiInputBase-input': {
                            color: isDarkMode ? '#fff' : 'inherit',
                          },
                        }}
                      >
                        {filteredCountries.residence.length > 0 ? (
                          filteredCountries.residence.map((country) => (
                            <MenuItem
                              key={country.cca2}
                              value={country.name.common}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 1,
                              }}
                            >
                              <img
                                src={country.flags.png}
                                alt={`${country.name.common} flag`}
                                style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
                              />
                              {country.name.common}
                            </MenuItem>
                          ))
                        ) : (
                          countries.map((country) => (
                            <MenuItem
                              key={country.cca2}
                              value={country.name.common}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 1,
                              }}
                            >
                              <img
                                src={country.flags.png}
                                alt={`${country.name.common} flag`}
                                style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
                              />
                              {country.name.common}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Vatandaşlık"
                        value={formState.citizenship || ''}
                        onChange={(e) => handleCitizenshipSelect(e.target.value)}
                        error={!!formErrors.citizenship}
                        helperText={formErrors.citizenship}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: !formState.citizenship ? (
                            <Box
                              sx={{
                                position: 'sticky',
                                top: 0,
                                bgcolor: isDarkMode ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                p: 1,
                                width: '100%',
                                zIndex: 1,
                                borderBottom: 1,
                                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Ülke ara..."
                                value={searchText.citizenship}
                                onChange={(e) => handleSearch("citizenship", e.target.value)}
                                style={{
                                  border: 'none',
                                  padding: '8px',
                                  width: '100%',
                                  background: 'transparent',
                                  color: isDarkMode ? '#fff' : 'inherit',
                                  outline: 'none',
                                  fontSize: '0.9rem',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Box>
                          ): null,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            '& fieldset': {
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                          },
                          '& .MuiInputBase-input': {
                            color: isDarkMode ? '#fff' : 'inherit',
                          },
                        }}
                      >
                        {filteredCountries.citizenship.length > 0 ? (
                          filteredCountries.citizenship.map((country) => (
                            <MenuItem
                              key={country.cca2}
                              value={country.name.common}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 1,
                              }}
                            >
                              <img
                                src={country.flags.png}
                                alt={`${country.name.common} flag`}
                                style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
                              />
                              {country.name.common}
                            </MenuItem>
                          ))
                        ) : (
                          countries.map((country) => (
                            <MenuItem
                              key={country.cca2}
                              value={country.name.common}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 1,
                              }}
                            >
                              <img
                                src={country.flags.png}
                                alt={`${country.name.common} flag`}
                                style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
                              />
                              {country.name.common}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>

                <CitySelector
                  inputValue={inputValue}
                  predictions={predictions}
                  onInputChange={setInput}
                  onPlaceSelect={handlePlaceSelect}
                  error={formErrors.city}
                  placeholder="Şehir ara..."
                  isDomestic={formState.isDomestic}
                />

                <TextField
                  type="number"
                  fullWidth
                  label="Kaç Gün"
                  value={formState.days}
                  onChange={e => handleDaysChange(parseInt(e.target.value))}
                  error={!!formErrors.days}
                  helperText={formErrors.days}
                  inputProps={{ min: 1, max: 5 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      '& fieldset': {
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? '#fff' : 'inherit',
                    },
                  }}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                  <DatePicker
                    label="Başlangıç Tarihi"
                    value={formState.startDate ? dayjs(formState.startDate) : null}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.startDate,
                        helperText: formErrors.startDate,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? '#fff' : 'inherit',
                      },
                    }}
                  />
                </LocalizationProvider>

                <Grid container spacing={2}>
                  {budgetOptions.map(option => (
                    <Grid item xs={12} sm={6} md={4} key={option.value}>
                      <Card
                        elevation={0}
                        onClick={() => handleBudgetSelect(option)}
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          background: formState.budget?.value === option.value
                            ? (isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)')
                            : (isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
                          borderRadius: "12px",
                          border: `1px solid ${
                            formState.budget?.value === option.value
                              ? (isDarkMode ? '#93c5fd' : '#2563eb')
                              : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                          }`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isDarkMode
                              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                              : '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: `1px solid ${isDarkMode ? '#93c5fd' : '#2563eb'}`,
                          },
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 1,
                              color: isDarkMode ? '#93c5fd' : '#2563eb',
                            }}
                          >
                            {option.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            }}
                          >
                            {option.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={2}>
                  {companionOptions.map(option => (
                    <Grid item xs={12} sm={6} key={option.value}>
                      <Card
                        elevation={0}
                        onClick={() => handleCompanionSelect(option)}
                        sx={{
                          height: "100%",
                          cursor: "pointer",
                          background: formState.companion?.value === option.value
                            ? (isDarkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)')
                            : (isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
                          borderRadius: "12px",
                          border: `1px solid ${
                            formState.companion?.value === option.value
                              ? (isDarkMode ? '#a78bfa' : '#7c3aed')
                              : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                          }`,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isDarkMode
                              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                              : '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: `1px solid ${isDarkMode ? '#a78bfa' : '#7c3aed'}`,
                          },
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 1,
                              color: isDarkMode ? '#a78bfa' : '#7c3aed',
                            }}
                          >
                            {option.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            }}
                          >
                            {option.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="contained"
                  onClick={handleCreatePlan}
                  disabled={isCreatingPlan || isSaving}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    background: isDarkMode
                      ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                      : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                    borderRadius: "12px",
                    "&:hover": {
                      background: isDarkMode
                        ? 'linear-gradient(45deg, #60a5fa, #8b5cf6)'
                        : 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                    },
                  }}
                >
                  {isCreatingPlan || isSaving ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Seyahat Planı Oluştur"
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: "100%",
                background: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {!user ? (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: isDarkMode ? '#fff' : 'inherit',
                      background: isDarkMode
                        ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Hoş Geldiniz!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    }}
                  >
                    Seyahat planı oluşturmak için lütfen giriş yapın veya kayıt olun.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      href="/sign-in"
                      startIcon={<UserIcon />}
                      sx={{
                        background: isDarkMode
                          ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                          : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                        borderRadius: "12px",
                        "&:hover": {
                          background: isDarkMode
                            ? 'linear-gradient(45deg, #60a5fa, #8b5cf6)'
                            : 'linear-gradient(45deg, #1d4ed8, #6d28d9)',
                        },
                      }}
                    >
                      Giriş Yap
                    </Button>
                    <Button
                      variant="outlined"
                      href="/sign-up"
                      startIcon={<UserPlus2Icon />}
                      sx={{
                        borderColor: isDarkMode ? '#93c5fd' : '#2563eb',
                        color: isDarkMode ? '#93c5fd' : '#2563eb',
                        borderRadius: "12px",
                        "&:hover": {
                          borderColor: isDarkMode ? '#60a5fa' : '#1d4ed8',
                          backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                        },
                      }}
                    >
                      Kayıt Ol
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: isDarkMode ? '#fff' : 'inherit',
                      background: isDarkMode
                        ? 'linear-gradient(45deg, #93c5fd, #a78bfa)'
                        : 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Hoş Geldiniz, {user.firstName || user.lastName}!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    }}
                  >
                    Yeni bir seyahat planı oluşturmaya başlayabilirsiniz.
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
        open={isCreatingPlan || isSaving}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Seyahat planınız oluşturuluyor...</Typography>
        </Box>
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            backgroundColor: isDarkMode
              ? (snackbar.severity === "success" ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)')
              : undefined,
            color: isDarkMode ? '#fff' : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
