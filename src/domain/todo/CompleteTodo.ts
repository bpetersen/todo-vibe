import type { TodoCompleted, TodoEvent } from './events';

export function CompleteTodo({
  todoId,
  completedAt,
  history,
}: {
  todoId: string;
  completedAt: Date;
  history: TodoEvent[];
}): TodoCompleted[] {
  const alreadyCompleted = history.some(
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
