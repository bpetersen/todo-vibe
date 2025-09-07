import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { vi } from 'vitest';

test('renders intro layout', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /todo vibe/i })).toBeInTheDocument();
  expect(
    screen.getByText(/organize your tasks with style/i)
  ).toBeInTheDocument();
});

test('posts to create a new list', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 'abc123' }),
  } as any);
  // @ts-expect-error: allow test-time override
  global.fetch = fetchMock;

  const assignMock = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { ...window.location, assign: assignMock },
    writable: true,
  });

  render(<App />);
  const button = screen.getByRole('button', { name: /start a new list/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith('/api/lists', { method: 'POST' });
  });
});
