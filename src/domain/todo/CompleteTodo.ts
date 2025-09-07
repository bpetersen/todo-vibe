import type { TodoCompleted } from './events';

export function CompleteTodo({ todoId, completedAt }: { todoId: string; completedAt: Date }): TodoCompleted[] {
  return [
    {
      type: 'TodoCompleted',
      data: { todoId, completedAt },
    },
  ];
}
