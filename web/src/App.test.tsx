import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders app title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /todo vibe/i })).toBeInTheDocument();
});
