const fs = require('fs');
const fileData = fs.readFileSync('sample_stats.csv');
const body = new FormData();
body.append('title', 'Test Upload');
body.append('description', 'Test CSV Upload');
body.append('category', 'Statistics');
body.append('year', '2015');
body.append('file', new Blob([fileData], { type: 'text/csv' }), 'sample_stats.csv');
(async () => {
  const res = await fetch('http://127.0.0.1:3001/api/admin/statistics-file', {
    method: 'POST',
    headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDEsInJvbGUiOjEsImlhdCI6MTc4MDY0NDk5MiwiZXhwIjoxNzgwNzMxMzkyfQ.4BGp3HkwgobbAJV7kgqeEA0veAeDTQSb8acsq2Mpaao' },
    body,
  });
  const text = await res.text();
  console.log(res.status, text);
})();
