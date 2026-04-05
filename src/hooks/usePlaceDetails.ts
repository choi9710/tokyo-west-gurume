import { useState, useEffect } from 'react';
import { getPlaceDetails } from '../lib/api';
import type { PlaceDetail } from '../lib/types';

interface UsePlaceDetailsResult {
  detail: PlaceDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function usePlaceDetails(placeId: string | null): UsePlaceDetailsResult {
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPlaceDetails(placeId);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setError('詳細情報の取得に失敗しました。');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [placeId]);

  return { detail, isLoading, error };
}
