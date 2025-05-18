// Para birimi dönüştürme ve formatlama servisi

// Döviz kurları (sabit değerler, gerçek uygulamada API'den alınmalı)
const EXCHANGE_RATES = {
  TRY: 1,
  USD: 32.5,
  EUR: 35.2,
  GBP: 41.3,
  JPY: 0.21,
  AUD: 21.5,
  CAD: 23.8,
  CHF: 36.4,
  CNY: 4.5,
  RUB: 0.35,
};

// Para birimi sembolleri
const CURRENCY_SYMBOLS = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  RUB: '₽',
};

export const CurrencyService = {
  /**
   * Para birimini formatlar
   * @param amount Miktar
   * @param currency Para birimi kodu (TRY, USD, EUR vb.)
   * @returns Formatlanmış para birimi
   */
  formatCurrency(amount: number, currency: string = 'TRY'): string {
    if (isNaN(amount)) {
      return '0';
    }

    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '';
    
    // Türk Lirası için özel format
    if (currency === 'TRY') {
      return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Diğer para birimleri için
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  /**
   * Para birimini dönüştürür
   * @param amount Miktar
   * @param fromCurrency Kaynak para birimi
   * @param toCurrency Hedef para birimi
   * @returns Dönüştürülmüş miktar
   */
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (isNaN(amount)) {
      return 0;
    }

    if (fromCurrency === toCurrency) {
      return amount;
    }

    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
    const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;

    // TRY'ye çevir, sonra hedef para birimine
    const amountInTRY = amount * fromRate;
    const convertedAmount = amountInTRY / toRate;

    // 2 ondalık basamağa yuvarla
    return Math.round(convertedAmount * 100) / 100;
  },

  /**
   * Gerçek zamanlı döviz kurlarını almak için API çağrısı
   * Not: Bu fonksiyon şu anda simüle edilmiştir, gerçek uygulamada bir API'ye bağlanmalıdır
   */
  async getExchangeRates(): Promise<Record<string, number>> {
    // Gerçek uygulamada burada bir API çağrısı yapılmalıdır
    // Örnek: const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
    
    // Şimdilik sabit değerleri döndür
    return EXCHANGE_RATES;
  }
};

export default CurrencyService;
