import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    // Client-side environment variable'ları server-side'da kullanırken NEXT_PUBLIC_ prefix'i olmadan kullanmalıyız
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }
    
    // Önce mekan araması yap
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      return NextResponse.json(
        { error: 'No places found', status: searchData.status },
        { status: 404 }
      );
    }
    
    // İlk sonucun place_id'sini al
    const placeId = searchData.results[0].place_id;
    
    // Place Details API ile daha fazla fotoğraf al
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK' || !detailsData.result || !detailsData.result.photos) {
      // Eğer detaylar alınamazsa, arama sonuçlarındaki fotoğrafları kullan
      const photoReferences = searchData.results[0].photos
        ? searchData.results[0].photos.map((photo: any) => photo.photo_reference)
        : [];
      
      return NextResponse.json({ photoReferences });
    }
    
    // Tüm fotoğraf referanslarını al
    const photoReferences = detailsData.result.photos.map((photo: any) => photo.photo_reference);
    
    return NextResponse.json({ photoReferences });
  } catch (error) {
    console.error('Error in Places Photos API:', error);
    return NextResponse.json(
      { error: 'Failed to get place photos' },
      { status: 500 }
    );
  }
}
