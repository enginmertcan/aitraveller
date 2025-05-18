// Bütçe ve harcama veri modelleri

// Bütçe kategorisi
export interface BudgetCategory {
  id: string;
  name: string;          // Konaklama, Yemek, Ulaşım, Aktiviteler, Alışveriş vb.
  icon: string;          // Lucide icon adı
  color: string;         // Kategori rengi
  allocatedAmount: number; // Ayrılan miktar
  spentAmount: number;   // Harcanan miktar
}

// Bütçe modeli
export interface Budget {
  id: string;
  userId: string;        // Kullanıcı ID'si
  travelPlanId: string;  // İlişkili seyahat planı
  name: string;          // Bütçe adı (örn: "Paris Seyahati Bütçesi")
  totalBudget: number;   // Toplam bütçe miktarı
  currency: string;      // Ana para birimi (TRY, USD, EUR vb.)
  categories: BudgetCategory[]; // Bütçe kategorileri
  notes?: string;        // Notlar (isteğe bağlı)
  createdAt: any;        // Oluşturulma tarihi
  updatedAt: any;        // Güncellenme tarihi
  isOwner?: boolean;     // Kullanıcının bütçe sahibi olup olmadığı
}

// Harcama modeli
export interface Expense {
  id: string;
  userId: string;        // Kullanıcı ID'si
  budgetId: string;      // İlişkili bütçe
  categoryId: string;    // İlişkili kategori
  amount: number;        // Harcama miktarı
  originalAmount?: number; // Orijinal para birimindeki miktar (dönüştürme yapıldıysa)
  originalCurrency?: string; // Orijinal para birimi
  description: string;   // Harcama açıklaması
  date: any;             // Harcama tarihi
  location?: string;     // Harcama yeri
  receiptImage?: string; // Makbuz/fiş fotoğrafı (isteğe bağlı)
  tags?: string[];       // Etiketler (isteğe bağlı)
}

// Varsayılan bütçe kategorileri
export const DEFAULT_BUDGET_CATEGORIES: Omit<BudgetCategory, 'id'>[] = [
  {
    name: 'Konaklama',
    icon: 'bed',
    color: '#FF6384',
    allocatedAmount: 0,
    spentAmount: 0
  },
  {
    name: 'Yemek',
    icon: 'utensils',
    color: '#36A2EB',
    allocatedAmount: 0,
    spentAmount: 0
  },
  {
    name: 'Ulaşım',
    icon: 'train',
    color: '#FFCE56',
    allocatedAmount: 0,
    spentAmount: 0
  },
  {
    name: 'Aktiviteler',
    icon: 'ticket',
    color: '#4BC0C0',
    allocatedAmount: 0,
    spentAmount: 0
  },
  {
    name: 'Alışveriş',
    icon: 'shopping-bag',
    color: '#9966FF',
    allocatedAmount: 0,
    spentAmount: 0
  },
  {
    name: 'Diğer',
    icon: 'more-horizontal',
    color: '#FF9F40',
    allocatedAmount: 0,
    spentAmount: 0
  }
];

// Desteklenen para birimleri
export const SUPPORTED_CURRENCIES = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' },
  { code: 'JPY', name: 'Japon Yeni', symbol: '¥' },
  { code: 'AUD', name: 'Avustralya Doları', symbol: 'A$' },
  { code: 'CAD', name: 'Kanada Doları', symbol: 'C$' },
  { code: 'CHF', name: 'İsviçre Frangı', symbol: 'CHF' },
  { code: 'CNY', name: 'Çin Yuanı', symbol: '¥' },
  { code: 'RUB', name: 'Rus Rublesi', symbol: '₽' },
];
