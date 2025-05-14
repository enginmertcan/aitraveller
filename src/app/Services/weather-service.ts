const API_KEY = process.env.NEXT_PUBLIC_VISUAL_CROSSING_API_KEY;

export interface WeatherData {
  date: string; // DD/MM/YYYY formatı (API çağrıları için)
  dateISO?: string; // ISO formatı (YYYY-MM-DD)
  dateTurkish?: string; // Türkçe format (30 Nisan 2025 Pazartesi)
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  uvIndex: number;
}

// Tarihi DD/MM/YYYY formatına dönüştüren yardımcı fonksiyon
function formatDateToDDMMYYYY(date: Date): string {
  // UTC kullanarak tarih formatla - gün kayması sorununu önlemek için
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// Yedek hava durumu verisi
const today = new Date();
const fallbackWeatherData: WeatherData = {
  date: formatDateToDDMMYYYY(today), // DD/MM/YYYY formatında
  dateISO: today.toISOString().split('T')[0], // ISO formatı (YYYY-MM-DD)
  dateTurkish: today.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  }), // Türkçe format (30 Nisan 2025 Pazartesi)
  temperature: 20,
  feelsLike: 20,
  description: "Hava durumu verisi alınamadı",
  icon: "01d",
  humidity: 50,
  windSpeed: 5,
  precipitationProbability: 0,
  uvIndex: 5,
};

// Konum adını formatlama fonksiyonu
function formatLocation(location: string): string {
  // Türkçe karakterleri koru ama özel karakterleri temizle
  return location
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, "")
    .replace(/\s+/g, " ");
}

// Hava durumu ikonlarını eşleştirme
function getWeatherIcon(icon: string): string {
  const iconMap: { [key: string]: string } = {
    "clear-day": "01d",
    "clear-night": "01n",
    "partly-cloudy-day": "02d",
    "partly-cloudy-night": "02n",
    cloudy: "03d",
    rain: "10d",
    snow: "13d",
    sleet: "13d",
    wind: "50d",
    fog: "50d",
    "thunder-rain": "11d",
    "thunder-showers-day": "11d",
    "thunder-showers-night": "11n",
  };

  return iconMap[icon] || "01d";
}

// İngilizce hava durumu açıklamalarını Türkçe'ye çevirme
function translateWeatherDescription(description: string): string {
  if (!description) return "Parçalı Bulutlu";

  console.log(`Translating weather description: "${description}"`);
  const translationMap: { [key: string]: string } = {
    // Temel hava durumları
    "Clear": "Açık",
    "Sunny": "Güneşli",
    "Partly cloudy": "Parçalı Bulutlu",
    "Partially cloudy": "Parçalı Bulutlu",
    "Cloudy": "Bulutlu",
    "Overcast": "Kapalı",
    "Rain": "Yağmurlu",
    "Light rain": "Hafif Yağmurlu",
    "Heavy rain": "Şiddetli Yağmur",
    "Drizzle": "Çisenti",
    "Showers": "Sağanak Yağış",
    "Thunderstorm": "Gök Gürültülü Fırtına",
    "Snow": "Karlı",
    "Light snow": "Hafif Kar",
    "Heavy snow": "Yoğun Kar",
    "Sleet": "Karla Karışık Yağmur",
    "Freezing rain": "Dondurucu Yağmur",
    "Fog": "Sisli",
    "Mist": "Puslu",
    "Haze": "Puslu",
    "Windy": "Rüzgarlı",
    "Dust": "Tozlu",
    "Smoke": "Dumanlı",
    "Scattered clouds": "Dağınık Bulutlu",
    "Broken clouds": "Parçalı Bulutlu",
    "Few clouds": "Az Bulutlu",
    "Moderate rain": "Orta Şiddetli Yağmur",
    "Shower rain": "Sağanak Yağış",
    "Thunderstorm with light rain": "Hafif Yağmurlu Gök Gürültülü Fırtına",
    "Thunderstorm with rain": "Yağmurlu Gök Gürültülü Fırtına",
    "Thunderstorm with heavy rain": "Şiddetli Yağmurlu Gök Gürültülü Fırtına",
    "Light intensity shower rain": "Hafif Sağanak Yağış",
    "Heavy intensity shower rain": "Şiddetli Sağanak Yağış",
    "Ragged shower rain": "Düzensiz Sağanak Yağış",
    "Light intensity drizzle": "Hafif Çisenti",
    "Drizzle rain": "Çisentili Yağmur",
    "Heavy intensity drizzle": "Yoğun Çisenti",
    "Shower drizzle": "Sağanak Çisenti",

    // Kombinasyonlar
    "Rain, Partially Cloudy": "Yağmurlu, Parçalı Bulutlu",
    "Rain, Overcast": "Yağmurlu, Kapalı",
    "Clear, Partially Cloudy": "Açık, Parçalı Bulutlu",
    "Partially cloudy, Fog": "Parçalı Bulutlu, Sisli",
    "Thunderstorm, Rain": "Gök Gürültülü Fırtına, Yağmurlu",
    "Snow, Partially Cloudy": "Karlı, Parçalı Bulutlu",
    "Snow, Overcast": "Karlı, Kapalı",
    "Rain, Fog": "Yağmurlu, Sisli",
    "Clear, Fog": "Açık, Sisli",
  };

  // Tam eşleşme kontrolü (büyük/küçük harf duyarsız)
  const lowerDescription = description.toLowerCase();

  for (const [eng, tr] of Object.entries(translationMap)) {
    if (eng.toLowerCase() === lowerDescription) {
      console.log(`Tam eşleşme bulundu: "${description}" -> "${tr}"`);
      return tr;
    }
  }

  // Kısmi eşleşme kontrolü (büyük/küçük harf duyarsız)
  for (const [eng, tr] of Object.entries(translationMap)) {
    if (lowerDescription.includes(eng.toLowerCase())) {
      const translated = description.replace(new RegExp(eng, 'i'), tr);
      console.log(`Kısmi eşleşme bulundu: "${description}" -> "${translated}"`);
      return translated;
    }
  }

  // Çeviri bulunamazsa orijinal açıklamayı döndür
  console.log(`Çevirisi bulunamayan hava durumu: "${description}"`);
  return description;
}

