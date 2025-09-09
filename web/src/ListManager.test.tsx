import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import ListManager from './ListManager';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  window.prompt = originalPrompt;
  window.confirm = originalConfirm;
});

const originalPrompt = window.prompt;
const originalConfirm = window.confirm;

test('lists active lists ordered by creation date with counts', async () => {
  localStorage.setItem(
    'list:one',
    JSON.stringify({
      id: 'one',
      name: 'First',
      createdAt: '2024-01-01T00:00:00Z',
      todos: [
        { completed: false },
        { completed: true },
      ],
    }),
  );
  localStorage.setItem(
    'list:two',
    JSON.stringify({
      id: 'two',
      name: 'Second',
      createdAt: '2024-01-02T00:00:00Z',
      todos: [
        { completed: true },
      ],
    }),
  );
  localStorage.setItem(
    'list:arch',
    JSON.stringify({
      id: 'arch',
      name: 'Archived',
      createdAt: '2024-01-03T00:00:00Z',
      todos: [],
      archived: true,
    }),
  );

  render(<ListManager />);
  const items = await screen.findAllByRole('listitem');
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent('First');
  expect(items[0]).toHaveTextContent('1/2');
  expect(items[1]).toHaveTextContent('Second');
  expect(items[1]).toHaveTextContent('1/1');
});

test('creates a new list', async () => {
  const uuidMock = vi
    .spyOn(global.crypto, 'randomUUID')
    .mockReturnValue('newid');
  const promptMock = vi.fn().mockReturnValue('Chores');
  window.prompt = promptMock as any;

  render(<ListManager />);
  fireEvent.click(screen.getByRole('button', { name: /new list/i }));

  await waitFor(() => {
    expect(promptMock).toHaveBeenCalled();
    const saved = JSON.parse(localStorage.getItem('list:newid')!);
    expect(saved).toMatchObject({ id: 'newid', name: 'Chores', todos: [], archived: false });
    expect(saved.createdAt).toBeDefined();
    expect(uuidMock).toHaveBeenCalled();
  });
  await screen.findByRole('link', { name: 'Chores' });
});

test('renames a list', async () => {
  localStorage.setItem(
    'list:abc',
    JSON.stringify({ id: 'abc', name: 'Old', createdAt: '2024-01-01T00:00:00Z', todos: [] }),
  );
  const promptMock = vi.fn().mockReturnValue('New');
  window.prompt = promptMock as any;

  render(<ListManager />);
  fireEvent.click(screen.getByRole('button', { name: /rename/i }));

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('list:abc')!);
    expect(saved.name).toBe('New');
  });
  await screen.findByRole('link', { name: 'New' });
});

test('archives a list after confirmation', async () => {
  localStorage.setItem(
    'list:abc',
    JSON.stringify({ id: 'abc', name: 'Old', createdAt: '2024-01-01T00:00:00Z', todos: [] }),
  );
  const confirmMock = vi.fn().mockReturnValue(true);
  window.confirm = confirmMock as any;

  render(<ListManager />);
  fireEvent.click(screen.getByRole('button', { name: /archive/i }));

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('list:abc')!);
    expect(saved.archived).toBe(true);
    expect(confirmMock).toHaveBeenCalled();
  });
  expect(screen.queryByText('Old')).not.toBeInTheDocument();
});
