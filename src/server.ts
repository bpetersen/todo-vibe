import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { CreateTodo } from './domain/todo/CreateTodo';
import { CompleteTodo } from './domain/todo/CompleteTodo';
import { ReorderTodo } from './domain/todo/ReorderTodo';

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
      const {
        rows: [{ pos }],
      } = await db.query('SELECT COALESCE(MAX(position) + 1, 0) AS pos FROM todos WHERE list_id = $1', [listId]);
      await db.query(
        'INSERT INTO todos(id, list_id, title, created_at, completed, position) VALUES($1, $2, $3, $4, false, $5)',
        [id, listId, title, createdAt, pos]
      );
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id }));
      return;
    }

    const todoMatch = req.url?.match(/^\/api\/todos\/([\w-]+)$/);
    if (req.method === 'GET' && todoMatch) {
      const id = todoMatch[1];
      const { rows } = await db.query(
        'SELECT id, list_id, title, completed FROM todos WHERE id = $1',
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
        JSON.stringify({ id: row.id, title: row.title, listId: row.list_id, completed: row.completed })
      );
      return;
    }

      if (req.method === 'PATCH' && todoMatch) {
        const id = todoMatch[1];
        let body = '';
        for await (const chunk of req) body += chunk;
        const { completed } = JSON.parse(body);
        if (completed) {
          CompleteTodo({ todoId: id, completedAt: new Date(), history: [] });
        }
        await db.query('UPDATE todos SET completed = $1 WHERE id = $2', [completed, id]);
        res.statusCode = 204;
        res.end();
        return;
      }

    const reorderMatch = req.url?.match(/^\/api\/lists\/([\w-]+)\/todos\/([\w-]+)\/reorder$/);
    if (req.method === 'PATCH' && reorderMatch) {
      const [_, listId, todoId] = reorderMatch;
      let body = '';
      for await (const chunk of req) body += chunk;
      const { toIndex } = JSON.parse(body);
      const {
        rows: all,
      } = await db.query('SELECT id FROM todos WHERE list_id = $1 ORDER BY position', [listId]);
      const history = all.map((r: any) => ({
        type: 'TodoCreated',
        data: { todoId: r.id, title: '', createdAt: new Date() },
      }));
      const events = ReorderTodo({ todoId, toIndex, history });
      if (events.length === 0) {
        res.statusCode = 204;
        res.end();
        return;
      }
      const { fromIndex } = events[0].data;
      await db.query('BEGIN');
      try {
        if (toIndex > fromIndex) {
          await db.query(
            'UPDATE todos SET position = position - 1 WHERE list_id = $1 AND position > $2 AND position <= $3',
            [listId, fromIndex, toIndex]
          );
        } else {
          await db.query(
            'UPDATE todos SET position = position + 1 WHERE list_id = $1 AND position >= $2 AND position < $3',
            [listId, toIndex, fromIndex]
          );
        }
        await db.query('UPDATE todos SET position = $1 WHERE id = $2', [toIndex, todoId]);
        await db.query('COMMIT');
      } catch (err) {
        await db.query('ROLLBACK');
        throw err;
      }
      res.statusCode = 204;
      res.end();
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
