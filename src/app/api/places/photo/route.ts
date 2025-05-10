import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URL'den parametreleri al
    const searchParams = request.nextUrl.searchParams;
    const photoReference = searchParams.get('photoReference');
    const maxwidth = searchParams.get('maxwidth') || 800;

    console.log('Fotoğraf isteği alındı:', photoReference);

    if (!photoReference) {
      console.error('Fotoğraf referansı eksik');
      return NextResponse.json(
        { error: 'Photo reference is required' },
        { status: 400 }
      );
    }

    // Client-side environment variable'ları server-side'da kullanırken NEXT_PUBLIC_ prefix'i olmadan kullanmalıyız
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.error('Google Places API anahtarı bulunamadı');
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

    console.log('API anahtarı bulundu, fotoğraf URL oluşturuluyor');

    // Google Places Photo API URL'i
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${apiKey}`;

    console.log('Fotoğraf URL oluşturuldu, yönlendiriliyor');

    // Doğrudan fotoğraf URL'ini döndür
    // Burada Response.redirect kullanarak doğrudan fotoğrafa yönlendirme yapıyoruz
    // Bu, CORS sorunlarını önler ve doğrudan fotoğrafı gösterir
    return NextResponse.redirect(photoUrl);
  } catch (error) {
    console.error('Error in Places API photo:', error);
    return NextResponse.json(
      { error: 'Failed to get photo URL' },
      { status: 500 }
    );
  }
}
