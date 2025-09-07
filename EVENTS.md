# Domain Events

## TodoCreated

Emitted when a todo is created.

### Data

- `todoId`: string
- `title`: string
- `createdAt`: Date

### Notes

- `title` must be non-empty; `CreateTodo` throws an error if the title is blank.

## TodoCompleted

Emitted when a todo is marked as completed.

### Data

- `todoId`: string
- `completedAt`: Date

### Notes

- `CompleteTodo` throws an error if the todo has already been completed.
