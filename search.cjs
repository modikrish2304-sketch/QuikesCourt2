const https = require('https');
const qs = require('querystring');
const postData = qs.stringify({ q: 'site:unsplash.com pickleball photo' });
const options = {
  hostname: 'lite.duckduckgo.com',
  path: '/lite/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/unsplash\.com\/photos\/([a-zA-Z0-9-]+)/g);
    console.log(matches ? [...new Set(matches)].slice(0, 5) : 'no matches');
  });
});
req.write(postData);
req.end();
