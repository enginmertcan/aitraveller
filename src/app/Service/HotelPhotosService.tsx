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
        return this.getDummyPhotos();
      }

      const data = await response.json();

      if (!data.photoReferences || data.photoReferences.length === 0) {
        console.log('Otel fotoğrafları bulunamadı, örnek fotoğraflar kullanılıyor');
        return this.getDummyPhotos();
      }

      // Tüm fotoğraf referanslarını URL'lere dönüştür
      const photoUrls = data.photoReferences.map((photoReference: string) => {
        return `/api/places/photo?photoReference=${encodeURIComponent(photoReference)}&maxwidth=800`;
      });

      console.log(`${photoUrls.length} adet fotoğraf bulundu`);
      return photoUrls;
    } catch (error) {
      console.error('Otel fotoğrafları getirme hatası:', error);
      return this.getDummyPhotos();
    }
  },

  /**
   * Örnek fotoğraflar döndürür (API çağrısı başarısız olduğunda kullanılır)
   * @returns Örnek fotoğraf URL'leri
   */
  getDummyPhotos(): string[] {
    return [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
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

      // Yükleniyor mesajını göster
      container.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 20px;">
          <p style="color: ${isDarkMode ? '#e5e7eb' : '#6b7280'}; font-style: italic;">Fotoğraflar yükleniyor...</p>
        </div>
      `;

      // Fotoğrafları getir
      console.log(`Fotoğraflar getiriliyor: ${hotelName}, ${city}`);
      const photos = await this.getHotelPhotos(hotelName, city);
      console.log(`${photos.length} adet fotoğraf bulundu`);

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
      photoGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
      photoGrid.style.gap = '16px';
      photoGrid.style.width = '100%';

      photos.forEach((photoUrl, index) => {
        const photoDiv = document.createElement('div');
        photoDiv.style.width = '100%';
        photoDiv.style.height = '150px';
        photoDiv.style.borderRadius = '8px';
        photoDiv.style.overflow = 'hidden';
        photoDiv.style.boxShadow = isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)';
        photoDiv.style.cursor = 'pointer';
        photoDiv.style.transition = 'transform 0.3s ease';

        // Hover efekti
        photoDiv.onmouseover = () => {
          photoDiv.style.transform = 'scale(1.05)';
        };
        photoDiv.onmouseout = () => {
          photoDiv.style.transform = 'scale(1)';
        };

        photoDiv.innerHTML = `
          <img
            src="${photoUrl}"
            alt="${hotelName} - Fotoğraf ${index + 1}"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        `;

        // Fotoğrafa tıklandığında büyüt
        photoDiv.addEventListener('click', () => {
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100%';
          modal.style.height = '100%';
          modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.style.zIndex = '9999';

          modal.innerHTML = `
            <img
              src="${photoUrl}"
              alt="${hotelName} - Fotoğraf ${index + 1}"
              style="max-width: 90%; max-height: 90%; object-fit: contain;"
            />
            <button
              style="position: absolute; top: 20px; right: 20px; background: rgba(255, 255, 255, 0.3); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;"
            >
              ✕
            </button>
          `;

          document.body.appendChild(modal);
          document.body.style.overflow = 'hidden';

          // Kapatma butonuna tıklandığında modalı kapat
          const closeButton = modal.querySelector('button');
          closeButton?.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
          });

          // Modalın dışına tıklandığında da kapat
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              document.body.removeChild(modal);
              document.body.style.overflow = '';
            }
          });
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
  }
};

export default HotelPhotosService;
