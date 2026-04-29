import { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1569516449774-7a7b4d84a0d8?w=1200&q=80';

export interface CompetitionCardProps {
  id: string;
  name: string;
  date: string;
  location: string;
  registrationDeadline: string;
  status: 'open' | 'closed' | 'coming';
  description?: string;
  image?: string;
  /** Shown if `image` fails to load (e.g. from `site_content.schedule_card_error_fallback`). */
  imageErrorFallback?: string;
  address?: string;
  time?: string;
  subtitle?: string;
}

const statusConfig = {
  open: {
    label: 'REGISTRATION OPEN',
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  coming: {
    label: 'COMING SOON',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  closed: {
    label: 'REGISTRATION CLOSED',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  },
} as const;

const CompetitionCard = ({
  name,
  date,
  location,
  address,
  registrationDeadline,
  status,
  description,
  subtitle,
  time,
  image,
  imageErrorFallback,
}: CompetitionCardProps) => {
  const [imgTier, setImgTier] = useState(0);
  const candidates = useMemo(() => {
    const raw = [image, imageErrorFallback, FALLBACK_EVENT_IMAGE].filter(
      (u): u is string => Boolean(u && u.trim()),
    );
    return [...new Set(raw)];
  }, [image, imageErrorFallback]);

  useEffect(() => {
    setImgTier(0);
  }, [candidates]);

  const imgSrc =
    candidates[Math.min(imgTier, Math.max(0, candidates.length - 1))] ?? FALLBACK_EVENT_IMAGE;
  const statusStyle = statusConfig[status];

  const contentBlock = (
    <div className="p-8 lg:p-12 flex flex-col justify-center h-full min-h-0">
      {/* Status Badge - hidden on mobile (shown on image) */}
      <div className="hidden lg:block mb-6">
        <span
          className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
        {name}
      </h2>

      {/* Subtitle */}
      {(subtitle || description) && (
        <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed line-clamp-2">
          {subtitle || description}
        </p>
      )}

      {/* Event details */}
      <div className="space-y-5 mb-10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Date
            </p>
            <p className="text-base font-bold text-gray-900">{date}</p>
            {time && <p className="text-sm text-gray-600 mt-1">{time}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0 max-w-md">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Location
            </p>
            <p className="text-base font-bold text-gray-900">{location}</p>
            {address && <p className="mt-1 text-sm text-gray-600">{address}</p>}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Deadline
            </p>
            <p className="text-base font-bold text-gray-900">{registrationDeadline}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to={status === 'open' ? '/registration' : '/schedule'}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-lg ${
            status === 'open'
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
          }`}
        >
          Register
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          to="/rules"
          className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all text-center"
        >
          Details
        </Link>
      </div>
    </div>
  );

  if (image) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.01] transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px] w-full">
          {/* LEFT: Image (60% - 3 cols) */}
          <div className="lg:col-span-3 relative order-1 w-full">
            <div className="relative h-80 sm:h-96 lg:h-full min-h-[320px] w-full">
              <img
                src={imgSrc}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover object-center"
                onError={() =>
                  setImgTier((t) => Math.min(t + 1, Math.max(0, candidates.length - 1)))
                }
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
              {/* Status on image for mobile only */}
              <div className="absolute top-5 left-5 lg:hidden">
                <span
                  className={`px-4 py-2 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Content (40% - 2 cols) */}
          <div className="lg:col-span-2 order-2 flex flex-col bg-white">
            {contentBlock}
          </div>
        </div>
      </div>
    );
  }

  /* No image: compact card for past events */
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl h-full flex flex-col">
      <div className="mb-6">
        <span
          className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4 leading-tight">
        {name}
      </h2>
      {description && (
        <p className="text-gray-600 text-base mb-6 line-clamp-2">{description}</p>
      )}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-sm">{date}</span>
        </div>
        <div className="flex items-start gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <span className="font-semibold text-sm">{location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-sm">Deadline: {registrationDeadline}</span>
        </div>
      </div>
      <div className="mt-auto">
        <Link
          to="/rules"
          className="inline-block px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

export default CompetitionCard;
