import OpenAI from "openai";
import { HotelImageService } from "./HotelImageService";
import { Hotel } from "../types/travel";

// OpenAI API anahtarını çevre değişkeninden al
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

// OpenAI istemcisini başlat
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Browser'da çalışması için gerekli
});

// Seyahat planı oluşturmak için kullanılacak sistem mesajı
const SYSTEM_PROMPT = `Sen bir seyahat asistanısın. Kullanıcının istediği seyahat planını JSON formatında oluşturmalısın. Tüm yanıtların Türkçe olmalı.

Yanıtın kesinlikle aşağıdaki alanları içermelidir:
- bestTimeToVisit (destinasyon için en uygun ziyaret zamanı - ZORUNLU ALAN)
- destinationInfo (destinasyon hakkında genel bilgiler, MUTLAKA bestTimeToVisit alanı içermeli)

Aşağıdaki formatta JSON döndürmelisin:
{
  "hotelOptions": [
    {
      "hotelName": "Otel adı",
      "hotelAddress": "Otel adresi",
      "price": "Fiyat aralığı",
      "hotelImageUrl": "Görsel URL",
      "geoCoordinates": {
        "latitude": 0,
        "longitude": 0
      },
      "rating": 0,
      "description": "Açıklama",
      "bestTimeToVisit": "En iyi ziyaret zamanı",
      "features": ["Özellik 1", "Özellik 2", "Özellik 3"],
      "surroundings": "Çevre bilgisi"
    }
  ],
  "itinerary": [
    {
      "day": "1. Gün",
      "plan": [
        {
          "time": "09:00 - 12:00",
          "placeName": "Yer adı",
          "placeDetails": "Detaylı açıklama",
          "placeImageUrl": "Görsel URL",
          "geoCoordinates": {
            "latitude": 0,
            "longitude": 0
          },
          "ticketPricing": "Bilet fiyatı",
          "timeToTravel": "Ulaşım süresi",
          "tips": ["Tavsiye 1", "Tavsiye 2", "Tavsiye 3"],
          "warnings": ["Uyarı 1", "Uyarı 2"],
          "alternatives": ["Alternatif 1", "Alternatif 2"]
        }
      ]
    }
  ],
  "visaInfo": {
    "visaRequirement": "Vize gerekliliği",
    "visaApplicationProcess": "Vize başvuru süreci",
    "requiredDocuments": ["Belge 1", "Belge 2"],
    "visaFee": "Vize ücreti",
    "visaProcessingTime": "İşlem süresi",
    "visaApplicationCenters": ["Merkez 1", "Merkez 2"],
    "passportRequirements": "Pasaport gereksinimleri",
    "passportValidityRequirements": "Geçerlilik süresi",
    "importantNotes": "Önemli notlar",
    "emergencyContacts": {
      "ambulance": "112",
      "police": "155",
      "jandarma": "156"
    }
  },
  "culturalDifferences": {
    "culturalDifferences": "Kültürel farklılıklar",
    "lifestyleDifferences": "Yaşam tarzı farklılıkları",
    "foodCultureDifferences": "Yemek kültürü farklılıkları",
    "socialNormsDifferences": "Sosyal norm farklılıkları",
    "religiousAndCulturalSensitivities": "Dini ve kültürel hassasiyetler",
    "localTraditionsAndCustoms": "Yerel gelenekler ve görenekler",
    "culturalEventsAndFestivals": "Kültürel etkinlikler ve festivaller",
    "localCommunicationTips": "Yerel halkla iletişim önerileri"
  },
  "localTips": {
    "localTransportationGuide": "Ulaşım rehberi",
    "emergencyContacts": "Acil durum numaraları",
    "currencyAndPayment": "Para birimi ve ödeme",
    "healthcareInfo": "Sağlık hizmetleri bilgisi",
    "communicationInfo": "İletişim ve internet kullanımı",
    "localCuisineAndFoodTips": "Yerel mutfak ve yemek önerileri",
    "safetyTips": "Güvenlik önerileri",
    "localLanguageAndCommunicationTips": "Yerel dil ve iletişim ipuçları"
  }
}`;

