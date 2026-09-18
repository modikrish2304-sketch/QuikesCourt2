const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { Filter, X, RotateCcw, MapPin, Search } from 'lucide-react';
import { SportType } from '../types';
import { venueService } from '../services/venueService';

export interface FilterState {
  sport: string;
  city: string;
  location: string;
  priceRange: string;
  venueType: string;
  minRating: number;
  verifiedOnly: boolean;
}

export interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const PRICE_OPTIONS = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹300', value: 'under-300' },
  { label: '₹300 – ₹500', value: '300-500' },
  { label: '₹500 – ₹1000', value: '500-1000' },
  { label: '₹1000+', value: 'above-1000' },
];

const VENUE_TYPES = [
  { label: 'All Types', value: 'all' },
  { label: 'Indoor', value: 'Indoor' },
  { label: 'Outdoor', value: 'Outdoor' },
  { label: 'Premium', value: 'Premium' },
  { label: 'Community', value: 'Community' },
];

const RATINGS = [
  { label: 'Any Rating', value: 0 },
  { label: '4.5 & above', value: 4.5 },
  { label: '4.0 & above', value: 4.0 },
  { label: '3.0 & above', value: 3.0 },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [sports, setSports] = useState<{ label: string; value: string }[]>([{ label: 'All Sports', value: 'all' }]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([{ label: 'All Cities', value: 'all' }]);
  const [locations, setLocations] = useState<{ label: string; value: string }[]>([{ label: 'All Locations', value: 'all' }]);

  useEffect(() => {
    const allSports = venueService.getAllSports();
    setSports([
      { label: 'All Sports', value: 'all' },
      ...allSports.map(s => ({ label: s.name, value: s.id }))
    ]);

    const allCities = venueService.getAllCities();
    setCities([
      { label: 'All Cities', value: 'all' },
      ...allCities.map(c => ({ label: c.name, value: c.id }))
    ]);
  }, []);

  useEffect(() => {
    if (filters.city && filters.city !== 'all') {
      const cityLocs = venueService.getLocationsByCity(filters.city);
      setLocations([
        { label: 'All Locations', value: 'all' },
        ...cityLocs.map(l => ({ label: l, value: l }))
      ]);
      if (!cityLocs.includes(filters.location) && filters.location !== 'all') {
        onChange({ ...filters, location: 'all' });
      }
    } else {
      setLocations([{ label: 'All Locations', value: 'all' }]);
      if (filters.location !== 'all') {
        onChange({ ...filters, location: 'all' });
      }
    }
  }, [filters.city]);

  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const MobileWrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      {/* Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      {/* Drawer */}
      <div 
        className={\`fixed inset-y-0 right-0 z-50 w-full max-w-xs transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:block lg:w-auto lg:max-w-none lg:translate-x-0 lg:bg-transparent lg:shadow-none \${isOpenMobile ? 'translate-x-0' : 'translate-x-full'}\`}
      >
        {children}
      </div>
    </>
  );

  return (
    <MobileWrapper>
      <div className="flex h-full flex-col lg:h-auto lg:block">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 lg:hidden">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <button onClick={onCloseMobile} className="rounded-full p-2 hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-3 lg:bg-white lg:p-4 lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-200">
            
            {/* Sport Filter */}
            <div className="flex flex-col gap-1.5 lg:w-[160px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sport</label>
              <select 
                value={filters.sport}
                onChange={(e) => handleChange('sport', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              >
                {sports.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex flex-col gap-1.5 lg:w-[160px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">City</label>
              <select 
                value={filters.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              >
                {cities.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex flex-col gap-1.5 lg:w-[160px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</label>
              <select 
                value={filters.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={filters.city === 'all'}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all disabled:opacity-50 disabled:bg-slate-50"
              >
                {locations.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex flex-col gap-1.5 lg:w-[140px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</label>
              <select 
                value={filters.priceRange}
                onChange={(e) => handleChange('priceRange', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              >
                {PRICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Venue Type */}
            <div className="flex flex-col gap-1.5 lg:w-[140px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Venue Type</label>
              <select 
                value={filters.venueType}
                onChange={(e) => handleChange('venueType', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              >
                {VENUE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-1.5 lg:w-[140px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Rating</label>
              <select 
                value={filters.minRating}
                onChange={(e) => handleChange('minRating', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              >
                {RATINGS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Verified Only */}
            <div className="flex items-center gap-2 lg:mb-2 lg:ml-2">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={filters.verifiedOnly}
                onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="verifiedOnly" className="text-sm font-medium text-slate-700">
                Verified Only
              </label>
            </div>

            {/* Clear Button */}
            <div className="mt-4 flex justify-end lg:mt-0 lg:ml-auto">
              <button
                onClick={onClear}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </button>
            </div>

          </div>
        </div>
      </div>
    </MobileWrapper>
  );
};
`;

fs.writeFileSync('src/components/FilterPanel.tsx', code);
console.log('FilterPanel.tsx updated');
