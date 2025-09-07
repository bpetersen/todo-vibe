export function CreateTodo({ todoId, title, createdAt }: { todoId: string; title: string; createdAt: Date }) {
  return [{ type: 'TodoCreated', data: { todoId, title, createdAt } }];
}
