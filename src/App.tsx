import { useState } from 'react';
import type { Area, Category } from './lib/constants';
import { useDebounce } from './hooks/useDebounce';
import { useTextSearch } from './hooks/useTextSearch';
import { usePlaceDetails } from './hooks/usePlaceDetails';
import { Header } from './components/layout/Header';
import { SearchBar } from './components/search/SearchBar';
import { AreaSelector } from './components/search/AreaSelector';
import { CategoryFilter } from './components/search/CategoryFilter';
import { ResultsList } from './components/results/ResultsList';
import { DetailModal } from './components/detail/DetailModal';
import { ApiKeySetup } from './components/ApiKeySetup';

function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem('gmaps_api_key') ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
  );
  const [query, setQuery] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  if (!apiKey) {
    return <ApiKeySetup onSave={setApiKey} />;
  }

  const debouncedQuery = useDebounce(query, 300);

  // Category and free-text are mutually exclusive
  const activeQuery = selectedCategory ? '' : debouncedQuery;
  const activeCategory = selectedCategory;

  const { results, isLoading, error, failedAreas } = useTextSearch(
    activeQuery,
    selectedAreas,
    activeCategory
  );

  const { detail, isLoading: detailLoading, error: detailError } = usePlaceDetails(selectedPlaceId);

  const hasSearched =
    !!selectedCategory || debouncedQuery.trim().length > 0 || selectedAreas.length > 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim()) setSelectedCategory(null); // mutually exclusive
  };

  const handleCategoryChange = (cat: Category | null) => {
    setSelectedCategory(cat);
    if (cat) setQuery(''); // mutually exclusive
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onResetApiKey={() => { localStorage.removeItem('gmaps_api_key'); setApiKey(''); }} />

      <main className="max-w-5xl mx-auto px-4 py-4 space-y-3">
        <SearchBar value={query} onChange={handleQueryChange} />
        <AreaSelector selected={selectedAreas} onChange={setSelectedAreas} />
        <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />

        <ResultsList
          results={results}
          isLoading={isLoading}
          error={error}
          failedAreas={failedAreas}
          hasSearched={hasSearched}
          onSelectPlace={setSelectedPlaceId}
        />
      </main>

      {selectedPlaceId && (
        <DetailModal
          detail={detail}
          isLoading={detailLoading}
          error={detailError}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}
    </div>
  );
}

export default App;
