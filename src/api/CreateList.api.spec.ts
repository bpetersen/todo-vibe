import { beforeAll, afterAll, expect, test } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../server';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';
import { Pool } from 'pg';
import { runMigrations } from '../migrate';

let server: Server;
let url: string;
let db: Pool;
let pg: StartedTestContainer;

beforeAll(async () => {
  pg = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_DB: 'todos',
    })
    .withExposedPorts(5432)
    .start();

  const host = pg.getHost();
  const port = pg.getMappedPort(5432);
  db = new Pool({
    connectionString: `postgres://postgres:postgres@${host}:${port}/todos`,
  });
  await runMigrations(db);

  server = createApp(db);
  await new Promise(resolve => server.listen(0, resolve));
  const { port: serverPort } = server.address() as any;
  url = `http://localhost:${serverPort}`;
});

afterAll(async () => {
  await db.end();
  await pg.stop();
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
