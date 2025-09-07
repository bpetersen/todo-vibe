import { strict as assert } from 'node:assert';
import { CompleteTodo } from './CompleteTodo';
import type { TodoCompleted, TodoEvent } from './events';

const todoId = '1';
const completedAt = new Date('2023-01-02T00:00:00Z');

{
  const history: TodoEvent[] = [
    { type: 'TodoCreated', data: { todoId, title: 'Test', createdAt: new Date('2023-01-01T00:00:00Z') } }
  ];
  const result: TodoCompleted[] = CompleteTodo({ todoId, completedAt, history });
  assert.deepStrictEqual(result, [
    { type: 'TodoCompleted', data: { todoId, completedAt } }
  ]);
}

{
  const history: TodoEvent[] = [
    { type: 'TodoCreated', data: { todoId, title: 'Test', createdAt: new Date('2023-01-01T00:00:00Z') } },
    { type: 'TodoCompleted', data: { todoId, completedAt: new Date('2023-01-02T00:00:00Z') } }
  ];
  assert.throws(() => CompleteTodo({ todoId, completedAt, history }), /completed/i);
}
