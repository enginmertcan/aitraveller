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
  userId: string;
  itinerary: { [key: string]: DayPlan | Activity[] };
  hotelOptions: Hotel[];
  bestTimeToVisit?: string;
  // Cultural Differences
  culturalDifferences?: string;
  lifestyleDifferences?: string;
  foodCultureDifferences?: string;
  socialNormsDifferences?: string;
  // Visa and Travel Information
  visaRequirements?: string;
  visaApplicationProcess?: string;
  visaFees?: string;
  travelDocumentChecklist?: string | string[];
  // Local Life Recommendations
  localTransportationGuide?: string;
  emergencyContacts?: string | string[];
  currencyAndPayment?: string;
  healthcareInfo?: string;
  communicationInfo?: string;
}
