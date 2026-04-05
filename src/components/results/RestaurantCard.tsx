import type { Place } from '../../lib/types';
import { getPhotoUrl } from '../../lib/api';

interface RestaurantCardProps {
  place: Place;
  onClick: (id: string) => void;
}

const PRICE_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_FREE: '無料',
  PRICE_LEVEL_INEXPENSIVE: '¥',
  PRICE_LEVEL_MODERATE: '¥¥',
  PRICE_LEVEL_EXPENSIVE: '¥¥¥',
  PRICE_LEVEL_VERY_EXPENSIVE: '¥¥¥¥',
};

export function RestaurantCard({ place, onClick }: RestaurantCardProps) {
  // Food photos tend to be closer to square (1:1); pick the most square photo
  const bestPhoto = place.photos?.reduce((best, photo) => {
    const ratio = (p: typeof photo) => Math.abs(1 - p.widthPx / p.heightPx);
    return ratio(photo) < ratio(best) ? photo : best;
  });
  const photoUrl = bestPhoto ? getPhotoUrl(bestPhoto.name, 400) : null;

  return (
    <button
      onClick={() => onClick(place.id)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
    >
      <div className="h-40 bg-gray-100 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${place.displayName.text} の写真`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">🍽️</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
          {place.displayName.text}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{place.formattedAddress}</p>
        <div className="flex items-center gap-2">
          {place.rating != null && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600">
              ⭐ {place.rating.toFixed(1)}
              {place.userRatingCount != null && (
                <span className="text-gray-400 font-normal">({place.userRatingCount})</span>
              )}
            </span>
          )}
          {place.priceLevel && PRICE_SYMBOLS[place.priceLevel] && (
            <span className="text-xs text-gray-500">{PRICE_SYMBOLS[place.priceLevel]}</span>
          )}
        </div>
      </div>
    </button>
  );
}
