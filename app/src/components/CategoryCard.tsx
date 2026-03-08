import { useState } from 'react';
import { ChevronDown, Music, Sparkles, Star, Users, Award } from 'lucide-react';

export interface CategoryCardProps {
  name: string;
  description: string;
  icon?: 'music' | 'sparkles' | 'star' | 'users' | 'award';
  badge?: string;
  details?: string[];
  variant?: 'default' | 'special' | 'variety';
}

const iconMap = {
  music: Music,
  sparkles: Sparkles,
  star: Star,
  users: Users,
  award: Award,
};

const CategoryCard = ({
  name,
  description,
  icon = 'music',
  badge,
  details,
  variant = 'default',
}: CategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = iconMap[icon];

  return (
    <div
      className={`group h-full flex flex-col transition-all duration-500 rounded-[2rem] overflow-hidden border border-gray-100 shadow-premium hover:shadow-2xl hover:border-primary/20 bg-white`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-8 flex flex-col items-start gap-6 text-left h-full"
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
            variant === 'special'
              ? 'bg-primary/10 text-primary'
              : 'bg-primary/5 text-primary'
          }`}
        >
          <IconComponent className="w-7 h-7" />
        </div>
        
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="font-display font-black text-2xl text-[#0a0a0a] group-hover:text-primary transition-colors duration-500 uppercase tracking-tight">
              {name}
            </h3>
            {details && details.length > 0 && (
              <div className={`w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-primary text-white border-primary rotate-180' : 'text-gray-400 group-hover:border-primary/20 group-hover:text-primary'}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            )}
          </div>

          {badge && (
            <span
              className={`inline-block mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                variant === 'special'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-primary text-white'
              }`}
            >
              {badge}
            </span>
          )}
          
          <p className="text-gray-500 text-lg leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </button>

      {/* Expandable Content */}
      {details && details.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-700 ease-in-out ${
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-8 pb-8 pt-0">
            <div className="border-t border-gray-100 pt-8">
              <h4 className="font-mono text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">
                Requirements & Specs
              </h4>
              <ul className="space-y-3">
                {details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-600 font-medium leading-relaxed"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
