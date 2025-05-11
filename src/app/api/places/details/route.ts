import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to get place details from Google Places API
 * This route is used to get accurate location data for hotels
 */
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

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
    const placeId = searchData.results[0].place_id;
    
    // Get place details including geometry (location)
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address,rating&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      return NextResponse.json(
        { error: 'Failed to get place details', status: detailsData.status },
        { status: 500 }
      );
    }

    // Extract the relevant information
    const placeDetails = {
      name: detailsData.result.name,
      address: detailsData.result.formatted_address,
      location: detailsData.result.geometry?.location,
      rating: detailsData.result.rating
    };

    return NextResponse.json(placeDetails);
  } catch (error) {
    console.error('Error in Places API details:', error);
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    );
  }
}
