export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Hotel {
  hotelName: string;
  hotelAddress: string;
  priceRange: string;
  hotelImageUrl: string;
  geoCoordinates: GeoCoordinates;
  rating: number;
  description: string;
}

export interface Activity {
  time: string;
  placeName: string;
  placeDetails: string;
  placeImageUrl: string;
  geoCoordinates: GeoCoordinates;
  cost?: string;
  ticketPricing?: string;
}

export interface DayPlan {
  day: string;
  plan: Activity[];
}

export interface TravelPlan {
  id: string;
  destination: string;
  duration: string;
  groupType: string;
  numberOfPeople: string;
  startDate: string;
  userId: string;
  bestTimeToVisit: string;
  hotelOptions?: Hotel[];
  itinerary?: DayPlan[] | string;
  budget?: string;
}
