import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

export function createApp(db: Pool = new Pool({ connectionString: process.env.DATABASE_URL })) {
  return http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/lists') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { name } = body ? JSON.parse(body) : { name: 'New List' };
      const id = randomUUID();
      await db.query('INSERT INTO lists(id, name) VALUES($1, $2)', [id, name]);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id }));
      return;
    }

    const match = req.url?.match(/^\/api\/lists\/([\w-]+)$/);
    if (req.method === 'GET' && match) {
      const id = match[1];
      const { rows } = await db.query('SELECT id, name FROM lists WHERE id = $1', [id]);
      if (rows.length === 0) {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows[0]));
      return;
    }

    res.statusCode = 404;
    res.end();
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
