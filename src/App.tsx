import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AREAS, CATEGORIES, type Area, type Category } from './lib/constants';
import { useDebounce } from './hooks/useDebounce';
import { useTextSearch } from './hooks/useTextSearch';
import { usePlaceDetails } from './hooks/usePlaceDetails';
import { useFavorites } from './hooks/useFavorites';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { AreaSelector } from './components/search/AreaSelector';
import { CategoryFilter } from './components/search/CategoryFilter';
import { ResultsList } from './components/results/ResultsList';
import { ResultsControls } from './components/results/ResultsControls';
import { ResultsMap } from './components/results/ResultsMap';
import { DetailModal } from './components/detail/DetailModal';
import { ApiKeySetup } from './components/ApiKeySetup';
import { ApiKeyModal } from './components/ApiKeyModal';
import type { Place } from './lib/types';

type SortBy = 'rating' | 'reviewCount' | 'distance';
type ViewMode = 'list' | 'map';
type MinRating = 0 | 3.5 | 4 | 4.5;

function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('gmaps_api_key') ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
  );
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get('q') ?? ''
  );
  const [selectedAreas, setSelectedAreas] = useState<Area[]>(() => {
    const ids = new URLSearchParams(window.location.search).get('areas')?.split(',').filter(Boolean) ?? [];
    return AREAS.filter((a) => ids.includes(a.id));
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    return (CATEGORIES as readonly string[]).includes(cat ?? '') ? (cat as Category) : null;
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<MinRating>(0);
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();

  // Sync search state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAreas.length > 0) params.set('areas', selectedAreas.map((a) => a.id).join(','));
    if (selectedCategory) params.set('category', selectedCategory);
    else if (query.trim()) params.set('q', query.trim());
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [selectedAreas, selectedCategory, query]);

  if (!apiKey) {
    return <ApiKeySetup onSave={setApiKey} />;
  }

  const debouncedAreas = useDebounce(selectedAreas, 300);
  const debouncedCategory = useDebounce(selectedCategory, 300);

  // Category and free-text are mutually exclusive; free-text requires min 2 chars
  const activeQuery = debouncedCategory ? '' : (query.trim().length >= 2 ? query : '');

  const { results, isLoading, error, failedAreas } = useTextSearch(
    activeQuery,
    debouncedAreas,
    debouncedCategory
  );

  const { detail, isLoading: detailLoading, error: detailError } = usePlaceDetails(selectedPlace);

  const hasQuery = !!selectedCategory || query.trim().length >= 2;
  const needsArea = hasQuery && selectedAreas.length === 0;
  const hasSearched = hasQuery && selectedAreas.length > 0;

  // Filter
  const filtered = results
    .filter((p) => !openNowOnly || p.regularOpeningHours?.openNow === true)
    .filter((p) => priceFilter.length === 0 || (p.priceLevel != null && priceFilter.includes(p.priceLevel)))
    .filter((p) => minRating === 0 || (p.rating ?? 0) >= minRating);

  // Sort
  const displayResults = [...filtered].sort((a, b) => {
    if (sortBy === 'reviewCount') return (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0);
    if (sortBy === 'distance' && userLocation) {
      const da = Math.hypot(
        a.location.latitude - userLocation.lat,
        a.location.longitude - userLocation.lng
      );
      const db = Math.hypot(
        b.location.latitude - userLocation.lat,
        b.location.longitude - userLocation.lng
      );
      return da - db;
    }
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim()) setSelectedCategory(null); // mutually exclusive
  };

  const handleCategoryChange = (cat: Category | null) => {
    setSelectedCategory(cat);
    if (cat) setQuery(''); // mutually exclusive
  };

  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort);
    if (newSort === 'distance' && !userLocation) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setSortBy('rating')
      );
    }
  };

  // Find Place object from id (searched results + favorites)
  const handleSelectPlace = (id: string) => {
    const place =
      displayResults.find((p) => p.id === id) ??
      favorites.find((p) => p.id === id) ??
      null;
    setSelectedPlace(place);
  };

  const showControls = hasSearched && !isLoading && !error && results.length > 0;

  // Favorites view: show favorites list regardless of search state
  const listResults = showFavorites ? favorites : displayResults;
  const listHasSearched = showFavorites ? true : hasSearched;
  const listIsLoading = showFavorites ? false : isLoading;
  const listError = showFavorites ? null : error;
  const listFailedAreas = showFavorites ? [] : failedAreas;

  return (
    <APIProvider apiKey={apiKey}>
    <div className="min-h-screen bg-gray-50">
      <Header onChangeApiKey={() => setShowApiKeyModal(true)} />

      <main className="max-w-5xl mx-auto px-4 py-4 space-y-3">
        <SearchBar value={query} onSearch={handleQueryChange} />
        <AreaSelector selected={selectedAreas} onChange={setSelectedAreas} />
        <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />

        {/* Favorites toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowFavorites((v) => !v)}
            aria-pressed={showFavorites}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              showFavorites
                ? 'bg-red-50 border-red-300 text-red-600 font-medium'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            ❤️ お気に入り{favorites.length > 0 && ` (${favorites.length}件)`}
          </button>
        </div>

        {!showFavorites && showControls && (
          <ResultsControls
            resultCount={displayResults.length}
            openNowOnly={openNowOnly}
            onOpenNowChange={setOpenNowOnly}
            priceFilter={priceFilter}
            onPriceFilterChange={setPriceFilter}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {!showFavorites && viewMode === 'map' && showControls ? (
          <ResultsMap results={displayResults} onSelectPlace={handleSelectPlace} />
        ) : (
          <ResultsList
            results={listResults}
            isLoading={listIsLoading}
            error={listError}
            failedAreas={listFailedAreas}
            hasSearched={listHasSearched}
            needsArea={showFavorites ? false : needsArea}
            onSelectPlace={handleSelectPlace}
            isFavorite={isFavorite}
            onFavoriteToggle={toggleFavorite}
          />
        )}
      </main>

      {selectedPlace && (
        <DetailModal
          detail={detail}
          isLoading={detailLoading}
          error={detailError}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={(key) => { setApiKey(key); setShowApiKeyModal(false); }}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}
    </div>
    </APIProvider>
  );
}

export default App;
