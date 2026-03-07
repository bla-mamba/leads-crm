export default function handler(req: any, res: any) {
  const allowedIP = '213.252.230.97';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!ip || !ip.includes(allowedIP)) {
    res.status(403).send('Access Denied');
    return;
  }

  // Serve SPA content
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(process.cwd(), 'dist', 'index.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}