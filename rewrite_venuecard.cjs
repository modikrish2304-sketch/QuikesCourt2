const fs = require('fs');

const code = `
import React from 'react';
import { MapPin, Star, Clock, ShieldCheck, Dumbbell, ArrowRight } from 'lucide-react';
import { Facility } from '../types';
import { Button } from './Button';

export interface VenueCardProps {
  venue: Facility;
  onViewDetails?: (id: string) => void;
  onBookNow?: (id: string) => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onViewDetails, onBookNow }) => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-lg hover:border-green-300">
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={venue.images?.[0] || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop'}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges Overlay */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <div className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
            {venue.venueType}
          </div>
        </div>
        
        {venue.verifiedBadge && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-green-500/95 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Top Info */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex flex-col">
             <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
               {venue.sports.slice(0,2).map(s => (
                 <span key={s} className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                   {s}
                 </span>
               ))}
               {venue.sports.length > 2 && (
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                   +{venue.sports.length - 2} more
                 </span>
               )}
             </div>
            <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">
              {venue.name}
            </h3>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-sm font-bold text-amber-600">{venue.rating.toFixed(1)}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1">({venue.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Location & Time */}
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-sm font-medium line-clamp-1">
              {venue.location}, {venue.city}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-sm font-medium">
              {venue.openingTime} - {venue.closingTime}
            </p>
          </div>
        </div>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {venue.amenities.slice(0,3).join(' • ')}
            {venue.amenities.length > 3 && ' • ...'}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Starting From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-green-600">₹{venue.startingPrice}</span>
              <span className="text-xs font-medium text-slate-500">/hr</span>
            </div>
          </div>
          <div className="flex gap-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(venue.id)}
                className="hidden sm:flex rounded-xl px-4"
              >
                Details
              </Button>
            )}
            {onBookNow && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onBookNow(venue.id)}
                className="rounded-xl px-5 shadow-xs"
              >
                Book Now
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/VenueCard.tsx', code);
console.log('VenueCard.tsx rewritten');
