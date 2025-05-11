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
import { CheckCircle, Info, Warning, MenuBook, InsertDriveFile } from "@mui/icons-material";

import { useThemeContext } from "../context/ThemeContext";

export default function TermsPage() {
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
          <InsertDriveFile
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
            Kullanım Koşulları
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
          AI Traveller uygulamasını kullanarak, aşağıdaki kullanım koşullarını kabul etmiş olursunuz. Lütfen bu
          koşulları dikkatlice okuyun. Bu koşulları kabul etmiyorsanız, uygulamayı kullanmayı bırakın.
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
            <MenuBook sx={{ fontSize: 24, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
            Hizmet Kullanımı
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            AI Traveller, yapay zeka destekli kişiselleştirilmiş seyahat planları oluşturan bir platformdur. Hizmetimizi
            kullanırken aşağıdaki koşullara uymayı kabul edersiniz:
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
                primary="Hesap Sorumluluğu"
                secondary="Hesabınızın güvenliğinden ve hesabınız altında gerçekleşen tüm etkinliklerden siz sorumlusunuz."
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
                primary="Yasal Kullanım"
                secondary="Hizmetimizi yalnızca yasal amaçlar için ve bu koşullara, geçerli yasalara ve düzenlemelere uygun olarak kullanacağınızı kabul edersiniz."
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
                primary="İçerik Sorumluluğu"
                secondary="Platformumuza yüklediğiniz veya oluşturduğunuz tüm içerikten siz sorumlusunuz."
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
            <Warning sx={{ fontSize: 24, color: isDarkMode ? "#93c5fd" : "#2563eb" }} />
            Yasaklanan Faaliyetler
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            Hizmetimizi kullanırken aşağıdaki faaliyetlerde bulunmayacağınızı kabul edersiniz:
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
                <Warning sx={{ fontSize: 20, color: isDarkMode ? "#fcd34d" : "#d97706" }} />
              </ListItemIcon>
              <ListItemText
                primary="Yasadışı İçerik"
                secondary="Yasadışı, zararlı, tehditkar, taciz edici, iftira niteliğinde, müstehcen veya başka şekilde sakıncalı içerik yüklemek veya paylaşmak."
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
                <Warning sx={{ fontSize: 20, color: isDarkMode ? "#fcd34d" : "#d97706" }} />
              </ListItemIcon>
              <ListItemText
                primary="Kötüye Kullanım"
                secondary="Hizmetimizi kötüye kullanmak, sistemlerimize zarar vermek veya normal işleyişini engellemek."
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
                <Warning sx={{ fontSize: 20, color: isDarkMode ? "#fcd34d" : "#d97706" }} />
              </ListItemIcon>
              <ListItemText
                primary="Fikri Mülkiyet İhlali"
                secondary="Başkalarının telif hakkı, ticari marka veya diğer fikri mülkiyet haklarını ihlal eden içerik paylaşmak."
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
            Fikri Mülkiyet
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            AI Traveller uygulaması ve içeriği, telif hakkı, ticari marka ve diğer fikri mülkiyet yasaları tarafından
            korunmaktadır. Hizmetimizi kullanarak, aşağıdakileri kabul edersiniz:
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
                primary="Mülkiyet Hakları"
                secondary="Uygulama ve içeriğinin mülkiyeti AI Traveller'a aittir ve tüm hakları saklıdır."
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
                primary="Kullanım Lisansı"
                secondary="Size, uygulamayı kişisel ve ticari olmayan amaçlarla kullanmanız için sınırlı, münhasır olmayan, devredilemez bir lisans verilmektedir."
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
                primary="Kullanıcı İçeriği"
                secondary="Platformumuza yüklediğiniz içeriğin mülkiyeti size aittir, ancak bu içeriği kullanmamız, dağıtmamız ve görüntülememiz için bize münhasır olmayan bir lisans vermiş olursunuz."
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
            Sorumluluk Reddi
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: isDarkMode ? "#d1d5db" : "#4b5563",
              lineHeight: 1.7,
            }}
          >
            AI Traveller uygulaması &quot;olduğu gibi&quot; ve &quot;mevcut olduğu şekliyle&quot; sunulmaktadır. Hizmetimizle ilgili olarak
            aşağıdaki hususları kabul edersiniz:
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
                <Warning sx={{ fontSize: 20, color: isDarkMode ? "#fcd34d" : "#d97706" }} />
              </ListItemIcon>
              <ListItemText
                primary="Garanti Reddi"
                secondary="Hizmetimizin kesintisiz, hatasız veya güvenli olacağını garanti etmiyoruz."
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
                <Warning sx={{ fontSize: 20, color: isDarkMode ? "#fcd34d" : "#d97706" }} />
              </ListItemIcon>
              <ListItemText
                primary="Seyahat Bilgileri"
                secondary="Uygulamamızın sağladığı seyahat planları ve bilgileri, en iyi çabamızla doğru ve güncel tutmaya çalışsak da, bu bilgilerin doğruluğunu garanti etmiyoruz."
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
                <Warning sx={{ fontSize: 20, color: isDarkMode ? "#fcd34d" : "#d97706" }} />
              </ListItemIcon>
              <ListItemText
                primary="Sorumluluk Sınırlaması"
                secondary="Hizmetimizin kullanımından kaynaklanan doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan zararlardan sorumlu değiliz."
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
          Bu kullanım koşulları hakkında sorularınız veya endişeleriniz varsa, lütfen{" "}
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
