"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Email, GitHub, Instagram, LinkedIn, LocationOn, Phone, Send } from "@mui/icons-material";

import { useThemeContext } from "../context/ThemeContext";

export default function ContactPage() {
  const { isDarkMode } = useThemeContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderimi simülasyonu
    setTimeout(() => {
      setFormStatus({
        success: true,
        message: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "16px",
          background: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          boxShadow: isDarkMode
            ? "0 10px 30px rgba(0, 0, 0, 0.3)"
            : "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 4,
            fontWeight: 700,
            textAlign: "center",
            color: isDarkMode ? "#e5e7eb" : "#111827",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
            },
          }}
        >
          İletişim
        </Typography>

        <Grid container spacing={6}>
          {/* Sol Taraf - İletişim Bilgileri */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "16px",
                background: isDarkMode
                  ? "linear-gradient(145deg, #1e293b, #111827)"
                  : "linear-gradient(145deg, #f9fafb, #f3f4f6)",
                boxShadow: isDarkMode
                  ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                  : "0 8px 32px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
              >
                Bize Ulaşın
              </Typography>

              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    <Email sx={{ fontSize: 20, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280", mb: 0.5 }}
                    >
                      E-posta
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, color: isDarkMode ? "#e5e7eb" : "#111827" }}
                    >
                      mertcanengin@ogr.bandirma.edu.tr
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    <Phone sx={{ fontSize: 20, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280", mb: 0.5 }}
                    >
                      Telefon
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, color: isDarkMode ? "#e5e7eb" : "#111827" }}
                    >
                      +90 (544) 466 2875
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    <LocationOn sx={{ fontSize: 20, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280", mb: 0.5 }}
                    >
                      Adres
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, color: isDarkMode ? "#e5e7eb" : "#111827" }}
                    >
                      Bandırma, Balıkesir, Türkiye
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 4, borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
              >
                Sosyal Medya
              </Typography>

              <Stack direction="row" spacing={2}>
                <Link href="https://linkedin.com/in/mertcanenginn54" target="_blank" rel="noopener noreferrer">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "linear-gradient(45deg, #0077B5, #0A66C2)",
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 16px rgba(0, 119, 181, 0.3)",
                        "& svg": {
                          color: "white !important",
                        },
                      },
                    }}
                  >
                    <LinkedIn sx={{ fontSize: 20, color: isDarkMode ? "#e5e7eb" : "#111827" }} />
                  </Box>
                </Link>

                <Link href="https://github.com/enginmertcan" target="_blank" rel="noopener noreferrer">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: isDarkMode ? "#333" : "#24292e",
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
                        "& svg": {
                          color: "white !important",
                        },
                      },
                    }}
                  >
                    <GitHub sx={{ fontSize: 20, color: isDarkMode ? "#e5e7eb" : "#111827" }} />
                  </Box>
                </Link>

                <Link href="https://instagram.com/enginmertcan" target="_blank" rel="noopener noreferrer">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "linear-gradient(45deg, #833AB4, #E1306C, #F77737)",
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 16px rgba(225, 48, 108, 0.3)",
                        "& svg": {
                          color: "white !important",
                        },
                      },
                    }}
                  >
                    <Instagram sx={{ fontSize: 20, color: isDarkMode ? "#e5e7eb" : "#111827" }} />
                  </Box>
                </Link>
              </Stack>
            </Card>
          </Grid>

          {/* Sağ Taraf - İletişim Formu */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                background: isDarkMode ? "rgba(17, 24, 39, 0.6)" : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                boxShadow: isDarkMode
                  ? "0 8px 32px rgba(0, 0, 0, 0.2)"
                  : "0 8px 32px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
              >
                Mesaj Gönder
              </Typography>

              <form
                onSubmit={handleSubmit}
                action="mailto:mertcanengin@ogr.bandirma.edu.tr"
                method="post"
                encType="text/plain"
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Adınız"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-posta Adresiniz"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Konu"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mesajınız"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={5}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      startIcon={<Send sx={{ fontSize: 18 }} />}
                      sx={{
                        py: 1.5,
                        background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                          boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
                        },
                      }}
                    >
                      Gönder
                    </Button>
                  </Grid>
                </Grid>
              </form>

              {formStatus && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: formStatus.success
                      ? isDarkMode
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(16, 185, 129, 0.1)"
                      : isDarkMode
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${
                      formStatus.success
                        ? isDarkMode
                          ? "rgba(16, 185, 129, 0.5)"
                          : "rgba(16, 185, 129, 0.3)"
                        : isDarkMode
                          ? "rgba(239, 68, 68, 0.5)"
                          : "rgba(239, 68, 68, 0.3)"
                    }`,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: formStatus.success
                        ? isDarkMode
                          ? "rgb(16, 185, 129)"
                          : "rgb(4, 120, 87)"
                        : isDarkMode
                          ? "rgb(239, 68, 68)"
                          : "rgb(185, 28, 28)",
                    }}
                  >
                    {formStatus.message}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
