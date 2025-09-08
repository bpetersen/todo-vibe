import type { TodoEvent, TodoReordered } from './events';

export function ReorderTodo({
  todoId,
  toIndex,
  history,
}: {
  todoId: string;
  toIndex: number;
  history: TodoEvent[];
}): TodoReordered[] {
  const order: string[] = [];
  for (const event of history) {
    if (event.type === 'TodoCreated') {
      order.push(event.data.todoId);
    } else if (event.type === 'TodoReordered') {
      const { fromIndex, toIndex } = event.data;
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
    }
  }
  const fromIndex = order.indexOf(todoId);
  if (fromIndex === -1) throw new Error('todo does not exist');
  if (toIndex < 0 || toIndex >= order.length) throw new Error('index out of bounds');
  if (fromIndex === toIndex) return [];
  return [
    {
      type: 'TodoReordered',
      data: { todoId, fromIndex, toIndex },
    },
  ];
}
