const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

// add imports
const imports = `import { GiShuttlecock, GiPingPongBat } from 'react-icons/gi';
import { MdSportsCricket, MdSportsTennis, MdSportsBasketball } from 'react-icons/md';
import { TbBallFootball } from 'react-icons/tb';`;

code = code.replace(
  "import { Search, MapPin, Aperture, ChevronDown, ArrowRight } from 'lucide-react';",
  "import { Search, MapPin, Aperture, ChevronDown, ArrowRight } from 'lucide-react';\n" + imports
);

// replace sports array
const newSports = `
  const sports = [
    { 
      name: 'Badminton', 
      venueCount: 128,
      icon: <GiShuttlecock className="w-5 h-5" />, 
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop' 
    },
    { 
      name: 'Football', 
      venueCount: 84,
      icon: <TbBallFootball className="w-5 h-5" />, 
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop' 
    },
    { 
      name: 'Cricket', 
      venueCount: 45,
      icon: <MdSportsCricket className="w-5 h-5" />, 
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop' 
    },
    { 
      name: 'Tennis', 
      venueCount: 62,
      icon: <MdSportsTennis className="w-5 h-5" />, 
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop' 
    },
    { 
      name: 'Basketball', 
      venueCount: 110,
      icon: <MdSportsBasketball className="w-5 h-5" />, 
      image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&auto=format&fit=crop' 
    },
    { 
      name: 'Pickleball', 
      venueCount: 24,
      icon: <GiPingPongBat className="w-5 h-5" />, 
      image: 'https://images.unsplash.com/photo-1689758410578-59424c53d9e2?w=800&auto=format&fit=crop' 
    },
  ];
`;

code = code.replace(/const sports = \[[\s\S]*?\];/, newSports.trim());

fs.writeFileSync('src/pages/LandingPage.tsx', code);
