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

export interface TodoReopened {
  type: 'TodoReopened';
  data: {
    todoId: string;
    reopenedAt: Date;
  };
}

export type TodoEvent = TodoCreated | TodoCompleted | TodoReopened;
