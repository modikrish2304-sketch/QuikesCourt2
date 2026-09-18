const fs = require('fs');

let code = fs.readFileSync('src/services/facilityService.ts', 'utf-8');

code = code.replace(/verifiedBadge: true,/, `verifiedBadge: false,`);
code = code.replace(/status: 'approved',/, `status: 'pending',`);

fs.writeFileSync('src/services/facilityService.ts', code);
console.log('Fixed facilityService.ts');
