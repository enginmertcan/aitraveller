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
}

export interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  days: number;
  duration?: string;
  budget: number;
  groupType?: string;
  numberOfPeople?: string;
  bestTimeToVisit?: string;
  itinerary: {
    [key: string]: DayPlan | Activity[];
  };
  hotelOptions?: Hotel[];
}
