import { useState } from 'react';
import type { PlacePhoto } from '../../lib/types';
import { getPhotoUrl } from '../../lib/api';

interface PhotoGalleryProps {
  photos: PlacePhoto[];
  placeName: string;
}

export function PhotoGallery({ photos, placeName }: PhotoGalleryProps) {
  // Default to most square photo (likely food photo)
  const defaultIndex = photos.reduce((bestIdx, photo, i) => {
    const ratio = (p: typeof photo) => Math.abs(1 - p.widthPx / p.heightPx);
    return ratio(photo) < ratio(photos[bestIdx]) ? i : bestIdx;
  }, 0);
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  if (photos.length === 0) return null;

  return (
    <div>
      <div className="h-56 md:h-72 bg-gray-100 overflow-hidden rounded-lg mb-2">
        <img
          src={getPhotoUrl(photos[activeIndex].name, 800)}
          alt={`${placeName} 写真 ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.slice(0, 8).map((photo, i) => (
            <button
              key={photo.name}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                i === activeIndex ? 'border-orange-500' : 'border-transparent'
              }`}
            >
              <img
                src={getPhotoUrl(photo.name, 400)}
                alt={`${placeName} 写真 ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
