const fs = require('fs');

let code = fs.readFileSync('src/services/venueService.ts', 'utf-8');

code = code.replace(/f\.status === 'approved' \|\| f\.status === undefined \|\| \(f as any\)\.approved !== false/g, "f.status === 'approved'");
code = code.replace(/f\.status === 'approved' \|\| \(f as any\)\.approved !== false/g, "f.status === 'approved'");

fs.writeFileSync('src/services/venueService.ts', code);
console.log('Fixed venueService status check');
