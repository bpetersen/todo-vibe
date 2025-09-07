import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders intro layout', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /todo vibe/i })).toBeInTheDocument();
  expect(
    screen.getByText(/organize your tasks with style/i)
  ).toBeInTheDocument();
});
