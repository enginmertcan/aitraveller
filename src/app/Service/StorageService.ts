"use client";

import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { getApp, initializeApp } from "firebase/app";

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBGux1bZhFmmuNQDvGr2CDsUxIrHF1pFhU",
  authDomain: "ai-traveller-67214.firebaseapp.com",
  projectId: "ai-traveller-67214",
  storageBucket: "ai-traveller-67214.appspot.com",
  messagingSenderId: "151291844199",
  appId: "1:151291844199:web:45fcc2574f5c1d3453a6c2",
  measurementId: "G-W93HDHGMR1",
};

// Mevcut Firebase uygulamasını kullan veya yeni bir tane oluştur
let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

const storage = getStorage(app);

/**
 * Firebase Storage servisi
 */
const StorageService = {
  /**
   * Base64 formatındaki bir resmi Storage'a yükler
   * @param base64Data Base64 formatındaki resim verisi
   * @param path Dosya yolu (örn: "comments/123.jpg")
   * @returns Yüklenen dosyanın URL'i
   */
  async uploadBase64Image(base64Data: string, path: string): Promise<string> {
    try {
      console.log(`Resim yükleniyor: ${path}`);

      // Base64 formatını kontrol et
      let processedData = base64Data;

      // Eğer data:image ile başlıyorsa, prefix'i kaldır
      if (base64Data.startsWith('data:image')) {
        processedData = base64Data.split(',')[1];
      }

      // Storage referansı oluştur
      const storageRef = ref(storage, path);

      // Base64 verisini yükle
      await uploadString(storageRef, processedData, 'base64');

      // Yüklenen dosyanın URL'ini al
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`Resim başarıyla yüklendi: ${downloadURL}`);

      return downloadURL;
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      throw error;
    }
  },

  /**
   * Birden fazla base64 formatındaki resmi Storage'a yükler
   * @param images Base64 formatındaki resim verileri ve konum bilgileri
   * @param basePath Temel dosya yolu (örn: "comments/123")
   * @returns Yüklenen dosyaların URL'leri ve konum bilgileri
   */
  async uploadMultipleImages(
    images: { data: string; location?: string }[],
    basePath: string
  ): Promise<{ url: string; location?: string }[]> {
    try {
      console.log(`${images.length} resim yükleniyor: ${basePath}`);

      const uploadPromises = images.map(async (image, index) => {
        const path = `${basePath}/${index}.jpg`;
        const url = await this.uploadBase64Image(image.data, path);
        return {
          url,
          location: image.location
        };
      });

      const results = await Promise.all(uploadPromises);
      console.log(`${results.length} resim başarıyla yüklendi`);

      return results;
    } catch (error) {
      console.error('Çoklu resim yükleme hatası:', error);
      throw error;
    }
  },

  /**
   * Storage'dan bir dosyayı siler
   * @param url Silinecek dosyanın URL'i
   * @returns İşlem başarılı ise true, değilse false
   */
  async deleteFile(url: string): Promise<boolean> {
    try {
      console.log(`Dosya siliniyor: ${url}`);

      // URL'den dosya yolunu çıkar
      let filePath = '';
      try {
        // URL'den dosya yolunu çıkar
        const storageUrl = new URL(url);
        // Firebase Storage URL'lerinden yolu çıkar
        // Örnek: https://firebasestorage.googleapis.com/v0/b/ai-traveller-67214.appspot.com/o/comments%2F123%2F0.jpg?alt=media&token=abc123
        const pathRegex = /\/o\/(.+?)(\?|$)/;
        const match = storageUrl.pathname.match(pathRegex);

        if (match && match[1]) {
          // URL-encoded yolu decode et
          filePath = decodeURIComponent(match[1]);
          console.log(`Çıkarılan dosya yolu: ${filePath}`);
        } else {
          // Eğer regex ile bulunamazsa, doğrudan URL'yi kullan
          filePath = url;
        }
      } catch (parseError) {
        console.error('URL parse hatası:', parseError);
        // Eğer URL parse edilemezse, doğrudan URL'yi kullan
        filePath = url;
      }

      // Dosya referansı oluştur
      const fileRef = ref(storage, filePath);

      // Dosyayı sil
      await deleteObject(fileRef);
      console.log(`Dosya başarıyla silindi: ${filePath}`);

      return true;
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      return false;
    }
  },

  /**
   * Bir URL'in geçerli olup olmadığını kontrol eder
   * @param url Kontrol edilecek URL
   * @returns URL geçerli ise true, değilse false
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default StorageService;
