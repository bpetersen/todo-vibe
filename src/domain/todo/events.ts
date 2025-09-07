export interface TodoCreated {
  type: 'TodoCreated';
  data: {
    todoId: string;
    title: string;
    createdAt: Date;
  };
}

export type TodoEvent = TodoCreated;
