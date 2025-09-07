import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

export function createApp(db: Pool = new Pool({ connectionString: process.env.DATABASE_URL })) {
  return http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/lists') {
      const id = randomUUID();
      await db.query('INSERT INTO lists(id) VALUES($1)', [id]);
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
