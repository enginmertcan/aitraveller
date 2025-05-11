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

    // Daha fazla sonuç için sorguyu genişlet
    // Orijinal sorguyu kullan
    const originalQuery = query;

    // Sorguyu daha spesifik hale getir - turistik yer, görülecek yer, landmark ekle
    const enhancedQuery = `${query} tourist attraction landmark`;

    // Türkçe karakterleri normalize et
    const normalizedQuery = query
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ğ/g, 'G')
      .replace(/Ü/g, 'U')
      .replace(/Ş/g, 'S')
      .replace(/İ/g, 'I')
      .replace(/Ö/g, 'O')
      .replace(/Ç/g, 'C');

    // Özel durumlar için ek sorgular
    const specialQueries = [];
    if (query.toLowerCase().includes('pamukkale') || query.toLowerCase().includes('travertenleri')) {
      specialQueries.push('Pamukkale Travertines Turkey');
      specialQueries.push('Pamukkale Hierapolis Turkey');
    } else if (query.toLowerCase().includes('efes') || query.toLowerCase().includes('ephesus')) {
      specialQueries.push('Ephesus Ancient City Turkey');
      specialQueries.push('Efes Antik Kenti Turkey');
    } else if (query.toLowerCase().includes('kapadokya') || query.toLowerCase().includes('cappadocia')) {
      specialQueries.push('Cappadocia Turkey');
      specialQueries.push('Kapadokya Balloon Turkey');
    }

    // Tüm sorgular için URL'ler oluştur
    const searchUrls = [
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(originalQuery)}&key=${apiKey}`,
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(enhancedQuery)}&key=${apiKey}`,
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(normalizedQuery)}&key=${apiKey}`
    ];

    // Özel sorgular için URL'ler ekle
    specialQueries.forEach(specialQuery => {
      searchUrls.push(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(specialQuery)}&key=${apiKey}`);
    });

    // Paralel olarak tüm aramaları yap
    const searchResponses = await Promise.all(searchUrls.map(url => fetch(url)));
    const searchDataResults = await Promise.all(searchResponses.map(response => response.json()));

    // Tüm sonuçları birleştir
    let allResults: any[] = [];

    searchDataResults.forEach(searchData => {
      if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
        allResults = [...allResults, ...searchData.results];
      }
    });

    // Sonuç yoksa hata döndür
    if (allResults.length === 0) {
      return NextResponse.json(
        { error: 'No places found for any query' },
        { status: 404 }
      );
    }

    // Tekrarlanan sonuçları kaldır (place_id'ye göre)
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.place_id, item])).values()
    );

    // Sonuçları puanlarına göre sırala (rating değeri)
    const sortedResults = [...uniqueResults].sort((a, b) => {
      // Önce rating değeri olan sonuçları tercih et
      if (a.rating && !b.rating) return -1;
      if (!a.rating && b.rating) return 1;

      // İkisinin de rating değeri varsa, yüksek olanı tercih et
      if (a.rating && b.rating) return b.rating - a.rating;

      // İkisinin de rating değeri yoksa, fotoğrafı olanı tercih et
      if (a.photos && !b.photos) return -1;
      if (!a.photos && b.photos) return 1;

      return 0;
    });

    // Daha fazla fotoğraf için birden fazla place_id kullan
    const MAX_PLACES_TO_CHECK = 8; // En iyi 8 yerin fotoğraflarını kontrol et
    const placeIds = sortedResults.slice(0, MAX_PLACES_TO_CHECK).map(result => result.place_id);

    console.log(`${placeIds.length} farklı yer için fotoğraf aranıyor...`);

    // Tüm yerler için paralel olarak detay bilgilerini al
    const detailsUrls = placeIds.map(placeId =>
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,name&key=${apiKey}`
    );

    const detailsResponses = await Promise.all(detailsUrls.map(url => fetch(url)));
    const detailsDataResults = await Promise.all(detailsResponses.map(response => response.json()));

    // Tüm fotoğrafları topla
    const allPhotos: any[] = [];

    // Önce arama sonuçlarındaki fotoğrafları ekle
    sortedResults.forEach(result => {
      if (result.photos && result.photos.length > 0) {
        allPhotos.push(...result.photos);
      }
    });

    // Sonra detay sonuçlarındaki fotoğrafları ekle
    detailsDataResults.forEach(detailsData => {
      if (detailsData.status === 'OK' && detailsData.result && detailsData.result.photos) {
        allPhotos.push(...detailsData.result.photos);
      }
    });

    // Fotoğraf bulunamadıysa, boş array döndür
    if (allPhotos.length === 0) {
      console.log('Hiçbir fotoğraf bulunamadı');
      return NextResponse.json({ photoReferences: [] });
    }

    // Maksimum fotoğraf sayısını artır
    const MAX_PHOTOS = 50; // Daha fazla fotoğraf göster

    // Fotoğrafları kalitelerine göre sırala (width ve height değerlerine göre)
    const sortedPhotos = allPhotos.sort((a: any, b: any) => {
      const aSize = a.width * a.height;
      const bSize = b.width * b.height;
      return bSize - aSize; // Büyükten küçüğe sırala
    });

    // En kaliteli fotoğrafları seç ve null değerleri filtrele
    let photoReferences = sortedPhotos
      .slice(0, MAX_PHOTOS)
      .map((photo: any) => photo.photo_reference)
      .filter((ref: string) => ref !== null && ref !== undefined && ref !== '');

    // Tekrarlanan fotoğraf referanslarını kaldır
    photoReferences = Array.from(new Set(photoReferences));

    // Maksimum fotoğraf sayısına göre kes
    photoReferences = photoReferences.slice(0, MAX_PHOTOS);

    console.log(`Toplam ${photoReferences.length} adet fotoğraf referansı bulundu`);
    return NextResponse.json({ photoReferences });
  } catch (error) {
    console.error('Error in Places Photos API:', error);
    return NextResponse.json(
      { error: 'Failed to get place photos' },
      { status: 500 }
    );
  }
}
