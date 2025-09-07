import { strict as assert } from 'node:assert';
import { CreateTodo } from './CreateTodo';
import type { TodoCreated } from './events';

const todoId = '1';
const title = 'Test';
const createdAt = new Date('2023-01-01T00:00:00Z');

{
  const result: TodoCreated[] = CreateTodo({ todoId, title, createdAt });

  assert.deepStrictEqual(result, [
    { type: 'TodoCreated', data: { todoId, title, createdAt } }
  ]);
}

assert.throws(() => CreateTodo({ todoId, title: '', createdAt }), /title/i);
