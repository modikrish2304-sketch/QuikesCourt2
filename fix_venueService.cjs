const fs = require('fs');

let code = fs.readFileSync('src/services/venueService.ts', 'utf-8');

code = code.replace(/import { SEED_FACILITIES, SEED_COURTS, SEED_REVIEWS } from '\.\.\/data\/seedData';/,
`import { SEED_FACILITIES, SEED_COURTS, SEED_REVIEWS, SPORTS, CITIES } from '../data/seedData';`);

const newMethods = `
  getAllSports() {
    return SPORTS;
  },

  getAllCities() {
    return CITIES;
  },

  getLocationsByCity(cityId: string) {
    const city = CITIES.find(c => c.id === cityId || c.name === cityId);
    return city ? city.famousLocations : [];
  },
`;

code = code.replace(/export const venueService = {/, `export const venueService = {${newMethods}`);

fs.writeFileSync('src/services/venueService.ts', code);
console.log('Done');
