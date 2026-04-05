import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getApiKey } from '../../lib/api';
import type { Place } from '../../lib/types';

interface ResultsMapProps {
  results: Place[];
  onSelectPlace: (id: string) => void;
}

export function ResultsMap({ results, onSelectPlace }: ResultsMapProps) {
  const center =
    results.length > 0
      ? {
          lat: results.reduce((s, p) => s + p.location.latitude, 0) / results.length,
          lng: results.reduce((s, p) => s + p.location.longitude, 0) / results.length,
        }
      : { lat: 35.7028, lng: 139.5798 };

  return (
    <APIProvider apiKey={getApiKey()}>
      <div className="h-[520px] rounded-xl overflow-hidden border border-gray-200">
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="RESULTS_MAP_ID"
          gestureHandling="greedy"
        >
          {results.map((place) => (
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
    </APIProvider>
  );
}
