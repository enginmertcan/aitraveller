"use client";

import React from "react";
import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { CheckCircle, Info, Shield } from "@mui/icons-material";

import { useThemeContext } from "../context/ThemeContext";

export default function PrivacyPolicyPage() {
  const { isDarkMode } = useThemeContext();

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Shield
            sx={{
              fontSize: 32,
              color: isDarkMode ? "#93c5fd" : "#2563eb",
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: isDarkMode ? "#e5e7eb" : "#111827",
            }}
          >
            Gizlilik Politikası
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: isDarkMode ? "#d1d5db" : "#4b5563",
            lineHeight: 1.7,
          }}
        >
          Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: isDarkMode ? "#d1d5db" : "#4b5563",
            lineHeight: 1.7,
          }}
        >
          AI Traveller olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu
          gizlilik politikası, hizmetlerimizi kullanırken hangi bilgileri topladığımızı, bu bilgileri nasıl
          kullandığımızı ve koruduğumuzu açıklamaktadır.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: isDarkMode ? "#e5e7eb" : "#111827",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Info sx={{ fontSize: 24, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
            Topladığımız Bilgiler
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            AI Traveller uygulamasını kullanırken aşağıdaki bilgileri toplayabiliriz:
          </Typography>

          <List>
            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Kişisel Bilgiler"
                secondary="Ad, e-posta adresi, profil fotoğrafı gibi hesap oluşturma ve yönetme için gerekli bilgiler."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Seyahat Tercihleri"
                secondary="Seyahat planlarınızı oluşturmak için girdiğiniz destinasyon, tarih, bütçe ve tercihler gibi bilgiler."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Kullanım Verileri"
                secondary="Uygulama içindeki etkileşimleriniz, ziyaret ettiğiniz sayfalar ve kullanım alışkanlıklarınız."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Cihaz Bilgileri"
                secondary="IP adresi, tarayıcı türü, cihaz türü ve işletim sistemi gibi teknik bilgiler."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4, borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: isDarkMode ? "#e5e7eb" : "#111827",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Info sx={{ fontSize: 24, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
            Bilgilerin Kullanımı
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            Topladığımız bilgileri aşağıdaki amaçlar için kullanıyoruz:
          </Typography>

          <List>
            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Hizmet Sağlama"
                secondary="Kişiselleştirilmiş seyahat planları oluşturmak ve sunmak için."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Kullanıcı Deneyimini İyileştirme"
                secondary="Uygulamamızı ve hizmetlerimizi geliştirmek için."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="İletişim"
                secondary="Güncellemeler, bildirimler ve destek sağlamak için sizinle iletişim kurmak."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Güvenlik"
                secondary="Hesabınızı ve verilerinizi korumak için."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4, borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: isDarkMode ? "#e5e7eb" : "#111827",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Info sx={{ fontSize: 24, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
            Veri Güvenliği
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz.
            Verilerinizi yetkisiz erişime, değişikliğe, ifşaya veya imhaya karşı korumak için uygun teknik ve
            organizasyonel önlemler alıyoruz.
          </Typography>
        </Box>

        <Divider sx={{ my: 4, borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: isDarkMode ? "#e5e7eb" : "#111827",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Info sx={{ fontSize: 24, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
            Haklarınız
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
          </Typography>

          <List>
            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Erişim Hakkı"
                secondary="Hakkınızda hangi bilgileri tuttuğumuzu öğrenme hakkı."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Düzeltme Hakkı"
                secondary="Yanlış veya eksik bilgilerin düzeltilmesini talep etme hakkı."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="Silme Hakkı"
                secondary="Belirli koşullar altında kişisel verilerinizin silinmesini talep etme hakkı."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2,
                py: 1,
                borderRadius: "8px",
                mb: 1,
                backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.5)" : "rgba(243, 244, 246, 0.7)",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle sx={{ fontSize: 20, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
              </ListItemIcon>
              <ListItemText
                primary="İşleme Sınırlandırma Hakkı"
                secondary="Belirli koşullar altında kişisel verilerinizin işlenmesini sınırlandırma hakkı."
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: isDarkMode ? "#e5e7eb" : "#111827",
                }}
                secondaryTypographyProps={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mt: 6,
            color: isDarkMode ? "#d1d5db" : "#4b5563",
            lineHeight: 1.7,
            fontStyle: "italic",
          }}
        >
          Bu gizlilik politikası hakkında sorularınız veya endişeleriniz varsa, lütfen{" "}
          <Box
            component="a"
            href="/contact"
            sx={{
              color: isDarkMode ? "#93c5fd" : "#2563eb",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            iletişim sayfamız
          </Box>{" "}
          üzerinden bizimle iletişime geçin.
        </Typography>
      </Paper>
    </Container>
  );
}
