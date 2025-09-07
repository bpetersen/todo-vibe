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

  expect(await screen.findByText('Buy milk')).toBeInTheDocument();
});
