type SortBy = 'rating' | 'reviewCount' | 'distance';
type ViewMode = 'list' | 'map';
type MinRating = 0 | 3.5 | 4 | 4.5;

const PRICE_OPTIONS = [
  { value: 'PRICE_LEVEL_INEXPENSIVE', label: '¥' },
  { value: 'PRICE_LEVEL_MODERATE',    label: '¥¥' },
  { value: 'PRICE_LEVEL_EXPENSIVE',   label: '¥¥¥' },
  { value: 'PRICE_LEVEL_VERY_EXPENSIVE', label: '¥¥¥¥' },
] as const;

const RATING_OPTIONS: { value: MinRating; label: string }[] = [
  { value: 0,   label: 'すべて' },
  { value: 3.5, label: '3.5+' },
  { value: 4,   label: '4.0+' },
  { value: 4.5, label: '4.5+' },
];

interface ResultsControlsProps {
  resultCount: number;
  openNowOnly: boolean;
  onOpenNowChange: (v: boolean) => void;
  priceFilter: string[];
  onPriceFilterChange: (v: string[]) => void;
  minRating: MinRating;
  onMinRatingChange: (v: MinRating) => void;
  sortBy: SortBy;
  onSortChange: (v: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

export function ResultsControls({
  resultCount,
  openNowOnly,
  onOpenNowChange,
  priceFilter,
  onPriceFilterChange,
  minRating,
  onMinRatingChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ResultsControlsProps) {
  const togglePrice = (value: string) => {
    onPriceFilterChange(
      priceFilter.includes(value)
        ? priceFilter.filter((v) => v !== value)
        : [...priceFilter, value]
    );
  };

  return (
    <div className="space-y-2">
      {/* Row 1: count + open-now + price filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 mr-1">{resultCount}件</span>

        <button
          onClick={() => onOpenNowChange(!openNowOnly)}
          aria-pressed={openNowOnly}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            openNowOnly
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${openNowOnly ? 'bg-green-500' : 'bg-gray-400'}`} />
          営業中のみ
        </button>

        <div className="flex gap-1">
          {PRICE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => togglePrice(value)}
              aria-pressed={priceFilter.includes(value)}
              className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                priceFilter.includes(value)
                  ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: rating filter + sort + view toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {RATING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onMinRatingChange(value)}
              aria-pressed={minRating === value}
              className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                minRating === value
                  ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="rating">評価順</option>
            <option value="reviewCount">レビュー数順</option>
            <option value="distance">距離順</option>
          </select>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="リスト表示"
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              ☰
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              aria-pressed={viewMode === 'map'}
              aria-label="地図表示"
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'map' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🗺
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
