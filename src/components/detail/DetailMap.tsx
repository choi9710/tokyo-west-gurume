import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { LatLng } from '../../lib/types';
import { getApiKey } from '../../lib/api';

interface DetailMapProps {
  location: LatLng;
  name: string;
}

export function DetailMap({ location, name }: DetailMapProps) {
  const center = { lat: location.latitude, lng: location.longitude };

  return (
    <APIProvider apiKey={getApiKey()}>
      <div className="h-48 rounded-lg overflow-hidden">
        <Map
          center={center}
          zoom={16}
          mapId="DEMO_MAP_ID"
          disableDefaultUI
          gestureHandling="cooperative"
        >
          <AdvancedMarker position={center} title={name} />
        </Map>
      </div>
    </APIProvider>
  );
}
