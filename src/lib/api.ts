import type { Place, PlaceDetail } from './types';
import { LOCATION_BIAS, TEXT_SEARCH_FIELD_MASK, PLACE_DETAILS_FIELD_MASK } from './constants';

const BASE_URL = 'https://places.googleapis.com/v1';

export function getApiKey(): string {
  return localStorage.getItem('gmaps_api_key') ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

export async function textSearch(
  query: string,
  center?: { lat: number; lng: number },
  radiusMeters = 800
): Promise<Place[]> {
  let location: object;
  if (center) {
    const latDelta = radiusMeters / 111000;
    const lngDelta = radiusMeters / (111000 * Math.cos((center.lat * Math.PI) / 180));
    location = {
      locationRestriction: {
        rectangle: {
          low:  { latitude: center.lat - latDelta, longitude: center.lng - lngDelta },
          high: { latitude: center.lat + latDelta, longitude: center.lng + lngDelta },
        },
      },
    };
  } else {
    location = { locationBias: LOCATION_BIAS };
  }

  const res = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': TEXT_SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      ...location,
      languageCode: 'ja',
    }),
  });

  if (!res.ok) {
    throw new Error(`Text Search failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.places ?? []) as Place[];
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetail> {
  const res = await fetch(`${BASE_URL}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': PLACE_DETAILS_FIELD_MASK,
    },
  });

  if (!res.ok) {
    throw new Error(`Place Details failed: ${res.status}`);
  }

  return res.json() as Promise<PlaceDetail>;
}

export function getPhotoUrl(photoName: string, maxWidthPx: 400 | 800 = 400): string {
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${getApiKey()}`;
}
