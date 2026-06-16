const http = require('http');
const data = JSON.stringify({full_name:'LMIS Test Admin', email:'testadmin+upload@local.test', password:'Password123!', role_id:1});
const opts = {hostname:'127.0.0.1', port:3001, path:'/api/auth/register', method:'POST', headers:{'Content-Type':'application/json','Content-Length': Buffer.byteLength(data)}};
const req = http.request(opts, res => { let body=''; res.on('data', d => body += d); res.on('end', () => console.log(body));});
req.on('error', e => console.error('ERR', e.message));
req.write(data);
req.end();
