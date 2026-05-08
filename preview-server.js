const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 4567;
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.png':'image/png', '.pdf':'application/pdf' };
http.createServer((req, res) => {
  let file = path.join(__dirname, req.url === '/' ? '/email-preview.html' : req.url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Preview server on port ${PORT}`));
