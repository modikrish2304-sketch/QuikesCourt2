const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const cityParam = searchParams\.get\('city'\) \|\| 'all';/,
`const cityParam = searchParams.get('city') || 'all';
      const locationParam = searchParams.get('location') || 'all';`);

code = code.replace(/<VenuesPage[\s\S]*?initialQuery=\{qParam\}[\s\S]*?\/>/,
`<VenuesPage
          onNavigate={navigate}
          initialSport={sportParam}
          initialCity={cityParam}
          initialLocation={locationParam}
          initialQuery={qParam}
        />`);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
