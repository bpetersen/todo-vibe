import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { CreateTodo } from './domain/todo/CreateTodo';

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

    if (req.method === 'POST' && req.url === '/api/todos') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { listId, title } = body ? JSON.parse(body) : { title: '' };
      const id = randomUUID();
      const createdAt = new Date();
      CreateTodo({ todoId: id, title, createdAt });
      await db.query(
        'INSERT INTO todos(id, list_id, title, created_at) VALUES($1, $2, $3, $4)',
        [id, listId, title, createdAt]
      );
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id }));
      return;
    }

    const todoMatch = req.url?.match(/^\/api\/todos\/([\w-]+)$/);
    if (req.method === 'GET' && todoMatch) {
      const id = todoMatch[1];
      const { rows } = await db.query(
        'SELECT id, list_id, title FROM todos WHERE id = $1',
        [id]
      );
      if (rows.length === 0) {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const row = rows[0];
      res.end(
        JSON.stringify({ id: row.id, title: row.title, listId: row.list_id })
      );
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
