const fs = require('fs');

let code = fs.readFileSync('src/pages/VenuesPage.tsx', 'utf-8');

// Replace props interface
code = code.replace(/export interface VenuesPageProps \{[\s\S]*?\}/, `export interface VenuesPageProps {
  onNavigate: (route: string) => void;
  initialQuery?: string;
  initialSport?: string;
  initialCity?: string;
  initialLocation?: string;
}`);

// Replace component definition
code = code.replace(/export const VenuesPage: React\.FC<VenuesPageProps> = \(\{[\s\S]*?\}\) => \{/, `export const VenuesPage: React.FC<VenuesPageProps> = ({
  onNavigate,
  initialQuery = '',
  initialSport = 'all',
  initialCity = 'all',
  initialLocation = 'all',
}) => {`);

// Update states
code = code.replace(/const \[selectedCity, setSelectedCity\] = useState\(initialCity\);/, 
`const [filters, setFilters] = useState<FilterState>({
    sport: initialSport,
    city: initialCity,
    location: initialLocation,
    priceRange: 'all',
    venueType: 'all',
    minRating: 0,
    verifiedOnly: false,
  });`);

// We need to carefully remove old states and replace with new. It's safer to just provide the whole file or carefully use sed.
console.log('Skipping partial and generating full file in the next step...');
