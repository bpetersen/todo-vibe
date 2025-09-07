import { CreateTodo } from './CreateTodo';

describe('CreateTodo', () => {
  it('emits TodoCreated with todoId, title, createdAt', () => {
    const todoId = 'todo-1';
    const title = 'write test';
    const createdAt = new Date('2024-01-01T00:00:00Z');

    const events = CreateTodo({ todoId, title, createdAt });

    expect(events).toEqual([
      {
        type: 'TodoCreated',
        todoId,
        title,
        createdAt,
      },
    ]);
  });
});
