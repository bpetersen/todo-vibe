import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import List from './List';

const originalLocation = window.location;

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation });
  localStorage.clear();
  vi.restoreAllMocks();
});

test('renders list name from local storage', async () => {
  localStorage.setItem(
    'list:abc123',
    JSON.stringify({ id: 'abc123', name: 'Groceries', todos: [] })
  );

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  await screen.findByRole('heading', { name: 'Groceries' });
  expect(screen.getByPlaceholderText(/add a todo/i)).toBeInTheDocument();
});

test('adds a new todo and displays it', async () => {
  localStorage.setItem(
    'list:abc123',
    JSON.stringify({ id: 'abc123', name: 'Groceries', todos: [] })
  );

  const uuidMock = vi
    .spyOn(global.crypto, 'randomUUID')
    .mockReturnValue('todo123');

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  const input = await screen.findByPlaceholderText(/add a todo/i);
  fireEvent.change(input, { target: { value: 'Buy milk' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('list:abc123')!);
    expect(saved.todos[0].id).toBe('todo123');
    expect(saved.todos[0].title).toBe('Buy milk');
    expect(saved.todos[0].completed).toBe(false);
    expect(saved.todos[0].events[0].type).toBe('TodoCreated');
    expect(uuidMock).toHaveBeenCalled();
  });
  const label = await screen.findByText('Buy milk');
  expect(label).toBeInTheDocument();
  expect(label.closest('li')).toHaveClass('todo-item');
});

test('checks off a todo and persists completion', async () => {
  localStorage.setItem(
    'list:abc123',
    JSON.stringify({
      id: 'abc123',
      name: 'Groceries',
      todos: [{ id: 'todo123', title: 'Buy milk', completed: false, events: [] }],
    })
  );

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  const checkbox = await screen.findByRole('checkbox', { name: /buy milk/i });
  fireEvent.click(checkbox);

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('list:abc123')!);
    expect(saved.todos[0].completed).toBe(true);
    expect(saved.todos[0].events[0].type).toBe('TodoCompleted');
  });

  expect(checkbox).toBeChecked();
});

test('reorders todos via drag and drop', async () => {
  localStorage.setItem(
    'list:abc123',
    JSON.stringify({
      id: 'abc123',
      name: 'Groceries',
      todos: [
        { id: 'todo1', title: 'A', completed: false, events: [] },
        { id: 'todo2', title: 'B', completed: false, events: [] },
      ],
    })
  );

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  const first = await screen.findByText('A');
  const second = await screen.findByText('B');
  const firstLi = first.closest('li')!;
  const secondLi = second.closest('li')!;
  const data: DataTransfer = {
    dropEffect: 'none',
    effectAllowed: 'all',
    files: [],
    items: [] as any,
    types: [],
    setData: () => {},
    getData: () => '',
    clearData: () => {},
    setDragImage: () => {},
  };
  fireEvent.dragStart(secondLi, { dataTransfer: data });
  await waitFor(() => expect(secondLi).toHaveClass('dragging'));
  fireEvent.dragOver(firstLi, { dataTransfer: data });
  await waitFor(() => {
    const duringDrag = screen.getAllByRole('listitem');
    expect(duringDrag[0]).toHaveTextContent('B');
  });
  fireEvent.drop(firstLi, { dataTransfer: data });
  await waitFor(() => expect(secondLi).not.toHaveClass('dragging'));

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('list:abc123')!);
    expect(saved.todos[0].id).toBe('todo2');
    expect(saved.todos[0].events[0].type).toBe('TodoReordered');
  });

  const items = screen.getAllByRole('listitem');
  expect(items[0]).toHaveTextContent('B');
});
