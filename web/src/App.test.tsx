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
  expect(
    screen.getByRole('button', { name: /start a new list/i })
  ).toHaveClass('start-button');
});

const originalLocation = window.location;
const originalPrompt = window.prompt;
const originalUUID = global.crypto.randomUUID;

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation });
  window.prompt = originalPrompt;
  global.crypto.randomUUID = originalUUID;
  localStorage.clear();
  vi.restoreAllMocks();
});

test('stores a new list in local storage with a name', async () => {
  const uuidMock = vi
    .spyOn(global.crypto, 'randomUUID')
    .mockReturnValue('abc123');

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
    expect(uuidMock).toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledWith('/lists/abc123');
    const saved = JSON.parse(localStorage.getItem('list:abc123')!);
    expect(saved).toEqual({ id: 'abc123', name: 'Groceries', todos: [] });
  });
});
