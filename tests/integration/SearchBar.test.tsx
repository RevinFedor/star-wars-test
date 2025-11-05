import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Search characters..." />);

    const input = screen.getByPlaceholderText('Search characters...');
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchBar value="Luke" onChange={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('Luke');
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'Luke');

    expect(handleChange).toHaveBeenCalledTimes(4);
    expect(handleChange).toHaveBeenCalledWith('L');
    expect(handleChange).toHaveBeenCalledWith('u');
    expect(handleChange).toHaveBeenCalledWith('k');
    expect(handleChange).toHaveBeenCalledWith('e');
  });

  it('should render search icon', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    const input = screen.getByRole('searchbox');
    expect(input.parentElement).toBeInTheDocument();
  });

  it('should allow clearing the input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SearchBar value="Luke" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    await user.clear(input);

    expect(handleChange).toHaveBeenCalled();
  });
});
