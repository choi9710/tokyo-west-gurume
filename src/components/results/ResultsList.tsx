import type { Place } from '../../lib/types';
import { RestaurantCard } from './RestaurantCard';
import { ResultsSkeleton } from './ResultsSkeleton';

interface ResultsListProps {
  results: Place[];
  isLoading: boolean;
  error: string | null;
  failedAreas: string[];
  hasSearched: boolean;
  onSelectPlace: (id: string) => void;
}

export function ResultsList({
  results,
  isLoading,
  error,
  failedAreas,
  hasSearched,
  onSelectPlace,
}: ResultsListProps) {
  if (isLoading) return <ResultsSkeleton />;

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
        {results.map((place) => (
          <RestaurantCard key={place.id} place={place} onClick={onSelectPlace} />
        ))}
      </div>
    </div>
  );
}
