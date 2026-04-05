type SortBy = 'rating' | 'reviewCount' | 'distance';
type ViewMode = 'list' | 'map';

interface ResultsControlsProps {
  resultCount: number;
  openNowOnly: boolean;
  onOpenNowChange: (v: boolean) => void;
  sortBy: SortBy;
  onSortChange: (v: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

export function ResultsControls({
  resultCount,
  openNowOnly,
  onOpenNowChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ResultsControlsProps) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{resultCount}件</span>
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
  );
}
