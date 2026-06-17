const http = require('http');

function request(path, method='GET', body=null, headers={}){
  return new Promise((resolve,reject)=>{
    const opts = { hostname: '127.0.0.1', port: 3001, path, method, headers };
    const req = http.request(opts, res=>{
      let b=''; res.on('data', d=> b+=d); res.on('end', ()=>{
        let parsed = b ? (()=>{ try{ return JSON.parse(b);}catch(e){return b;} })() : null;
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async ()=>{
  try{
    const email = `test-admin-${Date.now()}@example.com`;
    const password = 'password123';
    console.log('Registering admin', email);
    const reg = await request('/api/auth/register','POST',{ full_name: 'Test Admin', email, password, role_id: 1 }, {'Content-Type':'application/json'});
    console.log('register', reg.status, reg.body);

    console.log('Logging in...');
    const login = await request('/api/auth/login','POST',{ email, password }, {'Content-Type':'application/json'});
    console.log('login', login.status, login.body);
    if (!login.body || !login.body.token) throw new Error('Login failed');
    const token = login.body.token;

    console.log('Posting statistics with admin token...');
    const payload = { data: [ { year: '2025', category: 'Test Upload', industry: 'Testing', region: 'Manzini', value: 314 } ] };
    const post = await request('/api/admin/statistics','POST', payload, {'Content-Type':'application/json', 'Authorization': `Bearer ${token}`});
    console.log('post', post.status, post.body);

    console.log('Done. Fetching raw rows to confirm...');
    const raw = await request('/api/statistics/raw');
    console.log('raw', raw.status, raw.body ? raw.body.slice(-5) : raw.body);
  }catch(e){ console.error('ERROR', e.message); process.exit(1);} 
})();
