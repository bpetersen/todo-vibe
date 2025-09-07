import type { TodoCreated } from './events';

export function CreateTodo({ todoId, title, createdAt }: { todoId: string; title: string; createdAt: Date }): TodoCreated[] {
  if (!title.trim()) {
    throw new Error('title must be non-empty');
  }

  const event: TodoCreated = { type: 'TodoCreated', data: { todoId, title, createdAt } };
  return [event];
}
