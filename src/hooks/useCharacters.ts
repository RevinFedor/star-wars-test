import { useState, useEffect } from 'react';
import { fetchCharacters } from '@/api/swapi';
import type { Character, ApiResponse } from '@/api/types';

interface UseCharactersReturn {
  data: ApiResponse<Character> | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Хук для загрузки списка персонажей с пагинацией и поиском
 */
export const useCharacters = (
  page: number,
  search: string
): UseCharactersReturn => {
  const [data, setData] = useState<ApiResponse<Character> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCharacters = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await fetchCharacters(page, search);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Failed to load characters')
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCharacters();

    // Cleanup function чтобы избежать race conditions
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  return { data, isLoading, error };
};
