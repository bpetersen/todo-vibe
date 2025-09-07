import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import List from './List';

const originalFetch = global.fetch;
const originalLocation = window.location;

afterEach(() => {
  global.fetch = originalFetch;
  Object.defineProperty(window, 'location', { value: originalLocation });
});

test('renders list name fetched from the server', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 'abc123', name: 'Groceries' }),
  } as any);
  // @ts-expect-error test override
  global.fetch = fetchMock;

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  await screen.findByRole('heading', { name: 'Groceries' });
  expect(fetchMock).toHaveBeenCalledWith('/api/lists/abc123');
  expect(screen.getByPlaceholderText(/add a todo/i)).toBeInTheDocument();
});

test('posts to create a new todo and displays it', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      json: () => Promise.resolve({ id: 'abc123', name: 'Groceries' }),
    } as any)
    .mockResolvedValueOnce({
      json: () => Promise.resolve({ id: 'todo123' }),
    } as any);
  // @ts-expect-error test override
  global.fetch = fetchMock;

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  const input = await screen.findByPlaceholderText(/add a todo/i);
  fireEvent.change(input, { target: { value: 'Buy milk' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId: 'abc123', title: 'Buy milk' }),
    });
  });
  const label = await screen.findByText('Buy milk');
  expect(label).toBeInTheDocument();
  expect(label.closest('li')).toHaveClass('todo-item');
});

test('checks off a todo and sends completion to the server', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      json: () => Promise.resolve({ id: 'abc123', name: 'Groceries' }),
    } as any)
    .mockResolvedValueOnce({
      json: () => Promise.resolve({ id: 'todo123' }),
    } as any)
    .mockResolvedValue({ ok: true } as any);
  // @ts-expect-error test override
  global.fetch = fetchMock;

  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: '/lists/abc123' },
    writable: true,
  });

  render(<List />);

  const input = await screen.findByPlaceholderText(/add a todo/i);
  fireEvent.change(input, { target: { value: 'Buy milk' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  const checkbox = await screen.findByRole('checkbox', { name: /buy milk/i });
  fireEvent.click(checkbox);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenLastCalledWith('/api/todos/todo123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
  });

  expect(checkbox).toBeChecked();
});
