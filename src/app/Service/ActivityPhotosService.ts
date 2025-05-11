/**
 * ActivityPhotosService.ts
 *
 * This service handles fetching and displaying activity photos.
 * It provides methods to fetch activity photos from external APIs and display them in the UI.
 */

// API key for Google Places API
const GOOGLE_PLACES_API_KEY = "AIzaSyCuywyLDcnyRENGnIHnit-ym2rhQBnXMJw";

// Maximum number of photos to fetch
const MAX_PHOTOS = 15;

// Kategorilere göre yedek fotoğraflar
const DUMMY_PHOTOS: { [key: string]: string[] } = {
  // Genel turistik yerler
  "tourist": [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000"
  ],
  // Müzeler
  "museum": [
    "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=1000",
    "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=1000",
    "https://images.unsplash.com/photo-1605348863000-02e6ddb0df73?q=80&w=1000"
  ],
  // Parklar ve bahçeler
  "park": [
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=1000",
    "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000",
    "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=1000"
  ],
  // Plajlar
  "beach": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000",
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?q=80&w=1000"
  ],
  // Restoranlar
  "restaurant": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000"
  ],
  // Alışveriş
  "shopping": [
    "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=1000",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1000"
  ],
  // Tarihi yerler
  "historical": [
    "https://images.unsplash.com/photo-1519923834699-ef0b7cde4712?q=80&w=1000",
    "https://images.unsplash.com/photo-1560704429-05c3d0c78d8c?q=80&w=1000",
    "https://images.unsplash.com/photo-1548019979-e49b7cd4215b?q=80&w=1000"
  ],
  // Doğa
  "nature": [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1000",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000"
  ],
  // Varsayılan
  "default": [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000",
    "https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?q=80&w=1000",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000"
  ]
};

/**
 * Activity Photo interface
 */
export interface ActivityPhoto {
  imageUrl: string;
  location: string;
  description: string;
  imageData?: string;
}

/**
 * Activity Photos Service
 * Provides methods to fetch and display activity photos
 */
const ActivityPhotosService = {
  /**
   * Loads activity photos from Google Places API
   * @param activityName - The name of the activity or place
   * @param city - The city where the activity is located
   * @returns Promise<ActivityPhoto[]> - Array of photo objects
   */
  async loadActivityPhotos(activityName: string, city: string): Promise<ActivityPhoto[]> {
    try {
      console.log(`Fetching activity photos for: ${activityName} in ${city}`);

      // Önce önbellekte var mı kontrol et
      const cacheKey = `photos_${activityName}_${city}`;
      const cachedPhotos = sessionStorage.getItem(cacheKey);

      if (cachedPhotos) {
        console.log(`Using cached photos for ${activityName}`);
        return JSON.parse(cachedPhotos);
      }

      // Step 1: Find the place using Places API Text Search
      const searchQuery = `${activityName} ${city}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        searchQuery
      )}&key=${GOOGLE_PLACES_API_KEY}`;

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.results || searchData.results.length === 0) {
        console.warn(`No results found for activity: ${activityName}`);
        const dummyPhotos = this.getDummyPhotos(activityName, city);
        return dummyPhotos.map((url, index) => ({
          imageUrl: url,
          location: activityName,
          description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
        }));
      }

      // Get the first result (most relevant)
      const placeId = searchData.results[0].place_id;

      // Step 2: Get place details including photos
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,name,formatted_address&key=${GOOGLE_PLACES_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (!detailsData.result || !detailsData.result.photos || detailsData.result.photos.length === 0) {
        console.warn(`No photos found for activity: ${activityName}`);
        const dummyPhotos = this.getDummyPhotos(activityName, city);
        return dummyPhotos.map((url, index) => ({
          imageUrl: url,
          location: activityName,
          description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
        }));
      }

      // Get all available photos (up to MAX_PHOTOS)
      const photoReferences = detailsData.result.photos
        .slice(0, MAX_PHOTOS)
        .map((photo: { photo_reference: string }) => photo.photo_reference);

      // Step 3: Get photo URLs for each reference
      const photoUrls = photoReferences.map(
        (reference: string) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${reference}&key=${GOOGLE_PLACES_API_KEY}`
      );

      // Create photo objects
      const photos = photoUrls.map((url: string, index: number) => ({
        imageUrl: url,
        location: detailsData.result.name || activityName,
        description: `${detailsData.result.name || activityName} - ${detailsData.result.formatted_address || city} - Fotoğraf ${index + 1}`
      }));

      console.log(`Found ${photos.length} photos for activity: ${activityName}`);

      // Önbelleğe kaydet
      sessionStorage.setItem(cacheKey, JSON.stringify(photos));

      return photos;
    } catch (error) {
      console.error("Error fetching activity photos:", error);
      // Hata durumunda yedek fotoğrafları kullan
      const dummyPhotos = this.getDummyPhotos(activityName, city);
      return dummyPhotos.map((url, index) => ({
        imageUrl: url,
        location: activityName,
        description: `${activityName} - ${city} - Fotoğraf ${index + 1}`
      }));
    }
  },

  /**
   * Gets dummy photos for an activity based on its category
   * @param activityName - The name of the activity
   * @param city - The city where the activity is located
   * @returns string[] - Array of photo URLs
   */
  getDummyPhotos(activityName: string, city: string): string[] {
    // Aktivite adına göre kategori belirle
    const activityLower = activityName.toLowerCase();

    if (activityLower.includes("müze") || activityLower.includes("museum") || activityLower.includes("gallery")) {
      return DUMMY_PHOTOS.museum;
    } else if (activityLower.includes("park") || activityLower.includes("bahçe") || activityLower.includes("garden")) {
      return DUMMY_PHOTOS.park;
    } else if (activityLower.includes("plaj") || activityLower.includes("beach") || activityLower.includes("deniz") || activityLower.includes("sea")) {
      return DUMMY_PHOTOS.beach;
    } else if (activityLower.includes("restoran") || activityLower.includes("restaurant") || activityLower.includes("cafe") || activityLower.includes("kafe")) {
      return DUMMY_PHOTOS.restaurant;
    } else if (activityLower.includes("alışveriş") || activityLower.includes("shopping") || activityLower.includes("market") || activityLower.includes("çarşı")) {
      return DUMMY_PHOTOS.shopping;
    } else if (activityLower.includes("tarihi") || activityLower.includes("historical") || activityLower.includes("ancient") || activityLower.includes("antik")) {
      return DUMMY_PHOTOS.historical;
    } else if (activityLower.includes("doğa") || activityLower.includes("nature") || activityLower.includes("dağ") || activityLower.includes("mountain")) {
      return DUMMY_PHOTOS.nature;
    } else if (activityLower.includes("turist") || activityLower.includes("tourist") || activityLower.includes("landmark")) {
      return DUMMY_PHOTOS.tourist;
    } else {
      return DUMMY_PHOTOS.default;
    }
  }
};

export default ActivityPhotosService;
