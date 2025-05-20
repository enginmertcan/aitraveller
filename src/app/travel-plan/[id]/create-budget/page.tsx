"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Skeleton,
} from "@mui/material";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { fetchTravelPlanById, createBudget, getBudgetByTravelPlanId } from "../../../Services/travel-plans";
import { Budget, BudgetCategory, DEFAULT_BUDGET_CATEGORIES, SUPPORTED_CURRENCIES } from "../../../types/budget";
import { TravelPlan } from "../../../types/travel";

export default function CreateBudgetPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const travelPlanId = params?.id as string;
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingBudget, setExistingBudget] = useState<Budget | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [notes, setNotes] = useState("");
  const [categories, setCategories] = useState<Omit<BudgetCategory, 'id'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Seyahat planını getir
        const travelPlanData = await fetchTravelPlanById(travelPlanId);

        if (!travelPlanData) {
          alert("Hata: Seyahat planı bulunamadı");
          router.push("/dashboard");
          return;
        }

        setTravelPlan(travelPlanData as TravelPlan);

        // Varsayılan bütçe adını ayarla
        setName(`${travelPlanData.destination} Seyahati Bütçesi`);

        // Bu seyahat planına ait bütçe var mı kontrol et
        const existingBudgetData = await getBudgetByTravelPlanId(travelPlanId);

        if (existingBudgetData) {
          setExistingBudget(existingBudgetData as Budget);
          alert("Bilgi: Bu seyahat planı için zaten bir bütçe oluşturulmuş");
        }

        // Varsayılan kategorileri yükle
        setCategories(DEFAULT_BUDGET_CATEGORIES);
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        alert("Hata: Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoaded, user, router, travelPlanId]);

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        icon: "circle",
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        allocatedAmount: 0,
        spentAmount: 0
      }
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const handleCategoryChange = (index: number, field: keyof Omit<BudgetCategory, 'id'>, value: any) => {
    const newCategories = [...categories];
    newCategories[index] = {
      ...newCategories[index],
      [field]: value
    };
    setCategories(newCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!travelPlan || !user) return;

    if (!name.trim()) {
      alert("Hata: Lütfen bir bütçe adı girin");
      return;
    }

    if (!totalBudget || isNaN(parseFloat(totalBudget)) || parseFloat(totalBudget) <= 0) {
      alert("Hata: Lütfen geçerli bir bütçe miktarı girin");
      return;
    }

    if (categories.length === 0) {
      alert("Hata: En az bir kategori eklemelisiniz");
      return;
    }

    // Kategori adlarını kontrol et
    const invalidCategories = categories.filter(cat => !cat.name.trim());
    if (invalidCategories.length > 0) {
      alert("Hata: Tüm kategorilerin adı olmalıdır");
      return;
    }

    try {
      setIsSubmitting(true);

      // Kategorilere benzersiz ID'ler ekle
      const categoriesWithIds = categories.map(category => ({
        ...category,
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }));

      const budgetData: Partial<Budget> = {
        userId: user.id,
        travelPlanId: travelPlan.id,
        name,
        totalBudget: parseFloat(totalBudget),
        currency,
        categories: categoriesWithIds,
        notes: notes || "", // Boş string kullan, undefined kullanma
      };

      await createBudget(budgetData);

      alert("Başarılı: Bütçe başarıyla oluşturuldu");

      router.push(`/trips/${travelPlanId}`);
    } catch (error) {
      console.error("Bütçe oluşturma hatası:", error);
      alert("Hata: Bütçe oluşturulurken bir hata oluştu");
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

  if (!travelPlan) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Seyahat planı bulunamadı</Typography>
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

  if (existingBudget) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h4" component="h1">Bütçe Zaten Mevcut</Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Mevcut Bütçe</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bu seyahat planı için zaten bir bütçe oluşturulmuş
          </Typography>

          <Typography paragraph sx={{ mt: 2 }}>
            {travelPlan.destination} seyahati için {existingBudget.name} adlı bir bütçe zaten mevcut.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => router.push(`/budget/${existingBudget.id}`)}
              sx={{
                background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
                },
              }}
            >
              Bütçeyi Görüntüle
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push(`/trips/${travelPlanId}`)}
            >
              Seyahat Planına Dön
            </Button>
          </Stack>
        </Paper>
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
        <Typography variant="h4" component="h1">Bütçe Oluştur</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Yeni Bütçe</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {travelPlan.destination} seyahati için bir bütçe oluşturun
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          {/* Bütçe Adı */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Bütçe Adı</FormLabel>
            <TextField
              placeholder="Örn: Paris Seyahati Bütçesi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          </FormControl>

          {/* Toplam Bütçe ve Para Birimi */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Toplam Bütçe</FormLabel>
                <TextField
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  placeholder="0.00"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Para Birimi</FormLabel>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
          </Grid>

          {/* Notlar */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Notlar (İsteğe bağlı)</FormLabel>
            <TextField
              placeholder="Bütçe ile ilgili notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          </FormControl>

          {/* Kategoriler */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormLabel>Kategoriler</FormLabel>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={handleAddCategory}
              >
                Kategori Ekle
              </Button>
            </Box>

            <Stack spacing={2}>
              {categories.map((category, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <FormLabel sx={{ fontSize: '0.75rem' }}>Ad</FormLabel>
                        <TextField
                          value={category.name}
                          onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                          placeholder="Kategori adı"
                          required
                          fullWidth
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <FormLabel sx={{ fontSize: '0.75rem' }}>İkon</FormLabel>
                        <TextField
                          value={category.icon}
                          onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                          placeholder="İkon adı"
                          fullWidth
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <FormLabel sx={{ fontSize: '0.75rem' }}>Renk</FormLabel>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Box
                            component="input"
                            type="color"
                            value={category.color}
                            onChange={(e) => handleCategoryChange(index, 'color', e.target.value)}
                            sx={{ width: 40, height: 40, p: 0.5 }}
                          />
                          <TextField
                            value={category.color}
                            onChange={(e) => handleCategoryChange(index, 'color', e.target.value)}
                            placeholder="#RRGGBB"
                            fullWidth
                            size="small"
                          />
                        </Box>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: { xs: 1, md: 3 } }}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveCategory(index)}
                        disabled={categories.length <= 1}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>

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
              {isSubmitting ? "Oluşturuluyor..." : "Bütçe Oluştur"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
