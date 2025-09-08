import { strict as assert } from 'node:assert';
import { ReorderTodo } from './ReorderTodo';
import type { TodoEvent, TodoReordered } from './events';

const history: TodoEvent[] = [
  { type: 'TodoCreated', data: { todoId: 'a', title: 'A', createdAt: new Date('2023-01-01T00:00:00Z') } },
  { type: 'TodoCreated', data: { todoId: 'b', title: 'B', createdAt: new Date('2023-01-01T00:00:01Z') } },
  { type: 'TodoCreated', data: { todoId: 'c', title: 'C', createdAt: new Date('2023-01-01T00:00:02Z') } },
];

{
  const result: TodoReordered[] = ReorderTodo({ todoId: 'c', toIndex: 0, history });
  assert.deepStrictEqual(result, [
    { type: 'TodoReordered', data: { todoId: 'c', fromIndex: 2, toIndex: 0 } },
  ]);
}

assert.deepStrictEqual(ReorderTodo({ todoId: 'a', toIndex: 0, history }), []);

assert.throws(() => ReorderTodo({ todoId: 'x', toIndex: 0, history }), /exist/i);
