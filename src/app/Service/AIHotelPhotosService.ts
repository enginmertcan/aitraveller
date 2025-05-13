"use client";

/**
 * AIHotelPhotosService.ts
 *
 * Bu servis, OpenAI tarafından önerilen otellerin fotoğraflarını getirmek için kullanılır.
 * Google Places API kullanarak otel fotoğraflarını getirir.
 */

/**
 * AI Otel Fotoğrafları Servisi
 * OpenAI tarafından önerilen otellerin fotoğraflarını getirmek için metodlar sağlar
 */
const AIHotelPhotosService = {
  /**
   * Google Places API'den otel fotoğraflarını getirir
   * @param hotelName - Otelin adı
   * @param city - Otelin bulunduğu şehir
   * @returns Promise<string[]> - Fotoğraf URL'lerinin dizisi
   */
  async fetchHotelPhotos(hotelName: string, city: string): Promise<string[]> {
    try {
      console.log(`AI Otel fotoğrafları getiriliyor: ${hotelName}, ${city}`);

      // Arama sorgusu oluştur
      const query = `${hotelName} hotel ${city}`;

      console.log('Places Photos API isteği gönderiliyor...');

      // API route'u kullan
      const response = await fetch('/api/places/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error('Places Photos API isteği başarısız:', response.status);
        return [];
      }

      const data = await response.json();

      if (!data.photoReferences || data.photoReferences.length === 0) {
        console.log('Otel fotoğrafları bulunamadı');
        return [];
      }

      // Tüm fotoğraf referanslarını URL'lere dönüştür
      const photoUrls = data.photoReferences
        .filter((photoReference: string) => photoReference !== null && photoReference !== undefined && photoReference !== '')
        .map((photoReference: string) =>
          `/api/places/photo?photoReference=${encodeURIComponent(photoReference)}&maxwidth=800`
        );

      // Ekstra güvenlik için, aynı URL'leri tekrar kontrol et ve kaldır
      const uniquePhotoUrls: string[] = Array.from(new Set(photoUrls));

      console.log(`${uniquePhotoUrls.length} adet benzersiz fotoğraf bulundu`);
      return uniquePhotoUrls;
    } catch (error) {
      console.error('AI Otel fotoğrafları getirme hatası:', error);
      return [];
    }
  },

  /**
   * OpenAI tarafından önerilen otellerin fotoğraflarını getirir
   * @param hotelOptions - OpenAI tarafından önerilen otel seçenekleri
   * @param city - Otellerin bulunduğu şehir
   * @returns Promise<any[]> - Fotoğraflarla zenginleştirilmiş otel seçenekleri
   */
  async enhanceAIHotelOptions(hotelOptions: any[], city: string): Promise<any[]> {
    if (!hotelOptions || !Array.isArray(hotelOptions) || hotelOptions.length === 0) {
      console.warn("Geçersiz otel seçenekleri");
      return [];
    }

    try {
      console.log(`${hotelOptions.length} AI otel seçeneği için fotoğraflar getiriliyor...`);

      // Her otel için fotoğrafları getir
      const enhancedHotels = await Promise.all(
        hotelOptions.map(async (hotel) => {
          try {
            if (!hotel || !hotel.hotelName) {
              console.warn("Geçersiz otel nesnesi");
              return hotel;
            }

            // Mevcut additionalImages dizisini kontrol et
            const existingImages = hotel.additionalImages || [];

            // Eğer zaten yeterli fotoğraf varsa, işlem yapma
            if (existingImages.length >= 5) {
              return hotel;
            }

            // Ek fotoğraflar getir
            const photoUrls = await this.fetchHotelPhotos(hotel.hotelName, city);

            if (photoUrls.length === 0) {
              return hotel;
            }

            // Mevcut fotoğrafların URL'lerini topla
            const existingUrls = existingImages.map((img: any) =>
              typeof img === 'string' ? img : img.url
            );

            // Sadece yeni fotoğrafları ekle (tekrarları önle)
            const newPhotoUrls = photoUrls.filter(url => !existingUrls.includes(url));

            // Yeni fotoğrafları additionalImages dizisine ekle
            const newImages = newPhotoUrls.map(url => ({ url }));

            // Ana fotoğrafı ayarla (eğer yoksa)
            let updatedHotel = { ...hotel };

            if (!hotel.imageUrl && newPhotoUrls.length > 0) {
              updatedHotel.imageUrl = newPhotoUrls[0];
            }

            // Ek fotoğrafları ekle
            updatedHotel.additionalImages = [...existingImages, ...newImages];

            // AI tarafından önerilen otel olarak işaretle
            updatedHotel.isAIRecommended = true;

            return updatedHotel;
          } catch (error) {
            console.error(`${hotel.hotelName} için fotoğraf getirme hatası:`, error);
            return hotel;
          }
        })
      );

      console.log("AI otel seçenekleri fotoğraflarla zenginleştirildi");
      return enhancedHotels;
    } catch (error) {
      console.error("AI otel seçeneklerini zenginleştirme hatası:", error);
      return hotelOptions; // Hata durumunda orijinal otelleri döndür
    }
  },

  /**
   * Tek bir otelin fotoğraflarını zenginleştirir
   * @param hotel - Otel nesnesi
   * @param city - Otelin bulunduğu şehir
   * @returns Promise<any> - Fotoğraflarla zenginleştirilmiş otel nesnesi
   */
  async enhanceHotelWithPhotos(hotel: any, city: string): Promise<any> {
    try {
      if (!hotel || !hotel.hotelName) {
        console.warn("Geçersiz otel nesnesi");
        return hotel;
      }

      // Mevcut additionalImages dizisini kontrol et
      const existingImages = hotel.additionalImages || [];

      // Eğer zaten yeterli fotoğraf varsa, işlem yapma
      // Geçerli fotoğrafları say (null veya geçersiz olanları sayma)
      const validExistingImages = existingImages.filter(img =>
        img && (typeof img === 'string' ? img.trim() !== '' : (img.url && img.url.trim() !== ''))
      );

      if (validExistingImages.length >= 10) {
        return hotel;
      }

      // Ek fotoğraflar getir
      const photoUrls = await this.fetchHotelPhotos(hotel.hotelName, city);

      if (photoUrls.length === 0) {
        return hotel;
      }

      // Mevcut fotoğrafların URL'lerini topla
      const existingUrls = existingImages.map((img: any) =>
        typeof img === 'string' ? img : img.url
      );

      // Sadece yeni fotoğrafları ekle (tekrarları önle)
      const newPhotoUrls = photoUrls.filter(url => !existingUrls.includes(url));

      // Yeni fotoğrafları additionalImages dizisine ekle
      const newImages = newPhotoUrls.map(url => ({ url }));

      // Ana fotoğrafı ayarla (eğer yoksa)
      let updatedHotel = { ...hotel };

      if (!hotel.imageUrl && newPhotoUrls.length > 0) {
        updatedHotel.imageUrl = newPhotoUrls[0];
      }

      // Ek fotoğrafları ekle
      updatedHotel.additionalImages = [...existingImages, ...newImages];

      // AI tarafından önerilen otel olarak işaretle
      updatedHotel.isAIRecommended = true;

      return updatedHotel;
    } catch (error) {
      console.error(`${hotel.hotelName} için fotoğraf getirme hatası:`, error);
      // Hata durumunda bile AI tarafından önerilen olarak işaretle
      return {
        ...hotel,
        isAIRecommended: true
      };
    }
  },

  /**
   * OpenAI yanıtından otel seçeneklerini çıkarır ve fotoğraflarla zenginleştirir
   * @param openAIResponse - OpenAI yanıtı
   * @param city - Otellerin bulunduğu şehir
   * @returns Promise<any[]> - Fotoğraflarla zenginleştirilmiş otel seçenekleri
   */
  async processOpenAIHotelResponse(openAIResponse: any, city: string): Promise<any[]> {
    try {
      if (!openAIResponse) {
        console.warn("Geçersiz OpenAI yanıtı");
        return [];
      }

      // OpenAI yanıtından otel seçeneklerini çıkar
      let hotelOptions: any[] = [];

      if (openAIResponse.hotelOptions && Array.isArray(openAIResponse.hotelOptions)) {
        hotelOptions = openAIResponse.hotelOptions;
      } else if (typeof openAIResponse === 'string') {
        try {
          const parsedResponse = JSON.parse(openAIResponse);
          if (parsedResponse.hotelOptions && Array.isArray(parsedResponse.hotelOptions)) {
            hotelOptions = parsedResponse.hotelOptions;
          }
        } catch (error) {
          console.error("OpenAI yanıtını ayrıştırma hatası:", error);
        }
      }

      if (hotelOptions.length === 0) {
        console.warn("OpenAI yanıtında otel seçeneği bulunamadı");
        return [];
      }

      const enhancedHotels = await this.enhanceAIHotelOptions(hotelOptions, city);

      return enhancedHotels;
    } catch (error) {
      console.error("OpenAI otel yanıtını işleme hatası:", error);
      return [];
    }
  }
};

export default AIHotelPhotosService;
