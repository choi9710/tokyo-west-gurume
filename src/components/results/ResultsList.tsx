import { useState, useEffect } from 'react';
import type { Place } from '../../lib/types';
import { RestaurantCard } from './RestaurantCard';
import { ResultsSkeleton } from './ResultsSkeleton';

const PAGE_SIZE = 5;

interface ResultsListProps {
  results: Place[];
  isLoading: boolean;
  error: string | null;
  failedAreas: string[];
  hasSearched: boolean;
  needsArea?: boolean;
  onSelectPlace: (id: string) => void;
  isFavorite?: (id: string) => boolean;
  onFavoriteToggle?: (place: Place) => void;
}

export function ResultsList({
  results,
  isLoading,
  error,
  failedAreas,
  hasSearched,
  needsArea,
  onSelectPlace,
  isFavorite,
  onFavoriteToggle,
}: ResultsListProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Reset pagination when result set changes
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [results]);

  if (isLoading) return <ResultsSkeleton />;

  if (needsArea) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📍</p>
        <p className="font-medium">地域を選択してから検索してください</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium">該当するお店が見つかりませんでした</p>
        <p className="text-sm mt-1">キーワードや地域を変えて検索してみてください</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🍜</p>
        <p className="font-medium">地域・カテゴリを選ぶか、お店名で検索してください</p>
      </div>
    );
  }

  return (
    <div>
      {failedAreas.length > 0 && (
        <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
          {failedAreas.join('、')} の結果を取得できませんでした
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.slice(0, visible).map((place) => (
          <RestaurantCard
            key={place.id}
            place={place}
            onClick={onSelectPlace}
            isFavorite={isFavorite?.(place.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
      {visible < results.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 py-2 text-sm font-medium text-orange-600 border border-orange-300 rounded-full hover:bg-orange-50 transition-colors"
          >
            もっと見る ({results.length - visible} 件)
          </button>
        </div>
      )}
    </div>
  );
}
