import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import List from './List';

test('renders layout for a new todo list', () => {
  render(<List />);
  expect(screen.getByRole('heading', { name: /new list/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/add a todo/i)).toBeInTheDocument();
});
