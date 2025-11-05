import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 300 },
      }
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second', delay: 300 });

    expect(result.current).toBe('first');

    await waitFor(
      () => {
        expect(result.current).toBe('second');
      },
      { timeout: 400 }
    );
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 300 },
      }
    );

    rerender({ value: 'second', delay: 300 });
    rerender({ value: 'third', delay: 300 });
    rerender({ value: 'fourth', delay: 300 });

    expect(result.current).toBe('first');

    await waitFor(
      () => {
        expect(result.current).toBe('fourth');
      },
      { timeout: 400 }
    );
  });

  it('should respect custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 100 },
      }
    );

    rerender({ value: 'second', delay: 100 });

    await waitFor(
      () => {
        expect(result.current).toBe('second');
      },
      { timeout: 200 }
    );
  });
});
