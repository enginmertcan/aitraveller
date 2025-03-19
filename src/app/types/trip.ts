export interface TripDetails {
  id: string;
  destination: string;
  duration: number;
  groupType: string;
  budget: string;
  residenceCountry: string;
  citizenship: string;
  
  // Vize ve Pasaport Bilgileri
  visaRequirement: string;
  visaApplicationProcess: string;
  requiredDocuments: string[];
  visaFee: string;
  visaProcessingTime: string;
  visaApplicationCenters: string[];
  passportRequirements: string;
  passportValidityRequirements: string;
  importantNotes: string;
  emergencyContacts: string[];

  // Kültürel Farklılıklar ve Öneriler
  culturalDifferences: string;
  lifestyleDifferences: string;
  foodCultureDifferences: string;
  socialNormsDifferences: string;
  religiousAndCulturalSensitivities: string;
  localTraditionsAndCustoms: string;
  culturalEventsAndFestivals: string;
  localCommunicationTips: string;

  // Yerel Yaşam Önerileri
  localTransportationGuide: string;
  currencyAndPayment: string;
  healthcareInfo: string;
  communicationInfo: string;
  localCuisineAndFoodTips: string;
  safetyTips: string;
  localLanguageAndCommunicationTips: string;

  // Mevcut alanlar
  hotelOptions: HotelOption[];
  itinerary: DayPlan[];
}

export interface HotelOption {
  hotelName: string;
  hotelAddress: string;
  price: string;
  hotelImageUrl: string;
  geoCoordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  description: string;
  bestTimeToVisit: string;
  features: string[];
  surroundings: string;
}

export interface DayPlan {
  day: string;
  plan: Activity[];
}

export interface Activity {
  time: string;
  placeName: string;
  placeDetails: string;
  placeImageUrl: string;
  geoCoordinates: {
    latitude: number;
    longitude: number;
  };
  ticketPricing: string;
  timeToTravel: string;
  tips: string[];
  warnings?: string[];
  alternatives?: string[];
} 