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

test('PATCH /api/todos/:id sets completed to true', async () => {
  const listRes = await fetch(`${url}/api/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Groceries' }),
  });
  const { id: listId } = await listRes.json();

  const createRes = await fetch(`${url}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, title: 'Buy milk' }),
  });
  const { id: todoId } = await createRes.json();

  const getRes = await fetch(`${url}/api/todos/${todoId}`);
  const todo = await getRes.json();
  expect(todo.completed).toBe(false);

  const patchRes = await fetch(`${url}/api/todos/${todoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  });
  expect(patchRes.status).toBe(204);

  const getRes2 = await fetch(`${url}/api/todos/${todoId}`);
  const todo2 = await getRes2.json();
  expect(todo2.completed).toBe(true);
});
