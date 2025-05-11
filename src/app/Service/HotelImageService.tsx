"use client";

import { Hotel } from "@/app/types/travel";

/**
 * Google Places API ile otel görselleri arama servisi
 */
export const HotelImageService = {
  /**
   * Google Places API ile otel araması yapar ve ilk fotoğrafı döndürür
   * @param hotelName Otel adı
   * @param city Şehir adı
   * @param budget Bütçe seviyesi (Ekonomik, Standart, Lüks)
   * @returns Fotoğraf URL'i
   */
  async searchHotelImage(hotelName: string, city: string, budget: string): Promise<string | null> {
    try {
      console.log(`Otel görseli aranıyor: ${hotelName}, ${city}, ${budget}`);

      // API anahtarını client-side'da kullanıyoruz, bu yüzden NEXT_PUBLIC_ prefix'i gerekli
      // API anahtarını kontrol etmeye gerek yok, çünkü API route'ları kullanıyoruz
      console.log('API Anahtarı mevcut:', !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY);

      // Arama sorgusu oluştur
      const query = `${hotelName} hotel ${city}`;

      console.log('Places API isteği gönderiliyor...', query);

      // Server-side API çağrısı için Next.js API route kullan
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error('Places API isteği başarısız:', response.status);
        const errorText = await response.text();
        console.error('Hata detayı:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('Places API yanıtı:', data.status, data.results ? data.results.length : 0);

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.log('Otel bulunamadı veya fotoğraf yok:', data.status, data.error_message || '');
        return null;
      }

      // Bütçeye göre filtreleme
      const filteredResults = this.filterResultsByBudget(data.results, budget);

      if (filteredResults.length === 0) {
        console.log('Bütçeye uygun otel bulunamadı');
        return data.results[0].photos ?
          await this.getPhotoUrl(data.results[0].photos[0].photo_reference) :
          null;
      }

      // İlk sonucun fotoğrafını al
      const firstResult = filteredResults[0];

      if (!firstResult.photos || firstResult.photos.length === 0) {
        console.log('Otelin fotoğrafı bulunamadı');
        return null;
      }

      // Fotoğraf referansını al
      const photoReference = firstResult.photos[0].photo_reference;

      // Fotoğraf URL'ini al
      return await this.getPhotoUrl(photoReference);
    } catch (error) {
      console.error('Otel görseli arama hatası:', error);
      return null;
    }
  },

  /**
   * Fotoğraf referansından URL oluşturur
   * @param photoReference Fotoğraf referansı
   * @returns Fotoğraf URL'i
   */
  async getPhotoUrl(photoReference: string): Promise<string | null> {
    try {
      // API route'u doğrudan URL olarak kullan
      // Bu route, doğrudan Google Places Photo API'ye yönlendirme yapacak
      console.log('Fotoğraf referansı:', photoReference);
      const photoUrl = `/api/places/photo?photoReference=${encodeURIComponent(photoReference)}&maxwidth=800`;
      console.log('Oluşturulan fotoğraf URL:', photoUrl);
      return photoUrl;
    } catch (error) {
      console.error('Fotoğraf URL oluşturma hatası:', error);
      return null;
    }
  },

  /**
   * Sonuçları bütçeye göre filtreler
   * @param results API sonuçları
   * @param budget Bütçe seviyesi
   * @returns Filtrelenmiş sonuçlar
   */
  filterResultsByBudget(results: any[], budget: string): any[] {
    // Bütçe seviyesine göre fiyat aralığı belirle (0-4 arası, 0 en ucuz, 4 en pahalı)
    // Değişken kullanılmadığı için kaldırıldı

    // Bütçe seviyesini doğrudan kontrol edelim

    // Sonuçları filtrele
    return results.filter(result => {
      // Eğer price_level yoksa, varsayılan olarak dahil et
      if (result.price_level === undefined) return true;

      // Ekonomik için 0-1, standart için 1-2, lüks için 3-4
      if (budget.toLowerCase() === 'ekonomik' || budget.toLowerCase() === 'cheap' || budget.toLowerCase() === 'low') {
        return result.price_level <= 1;
      } else if (budget.toLowerCase() === 'standart' || budget.toLowerCase() === 'moderate' || budget.toLowerCase() === 'medium') {
        return result.price_level >= 1 && result.price_level <= 2;
      } 
        return result.price_level >= 3;
      
    });
  },

  /**
   * Otel listesi için görselleri toplu olarak getirir
   * @param hotels Otel listesi
   * @param city Şehir adı
   * @param budget Bütçe seviyesi
   * @returns Güncellenmiş otel listesi
   */
  async fetchImagesForHotels(hotels: Hotel[], city: string, budget: string): Promise<Hotel[]> {
    console.log(`${hotels.length} otel için görsel getiriliyor...`);

    const updatedHotels = [...hotels];

    for (let i = 0; i < updatedHotels.length; i++) {
      const hotel = updatedHotels[i];

      // Eğer zaten geçerli bir görsel varsa, atla
      if (hotel.hotelImageUrl && !hotel.hotelImageUrl.includes('sample-image') && !hotel.hotelImageUrl.includes('placeholder')) {
        console.log(`${hotel.hotelName} için zaten görsel var, atlanıyor`);
        continue;
      }

      console.log(`${hotel.hotelName} için görsel aranıyor...`);

      // Görsel ara
      const imageUrl = await this.searchHotelImage(hotel.hotelName, city, budget);

      if (imageUrl) {
        console.log(`${hotel.hotelName} için görsel bulundu`);

        // Otel nesnesini güncelle
        updatedHotels[i] = {
          ...hotel,
          hotelImageUrl: imageUrl,
          imageUrl // Uyumluluk için her iki alanı da güncelle
        };
        console.log(`${hotel.hotelName} için görsel güncellendi`);
      } else {
        console.log(`${hotel.hotelName} için görsel bulunamadı`);
      }
    }

    return updatedHotels;
  }
};

export default HotelImageService;
