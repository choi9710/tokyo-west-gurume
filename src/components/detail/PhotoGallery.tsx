import { useState, useRef } from 'react';
import type { PlacePhoto } from '../../lib/types';
import { getPhotoUrl } from '../../lib/api';

interface PhotoGalleryProps {
  photos: PlacePhoto[];
  placeName: string;
}

export function PhotoGallery({ photos, placeName }: PhotoGalleryProps) {
  const total = Math.min(photos.length, 5);

  // Default to most square photo (likely food photo)
  const defaultIndex = photos.slice(0, total).reduce((bestIdx, photo, i) => {
    const ratio = (p: typeof photo) => Math.abs(1 - p.widthPx / p.heightPx);
    return ratio(photo) < ratio(photos[bestIdx]) ? i : bestIdx;
  }, 0);

  const [index, setIndex] = useState(defaultIndex);
  const touchStartX = useRef(0);

  if (total === 0) return null;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) next();
    else if (delta < -40) prev();
  };

  return (
    <div className="relative select-none">
      <div
        className="h-56 md:h-72 bg-gray-100 overflow-hidden rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={photos[index].name}
          src={getPhotoUrl(photos[index].name, 800)}
          alt={`${placeName} 写真 ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation arrows */}
      {index > 0 && (
        <button
          onClick={prev}
          aria-label="前の写真"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          ‹
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={next}
          aria-label="次の写真"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          ›
        </button>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          {index + 1} / {total}
        </div>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`写真 ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
