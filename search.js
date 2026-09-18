const https = require('https');
https.get('https://lite.duckduckgo.com/lite/?q=site:unsplash.com+pickleball', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/unsplash\.com\/photos\/([a-zA-Z0-9-]+)/g);
    console.log(matches ? matches.slice(0, 5) : 'no matches');
  });
});
