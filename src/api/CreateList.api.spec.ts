import { beforeAll, afterAll, expect, test } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../server';

let server: Server;
let url: string;

beforeAll(async () => {
  server = createApp();
  await new Promise(resolve => server.listen(0, resolve));
  const { port } = server.address() as any;
  url = `http://localhost:${port}`;
});

afterAll(() => {
  server.close();
});

test('POST /api/lists returns an id', async () => {
  const res = await fetch(`${url}/api/lists`, { method: 'POST' });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body).toMatchObject({ id: expect.any(String) });
});
