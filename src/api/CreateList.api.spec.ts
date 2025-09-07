import { beforeAll, afterAll, expect, test } from 'vitest';
import type { Server } from 'node:http';
import { Pool } from 'pg';
import { createApp } from '../server';

let server: Server;
let url: string;
let db: Pool;

beforeAll(async () => {
  db = new Pool({ connectionString: process.env.DATABASE_URL });
  await db.query('DROP TABLE IF EXISTS lists');
  await db.query('CREATE TABLE lists (id uuid primary key)');

  server = createApp(db);
  await new Promise(resolve => server.listen(0, resolve));
  const { port } = server.address() as any;
  url = `http://localhost:${port}`;
});

afterAll(async () => {
  await db.end();
  server.close();
});

test('POST /api/lists returns an id and stores it', async () => {
  const res = await fetch(`${url}/api/lists`, { method: 'POST' });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body).toMatchObject({ id: expect.any(String) });
  const saved = await db.query('SELECT id FROM lists WHERE id = $1', [body.id]);
  expect(saved.rowCount).toBe(1);
});
