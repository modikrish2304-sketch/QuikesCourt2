const fs = require('fs');
let code = fs.readFileSync('src/services/venueService.ts', 'utf-8');

code = code.replace(/city\?: string;/, `city?: string;
  location?: string;
  verifiedOnly?: boolean;`);

const filterLogic = `
      // Apply city filter
      if (params.city && params.city !== 'all') {
        matches = matches && v.city.toLowerCase() === params.city.toLowerCase();
      }

      // Apply location filter
      if (params.location && params.location !== 'all') {
        matches = matches && (v.location?.toLowerCase() === params.location.toLowerCase() || v.area?.toLowerCase() === params.location.toLowerCase());
      }
      
      // Apply verified filter
      if (params.verifiedOnly) {
        matches = matches && v.verifiedBadge === true;
      }
`;

code = code.replace(/\/\/ Apply city filter[\s\S]*?matches = matches && v\.city\.toLowerCase\(\) === params\.city\.toLowerCase\(\);\n      \}/, filterLogic);

fs.writeFileSync('src/services/venueService.ts', code);
console.log('Filters updated in venueService.ts');
