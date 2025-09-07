import type { TodoEvent, TodoReopened } from './events';

export function ReopenTodo({
  todoId,
  reopenedAt,
  history,
}: {
  todoId: string;
  reopenedAt: Date;
  history: TodoEvent[];
}): TodoReopened[] {
  let completed = false;
  for (const event of history) {
    if (event.type === 'TodoCompleted') completed = true;
    if (event.type === 'TodoReopened') completed = false;
  }
  if (!completed) {
    throw new Error('todo is not completed');
  }
  return [
    {
      type: 'TodoReopened',
      data: { todoId, reopenedAt },
    },
  ];
}
