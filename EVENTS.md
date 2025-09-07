# Domain Events

## TodoCreated

Emitted when a todo is created.

### Data

- `todoId`: string
- `title`: string
- `createdAt`: Date

### Notes

- `title` must be non-empty; `CreateTodo` throws an error if the title is blank.
