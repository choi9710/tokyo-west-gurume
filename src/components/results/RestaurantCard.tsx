import type { Place } from '../../lib/types';
import { getPhotoUrl } from '../../lib/api';

interface RestaurantCardProps {
  place: Place;
  onClick: (id: string) => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (place: Place) => void;
}

const PRICE_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_FREE: '無料',
  PRICE_LEVEL_INEXPENSIVE: '¥',
  PRICE_LEVEL_MODERATE: '¥¥',
  PRICE_LEVEL_EXPENSIVE: '¥¥¥',
  PRICE_LEVEL_VERY_EXPENSIVE: '¥¥¥¥',
};

// Extract just the hours part from weekdayDescriptions entry (e.g. "月曜日: 11:00~22:00" → "11:00~22:00")
function getTodayHours(weekdayDescriptions?: string[]): string | null {
  if (!weekdayDescriptions?.length) return null;
  // Use Tokyo time (JST = UTC+9)
  const jsDay = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCDay();
  const idx = jsDay === 0 ? 6 : jsDay - 1; // weekdayDescriptions[0]=Monday, [6]=Sunday
  const desc = weekdayDescriptions[idx];
  if (!desc) return null;
  const sep = desc.indexOf(': ');
  return sep >= 0 ? desc.slice(sep + 2) : desc;
}

export function RestaurantCard({ place, onClick, isFavorite, onFavoriteToggle }: RestaurantCardProps) {
  // Food photos tend to be closer to square (1:1); pick the most square photo
  const bestPhoto = place.photos?.reduce((best, photo) => {
    const ratio = (p: typeof photo) => Math.abs(1 - p.widthPx / p.heightPx);
    return ratio(photo) < ratio(best) ? photo : best;
  });
  const photoUrl = bestPhoto ? getPhotoUrl(bestPhoto.name, 400) : null;

  const openNow = place.regularOpeningHours?.openNow;
  const todayHours = getTodayHours(place.regularOpeningHours?.weekdayDescriptions);

  return (
    <button
      onClick={() => onClick(place.id)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
    >
      <div className="relative h-40 bg-gray-100 overflow-hidden">
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
        {onFavoriteToggle && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavoriteToggle(place); }}
            aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow transition-colors text-base"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
          {place.displayName.text}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{place.formattedAddress}</p>
        <div className="flex items-center gap-2 flex-wrap">
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
          {openNow != null && (
            <span className={`text-xs font-medium ${openNow ? 'text-green-600' : 'text-red-400'}`}>
              {openNow ? '営業中' : '営業時間外'}
            </span>
          )}
        </div>
        {todayHours && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{todayHours}</p>
        )}
      </div>
    </button>
  );
}
