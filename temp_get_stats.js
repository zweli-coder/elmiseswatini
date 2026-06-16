const http = require('http');
const opts = { hostname: '127.0.0.1', port: 3001, path: '/api/statistics/raw', method: 'GET' };
const req = http.request(opts, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});
req.on('error', e => console.error('ERR', e.message));
req.end();
