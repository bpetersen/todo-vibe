import { strict as assert } from 'node:assert';
import { CompleteTodo } from './CompleteTodo';
import type { TodoCompleted } from './events';

const todoId = '1';
const completedAt = new Date('2023-01-02T00:00:00Z');

{
  const result: TodoCompleted[] = CompleteTodo({ todoId, completedAt });
  assert.deepStrictEqual(result, [
    { type: 'TodoCompleted', data: { todoId, completedAt } }
  ]);
}
