import { useState, useEffect } from 'react';

/**
 * Хук для загрузки изображения персонажа из Akabab Star Wars API
 * ID совпадают с SWAPI, поэтому можно использовать тот же ID
 */
export const useCharacterImage = (characterId: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!characterId) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://akabab.github.io/starwars-api/api/id/${characterId}.json`
        );

        if (!response.ok) {
          throw new Error('Failed to load character image');
        }

        const data = await response.json();
        setImageUrl(data.image || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [characterId]);

  return { imageUrl, isLoading, error };
};
