const fs = require('fs');

const indoorSports = ['Badminton', 'Table Tennis', 'Squash', 'Snooker', 'Billiards', 'Bowling', 'Futsal', 'Indoor Cricket', 'Indoor Basketball', 'Indoor Volleyball', 'Pickleball', 'Chess', 'Carrom', 'Boxing', 'Martial Arts'];
const outdoorSports = ['Cricket', 'Football', 'Tennis', 'Basketball', 'Volleyball', 'Hockey', 'Kabaddi', 'Kho-Kho', 'Golf', 'Archery', 'Athletics', 'Swimming', 'Cycling', 'Outdoor Badminton', 'Outdoor Pickleball'];

const SPORTS = [];
indoorSports.forEach(s => SPORTS.push({ id: s, name: s, category: 'Indoor Sports', icon: 'default', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop', description: `${s} courts and facilities` }));
outdoorSports.forEach(s => SPORTS.push({ id: s, name: s, category: 'Outdoor Sports', icon: 'default', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop', description: `${s} fields and facilities` }));

const cityData = {
  'Ahmedabad': { state: 'Gujarat', locs: ['SG Highway', 'Prahlad Nagar', 'Satellite', 'Vastrapur', 'Bopal', 'Navrangpura', 'Thaltej', 'Maninagar'] },
  'Surat': { state: 'Gujarat', locs: ['Vesu', 'Adajan', 'Pal', 'City Light', 'Piplod', 'Dumas'] },
  'Vadodara': { state: 'Gujarat', locs: ['Alkapuri', 'Gotri', 'Manjalpur', 'Akota', 'Vasna'] },
  'Rajkot': { state: 'Gujarat', locs: ['Kalawad Road', '150 Feet Ring Road', 'Raiya Road', 'University Road'] },
  'Gandhinagar': { state: 'Gujarat', locs: ['Infocity', 'Sargasan', 'Kudasan', 'Sector 11'] },
  'Bhavnagar': { state: 'Gujarat', locs: ['Kalanala', 'Waghawadi Road'] },
  'Jamnagar': { state: 'Gujarat', locs: ['Indira Marg', 'Patel Colony'] },
  'Anand': { state: 'Gujarat', locs: ['Vidyanagar Road', 'Town Hall'] },
  'Mumbai': { state: 'Maharashtra', locs: ['Andheri', 'Bandra', 'Powai', 'Borivali', 'Lower Parel', 'Dadar'] },
  'Pune': { state: 'Maharashtra', locs: ['Baner', 'Wakad', 'Kharadi', 'Viman Nagar', 'Hinjawadi', 'Kothrud', 'Hadapsar', 'Kalyani Nagar'] },
  'Nagpur': { state: 'Maharashtra', locs: ['Dharampeth', 'Wardhaman Nagar'] },
  'Nashik': { state: 'Maharashtra', locs: ['College Road', 'Gangapur Road'] },
  'Aurangabad': { state: 'Maharashtra', locs: ['CIDCO', 'Nirala Bazar'] },
  'Bengaluru': { state: 'Karnataka', locs: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Electronic City', 'Marathahalli', 'Jayanagar'] },
  'Mysuru': { state: 'Karnataka', locs: ['Gokulam', 'Jayalakshmipuram'] },
  'Mangaluru': { state: 'Karnataka', locs: ['Kodialbail', 'Bejai'] },
  'New Delhi': { state: 'Delhi NCR', locs: ['Connaught Place', 'Vasant Kunj', 'Dwarka'] },
  'Gurugram': { state: 'Delhi NCR', locs: ['Cyber City', 'Golf Course Road', 'Sohna Road', 'Sector 29'] },
  'Noida': { state: 'Delhi NCR', locs: ['Sector 18', 'Sector 62', 'Sector 137', 'Greater Noida'] },
  'Faridabad': { state: 'Delhi NCR', locs: ['Sector 15', 'Sector 21'] },
  'Hyderabad': { state: 'Telangana', locs: ['Gachibowli', 'Madhapur', 'Kondapur', 'Banjara Hills', 'Jubilee Hills', 'Uppal'] },
  'Chennai': { state: 'Tamil Nadu', locs: ['Anna Nagar', 'Adyar', 'T. Nagar', 'OMR', 'Velachery'] },
  'Coimbatore': { state: 'Tamil Nadu', locs: ['RS Puram', 'Peelamedu'] },
  'Madurai': { state: 'Tamil Nadu', locs: ['KK Nagar', 'Anna Nagar'] },
  'Kochi': { state: 'Kerala', locs: ['Kakkanad', 'Edappally', 'Vyttila', 'Marine Drive'] },
  'Thiruvananthapuram': { state: 'Kerala', locs: ['Kowdiar', 'Sasthamangalam'] },
  'Kozhikode': { state: 'Kerala', locs: ['Nadakkavu', 'Mavoor Road'] },
  'Kolkata': { state: 'West Bengal', locs: ['Salt Lake', 'New Town', 'Rajarhat', 'Ballygunge', 'Alipore'] },
  'Jaipur': { state: 'Rajasthan', locs: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Mansarovar'] },
  'Udaipur': { state: 'Rajasthan', locs: ['Fateh Sagar', 'Hiran Magri'] },
  'Jodhpur': { state: 'Rajasthan', locs: ['Sardarpura', 'Ratanada'] },
  'Lucknow': { state: 'Uttar Pradesh', locs: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar'] },
  'Kanpur': { state: 'Uttar Pradesh', locs: ['Swaroop Nagar', 'Kakadeo'] },
  'Varanasi': { state: 'Uttar Pradesh', locs: ['Lanka', 'Sigra'] },
  'Indore': { state: 'Madhya Pradesh', locs: ['Vijay Nagar', 'Palasia', 'Rau', 'Nipania'] },
  'Bhopal': { state: 'Madhya Pradesh', locs: ['MP Nagar', 'Arera Colony'] },
  'Visakhapatnam': { state: 'Andhra Pradesh', locs: ['MVP Colony', 'Madhurawada'] },
  'Vijayawada': { state: 'Andhra Pradesh', locs: ['Benz Circle', 'Patamata'] },
  'Chandigarh': { state: 'Punjab', locs: ['Sector 17', 'Sector 22', 'Sector 34', 'Sector 43'] },
  'Ludhiana': { state: 'Punjab', locs: ['Sarabha Nagar', 'Model Town'] },
  'Panipat': { state: 'Haryana', locs: ['Model Town', 'Sector 11'] },
  'Panaji': { state: 'Goa', locs: ['Miramar', 'Dona Paula'] },
  'Margao': { state: 'Goa', locs: ['Fatorda', 'Colva'] }
};

const CITIES = Object.keys(cityData).map(name => ({
  id: name,
  name,
  state: cityData[name].state,
  stateCode: cityData[name].state.substring(0, 2).toUpperCase(),
  famousLocations: cityData[name].locs
}));

let FACILITIES = [];

// Start with 16 existing IDs, then make up the rest up to 45
let idCounter = 1;
for (const cityName of Object.keys(cityData)) {
  const city = cityData[cityName];
  for (let i = 0; i < Math.min(2, city.locs.length); i++) {
    const loc = city.locs[i];
    
    // Distribute sports
    const sport1 = indoorSports[(idCounter * 3) % indoorSports.length];
    const sport2 = outdoorSports[(idCounter * 7) % outdoorSports.length];
    
    const venue = {
      id: `fac_${idCounter}`,
      ownerId: 'usr_owner_1',
      ownerName: 'Rajesh Sharma',
      name: `${sport1} Hub ${loc}`,
      description: `A fantastic venue for ${sport1} and ${sport2} located in ${loc}, ${cityName}.`,
      sports: [sport1, sport2],
      venueType: 'both',
      address: `123 Main St, ${loc}`,
      location: loc,
      area: loc,
      city: cityName,
      pincode: '400000',
      lat: 19.0 + (Math.random() * 2),
      lng: 72.0 + (Math.random() * 2),
      rating: +(Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 200) + 10,
      startingPrice: Math.floor(Math.random() * 1000) + 200,
      amenities: ['Parking', 'Changing Room', 'Drinking Water', 'Washroom'],
      openingTime: '06:00',
      closingTime: '23:00',
      images: [
        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop'
      ],
      verifiedBadge: true,
      status: 'approved',
      courtCount: Math.floor(Math.random() * 5) + 2,
      rules: ['Non-marking shoes only', 'Bring your own equipment'],
      createdAt: '2026-05-10T10:00:00Z',
    };
    FACILITIES.push(venue);
    idCounter++;
    if(idCounter > 50) break;
  }
  if(idCounter > 50) break;
}

let code = fs.readFileSync('src/data/seedData.ts', 'utf-8');
code = code.replace(/export const SEED_FACILITIES: Facility\[\] = \[[\s\S]*?export const SEED_COURTS/, `
export const SPORTS = ${JSON.stringify(SPORTS, null, 2)};

export const CITIES = ${JSON.stringify(CITIES, null, 2)};

export const SEED_FACILITIES: Facility[] = ${JSON.stringify(FACILITIES, null, 2)};

export const SEED_COURTS`);

fs.writeFileSync('src/data/seedData.ts', code);
console.log('Seed data updated successfully.');
