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

## TodoReopened

Emitted when a completed todo is reopened.

### Data

- `todoId`: string
- `reopenedAt`: Date

### Notes

- Only allowed if the todo was previously completed and not already reopened.

## TodoReordered

Emitted when a todo is moved to a new position within its list.

### Data

- `todoId`: string
- `fromIndex`: number
- `toIndex`: number

### Notes

- No event is emitted if the todo stays in the same position.
