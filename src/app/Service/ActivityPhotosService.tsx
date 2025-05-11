/**
 * Aktivite fotoğrafları için servis
 * Bu servis, aktivite fotoğraflarını getirmek için kullanılır
 */
const ActivityPhotosService = {
  /**
   * Aktivite fotoğraflarını getirir
   * @param activityName Aktivite adı
   * @param city Şehir adı
   * @returns Fotoğraf URL'lerinin listesi
   */
  async getActivityPhotos(activityName: string, city: string): Promise<string[]> {
    try {
      console.log(`Aktivite fotoğrafları getiriliyor: ${activityName}, ${city}`);

      // Arama sorgusu oluştur
      const query = `${activityName} ${city}`;
      console.log('Google Places API isteği gönderiliyor:', query);

      // Google Places API'den fotoğrafları getir
      try {
        const response = await fetch('/api/places/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          cache: 'no-store'
        });

        if (!response.ok) {
          console.error('Places Photos API isteği başarısız:', response.status);
          throw new Error(`API isteği başarısız: ${response.status}`);
        }

        const data = await response.json();

        if (!data.photoReferences || data.photoReferences.length === 0) {
          console.log('Aktivite fotoğrafları bulunamadı, yedek fotoğraflar kullanılıyor');
          throw new Error('Fotoğraf referansları bulunamadı');
        }

        // Tüm fotoğraf referanslarını URL'lere dönüştür
        const photoUrls = data.photoReferences
          .filter((photoReference: string) => photoReference !== null && photoReference !== undefined && photoReference !== '')
          .map((photoReference: string) => {
            return `/api/places/photo?photoReference=${encodeURIComponent(photoReference)}&maxwidth=800`;
          });

        console.log(`${photoUrls.length} adet fotoğraf referansı bulundu`);

        if (photoUrls.length === 0) {
          console.log('Geçerli fotoğraf bulunamadı, yedek fotoğraflar kullanılıyor');
          return this.getDummyPhotos();
        }

        return photoUrls;
      } catch (apiError) {
        console.error('API isteği hatası:', apiError);
        console.log('Yedek fotoğraflar kullanılıyor...');
        return this.getDummyPhotos();
      }
    } catch (error) {
      console.error('Aktivite fotoğrafları getirme hatası:', error);
      // Hata durumunda yedek fotoğraflar kullan
      console.log('Hata nedeniyle yedek aktivite fotoğrafları kullanılıyor');
      return this.getDummyPhotos();
    }
  },

  /**
   * Yüksek kaliteli aktivite fotoğrafları döndürür (API çağrısı başarısız olduğunda kullanılır)
   * @param activityName Aktivite adı (opsiyonel)
   * @param city Şehir adı (opsiyonel)
   * @returns Yüksek kaliteli aktivite fotoğraf URL'leri
   */
  getDummyPhotos(activityName?: string, city?: string): string[] {
    console.log(`Yedek fotoğraflar kullanılıyor: ${activityName || ''}, ${city || ''}`);

    // Statik fotoğraf URL'leri - CORS sorunlarını önlemek için
    return [
      'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2245436/pexels-photo-2245436.png?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
  },

  /**
   * Aktivite fotoğraflarını yükler ve döndürür
   * @param activityName Aktivite adı
   * @param city Şehir adı
   * @returns Aktivite fotoğrafları
   */
  async loadActivityPhotos(activityName: string, city: string): Promise<any[]> {
    try {
      console.log(`Aktivite fotoğrafları yükleniyor: ${activityName}, ${city}`);

      // Google Places API'den fotoğraf URL'lerini al
      const photoUrls = await this.getActivityPhotos(activityName, city);

      console.log('Alınan fotoğraf URL\'leri:', photoUrls);

      // Fotoğraf URL'lerini aktivite fotoğrafı formatına dönüştür
      const activityPhotos = photoUrls.map((url, index) => ({
        imageUrl: url,
        location: activityName,
        description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
      }));

      console.log('Aktivite fotoğrafları oluşturuldu:', activityPhotos);
      return activityPhotos;
    } catch (error) {
      console.error('Aktivite fotoğrafları yükleme hatası:', error);

      // Hata durumunda yedek fotoğraflar kullan
      console.log('Hata nedeniyle yedek fotoğraflar kullanılıyor');
      const backupUrls = this.getDummyPhotos(activityName, city);

      // Fotoğraf URL'lerini aktivite fotoğrafı formatına dönüştür
      const dummyPhotos = backupUrls.map((url, index) => ({
        imageUrl: url,
        location: activityName,
        description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
      }));

      console.log('Yedek fotoğraflar oluşturuldu:', dummyPhotos);
      return dummyPhotos;
    }
  }
};

export default ActivityPhotosService;
