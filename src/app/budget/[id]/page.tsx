"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  PlusCircle,
  Trash2,
  Edit,
  ArrowLeft,
  PieChart,
  List,
  Settings,
  Calendar,
  MapPin,
  Tag,
} from "lucide-react";
import PermissionModal from "../../components/ui/permission-modal";
import {
  getBudget,
  getExpensesByBudgetId,
  deleteBudget,
  deleteExpense,
} from "../../Services/travel-plans";
import { Budget, Expense } from "../../types/budget";
import CurrencyService from "../../Services/currency.service";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function BudgetDetailsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const budgetId = params?.id as string;
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal state
  const [permissionModal, setPermissionModal] = useState({
    open: false,
    title: "",
    message: "",
    actionText: "",
    onAction: () => {}
  });

  useEffect(() => {

    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const loadBudgetData = async () => {
      try {
        setLoading(true);
        const budgetData = await getBudget(budgetId, user?.id);

        if (!budgetData) {
          alert("Hata: Bütçe bulunamadı");
          router.push("/dashboard");
          return;
        }

        setBudget(budgetData as unknown as Budget);

        // Harcamaları getir
        const expensesData = await getExpensesByBudgetId(budgetId, user?.id);
        console.log("Yüklenen harcamalar:", expensesData, "Toplam:", expensesData.length);
        setExpenses(expensesData as Expense[]);
      } catch (error) {
        console.error("Bütçe yükleme hatası:", error);
        alert("Hata: Bütçe yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, [isLoaded, user, router, budgetId]);

  // Harcamalar sekmesine geçildiğinde harcamaları yeniden yükle
  useEffect(() => {
    if (activeTab === "expenses" && budget && user) {
      console.log("Harcamalar sekmesi aktif, harcamaları yeniden yüklüyorum");

      const loadExpenses = async () => {
        try {
          const expensesData = await getExpensesByBudgetId(budgetId, user?.id);
          setExpenses(expensesData as Expense[]);
        } catch (error) {
          console.error("Harcama yükleme hatası:", error);
        }
      };

      loadExpenses();
    }
  }, [activeTab, budget, user, budgetId]);

  // Yetki hatası modalını göster
  const showPermissionError = (action: string) => {
    setPermissionModal({
      open: true,
      title: "Yetki Hatası",
      message: `Bu işlemi gerçekleştirmek için yetkiniz yok. Sadece bütçe sahibi ${action} yapabilir.`,
      actionText: "",
      onAction: () => {}
    });
  };

  const handleDeleteBudget = async () => {
    // Kullanıcı bütçe sahibi değilse, yetki hatası göster
    if (budget && !budget.isOwner) {
      showPermissionError("bütçeyi silme işlemi");
      return;
    }

    try {
      const result = await deleteBudget(budgetId, user?.id);

      if (!result) {
        showPermissionError("bütçeyi silme işlemi");
        return;
      }

      alert("Başarılı: Bütçe başarıyla silindi");
      router.push("/dashboard");
    } catch (error) {
      console.error("Bütçe silme hatası:", error);
      alert("Hata: Bütçe silinirken bir hata oluştu");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    // Kullanıcı bütçe sahibi değilse, yetki hatası göster
    if (budget && !budget.isOwner) {
      showPermissionError("harcama silme işlemi");
      return;
    }

    try {
      const result = await deleteExpense(expenseId, user?.id);

      if (!result) {
        showPermissionError("harcama silme işlemi");
        return;
      }

      // Harcamaları güncelle
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
      setExpenses(updatedExpenses);

      alert("Başarılı: Harcama başarıyla silindi");

      // Bütçeyi yeniden yükle (kategori harcama miktarları güncellendi)
      const updatedBudget = await getBudget(budgetId, user?.id);
      if (updatedBudget) {
        setBudget(updatedBudget as unknown as Budget);
      }
    } catch (error) {
      console.error("Harcama silme hatası:", error);
      alert("Hata: Harcama silinirken bir hata oluştu");
    }
  };

  // Harcama ekleme sayfasına yönlendirme
  const handleAddExpense = () => {
    if (budget && !budget.isOwner) {
      showPermissionError("harcama ekleme işlemi");
      return;
    }

    router.push(`/budget/${budgetId}/add-expense`);
  };

  // Harcama düzenleme sayfasına yönlendirme
  const handleEditExpense = (expenseId: string) => {
    if (budget && !budget.isOwner) {
      showPermissionError("harcama düzenleme işlemi");
      return;
    }

    router.push(`/budget/${budgetId}/edit-expense/${expenseId}`);
  };

  // Bütçe düzenleme sayfasına yönlendirme
  const handleEditBudget = () => {
    if (budget && !budget.isOwner) {
      showPermissionError("bütçe düzenleme işlemi");
      return;
    }

    router.push(`/budget/${budgetId}/edit`);
  };

  // Toplam harcama miktarını hesapla
  const totalSpent = budget?.categories?.reduce((total, category) => total + (category.spentAmount || 0), 0) || 0;

  // Bütçe kullanım yüzdesini hesapla
  const budgetUsagePercentage = budget?.totalBudget ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={32} sx={{ ml: 2 }} />
        </Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 1 }} />
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2
        }}>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
        </Box>
      </Container>
    );
  }

  if (!budget) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Bütçe bulunamadı
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => router.push("/dashboard")}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Yetki hatası modalı */}
      <PermissionModal
        open={permissionModal.open}
        onClose={() => setPermissionModal(prev => ({ ...prev, open: false }))}
        title={permissionModal.title}
        message={permissionModal.message}
        actionText={permissionModal.actionText}
        onAction={permissionModal.onAction}
      />

      {/* Üst Başlık */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.back()}
            sx={{ mr: 2 }}
            startIcon={<ArrowLeft size={16} />}
          >
            Geri
          </Button>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            {budget.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Düzenleme ve silme butonları - Herkes görebilir ama sadece sahibi işlem yapabilir */}
          <Button
            variant="outlined"
            onClick={handleEditBudget}
            startIcon={<Edit size={16} />}
          >
            Düzenle
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (budget && !budget.isOwner) {
                showPermissionError("bütçeyi silme işlemi");
                return;
              }

              if (window.confirm('Bu bütçeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm harcama kayıtları da silinecektir.')) {
                handleDeleteBudget();
              }
            }}
            startIcon={<Trash2 size={16} />}
          >
            Sil
          </Button>
        </Box>
      </Box>

      {/* Sekmeler */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="fullWidth"
      >
        <Tab
          value="overview"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PieChart size={16} style={{ marginRight: 8 }} /> Genel Bakış
            </Box>
          }
        />
        <Tab
          value="expenses"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <List size={16} style={{ marginRight: 8 }} /> Harcamalar
            </Box>
          }
        />
        <Tab
          value="settings"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Settings size={16} style={{ marginRight: 8 }} /> Ayarlar
            </Box>
          }
        />
      </Tabs>

      {/* Tab İçerikleri */}
      <Box sx={{ mt: 2 }}>
        {/* Genel Bakış Sekmesi */}
        {activeTab === "overview" && (
          <Box>
            {/* Bütçe Özeti Kartı */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Bütçe Özeti"
                subheader={`Toplam bütçe: ${CurrencyService.formatCurrency(budget.totalBudget, budget.currency)}`}
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Kullanılan: {CurrencyService.formatCurrency(totalSpent, budget.currency)}
                    </Typography>
                    <Typography variant="body2">
                      {budgetUsagePercentage.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={budgetUsagePercentage}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: 2 }}>
                  Kalan: {CurrencyService.formatCurrency(budget.totalBudget - totalSpent, budget.currency)}
                </Typography>
              </CardContent>
            </Card>

            {/* Kategoriler */}
            <Typography variant="h6" sx={{ mb: 2 }}>Kategoriler</Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
              gap: 2,
              mb: 3
            }}>
              {budget.categories?.map((category) => {
                const categoryPercentage = category.allocatedAmount
                  ? Math.min(100, (category.spentAmount / category.allocatedAmount) * 100)
                  : 0;

                return (
                  <Card key={category.id} sx={{ overflow: 'hidden' }}>
                    <CardHeader
                      sx={{
                        p: 2,
                        bgcolor: `${category.color}20`,
                      }}
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: category.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1
                            }}
                          >
                            <Box component="span" sx={{ color: 'white' }}>
                              {/* Kategori ikonu */}
                              {category.icon === 'food' && <PlusCircle size={16} />}
                              {category.icon === 'transport' && <PlusCircle size={16} />}
                              {category.icon === 'accommodation' && <PlusCircle size={16} />}
                              {category.icon === 'activities' && <PlusCircle size={16} />}
                              {category.icon === 'shopping' && <PlusCircle size={16} />}
                              {category.icon === 'other' && <PlusCircle size={16} />}
                            </Box>
                          </Box>
                          <Typography variant="subtitle1">{category.name}</Typography>
                        </Box>
                      }
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Harcanan:</Typography>
                          <Typography variant="body2">
                            {CurrencyService.formatCurrency(category.spentAmount, budget.currency)}
                          </Typography>
                        </Box>

                        {category.allocatedAmount > 0 && (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">Ayrılan:</Typography>
                              <Typography variant="body2">
                                {CurrencyService.formatCurrency(category.allocatedAmount, budget.currency)}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={categoryPercentage}
                              sx={{ height: 4, borderRadius: 1, my: 1 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption">Kalan:</Typography>
                              <Typography variant="caption">
                                {CurrencyService.formatCurrency(category.allocatedAmount - category.spentAmount, budget.currency)}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {/* Harcama Ekle Butonu - Sadece bütçe sahibi görebilir */}
            {budget.isOwner && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<PlusCircle size={16} />}
                  onClick={handleAddExpense}
                >
                  Harcama Ekle
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Harcamalar Sekmesi */}
        {activeTab === "expenses" && (
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Harcamalar</Typography>
                  {budget.isOwner && (
                    <Button
                      variant="contained"
                      startIcon={<PlusCircle size={16} />}
                      onClick={handleAddExpense}
                      size="small"
                    >
                      Harcama Ekle
                    </Button>
                  )}
                </Box>
              }
              subheader={`Toplam ${expenses.length} harcama kaydı (Debug: ${expenses ? expenses.length : 'undefined'})`}
            />
            <CardContent>
              {/* Harcama sayısını kontrol et */}
              {expenses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Henüz harcama kaydı bulunmuyor
                  </Typography>
                  {budget.isOwner ? (
                    <Button
                      variant="contained"
                      startIcon={<PlusCircle size={16} />}
                      onClick={handleAddExpense}
                    >
                      İlk Harcamayı Ekle
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sadece bütçe sahibi harcama ekleyebilir
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                  {/* Harcamaları listele */}
                  {expenses.map((expense) => {
                    const category = budget.categories?.find(c => c.id === expense.categoryId);

                    return (
                      <Card key={expense.id} sx={{ overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex' }}>
                          {/* Kategori renk çubuğu */}
                          <Box sx={{ width: 8, bgcolor: category?.color || '#ccc' }} />

                          <Box sx={{ flexGrow: 1, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="subtitle1">{expense.description}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: 'text.secondary' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                                    <Calendar size={12} style={{ marginRight: 4 }} />
                                    <Typography variant="caption">
                                      {typeof expense.date === 'string'
                                        ? format(new Date(expense.date), 'dd MMM yyyy', { locale: tr })
                                        : 'Tarih yok'}
                                    </Typography>
                                  </Box>

                                  {category && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                                      <Tag size={12} style={{ marginRight: 4 }} />
                                      <Typography variant="caption">{category.name}</Typography>
                                    </Box>
                                  )}

                                  {expense.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <MapPin size={12} style={{ marginRight: 4 }} />
                                      <Typography variant="caption">{expense.location}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {CurrencyService.formatCurrency(expense.amount, budget.currency)}
                                </Typography>

                                {expense.originalAmount && expense.originalCurrency && expense.originalCurrency !== budget.currency && (
                                  <Typography variant="caption" color="text.secondary">
                                    {CurrencyService.formatCurrency(expense.originalAmount, expense.originalCurrency)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {/* Düzenleme ve silme butonları - Sadece bütçe sahibi görebilir */}
                            {budget.isOwner && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Edit size={12} />}
                                  onClick={() => handleEditExpense(expense.id)}
                                  sx={{ mr: 1 }}
                                >
                                  Düzenle
                                </Button>

                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<Trash2 size={12} />}
                                  onClick={() => {
                                    if (window.confirm('Bu harcamayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                      handleDeleteExpense(expense.id);
                                    }
                                  }}
                                >
                                  Sil
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ayarlar Sekmesi */}
        {activeTab === "settings" && (
          <Card>
            <CardHeader
              title="Bütçe Ayarları"
              subheader="Bütçe ayarlarını buradan yönetebilirsiniz"
            />
            <CardContent>
              <Box sx={{ '& > *:not(:last-child)': { mb: 3 } }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Bütçe Bilgileri</Typography>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1,
                    '& > *': { py: 0.5 }
                  }}>
                    <Typography variant="body2" color="text.secondary">Bütçe Adı:</Typography>
                    <Typography variant="body2">{budget.name}</Typography>

                    <Typography variant="body2" color="text.secondary">Toplam Bütçe:</Typography>
                    <Typography variant="body2">{CurrencyService.formatCurrency(budget.totalBudget, budget.currency)}</Typography>

                    <Typography variant="body2" color="text.secondary">Para Birimi:</Typography>
                    <Typography variant="body2">{budget.currency}</Typography>

                    {budget.notes && (
                      <>
                        <Typography variant="body2" color="text.secondary">Notlar:</Typography>
                        <Typography variant="body2">{budget.notes}</Typography>
                      </>
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Bütçe Yönetimi - Herkes görebilir ama sadece sahibi işlem yapabilir */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Bütçe Yönetimi</Typography>
                  <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Edit size={16} />}
                      onClick={handleEditBudget}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Bütçeyi Düzenle
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<Trash2 size={16} />}
                      onClick={() => {
                        if (budget && !budget.isOwner) {
                          showPermissionError("bütçeyi silme işlemi");
                          return;
                        }

                        if (window.confirm('Bu bütçeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm harcama kayıtları da silinecektir.')) {
                          handleDeleteBudget();
                        }
                      }}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Bütçeyi Sil
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}
