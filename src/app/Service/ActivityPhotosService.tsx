/**
 * Aktivite fotoğrafları için servis
 * Bu servis, aktivite fotoğraflarını getirmek için kullanılır
 */
const ActivityPhotosService = {
  // Fotoğraf önbelleği - aynı sorguları tekrar tekrar yapmamak için
  photoCache: new Map<string, string[]>(),

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

      // Arama sorgusu oluştur - daha spesifik sorgular için
      // Turistik yerler için "attraction" veya "landmark" ekle
      const query = `${activityName} ${city} attraction`;
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
          const dummyPhotos = this.getDummyPhotos(activityName, city);
          this.photoCache.set(cacheKey, dummyPhotos); // Önbelleğe kaydet
          return dummyPhotos;
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
          const dummyPhotos = this.getDummyPhotos(activityName, city);
          this.photoCache.set(cacheKey, dummyPhotos); // Önbelleğe kaydet
          return dummyPhotos;
        }

        // Sonuçları önbelleğe kaydet
        this.photoCache.set(cacheKey, photoUrls);
        return photoUrls;
      } catch (apiError) {
        console.error('API isteği hatası:', apiError);
        console.log('Yedek fotoğraflar kullanılıyor...');
        const dummyPhotos = this.getDummyPhotos(activityName, city);
        this.photoCache.set(cacheKey, dummyPhotos); // Önbelleğe kaydet
        return dummyPhotos;
      }
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
    if (activityNameLower.includes('müze') ||
        activityNameLower.includes('müzesi') ||
        activityNameLower.includes('museum') ||
        activityNameLower.includes('tarihi') ||
        activityNameLower.includes('antik') ||
        activityNameLower.includes('ancient') ||
        activityNameLower.includes('arkeoloji')) {
      return [
        'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3329292/pexels-photo-3329292.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2570063/pexels-photo-2570063.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Plaj, deniz veya sahil fotoğrafları
    if (activityNameLower.includes('plaj') ||
        activityNameLower.includes('beach') ||
        activityNameLower.includes('deniz') ||
        activityNameLower.includes('sea') ||
        activityNameLower.includes('sahil') ||
        activityNameLower.includes('coast')) {
      return [
        'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1705254/pexels-photo-1705254.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Doğa, park veya bahçe fotoğrafları
    if (activityNameLower.includes('park') ||
        activityNameLower.includes('bahçe') ||
        activityNameLower.includes('garden') ||
        activityNameLower.includes('doğa') ||
        activityNameLower.includes('nature') ||
        activityNameLower.includes('orman') ||
        activityNameLower.includes('forest')) {
      return [
        'https://images.pexels.com/photos/1319515/pexels-photo-1319515.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Cami, kilise veya dini yapı fotoğrafları
    if (activityNameLower.includes('cami') ||
        activityNameLower.includes('mosque') ||
        activityNameLower.includes('kilise') ||
        activityNameLower.includes('church') ||
        activityNameLower.includes('katedral') ||
        activityNameLower.includes('cathedral') ||
        activityNameLower.includes('tapınak') ||
        activityNameLower.includes('temple')) {
      return [
        'https://images.pexels.com/photos/1537086/pexels-photo-1537086.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1850021/pexels-photo-1850021.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1456291/pexels-photo-1456291.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1531958/pexels-photo-1531958.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Şehir merkezi, meydan veya cadde fotoğrafları
    if (activityNameLower.includes('meydan') ||
        activityNameLower.includes('square') ||
        activityNameLower.includes('cadde') ||
        activityNameLower.includes('street') ||
        activityNameLower.includes('merkez') ||
        activityNameLower.includes('center') ||
        activityNameLower.includes('çarşı') ||
        activityNameLower.includes('bazaar')) {
      return [
        'https://images.pexels.com/photos/2129796/pexels-photo-2129796.png?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2346216/pexels-photo-2346216.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1209978/pexels-photo-1209978.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Yemek, restoran veya kafe fotoğrafları
    if (activityNameLower.includes('restoran') ||
        activityNameLower.includes('restaurant') ||
        activityNameLower.includes('kafe') ||
        activityNameLower.includes('cafe') ||
        activityNameLower.includes('yemek') ||
        activityNameLower.includes('food') ||
        activityNameLower.includes('mutfak') ||
        activityNameLower.includes('cuisine')) {
      return [
        'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
    }

    // Şehir adına göre özel fotoğraflar
    const cityLower = (city || '').toLowerCase();
    if (cityLower === 'istanbul') {
      return [
        'https://images.pexels.com/photos/2042109/pexels-photo-2042109.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3254729/pexels-photo-3254729.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2563723/pexels-photo-2563723.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2868257/pexels-photo-2868257.jpeg?auto=compress&cs=tinysrgb&w=800'
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

      // Önbellek anahtarı oluştur
      const cacheKey = `photos_${activityName}_${city}`;

      // Önbellekte varsa, önbellekten döndür
      const cachedPhotos = sessionStorage.getItem(cacheKey);
      if (cachedPhotos) {
        console.log(`Önbellekten aktivite fotoğrafları alınıyor: ${activityName}`);
        return JSON.parse(cachedPhotos);
      }

      // Google Places API'den fotoğraf URL'lerini al
      const photoUrls = await this.getActivityPhotos(activityName, city);

      console.log('Alınan fotoğraf URL\'leri:', photoUrls.length > 0 ? `${photoUrls.length} adet` : 'Bulunamadı');

      // Fotoğraf URL'lerini aktivite fotoğrafı formatına dönüştür
      const activityPhotos = photoUrls.map((url, index) => ({
        imageUrl: url,
        location: activityName,
        description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
      }));

      // Sonuçları önbelleğe kaydet (session storage)
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(activityPhotos));
      } catch (cacheError) {
        console.warn('Fotoğraflar önbelleğe kaydedilemedi:', cacheError);
      }

      console.log('Aktivite fotoğrafları oluşturuldu:', activityPhotos.length);
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

      // Yedek fotoğrafları da önbelleğe kaydet
      try {
        const cacheKey = `photos_${activityName}_${city}`;
        sessionStorage.setItem(cacheKey, JSON.stringify(dummyPhotos));
      } catch (cacheError) {
        console.warn('Yedek fotoğraflar önbelleğe kaydedilemedi:', cacheError);
      }

      console.log('Yedek fotoğraflar oluşturuldu:', dummyPhotos.length);
      return dummyPhotos;
    }
  },

  /**
   * Tüm aktiviteler için fotoğrafları önceden yükler
   * @param activities Aktivite listesi
   * @param city Şehir adı
   * @returns Aktivite adı ve fotoğrafları içeren bir obje
   */
  async preloadActivityPhotos(activities: string[], city: string): Promise<{[key: string]: any[]}> {
    console.log(`${activities.length} aktivite için fotoğraflar önceden yükleniyor...`);

    const photosMap: {[key: string]: any[]} = {};

    // Her aktivite için paralel olarak fotoğrafları yükle
    const photosPromises = activities.map(async (activityName) => {
      if (!activityName) return null;

      try {
        const photos = await this.loadActivityPhotos(activityName, city);
        return { activityName, photos };
      } catch (error) {
        console.error(`${activityName} fotoğrafları yüklenirken hata:`, error);
        return { activityName, photos: [] };
      }
    });

    // Tüm isteklerin tamamlanmasını bekle
    const results = await Promise.all(photosPromises);

    // Sonuçları map'e ekle
    results.forEach(result => {
      if (result && result.activityName) {
        photosMap[result.activityName] = result.photos;
      }
    });

    console.log(`${Object.keys(photosMap).length} aktivite için fotoğraflar yüklendi`);
    return photosMap;
  }
};

export default ActivityPhotosService;
