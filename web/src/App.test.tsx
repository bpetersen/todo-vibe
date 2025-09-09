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
const originalBlob = global.Blob;

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation });
  window.prompt = originalPrompt;
  global.crypto.randomUUID = originalUUID;
  global.Blob = originalBlob;
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

test('downloads all lists as a json file', async () => {
  localStorage.setItem(
    'list:l1',
    JSON.stringify({ id: 'l1', name: 'Groceries', todos: [] })
  );
  localStorage.setItem(
    'list:l2',
    JSON.stringify({ id: 'l2', name: 'Chores', todos: [] })
  );

  let blobContent = '';
  global.Blob = class {
    constructor(parts: any[]) {
      blobContent = String(parts[0]);
    }
  } as any;

  const urlSpy = vi.fn().mockReturnValue('blob:mock');
  global.URL.createObjectURL = urlSpy;
  global.URL.revokeObjectURL = vi.fn();
  const clickMock = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /download state/i }));

  await waitFor(() => {
    expect(urlSpy).toHaveBeenCalled();
    expect(JSON.parse(blobContent)).toEqual([
      { id: 'l1', name: 'Groceries', todos: [] },
      { id: 'l2', name: 'Chores', todos: [] },
    ]);
    expect(clickMock).toHaveBeenCalled();
  });
});
