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
      // Ayrıca diğer sonuçlardaki fotoğrafları da ekle (maksimum 25 fotoğraf)
      const MAX_PHOTOS = 25;
      let photoReferences: string[] = [];

      // Tüm sonuçlardan fotoğrafları topla
      const allPhotos: any[] = [];

      // İlk sonuçtaki fotoğrafları ekle
      if (searchData.results[0].photos) {
        allPhotos.push(...searchData.results[0].photos);
      }

      // Diğer sonuçlardaki fotoğrafları da ekle
      let resultIndex = 1;
      while (resultIndex < searchData.results.length) {
        if (searchData.results[resultIndex].photos) {
          allPhotos.push(...searchData.results[resultIndex].photos);
        }
        resultIndex++;
      }

      // Fotoğrafları kalitelerine göre sırala (width ve height değerlerine göre)
      const sortedPhotos = allPhotos.sort((a: any, b: any) => {
        const aSize = a.width * a.height;
        const bSize = b.width * b.height;
        return bSize - aSize; // Büyükten küçüğe sırala
      });

      // En kaliteli fotoğrafları seç ve null değerleri filtrele
      photoReferences = sortedPhotos
        .slice(0, MAX_PHOTOS)
        .map((photo: any) => photo.photo_reference)
        .filter((ref: string) => ref !== null && ref !== undefined && ref !== '');

      // Tekrarlanan fotoğraf referanslarını kaldır
      photoReferences = Array.from(new Set(photoReferences));

      // Maksimum 25 fotoğraf döndür
      photoReferences = photoReferences.slice(0, MAX_PHOTOS);

      console.log(`Arama sonuçlarından ${photoReferences.length} adet fotoğraf referansı bulundu`);
      return NextResponse.json({ photoReferences });
    }

    // Tüm fotoğraf referanslarını al (maksimum 25 fotoğraf)
    const MAX_PHOTOS = 25; // Daha fazla fotoğraf göster

    // Fotoğrafları kalitelerine göre sırala (width ve height değerlerine göre)
    const sortedPhotos = detailsData.result.photos.sort((a: any, b: any) => {
      const aSize = a.width * a.height;
      const bSize = b.width * b.height;
      return bSize - aSize; // Büyükten küçüğe sırala
    });

    // Fotoğraf referanslarını al ve tekrarları kaldır
    let photoReferences = sortedPhotos
      .slice(0, MAX_PHOTOS) // Maksimum 25 fotoğraf al
      .map((photo: any) => photo.photo_reference)
      .filter((ref: string) => ref !== null && ref !== undefined && ref !== '');

    // Tekrarlanan fotoğraf referanslarını kaldır
    photoReferences = Array.from(new Set(photoReferences));

    console.log(`${photoReferences.length} adet fotoğraf referansı bulundu`);
    return NextResponse.json({ photoReferences });
  } catch (error) {
    console.error('Error in Places Photos API:', error);
    return NextResponse.json(
      { error: 'Failed to get place photos' },
      { status: 500 }
    );
  }
}
