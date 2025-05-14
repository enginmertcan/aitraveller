import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to get place details from Google Places API
 * This route is used to get details for places, including photos
 */
export async function POST(request: NextRequest) {
  try {
    // İstek parametrelerini al
    const requestData = await request.json();
    const { placeId, fields = 'photos', query } = requestData;

    // API anahtarını al
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

    // Eğer placeId verilmişse, doğrudan detayları getir
    if (placeId) {
      // Place Details API URL
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      return NextResponse.json(detailsData);
    }
    // Eğer query verilmişse, önce arama yap, sonra detayları getir
    else if (query) {
      // First, search for the place to get the place_id
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
        return NextResponse.json(
          { error: 'No places found', status: searchData.status },
          { status: 404 }
        );
      }

      // Get the first result (most relevant)
      const foundPlaceId = searchData.results[0].place_id;

      // Get place details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${foundPlaceId}&fields=${fields}&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      return NextResponse.json(detailsData);
    }

    return NextResponse.json(
      { error: 'Either placeId or query parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Places API details:', error);
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    );
  }
}