// Veri doğrulama fonksiyonu
function validateWeatherData(data: any): boolean {
  return (
    data &&
    Array.isArray(data.days) &&
    data.days.length > 0 &&
    typeof data.days[0].temp === "number" &&
    typeof data.days[0].feelslike === "number"
  );
}

export async function getWeatherForecast(location: string, date: Date): Promise<WeatherData[]> {
  try {
    if (!location || !date) {
      console.warn("Invalid location or date provided");
      return [fallbackWeatherData];
    }

    const formattedLocation = formatLocation(location);
    if (!formattedLocation) {
      console.warn("Location formatting failed");
      return [fallbackWeatherData];
    }

    // Tarih geçerli mi kontrol et
    if (isNaN(date.getTime())) {
      console.warn("Invalid date provided:", date);
      date = new Date(); // Geçersiz tarih ise bugünün tarihini kullan
    }

    console.log(`Fetching weather for ${formattedLocation} for date: ${date.toISOString().split("T")[0]}`);

    const formattedDate = date.toISOString().split("T")[0];

    // API çağrısını yap
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(formattedLocation)}/${formattedDate}?unitGroup=metric&include=days&key=${API_KEY}&contentType=json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // HTTP durumunu kontrol et
    if (!response.ok) {
      console.warn(`Weather API returned status ${response.status}`);
      return [fallbackWeatherData];
    }

    const data = await response.json();

    // Veri doğrulaması yap
    if (!validateWeatherData(data)) {
      console.warn("Invalid weather data structure received");
      return [fallbackWeatherData];
    }

    // Veriyi dönüştür ve tarihi formatla - Mobil uygulama ile uyumlu olması için DD/MM/YYYY formatını kullan
    return data.days.map((day: any) => {
      // API'den gelen datetime değerini Date objesine çevir (YYYY-MM-DD formatında)
      // UTC kullanarak tarih oluştur - gün kayması sorununu önlemek için
      const [year, month, dayNum] = day.datetime.split('-').map(Number);
      const dayDate = new Date(Date.UTC(year, month - 1, dayNum));

      // Tarihi DD/MM/YYYY formatına dönüştür (API çağrıları için)
      const formattedDate = formatDateToDDMMYYYY(dayDate);

      // Tarihi ISO formatına dönüştür (YYYY-MM-DD)
      const isoDate = day.datetime;

      // Tarihi Türkçe formatına dönüştür (görüntüleme için)
      const turkishDate = dayDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      });

      console.log(`Formatting weather date: ${day.datetime} -> ${formattedDate} (DD/MM/YYYY), ${turkishDate} (Türkçe)`);

      return {
        date: formattedDate, // DD/MM/YYYY formatı (API çağrıları için)
        dateISO: isoDate, // ISO formatı (YYYY-MM-DD)
        dateTurkish: turkishDate, // Türkçe format (30 Nisan 2025 Pazartesi)
        temperature: day.temp ?? 20,
        feelsLike: day.feelslike ?? day.temp ?? 20,
        description: day.conditions ? translateWeatherDescription(day.conditions) : "Parçalı Bulutlu",
        icon: getWeatherIcon(day.icon),
        humidity: day.humidity ?? 50,
        windSpeed: day.windspeed ?? 5,
        precipitationProbability: day.precipprob ?? 0,
        uvIndex: day.uvindex ?? 5,
      };
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return [fallbackWeatherData];
  }
}