// Kullanıcı mesajı şablonu
const getUserPrompt = (
  destination: string,
  duration: string,
  groupType: string,
  budget: string,
  residenceCountry: string,
  citizenship: string
) => `ÖNEMLİ: Tüm yanıtlarınız kesinlikle Türkçe olmalıdır. İngilizce yanıt vermeyin.

Aşağıdaki seyahat planını oluştur ve şu kurallara uy:

1. Tüm metinler Türkçe olmalı
2. Para birimleri TL olmalı
3. Mesafe ve süre birimleri metrik sistemde olmalı
4. Her aktivite için aşağıdaki bilgiler olmalı:
   - Aktivite adı (placeName)
   - Detaylı açıklama (placeDetails)
   - Görsel URL (placeImageUrl)
   - Konum bilgisi (geoCoordinates)
   - Bilet/giriş ücreti (ticketPricing)
   - Ulaşım süresi (timeToTravel)
   - Önerilen ziyaret zamanı (time)
   - Tavsiyeler (tips) - En az 3 madde
   - Dikkat edilmesi gerekenler (warnings) - Varsa
   - Alternatif aktiviteler (alternatives) - Varsa

5. Her otel için aşağıdaki bilgiler olmalı:
   - Otel adı (hotelName)
   - Adres (hotelAddress)
   - Fiyat aralığı (price)
   - Görsel URL (hotelImageUrl)
   - Konum (geoCoordinates)
   - Puan (rating)
   - Açıklama (description)
   - En iyi ziyaret zamanı (bestTimeToVisit)
   - Öne çıkan özellikler (features) - En az 3 madde
   - Yakın çevre bilgisi (surroundings)

6. Her gün için aktiviteler mantıklı bir sırayla planlanmalı
7. Aktiviteler arası ulaşım süreleri ve dinlenme molaları hesaba katılmalı
8. Her aktivite için pratik tavsiyeler ve ipuçları eklenmeli
9. Yerel deneyimler ve kültürel öğeler vurgulanmalı
10. Bütçeye uygun alternatifler sunulmalı

11. Vize ve Pasaport Bilgileri (ZORUNLU):
    - Vize gerekliliği ve türü (visaRequirement)
    - Vize başvuru süreci detayları (visaApplicationProcess)
    - Gerekli belgeler listesi (requiredDocuments)
    - Vize ücreti (visaFee)
    - Vize başvuru süresi (visaProcessingTime)
    - Vize başvuru merkezi bilgileri (visaApplicationCenters)
    - Pasaport gereksinimleri (passportRequirements)
    - Pasaport geçerlilik süresi gereksinimleri (passportValidityRequirements)
    - Önemli notlar ve uyarılar (importantNotes)
    - Acil durumlar için iletişim bilgileri (emergencyContacts)

12. Kültürel Farklılıklar ve Öneriler (ZORUNLU):
    - Yaşanılan ülke ile hedef ülke arasındaki temel kültürel farklılıklar (culturalDifferences)
    - Günlük yaşam alışkanlıkları farklılıkları (lifestyleDifferences)
    - Yeme-içme kültürü farklılıkları (foodCultureDifferences)
    - Sosyal davranış normları farklılıkları (socialNormsDifferences)
    - Dini ve kültürel hassasiyetler (religiousAndCulturalSensitivities)
    - Yerel gelenekler ve görenekler (localTraditionsAndCustoms)
    - Önemli kültürel etkinlikler ve festivaller (culturalEventsAndFestivals)
    - Yerel halkla iletişim önerileri (localCommunicationTips)

13. Yerel Yaşam Önerileri (ZORUNLU):
    - Yerel ulaşım sistemini kullanma rehberi (localTransportationGuide)
    - Önemli acil durum numaraları (emergencyContacts)
    - Yerel para birimi ve ödeme yöntemleri (currencyAndPayment)
    - Sağlık hizmetleri bilgisi (healthcareInfo)
    - İletişim ve internet kullanımı (communicationInfo)
    - Yerel mutfak ve yemek önerileri (localCuisineAndFoodTips)
    - Güvenlik önerileri (safetyTips)
    - Yerel dil ve iletişim ipuçları (localLanguageAndCommunicationTips)

Lütfen bu seyahat planını JSON formatında oluştur:
Konum: ${destination}
Süre: ${duration} gün
Kişi: ${groupType}
Bütçe: ${budget}
Yaşadığı Ülke: ${residenceCountry}
Vatandaşlık: ${citizenship}

Yanıtın kesinlikle JSON olmalıdır ve aşağıdaki alanları içermelidir:
- destinationInfo (destinasyon hakkında genel bilgiler, MUTLAKA bestTimeToVisit alanı içermeli)
- tripSummary (seyahat özeti)
- hotelOptions (en az 3 otel önerisi)
- itinerary (günlük gezi planı)
- visaInfo (vize ve pasaport bilgileri)
- culturalDifferences (kültürel farklılıklar)
- localTips (yerel yaşam önerileri)
- bestTimeToVisit (destinasyon için en uygun ziyaret zamanı - ZORUNLU ALAN)

NOT: Tüm yanıtınız Türkçe olmalıdır. İngilizce yanıt vermeyin.
NOT: Vize, pasaport ve kültürel öneriler bölümleri zorunludur ve detaylı olmalıdır.
NOT: SADECE JSON döndür, ekstra metin veya açıklama ekleme.`;

