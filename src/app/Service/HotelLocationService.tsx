"use client";

/**
 * Service for fetching hotel location data from Google Places API
 */
export const HotelLocationService = {
  /**
   * Get hotel location data from Google Places API
   * @param hotelName Hotel name
   * @param city City name
   * @returns Promise with location data
   */
  async getHotelLocation(hotelName: string, city: string): Promise<{
    name: string;
    address: string;
    location: { lat: number; lng: number };
    rating: number;
  } | null> {
    try {
      console.log(`Getting hotel location for: ${hotelName} in ${city}`);

      // Create search query
      const query = `${hotelName} hotel ${city}`;

      console.log('Sending Places Details API request...');

      // Use the new API route
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error('Places Details API request failed:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('Places Details API response:', data);

      if (!data.location) {
        console.log('No location data found for hotel');
        return null;
      }

      return {
        name: data.name,
        address: data.address,
        location: data.location,
        rating: data.rating
      };
    } catch (error) {
      console.error('Error getting hotel location:', error);
      return null;
    }
  }
};

export default HotelLocationService;
