import { useState } from 'react';
import { Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
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
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const activePlace = activeId ? visibleResults.find((p) => p.id === activeId) ?? null : null;

  return (
    <div className="relative">
      <div className="h-[520px] rounded-xl overflow-hidden border border-gray-200">
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="RESULTS_MAP_ID"
          gestureHandling="greedy"
          onBoundsChanged={(e) => setBounds(e.detail.bounds)}
          onClick={() => setActiveId(null)}
        >
          {visibleResults.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.location.latitude, lng: place.location.longitude }}
              title={place.displayName.text}
              onClick={() => setActiveId(place.id)}
            >
              <div
                className={`w-8 h-8 transition-colors rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer text-sm select-none ${
                  activeId === place.id ? 'bg-orange-600 scale-110' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                🍴
              </div>
            </AdvancedMarker>
          ))}

          {/* InfoWindow: lightweight popup before loading full detail */}
          {activePlace && (
            <InfoWindow
              position={{
                lat: activePlace.location.latitude,
                lng: activePlace.location.longitude,
              }}
              onCloseClick={() => setActiveId(null)}
              pixelOffset={[0, -36]}
            >
              <div style={{ minWidth: '160px', padding: '2px 4px' }}>
                <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', color: '#111827' }}>
                  {activePlace.displayName.text}
                </p>
                {activePlace.rating != null && (
                  <p style={{ fontSize: '12px', color: '#d97706', marginBottom: '2px' }}>
                    ⭐ {activePlace.rating.toFixed(1)}
                    {activePlace.userRatingCount != null && (
                      <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                        {' '}({activePlace.userRatingCount})
                      </span>
                    )}
                  </p>
                )}
                {activePlace.regularOpeningHours?.openNow != null && (
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: activePlace.regularOpeningHours.openNow ? '#16a34a' : '#ef4444',
                    }}
                  >
                    {activePlace.regularOpeningHours.openNow ? '営業中' : '営業時間外'}
                  </p>
                )}
                <button
                  onClick={() => {
                    onSelectPlace(activePlace.id);
                    setActiveId(null);
                  }}
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  詳しく見る →
                </button>
              </div>
            </InfoWindow>
          )}
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
  );
}
