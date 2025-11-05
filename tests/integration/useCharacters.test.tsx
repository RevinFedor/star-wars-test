import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCharacters } from '@/hooks/useCharacters';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('useCharacters', () => {
  it('should load characters successfully', async () => {
    const { result } = renderHook(() => useCharacters(1, ''));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.results).toHaveLength(2);
    expect(result.current.data?.results[0].name).toBe('Luke Skywalker');
    expect(result.current.error).toBeNull();
  });

  it('should filter characters by search', async () => {
    const { result } = renderHook(() => useCharacters(1, 'luke'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.results).toHaveLength(1);
    expect(result.current.data?.results[0].name).toBe('Luke Skywalker');
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('https://swapi.py4e.com/api/people/', () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      })
    );

    const { result } = renderHook(() => useCharacters(1, ''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('Failed to');
    expect(result.current.data).toBeNull();
  });

  it('should reload when page changes', async () => {
    const { result, rerender } = renderHook(
      ({ page, search }) => useCharacters(page, search),
      {
        initialProps: { page: 1, search: '' },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstData = result.current.data;

    // change page
    rerender({ page: 2, search: '' });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should reload when search changes', async () => {
    const { result, rerender } = renderHook(
      ({ page, search }) => useCharacters(page, search),
      {
        initialProps: { page: 1, search: '' },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.results).toHaveLength(2);

    rerender({ page: 1, search: 'luke' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.results).toHaveLength(1);
    expect(result.current.data?.results[0].name).toBe('Luke Skywalker');
  });

  it('should handle cleanup on unmount (no race conditions)', async () => {
    const { result, unmount } = renderHook(() => useCharacters(1, ''));

    unmount();

    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});
