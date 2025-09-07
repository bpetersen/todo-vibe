import { render, screen, waitFor } from '@testing-library/react';
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
