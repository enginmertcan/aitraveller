/**
 * Aktivite fotoğrafları için servis
 * Bu servis, aktivite fotoğraflarını getirmek için kullanılır
 */
const ActivityPhotosService = {
  // Fotoğraf önbelleği - aynı sorguları tekrar tekrar yapmamak için
  photoCache: new Map<string, string[]>(),

  /**
   * Metindeki Türkçe karakterleri İngilizce karakterlere dönüştürür
   * @param text Dönüştürülecek metin
   * @returns Dönüştürülmüş metin
   */
  normalizeText(text: string): string {
    return text
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ğ/g, 'G')
      .replace(/Ü/g, 'U')
      .replace(/Ş/g, 'S')
      .replace(/İ/g, 'I')
      .replace(/Ö/g, 'O')
      .replace(/Ç/g, 'C');
  },

  /**
   * Aktivite fotoğraflarını getirir
   * @param activityName Aktivite adı
   * @param city Şehir adı
   * @returns Fotoğraf URL'lerinin listesi
   */
  async getActivityPhotos(activityName: string, city: string): Promise<string[]> {
    try {
      // Önbellek anahtarı oluştur
      const cacheKey = `${activityName}_${city}`;

      // Önbellekte varsa, önbellekten döndür
      if (this.photoCache.has(cacheKey)) {
        console.log(`Önbellekten fotoğraflar alınıyor: ${activityName}, ${city}`);
        return this.photoCache.get(cacheKey) || [];
      }

      console.log(`Aktivite fotoğrafları getiriliyor: ${activityName}, ${city}`);

      // Aktivite adında Türkçe karakterleri İngilizce karakterlere dönüştür
      const normalizedActivityName = this.normalizeText(activityName);
      const normalizedCity = this.normalizeText(city);

      // Birden fazla sorgu oluştur - daha doğru sonuçlar için
      const queries = [
        // Ana sorgu - aktivite adı ve şehir
        `${normalizedActivityName} ${normalizedCity} tourist attraction`,
        // Alternatif sorgu - aktivite adı, şehir ve "landmark"
        `${normalizedActivityName} ${normalizedCity} landmark`,
        // Alternatif sorgu - aktivite adı ve "Turkey"
        `${normalizedActivityName} Turkey tourist attraction`
      ];

      // Özel durumlar için ek sorgular
      if (activityName.toLowerCase().includes('travertenleri') || activityName.toLowerCase().includes('pamukkale')) {
        queries.push('Pamukkale Travertines Turkey');
        queries.push('Pamukkale Hierapolis Turkey');
      } else if (activityName.toLowerCase().includes('efes') || activityName.toLowerCase().includes('ephesus')) {
        queries.push('Ephesus Ancient City Turkey');
        queries.push('Efes Antik Kenti Turkey');
      } else if (activityName.toLowerCase().includes('kapadokya') || activityName.toLowerCase().includes('cappadocia')) {
        queries.push('Cappadocia Turkey');
        queries.push('Kapadokya Balloon Turkey');
      }

      console.log('Kullanılacak sorgular:', queries);

      // Tüm sorgular için fotoğrafları getir
      let allPhotoUrls: string[] = [];

      // Her sorgu için paralel olarak fotoğrafları getir
      const photoPromises = queries.map(async (queryText) => {
        try {
          const response = await fetch('/api/places/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: queryText }),
            cache: 'no-store'
          });

          if (!response.ok) {
            console.error(`"${queryText}" sorgusu için API isteği başarısız:`, response.status);
            return [];
          }

          const data = await response.json();

          if (!data.photoReferences || data.photoReferences.length === 0) {
            console.log(`"${queryText}" sorgusu için fotoğraf bulunamadı`);
            return [];
          }

          // Fotoğraf referanslarını URL'lere dönüştür
          return data.photoReferences
            .filter((photoReference: string) => photoReference !== null && photoReference !== undefined && photoReference !== '')
            .map((photoReference: string) => {
              return `/api/places/photo?photoReference=${encodeURIComponent(photoReference)}&maxwidth=800`;
            });
        } catch (error) {
          console.error(`"${queryText}" sorgusu için hata:`, error);
          return [];
        }
      });

      // Tüm sorgu sonuçlarını bekle
      const photoUrlsArrays = await Promise.all(photoPromises);

      // Tüm sonuçları birleştir ve tekrarlanan URL'leri kaldır
      const uniquePhotoUrls = new Set<string>();
      photoUrlsArrays.forEach(urls => {
        urls.forEach(url => uniquePhotoUrls.add(url));
      });

      // Set'i array'e dönüştür
      allPhotoUrls = Array.from(uniquePhotoUrls);

      console.log(`Toplam ${allPhotoUrls.length} adet benzersiz fotoğraf referansı bulundu`);

      if (allPhotoUrls.length === 0) {
        console.log('Hiçbir sorguda fotoğraf bulunamadı, yedek fotoğraflar kullanılıyor');
        const dummyPhotos = this.getDummyPhotos(activityName, city);
        this.photoCache.set(cacheKey, dummyPhotos); // Önbelleğe kaydet
        return dummyPhotos;
      }

      // Sonuçları önbelleğe kaydet
      this.photoCache.set(cacheKey, allPhotoUrls);
      return allPhotoUrls;
    } catch (error) {
      console.error('Aktivite fotoğrafları getirme hatası:', error);
      // Hata durumunda yedek fotoğraflar kullan
      console.log('Hata nedeniyle yedek aktivite fotoğrafları kullanılıyor');
      const dummyPhotos = this.getDummyPhotos(activityName, city);
      return dummyPhotos;
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

    // Aktivite adına göre kategorize edilmiş fotoğraflar
    const activityNameLower = (activityName || '').toLowerCase();

    // Müze veya tarihi yer fotoğrafları
    if (activityNameLower.includes('müze') || activityNameLower.includes('müzesi') || activityNameLower.includes('museum')) {
      return [
        'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3329292/pexels-photo-3329292.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2570063/pexels-photo-2570063.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Plaj, deniz veya sahil fotoğrafları
    if (activityNameLower.includes('plaj') || activityNameLower.includes('beach')) {
      return [
        'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1705254/pexels-photo-1705254.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Pamukkale için özel fotoğraflar
    if (activityNameLower.includes('pamukkale') || activityNameLower.includes('hierapolis')) {
      return [
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1000',
        'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1000',
        'https://images.unsplash.com/photo-1552248524-10d9a7e4b84a?q=80&w=1000',
        'https://images.unsplash.com/photo-1593238739364-18cfde3c6c82?q=80&w=1000',
        'https://images.unsplash.com/photo-1604154858776-6c30088a0e4a?q=80&w=1000'
      ];
    }

    // Efes için özel fotoğraflar
    if (activityNameLower.includes('efes') || activityNameLower.includes('ephesus')) {
      return [
        'https://images.unsplash.com/photo-1600002423562-54c88fc6f0b8?q=80&w=1000',
        'https://images.unsplash.com/photo-1589834016091-3b8e5c7e1f19?q=80&w=1000',
        'https://images.unsplash.com/photo-1607162378996-b230300835a3?q=80&w=1000',
        'https://images.unsplash.com/photo-1566136599746-c0f258451808?q=80&w=1000',
        'https://images.unsplash.com/photo-1601582067700-4a73f9d9d5e9?q=80&w=1000'
      ];
    }

    // Kapadokya için özel fotoğraflar
    if (activityNameLower.includes('kapadokya') || activityNameLower.includes('cappadocia')) {
      return [
        'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=1000',
        'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?q=80&w=1000',
        'https://images.unsplash.com/photo-1642419752111-78a4c9a0ef0f?q=80&w=1000',
        'https://images.unsplash.com/photo-1533230050368-fbf55584f782?q=80&w=1000',
        'https://images.unsplash.com/photo-1604154274174-7c175ca7b211?q=80&w=1000'
      ];
    }

    // Varsayılan genel seyahat fotoğrafları
    return [
      'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2245436/pexels-photo-2245436.png?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=800'
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
      // Aktivite adı veya şehir yoksa, varsayılan fotoğrafları döndür
      if (!activityName || !city) {
        console.log('Aktivite adı veya şehir bilgisi eksik, varsayılan fotoğraflar kullanılıyor');
        const dummyUrls = this.getDummyPhotos('', '');
        return dummyUrls.map((url, index) => ({
          imageUrl: url,
          location: activityName || 'Aktivite',
          description: `${activityName || 'Aktivite'} - Fotoğraf ${index + 1}`
        }));
      }

      console.log(`Aktivite fotoğrafları yükleniyor: ${activityName}, ${city}`);

      // Google Places API'den fotoğraf URL'lerini al
      const photoUrls = await this.getActivityPhotos(activityName, city);

      // Fotoğraf URL'lerini aktivite fotoğrafı formatına dönüştür
      const activityPhotos = photoUrls.map((url, index) => ({
        imageUrl: url,
        location: activityName,
        description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
      }));

      return activityPhotos;
    } catch (error) {
      console.error('Aktivite fotoğrafları yükleme hatası:', error);
      // Hata durumunda yedek fotoğraflar kullan
      const backupUrls = this.getDummyPhotos(activityName, city);
      return backupUrls.map((url, index) => ({
        imageUrl: url,
        location: activityName,
        description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
      }));
    }
  }
};

export default ActivityPhotosService;
