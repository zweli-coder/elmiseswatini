const http = require('http');
const data = JSON.stringify({email:'testadmin+upload@local.test', password:'Password123!'});
const opts = {hostname:'127.0.0.1', port:3001, path:'/api/auth/login', method:'POST', headers:{'Content-Type':'application/json','Content-Length': Buffer.byteLength(data)}};
const req = http.request(opts, res => { let body=''; res.on('data', d => body += d); res.on('end', () => { try { const parsed = JSON.parse(body); console.log(JSON.stringify(parsed)); } catch (e) { console.error('BAD', body); } });});
req.on('error', e => console.error('ERR', e.message));
req.write(data);
req.end();
