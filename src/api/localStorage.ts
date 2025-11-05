import type { LocalCharacterEdits } from './types';

const STORAGE_KEY = 'star-wars-character-edits';

/**
 * Структура хранилища:
 * {
 *   "1": { name: "Luke Skywalker (Modified)", height: "180" },
 *   "2": { mass: "80" }
 * }
 */
interface CharacterEditsStorage {
  [characterId: string]: LocalCharacterEdits;
}

/**
 * Получить все сохраненные изменения персонажей
 */
const getAllEditsFromStorage = (): CharacterEditsStorage => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse localStorage data:', error);
    return {};
  }
};

/**
 * Сохранить все изменения в localStorage
 */
const saveAllEditsToStorage = (edits: CharacterEditsStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

/**
 * Получить локальные изменения для конкретного персонажа
 */
export const getCharacterEdits = (characterId: string): LocalCharacterEdits | null => {
  const allEdits = getAllEditsFromStorage();
  return allEdits[characterId] || null;
};

/**
 * Сохранить изменения для конкретного персонажа (мержит с существующими)
 */
export const saveCharacterEdits = (
  characterId: string,
  edits: LocalCharacterEdits
): void => {
  const allEdits = getAllEditsFromStorage();

  // Мержим новые изменения с существующими
  const existingEdits = allEdits[characterId] || {};
  const mergedEdits = {
    ...existingEdits,
    ...edits,
  };

  // Если все поля пустые, удаляем запись вместо сохранения
  const hasAnyEdits = Object.values(mergedEdits).some(value => value !== undefined && value !== '');

  if (hasAnyEdits) {
    allEdits[characterId] = mergedEdits;
  } else {
    delete allEdits[characterId];
  }

  saveAllEditsToStorage(allEdits);
};

/**
 * Удалить все локальные изменения для персонажа
 */
export const clearCharacterEdits = (characterId: string): void => {
  const allEdits = getAllEditsFromStorage();
  delete allEdits[characterId];
  saveAllEditsToStorage(allEdits);
};

/**
 * Получить все локальные изменения (для дебага или экспорта)
 */
export const getAllEdits = (): CharacterEditsStorage => {
  return getAllEditsFromStorage();
};

/**
 * Проверить, есть ли локальные изменения для персонажа
 */
export const hasCharacterEdits = (characterId: string): boolean => {
  return getCharacterEdits(characterId) !== null;
};
