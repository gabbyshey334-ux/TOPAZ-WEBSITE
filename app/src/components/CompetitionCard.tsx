import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CompetitionCardProps {
  id: string;
  name: string;
  date: string;
  location: string;
  registrationDeadline: string;
  status: 'open' | 'closed' | 'coming';
  description?: string;
}

const CompetitionCard = ({
  name,
  date,
  location,
  registrationDeadline,
  status,
  description,
}: CompetitionCardProps) => {
  const statusConfig = {
    open: { label: 'Registration Open', className: 'bg-green-500/10 text-green-600 border border-green-500/20' },
    closed: { label: 'Registration Closed', className: 'bg-red-500/10 text-red-600 border border-red-500/20' },
    coming: { label: 'Coming Soon', className: 'bg-primary/10 text-primary border border-primary/20' },
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="bg-white p-8 group h-full flex flex-col">
      {/* Header with Status Badge */}
      <div className="flex flex-col items-start gap-4 mb-8">
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
        <h3 className="font-display font-black text-2xl lg:text-3xl text-[#0a0a0a] group-hover:text-primary transition-colors duration-500 leading-tight uppercase tracking-tighter">
          {name}
        </h3>
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-lg mb-10 line-clamp-3 leading-relaxed font-medium">
          {description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-4 mb-10 mt-auto">
        <div className="flex items-center gap-4 text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">{date}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">{location}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">Deadline: {registrationDeadline}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/schedule"
          className={`flex-1 btn-primary !px-6 !py-3.5 !text-xs !rounded-2xl shadow-none hover:shadow-lg ${
            status !== 'open' ? 'opacity-50 pointer-events-none grayscale' : ''
          }`}
        >
          Register
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/rules"
          className="flex-1 btn-secondary !px-6 !py-3.5 !text-xs !rounded-2xl !bg-gray-50 !border-none hover:!bg-gray-100 shadow-none"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

export default CompetitionCard;
