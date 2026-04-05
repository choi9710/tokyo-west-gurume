import { useState, useCallback } from 'react';
import type { Place } from '../lib/types';

const LS_KEY = 'tkg_favorites';

function load(): Place[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

function save(places: Place[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(places));
  } catch {
    // localStorage full or unavailable
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Place[]>(load);

  const toggle = useCallback((place: Place) => {
    setFavorites((prev) => {
      const next = prev.some((p) => p.id === place.id)
        ? prev.filter((p) => p.id !== place.id)
        : [...prev, place];
      save(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((p) => p.id === id),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
