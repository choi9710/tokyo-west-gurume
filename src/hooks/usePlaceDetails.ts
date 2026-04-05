import { useState, useEffect } from 'react';
import { getPlaceDetails, type PlaceExtra } from '../lib/api';
import type { Place, PlaceDetail } from '../lib/types';

// In-memory cache for the 3 extra fields only
const extraCache = new Map<string, PlaceExtra>();

const LS_EXTRA_PREFIX = 'tkg_extra_';
const EXTRA_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function lsGet(id: string): PlaceExtra | null {
  try {
    const raw = localStorage.getItem(LS_EXTRA_PREFIX + id);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: PlaceExtra; ts: number };
    if (Date.now() - ts > EXTRA_CACHE_TTL) {
      localStorage.removeItem(LS_EXTRA_PREFIX + id);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function lsSet(id: string, data: PlaceExtra): void {
  try {
    localStorage.setItem(LS_EXTRA_PREFIX + id, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full or unavailable
  }
}

interface UsePlaceDetailsResult {
  detail: PlaceDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function usePlaceDetails(place: Place | null): UsePlaceDetailsResult {
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!place) {
      setDetail(null);
      setError(null);
      return;
    }

    // Immediately expose all data we already have from Text Search
    setDetail({ ...place });
    setError(null);

    // Check in-memory cache for extra fields
    if (extraCache.has(place.id)) {
      setDetail({ ...place, ...extraCache.get(place.id)! });
      return;
    }

    // Check localStorage cache
    const lsCached = lsGet(place.id);
    if (lsCached) {
      extraCache.set(place.id, lsCached);
      setDetail({ ...place, ...lsCached });
      return;
    }

    // Fetch only the 3 extra fields (phone, website, Google Maps URI)
    let cancelled = false;
    getPlaceDetails(place.id)
      .then((extra) => {
        if (!cancelled) {
          extraCache.set(place.id, extra);
          lsSet(place.id, extra);
          setDetail({ ...place, ...extra });
        }
      })
      .catch(() => {
        // Extra fields fail silently — basic info already shown
      });

    return () => { cancelled = true; };
  }, [place?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { detail, isLoading: false, error };
}
