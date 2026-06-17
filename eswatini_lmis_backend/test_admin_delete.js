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
    const email = `del-admin-${Date.now()}@example.com`;
    const password = 'password123';
    await request('/api/auth/register','POST',{ full_name: 'Delete Admin', email, password, role_id: 1 }, {'Content-Type':'application/json'});
    const login = await request('/api/auth/login','POST',{ email, password }, {'Content-Type':'application/json'});
    const token = login.body.token;
    // create a row
    await request('/api/admin/statistics','POST',{ data: [ { year: '2099', category: 'Delete Test', industry: 'X', region: 'Nowhere', value: 1 } ] }, {'Content-Type':'application/json','Authorization': `Bearer ${token}`});
    const raw = await request('/api/statistics/raw');
    const last = raw.body[raw.body.length-1];
    console.log('Inserted id', last.id);
    const del = await request(`/api/admin/statistics/${last.id}`,'DELETE', null, {'Authorization': `Bearer ${token}`});
    console.log('delete', del.status, del.body);
    const raw2 = await request('/api/statistics/raw');
    console.log('still present?', raw2.body.find(r=>r.id===last.id));
  }catch(e){ console.error('ERR', e.message); process.exit(1);} 
})();
