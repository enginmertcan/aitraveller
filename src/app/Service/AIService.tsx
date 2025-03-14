const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `Aşağıdaki seyahat planını oluştur ve şu kurallara uy:

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

11. Kültürel Farklılıklar ve Öneriler:
    - Yaşanılan ülke ile hedef ülke arasındaki temel kültürel farklılıklar (culturalDifferences)
    - Günlük yaşam alışkanlıkları farklılıkları (lifestyleDifferences)
    - Yeme-içme kültürü farklılıkları (foodCultureDifferences)
    - Sosyal davranış normları farklılıkları (socialNormsDifferences)

12. Vize ve Seyahat Bilgileri:
    - Vatandaşlık durumuna göre vize gereklilikleri (visaRequirements)
    - Vize başvuru süreci ve gerekli belgeler (visaApplicationProcess)
    - Tahmini vize ücreti (visaFees)
    - Vize başvurusu için öneriler (visaTips)
    - Pasaport ve seyahat belgeleri kontrol listesi (travelDocumentChecklist)

13. Yerel Yaşam Önerileri:
    - Yerel ulaşım sistemini kullanma rehberi (localTransportationGuide)
    - Önemli acil durum numaraları (emergencyContacts)
    - Yerel para birimi ve ödeme yöntemleri (currencyAndPayment)
    - Sağlık hizmetleri bilgisi (healthcareInfo)
    - İletişim ve internet kullanımı (communicationInfo)

Lütfen bu seyahat planını JSON formatında oluştur:
Konum: {destination}
Süre: {duration} gün
Kişi: {groupType}
Bütçe: {budget}
Yaşadığı Ülke: {residenceCountry}
Vatandaşlık: {citizenship}`
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n{\n  "hotelOptions": [\n    {\n      "hotelName": "The D Las Vegas",\n      "hotelAddress": "301 Fremont Street, Las Vegas, NV 89101",\n      "price": "1500 TL - 3000 TL gece",\n      "hotelImageUrl": "https://www.the-d.com/media/images/hotel-exterior.jpg",\n      "geoCoordinates": {\n        "latitude": 36.1699,\n        "longitude": -115.1426\n      },\n      "rating": 4.0,\n      "description": "Fremont Street\'in kalbinde yer alan, kumarhane, restoranlar ve canlı eğlence sunan uygun fiyatlı bir otel."\n    },\n    {\n      "hotelName": "Golden Nugget Las Vegas",\n      "hotelAddress": "129 E Fremont St, Las Vegas, NV 89101",\n      "price": "2100 TL - 4500 TL gece",\n      "hotelImageUrl": "https://www.goldennugget.com/las-vegas/media/images/header-images/golden-nugget-las-vegas-hotel-casino-exterior-view.jpg",\n      "geoCoordinates": {\n        "latitude": 36.1696,\n        "longitude": -115.1419\n      },\n      "rating": 4.5,\n      "description": "Lüks olanaklarıyla bilinen tarihi bir otel; kumarhane, havuz ve köpekbalığı akvaryumu bulunmaktadır."\n    },\n    {\n      "hotelName": "Circus Circus Hotel & Casino",\n      "hotelAddress": "2880 S Las Vegas Blvd, Las Vegas, NV 89109",\n      "price": "1200 TL - 2400 TL gece",\n      "hotelImageUrl": "https://www.circuscircus.com/media/images/hotel-exterior.jpg",\n      "geoCoordinates": {\n        "latitude": 36.1034,\n        "longitude": -115.1723\n      },\n      "rating": 3.5,\n      "description": "Sirke temalı, lunapark ve kumarhane sunan uygun fiyatlı bir otel."\n    }\n  ],\n  "itinerary": [\n    {\n      "day": "1. Gün",\n      "plan": [\n        {\n          "time": "09:00 - 12:00",\n          "placeName": "Fremont Street Deneyimi",\n          "placeDetails": "Canlı eğlence, sokak sanatçıları ve ışık şovlarıyla dolu yaya alanını keşfedin.",\n          "placeImageUrl": "https://www.vegasexperience.com/sites/default/files/images/freemont-street-experience-las-vegas-header-image.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1699,\n            "longitude": -115.1426\n          },\n          "ticketPricing": "Ücretsiz",\n          "timeToTravel": "1 saat"\n        },\n        {\n          "time": "12:00 - 14:00",\n          "placeName": "Heart Attack Grill",\n          "placeDetails": "Hastane temalı, yüksek kalorili hamburgerler sunan benzersiz bir restoranda yemek deneyiminin tadını çıkarın.",\n          "placeImageUrl": "https://www.heartattackgrill.com/images/heartattackgrill_vegas_logo.png",\n          "geoCoordinates": {\n            "latitude": 36.1684,\n            "longitude": -115.1434\n          },\n          "ticketPricing": "300 TL - 600 TL",\n          "timeToTravel": "15 dakika"\n        },\n        {\n          "time": "14:00 - 17:00",\n          "placeName": "Neon Müzesi",\n          "placeDetails": "Las Vegas tarihinden kalma eski neon tabelaları sergileyen bir müzeyi ziyaret edin.",\n          "placeImageUrl": "https://www.neonmuseum.org/wp-content/uploads/2021/09/Neon-Museum-Front-Sign-09-18-21.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1707,\n            "longitude": -115.1505\n          },\n          "ticketPricing": "600 TL",\n          "timeToTravel": "30 dakika"\n        },\n        {\n          "time": "17:00 - 19:00",\n          "placeName": "The LINQ Promenade",\n          "placeDetails": "Çelik çark ve eğlence olanaklarıyla açık hava alışveriş ve yemek bölgesinde gezintiye çıkın.",\n          "placeImageUrl": "https://www.caesars.com/content/dam/caesars-entertainment/linq/images/hotel-experience-images/linq-promenade-at-night-1.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1014,\n            "longitude": -115.1709\n          },\n          "ticketPricing": "Ücretsiz",\n          "timeToTravel": "15 dakika"\n        },\n        {\n          "time": "19:00 - 21:00",\n          "placeName": "Büfede Akşam Yemeği",\n          "placeDetails": "Las Vegas\'taki birçok uygun fiyatlı büfeden birinde ucuz ve doyurucu bir akşam yemeğinin tadını çıkarın.",\n          "placeImageUrl": "https://www.caesars.com/content/dam/caesars-entertainment/paris-las-vegas/images/hotel-experience-images/paris-buffet-header.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1005,\n            "longitude": -115.1717\n          },\n          "ticketPricing": "600 TL - 900 TL",\n          "timeToTravel": "15 dakika"\n        }\n      ]\n    },\n    {\n      "day": "2. Gün",\n      "plan": [\n        {\n          "time": "09:00 - 12:00",\n          "placeName": "Bellagio Konservatuarı ve Botanik Bahçesi",\n          "placeDetails": "Konservatuvardaki güzel çiçek sergilerini ve mevsimsel temaları hayranlıkla izleyin.",\n          "placeImageUrl": "https://www.bellagio.com/content/dam/bellagio/images/experience/conservatory-botanical-garden/conservatory-botanical-garden-11.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1138,\n            "longitude": -115.1738\n          },\n          "ticketPricing": "Ücretsiz",\n          "timeToTravel": "30 dakika"\n        },\n        {\n          "time": "12:00 - 14:00",\n          "placeName": "Bellagio Çeşmeleri",\n          "placeDetails": "Müzikle senkronize edilmiş su ve ışık şovunu izleyin.",\n          "placeImageUrl": "https://www.bellagio.com/content/dam/bellagio/images/experience/fountains-of-bellagio/fountains-of-bellagio-10.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1141,\n            "longitude": -115.1736\n          },\n          "ticketPricing": "Ücretsiz",\n          "timeToTravel": "1 saat"\n        },\n        {\n          "time": "14:00 - 17:00",\n          "placeName": "The Strip",\n          "placeDetails": "Las Vegas Strip\'i yürüyerek veya otobüsle gezerek ikonik otelleri ve kumarhaneleri keşfedin.",\n          "placeImageUrl": "https://www.visitlasvegas.com/sites/default/files/styles/landscape_lg/public/images/hero-images/strip-las-vegas-night.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1053,\n            "longitude": -115.1705\n          },\n          "ticketPricing": "Ücretsiz",\n          "timeToTravel": "2 saat"\n        },\n        {\n          "time": "17:00 - 19:00",\n          "placeName": "High Roller Gözlem Çarkı",\n          "placeDetails": "Dünyanın en yüksek gözlem çarkından Las Vegas\'ın panoramik manzarasının tadını çıkarın.",\n          "placeImageUrl": "https://www.caesars.com/content/dam/caesars-entertainment/linq/images/hotel-experience-images/high-roller-at-night.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1014,\n            "longitude": -115.1709\n          },\n          "ticketPricing": "900 TL - 1200 TL",\n          "timeToTravel": "1 saat"\n        },\n        {\n          "time": "19:00 - 21:00",\n          "placeName": "Yiyecek Mahallesi\'nde Akşam Yemeği",\n          "placeDetails": "Bir kumarhanedeki yiyecek mahallerinde uygun fiyatlı ve çeşitli yemek seçenekleri bulun.",\n          "placeImageUrl": "https://www.caesars.com/content/dam/caesars-entertainment/linq/images/hotel-experience-images/linq-promenade-food-court-1.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1014,\n            "longitude": -115.1709\n          },\n          "ticketPricing": "300 TL - 450 TL",\n          "timeToTravel": "15 dakika"\n        }\n      ]\n    },\n    {\n      "day": "3. Gün",\n      "plan": [\n        {\n          "time": "09:00 - 12:00",\n          "placeName": "Red Rock Kanyonu Ulusal Koruma Alanı",\n          "placeDetails": "Yürüyüş parkurları, kaya oluşumları ve panoramik manzaralarıyla doğal çöl manzaralarını keşfedin.",\n          "placeImageUrl": "https://www.nps.gov/redr/planyourvisit/images/red-rock-canyon-hiking-trails-jpg-red-rock-canyon-national-conservation-area-nps-gov.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1943,\n            "longitude": -115.2427\n          },\n          "ticketPricing": "450 TL",\n          "timeToTravel": "1 saat"\n        },\n        {\n          "time": "12:00 - 14:00",\n          "placeName": "Yerel Lokantada Öğle Yemeği",\n          "placeDetails": "Strip yakınlarında uygun fiyatlı bir lokantada klasik Amerikan öğle yemeğinin tadını çıkarın.",\n          "placeImageUrl": "https://www.visitlasvegas.com/sites/default/files/styles/landscape_lg/public/images/hero-images/strip-las-vegas-night.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1053,\n            "longitude": -115.1705\n          },\n          "ticketPricing": "300 TL - 450 TL",\n          "timeToTravel": "30 dakika"\n        },\n        {\n          "time": "14:00 - 17:00",\n          "placeName": "Hoover Barajı",\n          "placeDetails": "İkonik Hoover Barajı\'nı görmek ve tarihi ve mühendislik harikaları hakkında bilgi edinmek için bir günlük geziye çıkın.",\n          "placeImageUrl": "https://www.nps.gov/hove/planyourvisit/images/hooverdam-0517.jpg",\n          "geoCoordinates": {\n            "latitude": 36.0001,\n            "longitude": -114.9774\n          },\n          "ticketPricing": "900 TL",\n          "timeToTravel": "1.5 saat"\n        },\n        {\n          "time": "17:00 - 19:00",\n          "placeName": "Gündelik Restoranda Akşam Yemeği",\n          "placeDetails": "Las Vegas\'taki son akşam yemeğiniz için otelinize yakın rahat ve uygun fiyatlı bir restoran bulun.",\n          "placeImageUrl": "https://www.visitlasvegas.com/sites/default/files/styles/landscape_lg/public/images/hero-images/strip-las-vegas-night.jpg",\n          "geoCoordinates": {\n            "latitude": 36.1053,\n            "longitude": -115.1705\n          },\n          "ticketPricing": "450 TL - 750 TL",\n          "timeToTravel": "15 dakika"\n        }\n      ]\n    }\n  ]\n}\n```\n\n**Açıklama:**\n\n* **hotelOptions**: Las Vegas\'taki uygun fiyatlı otellerin listesini isim, adres, fiyat aralığı, resim URL\'i, koordinatlar, puan ve kısa açıklama gibi bilgilerle sunar.\n* **itinerary**: Las Vegas\'ı bütçe dostu bir şekilde ziyaret eden çiftler için 3 günlük gezi planını içerir.\n    * **day**: Her gün aktivitelerle birlikte planlanmıştır.\n    * **plan**: Her plan şunları içeren bir dizi aktivite sunar:\n        * **time**: Aktivite için önerilen zaman dilimi.\n        * **placeName**: Gezilecek yer veya lokasyonun adı.\n        * **placeDetails**: Yerin kısa açıklaması.\n        * **placeImageUrl**: Yerin resminin URL\'i.\n        * **geoCoordinates**: Lokasyonun enlem ve boylam koordinatları.\n        * **ticketPricing**: Bilet veya giriş ücretlerinin yaklaşık maliyeti.\n        * **timeToTravel**: Lokasyona ulaşım için tahmini süre.\n\n**Ucuz Bütçe İçin Önemli Noktalar:**\n\n* **Konaklama**: Las Vegas\'ın merkezinde veya Strip\'te ama en pahalı otellerden uzakta, uygun fiyatlı otelleri seçin.\n* **Yemek**: Yiyecek mahalleri, büfeler (daha doyurucu bir deneyim için) ve yerel lokantaları uygun fiyatlı yemekler için kullanın.\n* **Aktiviteler**: Fremont Street Deneyimi, The LINQ Promenade, Bellagio Konservatuarı ve Botanik Bahçesi ve The Strip\'te yürüyüş gibi ücretsiz cazibe merkezlerine öncelik verin.\n* **Ulaşım**: Seyahatlerin çoğu için toplu taşıma veya yürüyüşü tercih edin.\n* **İndirimli Biletleri Değerlendirin**: Groupon veya Travelzoo gibi siteler genellikle cazibe merkezleri ve gösteriler için indirimler sunar.\n* **Önceden Planlama**: Para tasarrufu için gerekli biletleri veya rezervasyonları önceden yapın.\n\n**Not:** Fiyatlar ve müsaitlik değişebilir, bu nedenle en güncel bilgiler için her zaman çevrimiçi kontrol etmek en iyisidir.',
        },
      ],
    },
  ],
});
