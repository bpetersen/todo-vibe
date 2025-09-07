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

- Currently no guard against double completion.

## TodoReopened

Emitted when a completed todo is reopened.

### Data

- `todoId`: string
- `reopenedAt`: Date

### Notes

- Only allowed if the todo was previously completed and not already reopened.
