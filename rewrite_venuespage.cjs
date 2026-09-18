const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { venueService, VenueFilterParams } from '../services/venueService';
import { Facility } from '../types';
import { VenueCard } from '../components/VenueCard';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel, FilterState } from '../components/FilterPanel';
import { Pagination } from '../components/Pagination';
import { SkeletonCard } from '../components/SkeletonCard';
import { Button } from '../components/Button';
import { Filter, MapPin, X, RotateCcw } from 'lucide-react';

export interface VenuesPageProps {
  onNavigate: (route: string) => void;
  initialQuery?: string;
  initialSport?: string;
  initialCity?: string;
  initialLocation?: string;
}

export const VenuesPage: React.FC<VenuesPageProps> = ({
  onNavigate,
  initialQuery = '',
  initialSport = 'all',
  initialCity = 'all',
  initialLocation = 'all',
}) => {
  const [venues, setVenues] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  const [filters, setFilters] = useState<FilterState>({
    sport: initialSport,
    city: initialCity,
    location: initialLocation,
    priceRange: 'all',
    venueType: 'all',
    minRating: 0,
    verifiedOnly: false,
  });

  const fetchVenues = async () => {
    try {
      setLoading(true);
      
      const filterParams: VenueFilterParams = {
        search,
        sport: filters.sport !== 'all' ? filters.sport : undefined,
        city: filters.city !== 'all' ? filters.city : undefined,
        location: filters.location !== 'all' ? filters.location : undefined,
        priceRange: filters.priceRange !== 'all' ? (filters.priceRange as any) : undefined,
        venueType: filters.venueType !== 'all' ? (filters.venueType as any) : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        verifiedOnly: filters.verifiedOnly ? true : undefined,
        page,
        limit: 12,
      };

      let result = await venueService.getVenues(filterParams);
      
      let sortedVenues = [...result.venues];
      if (sortBy === 'rating') {
        sortedVenues.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'price-low') {
        sortedVenues.sort((a, b) => a.startingPrice - b.startingPrice);
      } else if (sortBy === 'price-high') {
        sortedVenues.sort((a, b) => b.startingPrice - a.startingPrice);
      }
      
      setVenues(sortedVenues);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to fetch venues', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [filters, search, page, sortBy]);

  const handleClearFilters = () => {
    setFilters({
      sport: 'all',
      city: 'all',
      location: 'all',
      priceRange: 'all',
      venueType: 'all',
      minRating: 0,
      verifiedOnly: false,
    });
    setSearch('');
    setPage(1);
    setSortBy('recommended');
  };

  const removeFilterTag = (key: keyof FilterState) => {
    setFilters({ ...filters, [key]: key === 'minRating' ? 0 : key === 'verifiedOnly' ? false : 'all' });
    setPage(1);
  };

  const hasActiveFilters =
    filters.sport !== 'all' ||
    filters.city !== 'all' ||
    filters.location !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.venueType !== 'all' ||
    filters.minRating > 0 ||
    filters.verifiedOnly ||
    search !== '';

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Find Your Court</h1>
            <p className="text-sm font-medium text-slate-500">Discover sports venues near you and book your next game.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 px-3 py-1.5 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Rating: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Top Search & Filter Trigger Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by venue name, sport or area..."
            />
          </div>
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </button>
        </div>

        {/* Desktop Filter Panel */}
        <div className="hidden lg:block mb-8">
            <FilterPanel
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
              onClear={handleClearFilters}
            />
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Keyword: "{search}"
                <button onClick={() => setSearch('')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.city !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                City: {filters.city}
                <button onClick={() => removeFilterTag('city')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.location !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Location: {filters.location}
                <button onClick={() => removeFilterTag('location')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.sport !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Sport: {filters.sport}
                <button onClick={() => removeFilterTag('sport')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Price: {filters.priceRange}
                <button onClick={() => removeFilterTag('priceRange')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.venueType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Type: {filters.venueType}
                <button onClick={() => removeFilterTag('venueType')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Rating: {filters.minRating}+ ★
                <button onClick={() => removeFilterTag('minRating')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            {filters.verifiedOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Verified Only
                <button onClick={() => removeFilterTag('verifiedOnly')}>
                  <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-700 ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Right Column: Venues Grid */}
        <div className="space-y-6">
          {/* Header with Result Count */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {loading ? 'Searching venues...' : \`\${totalCount} courts found\`}
            </span>
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages || 1}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : venues.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                🏟️
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                No courts found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {filters.sport !== 'all' && filters.city !== 'all' && filters.location !== 'all' 
                  ? \`No \${filters.sport} courts found in \${filters.location}, \${filters.city}.\`
                  : 'We couldn\\'t find any courts matching your current filters.'} Try another location or sport.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            /* Venues Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {venues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onViewDetails={(id) => onNavigate(\`/venues/\${id}\`)}
                  onBookNow={(id) => onNavigate(\`/booking/\${id}\`)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="pt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <FilterPanel
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onClear={handleClearFilters}
        isOpenMobile={mobileFilterOpen}
        onCloseMobile={() => setMobileFilterOpen(false)}
      />
    </div>
  );
};
`;

fs.writeFileSync('src/pages/VenuesPage.tsx', code);
console.log('VenuesPage.tsx rewritten');
