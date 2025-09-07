export function CreateTodo({ todoId, title, createdAt }: { todoId: string; title: string; createdAt: Date }) {
  if (!title.trim()) {
    throw new Error('title must be non-empty');
  }

  return [{ type: 'TodoCreated', data: { todoId, title, createdAt } }];
}
