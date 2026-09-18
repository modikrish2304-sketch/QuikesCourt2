const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf-8');

const newSportType = `export type SportType = string;`;

code = code.replace(/export type SportType =[\s\S]*?\| 'Squash';/, newSportType);

fs.writeFileSync('src/types/index.ts', code);
console.log('Done');
