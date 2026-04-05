import { useEffect, useRef } from 'react';
import type { PlaceDetail } from '../../lib/types';
import { PhotoGallery } from './PhotoGallery';
import { DetailMap } from './DetailMap';

interface DetailModalProps {
  detail: PlaceDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export function DetailModal({ detail, isLoading, error, onClose }: DetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & ESC key
  useEffect(() => {
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // history.pushState for mobile back button
  useEffect(() => {
    history.pushState({ modal: true }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90dvh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <h2 id="modal-title" className="font-bold text-gray-900 text-base line-clamp-1">
            {isLoading ? '読み込み中...' : (detail?.displayName.text ?? '')}
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="ml-2 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-56 bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">
              <p className="text-3xl mb-2">⚠️</p>
              <p>{error}</p>
            </div>
          )}

          {detail && !isLoading && (
            <>
              {detail.photos && detail.photos.length > 0 && (
                <PhotoGallery photos={detail.photos} placeName={detail.displayName.text} />
              )}

              <DetailMap location={detail.location} name={detail.displayName.text} />

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">{detail.formattedAddress}</p>

                {detail.rating != null && (
                  <p className="text-amber-600 font-medium">
                    ⭐ {detail.rating.toFixed(1)}
                    {detail.userRatingCount != null && (
                      <span className="text-gray-500 font-normal ml-1">
                        ({detail.userRatingCount} 件のレビュー)
                      </span>
                    )}
                  </p>
                )}

                {detail.nationalPhoneNumber && (
                  <p className="text-gray-700">📞 {detail.nationalPhoneNumber}</p>
                )}

                {detail.regularOpeningHours && (
                  <div>
                    <p className={`font-medium mb-1 ${detail.regularOpeningHours.openNow ? 'text-green-600' : 'text-red-500'}`}>
                      {detail.regularOpeningHours.openNow ? '営業中' : '営業時間外'}
                    </p>
                    <ul className="text-gray-600 space-y-0.5 text-xs">
                      {detail.regularOpeningHours.weekdayDescriptions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  {detail.websiteUri && (
                    <a
                      href={detail.websiteUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline text-xs"
                    >
                      🌐 ウェブサイト
                    </a>
                  )}
                  {detail.googleMapsUri && (
                    <a
                      href={detail.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline text-xs"
                    >
                      📍 Google マップで開く
                    </a>
                  )}
                </div>
              </div>

              {detail.reviews && detail.reviews.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">レビュー</h3>
                  <div className="space-y-3">
                    {detail.reviews.slice(0, 3).map((review) => (
                      <div key={review.name} className="bg-gray-50 rounded-lg p-3 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">
                            {review.authorAttribution.displayName}
                          </span>
                          <span className="text-amber-500">{'⭐'.repeat(review.rating)}</span>
                          <span className="text-gray-400">{review.relativePublishTimeDescription}</span>
                        </div>
                        <p className="text-gray-700 line-clamp-3">{review.text.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
