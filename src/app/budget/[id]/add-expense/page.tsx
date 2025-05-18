"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ArrowLeft, Calendar, Upload } from "lucide-react";
import { getBudget, addExpense } from "../../../Services/travel-plans";
import { Budget, BudgetCategory, Expense, SUPPORTED_CURRENCIES } from "../../../types/budget";
import CurrencyService from "../../../Services/currency.service";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@mui/material";
import { useThemeContext } from "../../../context/ThemeContext";

import { use } from 'react';

export default function AddExpensePage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [originalCurrency, setOriginalCurrency] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const loadBudgetData = async () => {
      try {
        setLoading(true);
        const budgetData = await getBudget(resolvedParams.id, user?.id);

        if (!budgetData) {
          alert("Hata: Bütçe bulunamadı");
          router.push("/dashboard");
          return;
        }

        // Kullanıcı bütçe sahibi değilse, uyarı göster
        if (!budgetData.isOwner) {
          alert("Uyarı: Sadece bütçe sahibi harcama ekleyebilir");
          router.push(`/budget/${resolvedParams.id}`);
          return;
        }

        setBudget(budgetData as Budget);

        // Varsayılan para birimini ayarla
        setOriginalCurrency(budgetData.currency);
      } catch (error) {
        console.error("Bütçe yükleme hatası:", error);
        alert("Hata: Bütçe yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, [isLoaded, user, router, resolvedParams.id]);

  // Para birimi değiştiğinde otomatik dönüştürme
  useEffect(() => {
    if (originalCurrency && originalAmount && budget?.currency && originalCurrency !== budget.currency) {
      const convertedAmount = CurrencyService.convertCurrency(
        parseFloat(originalAmount) || 0,
        originalCurrency,
        budget.currency
      );
      setAmount(convertedAmount.toString());
    } else if (originalCurrency === budget?.currency) {
      setAmount(originalAmount);
    }
  }, [originalCurrency, originalAmount, budget?.currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budget || !user) return;

    if (!description.trim()) {
      alert("Hata: Lütfen bir açıklama girin");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Hata: Lütfen geçerli bir miktar girin");
      return;
    }

    if (!categoryId) {
      alert("Hata: Lütfen bir kategori seçin");
      return;
    }

    try {
      setIsSubmitting(true);

      const expenseData: Partial<Expense> = {
        userId: user.id,
        budgetId: budget.id,
        categoryId,
        description,
        amount: parseFloat(amount),
        date: date?.toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      };

      // Eğer farklı para birimi kullanıldıysa orijinal değerleri ekle
      if (originalCurrency && originalCurrency !== budget.currency && originalAmount) {
        expenseData.originalCurrency = originalCurrency;
        expenseData.originalAmount = parseFloat(originalAmount);
      }

      await addExpense(expenseData, user.id);

      alert("Başarılı: Harcama başarıyla eklendi");

      router.push(`/budget/${resolvedParams.id}`);
    } catch (error) {
      console.error("Harcama ekleme hatası:", error);
      alert("Hata: Harcama eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={40} sx={{ ml: 2 }} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={500} />
      </Container>
    );
  }

  if (!budget) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Bütçe bulunamadı</Typography>
        <Button
          variant="contained"
          startIcon={<ArrowLeft />}
          onClick={() => router.push("/dashboard")}
          sx={{
            background: "linear-gradient(45deg, #2563eb, #7c3aed)",
            "&:hover": {
              background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
            },
          }}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Üst Başlık */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4" component="h1">Harcama Ekle</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Yeni Harcama</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {budget.name} bütçesine yeni bir harcama ekleyin
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          {/* Açıklama */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Açıklama</FormLabel>
            <TextField
              placeholder="Örn: Akşam yemeği, Müze girişi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          </FormControl>

          {/* Kategori */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Kategori</FormLabel>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              size="small"
              sx={{ mt: 1 }}
            >
              {budget.categories?.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: category.color,
                        mr: 1
                      }}
                    />
                    {category.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Miktar ve Para Birimi */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Para Birimi</FormLabel>
                <Select
                  value={originalCurrency}
                  onChange={(e) => setOriginalCurrency(e.target.value)}
                  required
                  size="small"
                  sx={{ mt: 1 }}
                >
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <MenuItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Miktar</FormLabel>
                <TextField
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  placeholder="0.00"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                />
              </FormControl>
            </Grid>
          </Grid>

          {/* Dönüştürülmüş Miktar (farklı para birimi seçildiyse) */}
          {originalCurrency && budget.currency && originalCurrency !== budget.currency && originalAmount && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              }}
            >
              <Typography variant="body2">
                Dönüştürülmüş miktar: {CurrencyService.formatCurrency(parseFloat(amount) || 0, budget.currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {originalAmount} {originalCurrency} = {amount} {budget.currency}
              </Typography>
            </Paper>
          )}

          {/* Tarih */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Tarih</FormLabel>
            <TextField
              type="date"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : null;
                setDate(newDate);
              }}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Calendar size={16} />
                  </Box>
                ),
              }}
            />
          </FormControl>

          {/* Konum */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Konum (İsteğe bağlı)</FormLabel>
            <TextField
              placeholder="Örn: Restoran adı, Şehir"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          </FormControl>

          {/* Notlar */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Notlar (İsteğe bağlı)</FormLabel>
            <TextField
              placeholder="Ek bilgiler..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          </FormControl>

          {/* Butonlar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                background: isSubmitting ? undefined : "linear-gradient(45deg, #2563eb, #7c3aed)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                },
              }}
            >
              {isSubmitting ? "Ekleniyor..." : "Harcama Ekle"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
