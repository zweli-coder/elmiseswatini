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
    const email = `bad-admin-${Date.now()}@example.com`;
    const password = 'password123';
    await request('/api/auth/register','POST',{ full_name: 'Bad Admin', email, password, role_id: 1 }, {'Content-Type':'application/json'});
    const login = await request('/api/auth/login','POST',{ email, password }, {'Content-Type':'application/json'});
    if (!login.body || !login.body.token) throw new Error('Login failed');
    const token = login.body.token;
    const badPayload = { data: [ { "Some Weird Column": "", "Another": "", "": "" } ] };
    const res = await request('/api/admin/statistics','POST', badPayload, {'Content-Type':'application/json','Authorization':`Bearer ${token}`});
    console.log('response', res.status, res.body);
  }catch(e){ console.error('ERR', e.message); process.exit(1);} 
})();
