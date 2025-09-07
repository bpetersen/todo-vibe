import http from 'node:http';
import { randomUUID } from 'node:crypto';

export function createApp() {
  return http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/lists') {
      const id = randomUUID();
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id }));
      return;
    }
    res.statusCode = 404;
    res.end();
  });
}

if (import.meta.main) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
