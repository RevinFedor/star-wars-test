import { useState, useEffect } from 'react';
import { fetchCharacter } from '@/api/swapi';
import { getCharacterEdits, hasCharacterEdits } from '@/api/localStorage';
import type { Character } from '@/api/types';

interface UseCharacterReturn {
  character: Character | null;
  isLoading: boolean;
  error: Error | null;
  hasLocalEdits: boolean;
  refetch: () => void;
}

/**
 * Хук для загрузки персонажа с учетом локальных изменений
 *
 * Объединяет данные из API с локальными изменениями из localStorage
 */
export const useCharacter = (characterId: string): UseCharacterReturn => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasLocalEdits, setHasLocalEdits] = useState(false);

  const loadCharacter = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Загружаем данные из API
      const apiData = await fetchCharacter(characterId);

      // Получаем локальные изменения
      const localEdits = getCharacterEdits(characterId);
      const hasEdits = hasCharacterEdits(characterId);

      // Объединяем данные: API + локальные изменения
      const mergedCharacter: Character = {
        ...apiData,
        ...(localEdits || {}),
      };

      setCharacter(mergedCharacter);
      setHasLocalEdits(hasEdits);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load character')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (characterId) {
      loadCharacter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  return {
    character,
    isLoading,
    error,
    hasLocalEdits,
    refetch: loadCharacter,
  };
};
