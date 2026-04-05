import { useState, useEffect, useRef } from 'react';
import { textSearch } from '../lib/api';
import type { Place } from '../lib/types';
import type { Area } from '../lib/constants';

const cache = new Map<string, Place[]>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const LS_PREFIX = 'tkg_search_';

function lsGet(key: string): Place[] | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: Place[]; ts: number };
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(LS_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function lsSet(key: string, data: Place[]): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full or unavailable
  }
}

interface UseTextSearchResult {
  results: Place[];
  isLoading: boolean;
  error: string | null;
  failedAreas: string[];
}

export function useTextSearch(
  query: string,
  selectedAreas: Area[],
  selectedCategory: string | null
): UseTextSearchResult {
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAreas, setFailedAreas] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const searchTerm = selectedCategory ?? query.trim();
    if (!searchTerm || selectedAreas.length === 0) {
      setResults([]);
      setError(null);
      setFailedAreas([]);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const cacheKey = `${searchTerm}|${selectedAreas.map((a) => a.id).join(',')}`;

    const run = async () => {
      // Return cached result immediately if available (memory first, then localStorage)
      if (cache.has(cacheKey)) {
        setResults(cache.get(cacheKey)!);
        setIsLoading(false);
        setError(null);
        setFailedAreas([]);
        return;
      }
      const lsCached = lsGet(cacheKey);
      if (lsCached) {
        cache.set(cacheKey, lsCached);
        setResults(lsCached);
        setIsLoading(false);
        setError(null);
        setFailedAreas([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      setFailedAreas([]);

      try {
        const isCategory = !!selectedCategory;

        const requests =
          selectedAreas.length > 0
            ? selectedAreas.map((area) =>
                isCategory
                  ? textSearch(searchTerm, { lat: area.lat, lng: area.lng })
                  : textSearch(`${searchTerm} ${area.name}`)
              )
            : [textSearch(searchTerm)];

        const settled = await Promise.allSettled(requests);

        if (controller.signal.aborted) return;

        const all: Place[] = [];
        const failed: string[] = [];

        settled.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            all.push(...result.value);
          } else {
            failed.push(selectedAreas[i]?.name ?? '不明');
          }
        });

        // Deduplicate by id, sort by rating desc
        const seen = new Set<string>();
        const deduped = all
          .filter((p) => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          })
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        if (failed.length === 0) {
          cache.set(cacheKey, deduped);
          lsSet(cacheKey, deduped);
        }

        setResults(deduped);
        setFailedAreas(failed);
        if (failed.length > 0 && deduped.length === 0) {
          setError('検索に失敗しました。しばらく経ってからもう一度お試しください。');
        }
      } catch {
        if (!controller.signal.aborted) {
          setError('ネットワークエラーが発生しました。');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => controller.abort();
  }, [query, selectedAreas, selectedCategory]);

  return { results, isLoading, error, failedAreas };
}
