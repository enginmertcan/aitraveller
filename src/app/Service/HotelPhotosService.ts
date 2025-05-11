"use client";

/**
 * Google Places API ile otel fotoğrafları getirme servisi
 */
export const HotelPhotosService = {
  /**
   * Otel için fotoğrafları getirir
   * @param hotelName Otel adı
   * @param city Şehir adı
   * @returns Fotoğraf URL'lerinin listesi
   */
  async getHotelPhotos(hotelName: string, city: string): Promise<string[]> {
    try {
      console.log(`Otel fotoğrafları getiriliyor: ${hotelName}, ${city}`);

      // Arama sorgusu oluştur
      const query = `${hotelName} hotel ${city}`;

      console.log('Places Photos API isteği gönderiliyor...');

      // Yeni API route'u kullan - daha fazla fotoğraf için
      const response = await fetch('/api/places/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error('Places Photos API isteği başarısız:', response.status);
        // API isteği başarısız olduğunda yüksek kaliteli alternatif fotoğraflar kullan
        console.log('Yüksek kaliteli alternatif otel fotoğrafları kullanılıyor');
        return this.getDummyPhotos();
      }

      const data = await response.json();

      if (!data.photoReferences || data.photoReferences.length === 0) {
        console.log('Otel fotoğrafları bulunamadı, yüksek kaliteli alternatif fotoğraflar kullanılıyor');
        // Her zaman fotoğraf göstermek için yüksek kaliteli alternatif fotoğraflar kullan
        return this.getDummyPhotos();
      }

      // Tüm fotoğraf referanslarını URL'lere dönüştür
      const photoUrls = data.photoReferences
        .filter((photoReference: string) => photoReference !== null && photoReference !== undefined && photoReference !== '')
        .map((photoReference: string) =>
          `/api/places/photo?photoReference=${encodeURIComponent(photoReference)}&maxwidth=800`
        );

      // Eğer hiç geçerli fotoğraf yoksa, yedek fotoğrafları kullan
      if (photoUrls.length === 0) {
        console.log('Geçerli fotoğraf bulunamadı, yüksek kaliteli alternatif fotoğraflar kullanılıyor');
        return this.getDummyPhotos();
      }

      // Ekstra güvenlik için, aynı URL'leri tekrar kontrol et ve kaldır
      // (API'den gelen referanslar zaten benzersiz olmalı, ama emin olmak için)
      const uniquePhotoUrls: string[] = Array.from(new Set(photoUrls));

      console.log(`${uniquePhotoUrls.length} adet benzersiz fotoğraf bulundu`);
      return uniquePhotoUrls;
    } catch (error) {
      console.error('Otel fotoğrafları getirme hatası:', error);
      // Hata durumunda yüksek kaliteli alternatif fotoğraflar kullan
      console.log('Hata nedeniyle yüksek kaliteli alternatif otel fotoğrafları kullanılıyor');
      return this.getDummyPhotos();
    }
  },

  /**
   * Yüksek kaliteli otel fotoğrafları döndürür (API çağrısı başarısız olduğunda kullanılır)
   * @returns Yüksek kaliteli otel fotoğraf URL'leri
   */
  /**
   * Alias for getHotelPhotos for backward compatibility with HotelPhotosService.ts
   * @param hotelName Hotel name
   * @param city City name
   * @returns Promise<string[]> Array of photo URLs
   */
  async fetchHotelPhotos(hotelName: string, city: string): Promise<string[]> {
    return this.getHotelPhotos(hotelName, city);
  },

  getDummyPhotos(): string[] {
    return [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=90',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=90',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=90',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=90',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=90',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=90',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=90',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1174&q=90',
    ];
  },

  /**
   * Otel detay sayfasında fotoğrafları göster
   * @param hotelName Otel adı
   * @param city Şehir adı
   * @param containerId Fotoğrafların gösterileceği container ID'si
   * @param isDarkMode Karanlık mod aktif mi
   */
  async displayHotelPhotos(hotelName: string, city: string, containerId: string, isDarkMode: boolean): Promise<void> {
    try {
      console.log(`Otel fotoğrafları gösteriliyor: ${hotelName}, ${city}, ${containerId}`);

      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container bulunamadı: ${containerId}`);
        return;
      }

      console.log(`Container bulundu: ${containerId}`);

      // Fotoğrafları getir
      console.log(`Fotoğraflar getiriliyor: ${hotelName}, ${city}`);
      const photos = await this.getHotelPhotos(hotelName, city);
      console.log(`${photos.length} adet fotoğraf bulundu`);

      // Önizleme kutuları artık kullanılmıyor

      if (photos.length === 0) {
        container.innerHTML = `
          <div style="width: 100%; text-align: center; padding: 20px;">
            <p style="color: ${isDarkMode ? '#e5e7eb' : '#6b7280'}; font-style: italic;">Fotoğraf bulunamadı</p>
          </div>
        `;
        return;
      }

      // Fotoğrafları göster
      container.innerHTML = '';

      // Fotoğrafları grid olarak göster
      const photoGrid = document.createElement('div');
      photoGrid.style.display = 'grid';
      photoGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
      photoGrid.style.gap = '20px';
      photoGrid.style.width = '100%';

      photos.forEach((photoUrl: string, index: number) => {
        // Null veya boş URL kontrolü
        if (!photoUrl) {
          console.log(`Fotoğraf ${index + 1} için URL bulunamadı, atlanıyor`);
          return;
        }

        const photoDiv = document.createElement('div');
        photoDiv.style.width = '100%';
        photoDiv.style.height = '180px';
        photoDiv.style.borderRadius = '12px';
        photoDiv.style.overflow = 'hidden';
        photoDiv.style.boxShadow = isDarkMode ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 8px 16px rgba(0, 0, 0, 0.15)';
        photoDiv.style.cursor = 'pointer';
        photoDiv.style.transition = 'all 0.3s ease';
        photoDiv.style.border = isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)';

        // Hover efekti
        photoDiv.onmouseover = () => {
          photoDiv.style.transform = 'translateY(-5px) scale(1.02)';
          photoDiv.style.boxShadow = isDarkMode ? '0 12px 24px rgba(0, 0, 0, 0.5)' : '0 12px 24px rgba(0, 0, 0, 0.2)';
        };
        photoDiv.onmouseout = () => {
          photoDiv.style.transform = 'translateY(0) scale(1)';
          photoDiv.style.boxShadow = isDarkMode ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 8px 16px rgba(0, 0, 0, 0.15)';
        };

        photoDiv.innerHTML = `
          <img
            src="${photoUrl}"
            alt="${hotelName} - Fotoğraf ${index + 1}"
            style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;"
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';"
          />
        `;

        // Fotoğrafa tıklandığında büyüt
        photoDiv.addEventListener('click', () => {
          this.openFullSizeImage(photoUrl, hotelName, index, photos, isDarkMode);
        });

        photoGrid.appendChild(photoDiv);
      });

      container.appendChild(photoGrid);
    } catch (error) {
      console.error('Otel fotoğrafları gösterme hatası:', error);

      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div style="width: 100%; text-align: center; padding: 20px;">
            <p style="color: ${isDarkMode ? '#e5e7eb' : '#6b7280'}; font-style: italic;">Fotoğraflar yüklenirken bir hata oluştu</p>
          </div>
        `;
      }
    }
  },

  /**
   * Önizleme kutularını güncelle - Artık kullanılmıyor
   * @deprecated Bu fonksiyon artık kullanılmıyor
   */
  updatePreviewThumbnails(_photos: string[], _hotelName: string, _isDarkMode: boolean): void {
    // Bu fonksiyon artık kullanılmıyor
    console.log('updatePreviewThumbnails fonksiyonu artık kullanılmıyor');
  },

  /**
   * Tam boyutlu fotoğrafı modal içinde göster
   * @param photoUrl Fotoğraf URL'i
   * @param hotelName Otel adı
   * @param index Fotoğraf indeksi
   * @param allPhotos Tüm fotoğraflar
   * @param isDarkMode Karanlık mod aktif mi
   */
  openFullSizeImage(photoUrl: string, hotelName: string, index: number, allPhotos: string[], isDarkMode: boolean): void {
    // isDarkMode değişkenini kullan
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.9)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    // Ana görsel
    const imgContainer = document.createElement('div');
    imgContainer.style.position = 'relative';
    imgContainer.style.width = '90%';
    imgContainer.style.height = '80%';
    imgContainer.style.display = 'flex';
    imgContainer.style.justifyContent = 'center';
    imgContainer.style.alignItems = 'center';

    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = `${hotelName} - Fotoğraf ${index + 1}`;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '4px';
    img.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';

    imgContainer.appendChild(img);
    modal.appendChild(imgContainer);

    // Fotoğraf sayısı göstergesi
    if (allPhotos.length > 1) {
      const counter = document.createElement('div');
      counter.textContent = `${index + 1} / ${allPhotos.length}`;
      counter.style.position = 'absolute';
      counter.style.bottom = '20px';
      counter.style.left = '50%';
      counter.style.transform = 'translateX(-50%)';
      counter.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      counter.style.color = 'white';
      counter.style.padding = '8px 16px';
      counter.style.borderRadius = '20px';
      counter.style.fontSize = '14px';
      modal.appendChild(counter);

      // Önceki/sonraki butonları
      if (allPhotos.length > 1) {
        // Önceki buton
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '❮';
        prevButton.style.position = 'absolute';
        prevButton.style.top = '50%';
        prevButton.style.left = '20px';
        prevButton.style.transform = 'translateY(-50%)';
        prevButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        prevButton.style.color = 'white';
        prevButton.style.border = 'none';
        prevButton.style.borderRadius = '50%';
        prevButton.style.width = '50px';
        prevButton.style.height = '50px';
        prevButton.style.fontSize = '24px';
        prevButton.style.cursor = 'pointer';
        prevButton.style.transition = 'background-color 0.3s';
        prevButton.style.zIndex = '10000';

        prevButton.onmouseover = () => {
          prevButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        };
        prevButton.onmouseout = () => {
          prevButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        };

        prevButton.onclick = (e) => {
          e.stopPropagation();
          const newIndex = (index - 1 + allPhotos.length) % allPhotos.length;
          img.src = allPhotos[newIndex];
          counter.textContent = `${newIndex + 1} / ${allPhotos.length}`;
          index = newIndex;
        };

        // Sonraki buton
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '❯';
        nextButton.style.position = 'absolute';
        nextButton.style.top = '50%';
        nextButton.style.right = '20px';
        nextButton.style.transform = 'translateY(-50%)';
        nextButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        nextButton.style.color = 'white';
        nextButton.style.border = 'none';
        nextButton.style.borderRadius = '50%';
        nextButton.style.width = '50px';
        nextButton.style.height = '50px';
        nextButton.style.fontSize = '24px';
        nextButton.style.cursor = 'pointer';
        nextButton.style.transition = 'background-color 0.3s';
        nextButton.style.zIndex = '10000';

        nextButton.onmouseover = () => {
          nextButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        };
        nextButton.onmouseout = () => {
          nextButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        };

        nextButton.onclick = (e) => {
          e.stopPropagation();
          const newIndex = (index + 1) % allPhotos.length;
          img.src = allPhotos[newIndex];
          counter.textContent = `${newIndex + 1} / ${allPhotos.length}`;
          index = newIndex;
        };

        modal.appendChild(prevButton);
        modal.appendChild(nextButton);
      }
    }

    // Kapatma butonu
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.transition = 'background-color 0.3s';
    closeButton.style.zIndex = '10000';

    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    };

    closeButton.onclick = () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    };

    modal.appendChild(closeButton);

    // Modalın dışına tıklandığında kapat
    modal.onclick = () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    };

    // Görsel tıklamasını engelle
    imgContainer.onclick = (e) => {
      e.stopPropagation();
    };

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }
};

export default HotelPhotosService;
