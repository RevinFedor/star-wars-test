import type { Character, ApiResponse } from './types';

const BASE_URL = 'https://swapi.py4e.com/api';

/**
 * Получить список персонажей с пагинацией и поиском
 */
export const fetchCharacters = async (
  page: number = 1,
  search?: string
): Promise<ApiResponse<Character>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  const response = await fetch(`${BASE_URL}/people/?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Получить персонажа по ID
 */
export const fetchCharacter = async (id: string): Promise<Character> => {
  const response = await fetch(`${BASE_URL}/people/${id}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch character: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Извлечь ID из URL персонажа
 * Example: https://swapi.py4e.com/api/people/1/ -> "1"
 */
export const getCharacterId = (url: string): string => {
  const match = url.match(/\/people\/(\d+)\//);
  return match ? match[1] : '';
};
