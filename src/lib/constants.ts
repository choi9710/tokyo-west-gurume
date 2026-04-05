export interface Area {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Ward {
  id: string;
  name: string;
  areas: Area[];
}

export const WARDS: Ward[] = [
  {
    id: 'shinjuku',
    name: '新宿区',
    areas: [
      { id: 'shinjuku',     name: '新宿',    lat: 35.6896, lng: 139.7006 },
      { id: 'shinokubo',    name: '新大久保', lat: 35.7009, lng: 139.7004 },
      { id: 'takadanobaba', name: '高田馬場', lat: 35.7127, lng: 139.7036 },
      { id: 'kagurazaka',   name: '神楽坂',  lat: 35.7021, lng: 139.7445 },
    ],
  },
  {
    id: 'toshima',
    name: '豊島区',
    areas: [
      { id: 'ikebukuro', name: '池袋', lat: 35.7295, lng: 139.7109 },
      { id: 'otsuka',    name: '大塚', lat: 35.7318, lng: 139.7285 },
      { id: 'sugamo',    name: '巣鴨', lat: 35.7336, lng: 139.7394 },
    ],
  },
  {
    id: 'nakano',
    name: '中野区',
    areas: [
      { id: 'nakano',      name: '中野',   lat: 35.7074, lng: 139.6645 },
      { id: 'higashinakano', name: '東中野', lat: 35.7121, lng: 139.6680 },
    ],
  },
  {
    id: 'suginami',
    name: '杉並区',
    areas: [
      { id: 'koenji',       name: '高円寺', lat: 35.7053, lng: 139.6496 },
      { id: 'asagaya',      name: '阿佐ヶ谷', lat: 35.7042, lng: 139.6355 },
      { id: 'ogikubo',      name: '荻窪',   lat: 35.7038, lng: 139.6199 },
      { id: 'nishiogikubo', name: '西荻窪', lat: 35.7031, lng: 139.5993 },
    ],
  },
  {
    id: 'nerima',
    name: '練馬区',
    areas: [
      { id: 'nerima',          name: '練馬',     lat: 35.7357, lng: 139.6517 },
      { id: 'shakujikoen',     name: '石神井公園', lat: 35.7369, lng: 139.6214 },
      { id: 'oizumigakuen',    name: '大泉学園',  lat: 35.7393, lng: 139.5971 },
      { id: 'hikarigaoka',     name: '光が丘',   lat: 35.7606, lng: 139.6189 },
    ],
  },
  {
    id: 'musashino',
    name: '武蔵野市・三鷹市',
    areas: [
      { id: 'kichijoji', name: '吉祥寺', lat: 35.7028, lng: 139.5798 },
      { id: 'mitaka',    name: '三鷹',   lat: 35.6836, lng: 139.5603 },
    ],
  },
  {
    id: 'itabashi',
    name: '板橋区',
    areas: [
      { id: 'itabashi',       name: '板橋',   lat: 35.7506, lng: 139.7087 },
      { id: 'narimasu',       name: '成増',   lat: 35.7680, lng: 139.6391 },
      { id: 'shimurosakaue',  name: '志村坂上', lat: 35.7604, lng: 139.6729 },
    ],
  },
];

// Flat list for hooks that iterate over areas
export const AREAS: Area[] = WARDS.flatMap((w) => w.areas);

export const CATEGORIES = [
  '韓国料理',
  '中華料理',
  '洋食',
  '和食',
  'ラーメン',
  'カフェ',
  '居酒屋',
  'イタリアン',
  '定食',
  'うどん・そば',
  'アジア料理',
  'スイーツ・ケーキ',
  'ベーカリー',
] as const;

export type Category = typeof CATEGORIES[number];

// locationBias rectangle covering Shinjuku/Toshima/Nakano/Suginami/Nerima/Itabashi/Musashino/Mitaka
export const LOCATION_BIAS = {
  rectangle: {
    low:  { latitude: 35.670, longitude: 139.550 },
    high: { latitude: 35.780, longitude: 139.750 },
  },
};

export const TEXT_SEARCH_FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.priceLevel,places.regularOpeningHours.openNow';

export const PLACE_DETAILS_FIELD_MASK =
  'id,displayName,formattedAddress,location,rating,userRatingCount,photos,regularOpeningHours,nationalPhoneNumber,websiteUri,googleMapsUri,reviews,priceLevel';
