import { useState } from 'react';
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
  /** Optional image URL. When set, card uses hero-style 60/40 layout. */
  image?: string;
  /** Optional full address shown under location */
  address?: string;
  /** Optional time range (e.g. "8:00 AM – 12:00 PM") */
  time?: string;
  /** Optional subtitle under the title */
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
}: CompetitionCardProps) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc = image && !imgError ? image : FALLBACK_EVENT_IMAGE;
  const statusStyle = statusConfig[status];

  const contentBlock = (
    <div className="p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center h-full">
      {/* Status Badge - desktop only; on mobile shown on image */}
      <div className="hidden lg:block mb-5 lg:mb-6">
        <span
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} inline-block`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 leading-tight tracking-tight">
        {name}
      </h2>

      {/* Subtitle or description line */}
      {(subtitle || description) && (
        <p className="text-base lg:text-lg text-gray-600 mb-6 line-clamp-2 leading-relaxed">
          {subtitle || description}
        </p>
      )}

      {/* Event details with icons */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
            <p className="text-gray-900 font-semibold">{date}</p>
            {time && <p className="text-sm text-gray-600 mt-0.5">{time}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Location</p>
            <p className="text-gray-900 font-semibold">{location}</p>
            {address && <p className="text-sm text-gray-600 mt-0.5">{address}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Deadline</p>
            <p className="text-gray-900 font-semibold">{registrationDeadline}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={status === 'open' ? '/registration' : '/schedule'}
          className={`flex-1 px-6 py-4 rounded-xl font-bold text-center inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl ${
            status === 'open'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
          }`}
        >
          {status === 'open' ? 'Register Now' : 'Register'}
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          to="/rules"
          className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors text-center"
        >
          Details
        </Link>
      </div>
    </div>
  );

  if (image) {
    return (
      <div className="group h-full flex flex-col overflow-hidden rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px] lg:min-h-[560px]">
          {/* LEFT: Image (60% - 3 cols) */}
          <div className="lg:col-span-3 relative h-72 sm:h-80 lg:h-auto min-h-[280px] order-1 overflow-hidden">
            <img
              src={imgSrc}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent lg:to-transparent" />
            {/* Status on image for mobile only */}
            <div className="absolute top-5 left-5 lg:hidden">
              <span className={`px-4 py-2 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
            </div>
          </div>

          {/* RIGHT: Content (40% - 2 cols) */}
          <div className="lg:col-span-2 bg-white order-2 flex flex-col">
            {contentBlock}
          </div>
        </div>
      </div>
    );
  }

  /* No image: compact card for past events */
  return (
    <div className="bg-white p-6 sm:p-8 group h-full flex flex-col rounded-2xl">
      <div className="mb-4">
        <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${statusStyle.bg} ${statusStyle.text} inline-block`}>
          {statusStyle.label}
        </span>
      </div>
      <h2 className="font-display font-black text-2xl lg:text-3xl text-gray-900 mb-4 leading-tight">
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
      <div className="mt-auto flex gap-3">
        <Link
          to="/schedule"
          className="btn-secondary !px-6 !py-3 !rounded-xl !text-sm flex-1 text-center"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

export default CompetitionCard;