// OpenAI API'ye istek gönderen fonksiyon
export const sendMessage = async (
  destination: string,
  duration: string,
  groupType: string,
  budget: string,
  residenceCountry: string,
  citizenship: string
) => {
  try {
    console.log("OpenAI API ile seyahat planı oluşturuluyor...");
    console.log(`Konum: ${destination}, Süre: ${duration}, Kişi: ${groupType}, Bütçe: ${budget}`);

    // API anahtarı kontrolü
    if (!apiKey) {
      console.error("OpenAI API anahtarı bulunamadı!");
      throw new Error("API anahtarı eksik. Lütfen .env dosyasını kontrol edin.");
    }

    // OpenAI API'ye istek gönder
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: getUserPrompt(destination, duration, groupType, budget, residenceCountry, citizenship),
        },
      ],
      response_format: { type: "json_object" },
    });

    // Yanıtı al
    const responseText = completion.choices[0]?.message?.content || "{}";
    console.log("OpenAI yanıtı alındı");

    // JSON olarak parse et
    try {
      const jsonResponse = JSON.parse(responseText);

      // Otel görselleri için Google Places API'yi kullan
      if (jsonResponse.hotelOptions && Array.isArray(jsonResponse.hotelOptions) && jsonResponse.hotelOptions.length > 0) {
        console.log('Otel görselleri getiriliyor...');
        try {
          // Bütçeye göre otel görselleri getir
          const updatedHotels = await HotelImageService.fetchImagesForHotels(
            jsonResponse.hotelOptions as Hotel[],
            destination,
            budget
          );

          // Güncellenmiş otel listesini kaydet
          jsonResponse.hotelOptions = updatedHotels;
          console.log(`${updatedHotels.length} otel için görsel güncellendi`);
        } catch (error) {
          console.error('Otel görselleri getirme hatası:', error);
          // Hata durumunda mevcut otel listesini koru
        }
      }

      return {
        text: responseText,
        json: jsonResponse,
      };
    } catch (parseError) {
      console.error("JSON parse hatası:", parseError);
      return {
        text: responseText,
        json: {},
      };
    }
  } catch (error) {
    console.error("OpenAI API hatası:", error);
    throw error;
  }
};

// Chat session nesnesi (eski Gemini API ile uyumluluk için)
export const chatSession = {
  sendMessage: async (prompt: string) => {
    try {
      console.log("Alınan prompt:", prompt);

      // Prompt'tan parametreleri çıkar - regex'i iyileştir
      const destination = prompt.match(/Konum:\s*(.*?)(?:\n|$)/)?.[1] || "";
      const duration = prompt.match(/Süre:\s*(\d+)/)?.[1] || "3";
      const groupType = prompt.match(/Kişi:\s*(.*?)(?:\n|$)/)?.[1] || "Çift";
      const budget = prompt.match(/Bütçe:\s*(.*?)(?:\n|$)/)?.[1] || "Ekonomik";
      const residenceCountry = prompt.match(/Yaşadığı Ülke:\s*(.*?)(?:\n|$)/)?.[1] || "Turkey";
      const citizenship = prompt.match(/Vatandaşlık:\s*(.*?)(?:\n|$)/)?.[1] || "Turkey";

      console.log("Çıkarılan parametreler:", {
        destination,
        duration,
        groupType,
        budget,
        residenceCountry,
        citizenship,
      });

      // Eğer destination boşsa, hata fırlat
      if (!destination) {
        throw new Error("Konum bilgisi bulunamadı. Lütfen geçerli bir konum girin.");
      }

      // OpenAI API'ye istek gönder
      const result = await sendMessage(destination, duration, groupType, budget, residenceCountry, citizenship);

      // Gemini API formatına uygun yanıt döndür
      return {
        response: {
          text: () => result.text,
          json: result.json,
        },
      };
    } catch (error) {
      console.error("OpenAI mesaj gönderme hatası:", error);
      throw error;
    }
  },
};

export default chatSession;
