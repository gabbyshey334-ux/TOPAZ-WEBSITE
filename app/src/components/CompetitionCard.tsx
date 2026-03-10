import { useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1569516449774-7a7b4d84a0d8?w=800&q=80';

export interface CompetitionCardProps {
  id: string;
  name: string;
  date: string;
  location: string;
  registrationDeadline: string;
  status: 'open' | 'closed' | 'coming';
  description?: string;
  /** Optional image URL. When set, card uses split layout (content left, image right). */
  image?: string;
  /** Optional full address shown under location */
  address?: string;
}

const CompetitionCard = ({
  name,
  date,
  location,
  address,
  registrationDeadline,
  status,
  description,
  image,
}: CompetitionCardProps) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc = image && !imgError ? image : FALLBACK_EVENT_IMAGE;

  const statusConfig = {
    open: { label: 'Registration Open', className: 'bg-green-500/10 text-green-600 border border-green-500/20' },
    closed: { label: 'Registration Closed', className: 'bg-red-500/10 text-red-600 border border-red-500/20' },
    coming: { label: 'Coming Soon', className: 'bg-primary/10 text-primary border border-primary/20' },
  };

  const statusInfo = statusConfig[status];

  const contentBlock = (
    <div className="p-6 lg:p-8 xl:p-10 flex flex-col justify-center h-full">
      <div className="flex flex-col items-start gap-4 mb-6">
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
        <h3 className="font-display font-black text-2xl lg:text-3xl text-[#0a0a0a] group-hover:text-primary transition-colors duration-500 leading-tight uppercase tracking-tighter">
          {name}
        </h3>
      </div>

      {description && (
        <p className="text-gray-500 text-base lg:text-lg mb-6 line-clamp-3 leading-relaxed font-medium">
          {description}
        </p>
      )}

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-4 text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">{date}</span>
        </div>
        <div className="flex items-start gap-4 text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors mt-0.5">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">{location}</p>
            {address && <p className="text-sm text-gray-500 mt-0.5">{address}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">Deadline: {registrationDeadline}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
        <Link
          to={status === 'open' ? '/registration' : '/schedule'}
          className={`flex-1 btn-primary !px-6 !py-3.5 !text-xs !rounded-2xl shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 ${
            status !== 'open' ? 'opacity-50 pointer-events-none grayscale' : ''
          }`}
        >
          {status === 'open' ? 'Register Now' : 'Register'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/rules"
          className="flex-1 btn-secondary !px-6 !py-3.5 !text-xs !rounded-2xl !bg-gray-50 !border-none hover:!bg-gray-100 shadow-none text-center"
        >
          Details
        </Link>
      </div>
    </div>
  );

  if (image) {
    return (
      <div className="group h-full flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[320px] lg:min-h-[380px]">
          <div className="order-2 lg:order-1 bg-white">{contentBlock}</div>
          <div className="order-1 lg:order-2 relative h-64 lg:h-auto min-h-[260px] overflow-hidden">
            <img
              src={imgSrc}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 group h-full flex flex-col">
      {contentBlock}
    </div>
  );
};

export default CompetitionCard;
