import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { vi, afterEach } from 'vitest';

test('renders intro layout', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /todo vibe/i })).toBeInTheDocument();
  expect(
    screen.getByText(/organize your tasks with style/i)
  ).toBeInTheDocument();
});

const originalFetch = global.fetch;
const originalLocation = window.location;
const originalPrompt = window.prompt;

afterEach(() => {
  global.fetch = originalFetch;
  Object.defineProperty(window, 'location', { value: originalLocation });
  window.prompt = originalPrompt;
});

test('posts to create a new list with a name', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 'abc123' }),
  } as any);
  // @ts-expect-error: allow test-time override
  global.fetch = fetchMock;

  const promptMock = vi.fn().mockReturnValue('Groceries');
  window.prompt = promptMock as any;

  const assignMock = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { ...window.location, assign: assignMock },
    writable: true,
  });

  render(<App />);
  const button = screen.getByRole('button', { name: /start a new list/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(promptMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Groceries' }),
    });
    expect(assignMock).toHaveBeenCalledWith('/lists/abc123');
  });
});
