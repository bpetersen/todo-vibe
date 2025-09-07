import { strict as assert } from 'node:assert';
import { ReopenTodo } from './ReopenTodo';
import type { TodoEvent, TodoReopened } from './events';

const todoId = '1';
const reopenedAt = new Date('2023-01-03T00:00:00Z');

{
  const history: TodoEvent[] = [
    { type: 'TodoCreated', data: { todoId, title: 'Test', createdAt: new Date('2023-01-01T00:00:00Z') } },
    { type: 'TodoCompleted', data: { todoId, completedAt: new Date('2023-01-02T00:00:00Z') } }
  ];

  const result: TodoReopened[] = ReopenTodo({ todoId, reopenedAt, history });
  assert.deepStrictEqual(result, [
    { type: 'TodoReopened', data: { todoId, reopenedAt } }
  ]);
}

{
  const history: TodoEvent[] = [
    { type: 'TodoCreated', data: { todoId, title: 'Test', createdAt: new Date('2023-01-01T00:00:00Z') } }
  ];

  assert.throws(() => ReopenTodo({ todoId, reopenedAt, history }), /completed/i);
}
