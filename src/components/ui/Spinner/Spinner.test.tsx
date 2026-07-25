import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('exposes status role and optional label', () => {
    render(<Spinner label="Загрузка данных" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Загрузка данных')).toBeInTheDocument();
  });
});
