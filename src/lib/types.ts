export interface DisplayName {
  text: string;
  languageCode: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: { displayName: string; uri: string; photoUri: string }[];
}

export interface OpeningHours {
  openNow: boolean;
  weekdayDescriptions: string[];
}

export interface Review {
  name: string;
  rating: number;
  text: { text: string; languageCode: string };
  relativePublishTimeDescription: string;
  authorAttribution: { displayName: string; uri: string; photoUri: string };
}

export type PriceLevel =
  | 'PRICE_LEVEL_UNSPECIFIED'
  | 'PRICE_LEVEL_FREE'
  | 'PRICE_LEVEL_INEXPENSIVE'
  | 'PRICE_LEVEL_MODERATE'
  | 'PRICE_LEVEL_EXPENSIVE'
  | 'PRICE_LEVEL_VERY_EXPENSIVE';

export interface Place {
  id: string;
  displayName: DisplayName;
  formattedAddress: string;
  location: LatLng;
  rating?: number;
  userRatingCount?: number;
  photos?: PlacePhoto[];
  priceLevel?: PriceLevel;
}

export interface PlaceDetail extends Place {
  regularOpeningHours?: OpeningHours;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  reviews?: Review[];
}
