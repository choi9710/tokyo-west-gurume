import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getApiKey } from '../../lib/api';
import type { Place } from '../../lib/types';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ResultsMapProps {
  results: Place[];
  onSelectPlace: (id: string) => void;
}

export function ResultsMap({ results, onSelectPlace }: ResultsMapProps) {
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [boundsFilter, setBoundsFilter] = useState(false);

  const center =
    results.length > 0
      ? {
          lat: results.reduce((s, p) => s + p.location.latitude, 0) / results.length,
          lng: results.reduce((s, p) => s + p.location.longitude, 0) / results.length,
        }
      : { lat: 35.7028, lng: 139.5798 };

  const visibleResults =
    boundsFilter && bounds
      ? results.filter(
          (p) =>
            p.location.latitude >= bounds.south &&
            p.location.latitude <= bounds.north &&
            p.location.longitude >= bounds.west &&
            p.location.longitude <= bounds.east
        )
      : results;

  return (
    <APIProvider apiKey={getApiKey()}>
      <div className="relative">
        <div className="h-[520px] rounded-xl overflow-hidden border border-gray-200">
          <Map
            defaultCenter={center}
            defaultZoom={14}
            mapId="RESULTS_MAP_ID"
            gestureHandling="greedy"
            onBoundsChanged={(e) => setBounds(e.detail.bounds)}
          >
            {visibleResults.map((place) => (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.location.latitude, lng: place.location.longitude }}
                title={place.displayName.text}
                onClick={() => onSelectPlace(place.id)}
              >
                <div className="w-8 h-8 bg-orange-500 hover:bg-orange-600 transition-colors rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer text-sm select-none">
                  🍴
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </div>

        {/* Bounds filter toggle */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setBoundsFilter((v) => !v)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full shadow-md transition-colors whitespace-nowrap ${
              boundsFilter
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {boundsFilter
              ? `このエリアで絞り込み中 (${visibleResults.length}件)`
              : 'このエリアで絞り込む'}
          </button>
        </div>
      </div>
    </APIProvider>
  );
}
