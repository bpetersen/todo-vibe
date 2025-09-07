import type { TodoCompleted, TodoEvent } from './events';

export function CompleteTodo(
  events: TodoEvent[],
  { todoId, completedAt }: { todoId: string; completedAt: Date }
): TodoCompleted[] {
  const alreadyCompleted = events.some(
    (e) => e.type === 'TodoCompleted' && e.data.todoId === todoId
  );
  if (alreadyCompleted) throw new Error('Todo already completed');

  return [
    {
      type: 'TodoCompleted',
      data: { todoId, completedAt },
    },
  ];
}
