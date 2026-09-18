const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, Zap, Award, Users, Star, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { venueService } from '../services/venueService';
import { Facility, Sport } from '../types';
import { VenueCard } from '../components/VenueCard';
import { SportCard } from '../components/SportCard';
import { Button } from '../components/Button';
import { SkeletonCard } from '../components/SkeletonCard';
import heroBackground from '../assets/images/sports_venue_background_1789209502947.jpg';

export interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [popularVenues, setPopularVenues] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const allSports = venueService.getAllSports();
  const allCities = venueService.getAllCities();
  
  const topSports = allSports.filter(s => ['Badminton', 'Cricket', 'Football', 'Tennis', 'Basketball', 'Volleyball', 'Pickleball', 'Table Tennis'].includes(s.name)).slice(0, 8);
  const popularCityNames = ['Ahmedabad', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'New Delhi', 'Kolkata'];
  const popularCities = allCities.filter(c => popularCityNames.includes(c.name));

  const availableLocations = selectedCity !== 'all' ? venueService.getLocationsByCity(selectedCity) : [];

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const res = await venueService.getPopularVenues(6);
        setPopularVenues(res);
      } catch (error) {
        console.error('Failed to fetch popular venues', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedCity === 'all') {
      setSelectedLocation('all');
    } else if (!availableLocations.includes(selectedLocation) && selectedLocation !== 'all') {
      setSelectedLocation('all');
    }
  }, [selectedCity, availableLocations]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedSport !== 'all') params.append('sport', selectedSport);
    if (selectedCity !== 'all') params.append('city', selectedCity);
    if (selectedLocation !== 'all') params.append('location', selectedLocation);
    
    onNavigate(\`/venues?\${params.toString()}\`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HERO SECTION */}
      <section 
        className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#041A1A] bg-cover bg-center bg-no-repeat pt-20 pb-16"
        style={{ backgroundImage: \`url(\${heroBackground})\` }}
      >
        <div className="absolute inset-0 bg-[#041515]/20" />
        
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 mt-12">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="mb-6 max-w-5xl text-[56px] font-black leading-[1.05] tracking-tight text-white sm:text-[64px] md:text-[76px]"
          >
            <span className="block drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">Find. Book. Play.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mb-14 max-w-2xl text-[17px] font-medium text-white/80 sm:text-[19px] drop-shadow-md"
          >
            Find your perfect place to play. Discover top-rated sports facilities near you.
          </motion.p>

          {/* Search Card */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="w-full max-w-4xl rounded-[2rem] md:rounded-full bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100"
          >
            <form onSubmit={handleHeroSearch} className="flex flex-col gap-2 md:flex-row md:items-center h-auto md:h-[64px]">
              
              {/* Sport */}
              <div className="flex h-[48px] md:h-full items-center gap-2.5 rounded-full px-4 hover:bg-slate-50 flex-1 transition cursor-pointer relative group">
                <Award className="h-4 w-4 text-slate-400 group-hover:text-green-600 shrink-0" strokeWidth={2.5} />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Sport</p>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-[13px] font-semibold text-slate-900 outline-none appearance-none"
                  >
                    <option value="all">Select Sport</option>
                    {allSports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="hidden h-8 w-[1px] bg-slate-200 md:block shrink-0" />

              {/* City */}
              <div className="flex h-[48px] md:h-full items-center gap-2.5 rounded-full px-4 hover:bg-slate-50 flex-1 transition cursor-pointer relative group">
                <MapPin className="h-4 w-4 text-slate-400 group-hover:text-green-600 shrink-0" strokeWidth={2.5} />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">City</p>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-[13px] font-semibold text-slate-900 outline-none appearance-none"
                  >
                    <option value="all">Select City</option>
                    {allCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="hidden h-8 w-[1px] bg-slate-200 md:block shrink-0" />

              {/* Location */}
              <div className="flex h-[48px] md:h-full items-center gap-2.5 rounded-full px-4 hover:bg-slate-50 flex-1 transition cursor-pointer relative group">
                <MapPin className="h-4 w-4 text-slate-400 group-hover:text-green-600 shrink-0" strokeWidth={2.5} />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Location</p>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    disabled={selectedCity === 'all'}
                    className="w-full cursor-pointer bg-transparent text-[13px] font-semibold text-slate-900 outline-none appearance-none disabled:opacity-50"
                  >
                    <option value="all">All Locations</option>
                    {availableLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="h-[48px] md:h-full rounded-2xl md:rounded-full px-8 shrink-0 bg-green-600 hover:bg-green-700 w-full md:w-auto mt-2 md:mt-0"
              >
                Find Courts
              </Button>
            </form>
          </motion.div>

        </div>
      </section>

      {/* EXPLORE SPORTS */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Explore Sports Near You</h2>
            <p className="mt-3 text-slate-500">Find the perfect court for your favorite game</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {topSports.map((sport) => (
              <div 
                key={sport.id}
                onClick={() => onNavigate(\`/venues?sport=\${sport.id}\`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-green-300 aspect-square flex flex-col items-center justify-center text-center p-4"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-50 transition-all duration-300">
                  <span className="text-3xl">{sport.name === 'Badminton' ? '🏸' : sport.name === 'Tennis' ? '🎾' : sport.name === 'Football' ? '⚽' : sport.name === 'Basketball' ? '🏀' : sport.name === 'Pickleball' ? '🏓' : sport.name === 'Cricket' ? '🏏' : '🏆'}</span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">{sport.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{sport.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR CITIES */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Popular Cities</h2>
            <p className="mt-3 text-slate-500">Find top-rated venues in major cities across India</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCities.map((city) => (
              <div 
                key={city.id}
                onClick={() => onNavigate(\`/venues?city=\${city.name}\`)}
                className="group flex items-center justify-between cursor-pointer rounded-2xl bg-slate-50 p-5 transition-all hover:bg-green-50 border border-transparent hover:border-green-200"
              >
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-green-700">{city.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{city.state}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP VENUES SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Top Rated Venues</h2>
              <p className="mt-3 text-slate-500">Discover the most highly recommended sports facilities</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('/venues')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All Venues
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
              popularVenues.slice(0, 6).map((venue) => (
                <VenueCard 
                  key={venue.id} 
                  venue={venue} 
                  onViewDetails={() => onNavigate(\`/venues/\${venue.id}\`)}
                  onBookNow={() => onNavigate(\`/booking/\${venue.id}\`)}
                />
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
`;

fs.writeFileSync('src/pages/LandingPage.tsx', code);
console.log('LandingPage.tsx rewritten');
