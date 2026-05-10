import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ImageLightboxItem = {
  src: string;
  alt: string;
  caption?: string;
};

type Phase = 'entering' | 'open' | 'exiting';

type ImageLightboxProps = {
  items: ImageLightboxItem[];
  startIndex?: number;
  onClose: () => void;
  onImageError?: (e: SyntheticEvent<HTMLImageElement>) => void;
};

/**
 * Full-screen image lightbox — same visual pattern as the gallery page (dark overlay, centered image, X, click-outside to close).
 * Supports multiple images with prev/next controls and keyboard arrows / Escape.
 */
export function ImageLightbox({ items, startIndex = 0, onClose, onImageError }: ImageLightboxProps) {
  const safeLen = items.length;
  const [index, setIndex] = useState(() => {
    const len = items.length;
    if (len === 0) return 0;
    return Math.min(Math.max(0, startIndex), len - 1);
  });
  const [phase, setPhase] = useState<Phase>('entering');

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setPhase('open'));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestClose = useCallback(() => {
    setPhase('exiting');
    window.setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
      if (safeLen <= 1) return;
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + safeLen) % safeLen);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % safeLen);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [safeLen, requestClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const current = items[index];
  if (!current || safeLen === 0) return null;

  const showNav = safeLen > 1;
  const goPrev = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + safeLen) % safeLen);
  };
  const goNext = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % safeLen);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 transition-opacity duration-300 ease-out',
        phase === 'open' ? 'opacity-100' : 'opacity-0',
      )}
      onClick={requestClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          requestClose();
        }}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {showNav && (
        <button
          type="button"
          className="absolute left-2 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4 sm:h-14 sm:w-14"
          onClick={goPrev}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8 sm:h-9 sm:w-9" />
        </button>
      )}
      {showNav && (
        <button
          type="button"
          className="absolute right-2 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4 sm:h-14 sm:w-14"
          onClick={goNext}
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8 sm:h-9 sm:w-9" />
        </button>
      )}

      <div
        className={cn(
          'flex max-h-[95vh] max-w-full flex-col items-center gap-3 transition-all duration-300 ease-out',
          phase === 'open' ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-h-[85vh] min-h-[120px] max-w-full rounded-lg object-contain"
          onError={onImageError}
        />
        {current.caption ? (
          <p className="max-w-[min(90vw,640px)] truncate px-2 py-1 text-center text-sm text-white/80">{current.caption}</p>
        ) : null}
        {showNav ? (
          <p className="text-xs font-medium text-white/50">
            {index + 1} / {safeLen}
          </p>
        ) : null}
      </div>
    </div>
  );
}
