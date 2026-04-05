import type { LatLng } from '../../lib/types';
import { getApiKey } from '../../lib/api';

interface DetailMapProps {
  location: LatLng;
  name: string;
}

export function DetailMap({ location, name }: DetailMapProps) {
  const { latitude: lat, longitude: lng } = location;
  const staticMapUrl =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=16` +
    `&size=600x300` +
    `&scale=2` +
    `&markers=color:0xf97316|${lat},${lng}` +
    `&key=${getApiKey()}`;

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-48 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
      aria-label={`${name}の地図を開く`}
    >
      <img
        src={staticMapUrl}
        alt={`${name}の地図`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </a>
  );
}
