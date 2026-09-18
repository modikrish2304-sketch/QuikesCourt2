const fs = require('fs');

let code = fs.readFileSync('src/pages/owner/FacilityManagement.tsx', 'utf-8');

code = code.replace(/<div className="flex items-center gap-4">/, `<div className="flex items-center gap-4">
              <span className={\`px-3 py-1 rounded-full text-xs font-bold \${facility.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}\`}>
                {facility.status === 'approved' ? 'Active' : 'Pending Approval'}
              </span>`);

fs.writeFileSync('src/pages/owner/FacilityManagement.tsx', code);
