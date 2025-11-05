import { useState, useEffect } from 'react';
import { extractIdFromUrl, extractResourceType } from '@/lib/formatters';

interface ResourceData {
  name?: string;
  title?: string; 
}

/**
 * Хук для resolve SWAPI URL в читаемое название
 * Вариант C (гибридный): показываем ID сразу, загружаем название асинхронно
 */
export const useResourceName = (url: string) => {
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    // Показываем ID сразу как fallback
    const id = extractIdFromUrl(url);
    const resourceType = extractResourceType(url);
    const fallbackName = resourceType ? `${resourceType} #${id}` : id;

    setName(fallbackName);
    setIsLoading(true);

    // Загружаем реальное название асинхронно
    const loadName = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data: ResourceData = await response.json();

        // Films используют "title", остальные "name"
        const resourceName = data.title || data.name || fallbackName;
        setName(resourceName);
      } catch (error) {
        // Оставляем fallback если загрузка не удалась
        console.error('Failed to load resource name:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadName();
  }, [url]);

  return { name, isLoading };
};

/**
 * Хук для загрузки нескольких ресурсов
 */
export const useResourceNames = (urls: string[]) => {
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setNames([]);
      setIsLoading(false);
      return;
    }

    // Показываем IDs сразу
    const fallbackNames = urls.map(url => {
      const id = extractIdFromUrl(url);
      const resourceType = extractResourceType(url);
      return resourceType ? `${resourceType} #${id}` : id;
    });

    setNames(fallbackNames);
    setIsLoading(true);

    // Загружаем все названия параллельно
    const loadNames = async () => {
      try {
        const promises = urls.map(async (url, index) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              return fallbackNames[index];
            }

            const data: ResourceData = await response.json();
            return data.title || data.name || fallbackNames[index];
          } catch {
            return fallbackNames[index];
          }
        });

        const resolvedNames = await Promise.all(promises);
        setNames(resolvedNames);
      } catch (error) {
        console.error('Failed to load resource names:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNames();
  }, [urls.join(',')]); 

  return { names, isLoading };
};
