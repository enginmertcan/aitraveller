export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Activity {
  time?: string;
  name?: string;
  placeName?: string;
  title?: string;
  description?: string;
  placeDetails?: string;
  imageUrl?: string;
  placeImageUrl?: string;
  geoCoordinates?: GeoCoordinates;
  timeEstimate?: string;
  timeToSpend?: string;
  timeToTravel?: string;
  ticketPricing?: string;
  cost?: string;
}

export interface DayPlan {
  day: string;
  theme?: string;
  activities?: Activity[];
  plan?: Activity[];
}

export interface Hotel {
  hotelName: string;
  hotelAddress: string;
  priceRange: string;
  imageUrl?: string;
  hotelImageUrl?: string;
  geoCoordinates?: GeoCoordinates;
  rating?: number;
  description: string;
  bestTimeToVisit?: string;
}

export interface LocalTips {
  localTransportationGuide?: string;
  emergencyContacts?: string | { [key: string]: string };
  currencyAndPayment?: string;
  healthcareInfo?: string;
  communicationInfo?: string;
  localCuisineAndFoodTips?: string;
  safetyTips?: string;
  localLanguageAndCommunicationTips?: string;
  [key: string]: any; // Allow for additional fields
}

export interface VisaInfo {
  visaRequirement?: string;
  visaApplicationProcess?: string;
  requiredDocuments?: string[] | string;
  visaFee?: string;
  visaProcessingTime?: string;
  visaApplicationCenters?: string[];
  passportRequirements?: string;
  passportValidityRequirements?: string;
  importantNotes?: string;
  emergencyContacts?: { [key: string]: string };
  [key: string]: any; // Allow for additional fields
}

export interface TripPhoto {
  imageUrl: string;
  imageData?: string;
  location: string;
  uploadedAt: string;
  [key: string]: any; // Allow for additional fields
}

export interface TripComment {
  id: string; // Yorum ID'si
  travelPlanId: string; // Hangi seyahat planına ait olduğu
  userId: string; // Yorumu yapan kullanıcı ID'si
  userName: string; // Kullanıcı adı (görüntüleme için)
  userPhotoUrl?: string; // Kullanıcı profil fotoğrafı (opsiyonel)
  content: string; // Yorum içeriği
  photoUrl?: string; // Yorum fotoğrafı URL'i (opsiyonel)
  photoData?: string; // Yorum fotoğrafı base64 verisi (opsiyonel)
  photoLocation?: string; // Fotoğrafın çekildiği konum (opsiyonel)
  rating?: number; // Değerlendirme puanı (1-5 arası, opsiyonel)
  createdAt: string; // Oluşturulma zamanı
  updatedAt?: string; // Güncellenme zamanı (opsiyonel)
  [key: string]: any; // Allow for additional fields
}

export interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  duration: string;
  days: number;
  groupType: string;
  numberOfPeople: string;
  budget: string;
  isDomestic: boolean;
  residenceCountry: string;
  citizenship: string;
  country?: string;
  userId: string;
  isRecommended?: boolean;
  likes?: number;
  likedBy?: string[];
  itinerary: { [key: string]: DayPlan | Activity[] } | string;
  hotelOptions: Hotel[] | string;
  bestTimeToVisit?: string;
  // Cultural Differences
  culturalDifferences?: string | any;
  lifestyleDifferences?: string;
  foodCultureDifferences?: string;
  socialNormsDifferences?: string;
  // Visa and Travel Information
  visaInfo?: string | VisaInfo;
  visaRequirements?: string;
  visaApplicationProcess?: string;
  visaFees?: string;
  travelDocumentChecklist?: string | string[];
  // Local Life Recommendations
  localTips?: string | LocalTips;
  localTransportationGuide?: string;
  emergencyContacts?: string | string[];
  currencyAndPayment?: string;
  healthcareInfo?: string;
  communicationInfo?: string;
  localCuisineAndFoodTips?: string;
  safetyTips?: string;
  localLanguageAndCommunicationTips?: string;
  // Trip Summary
  tripSummary?: string | { [key: string]: string };
  // Destination Info
  destinationInfo?: string | { [key: string]: string };
  // Trip Photos
  tripPhotos?: TripPhoto[] | string;
  // Timestamps
  createdAt?: string | any;
  updatedAt?: string | any;
}
