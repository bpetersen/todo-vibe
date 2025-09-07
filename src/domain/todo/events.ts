export interface TodoCreated {
  type: 'TodoCreated';
  data: {
    todoId: string;
    title: string;
    createdAt: Date;
  };
}

export interface TodoCompleted {
  type: 'TodoCompleted';
  data: {
    todoId: string;
    completedAt: Date;
  };
}

export type TodoEvent = TodoCreated | TodoCompleted;
