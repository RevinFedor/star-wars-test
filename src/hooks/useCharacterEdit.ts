import { useState, useCallback } from 'react';
import { saveCharacterEdits, clearCharacterEdits, getCharacterEdits } from '@/api/localStorage';
import type { Character, LocalCharacterEdits } from '@/api/types';

interface UseCharacterEditReturn {
  isEditing: boolean;
  editedData: LocalCharacterEdits;
  startEdit: () => void;
  cancelEdit: () => void;
  updateField: (field: keyof LocalCharacterEdits, value: string) => void;
  saveEdit: () => void;
  resetEdits: () => void;
  resetField: (field: keyof LocalCharacterEdits) => void;
  isFieldEdited: (field: keyof LocalCharacterEdits) => boolean;
  getOriginalValue: (field: keyof LocalCharacterEdits) => string;
}

/**
 * Хук для управления состоянием редактирования персонажа
 */
export const useCharacterEdit = (
  character: Character | null,
  originalCharacter: Character | null,
  characterId: string,
  onSaveSuccess?: () => void
): UseCharacterEditReturn => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<LocalCharacterEdits>({});

  /**
   * Начать редактирование - заполнить форму текущими данными
   */
  const startEdit = useCallback(() => {
    if (character) {
      setEditedData({
        name: character.name,
        height: character.height,
        mass: character.mass,
        hair_color: character.hair_color,
        skin_color: character.skin_color,
        eye_color: character.eye_color,
        birth_year: character.birth_year,
        gender: character.gender,
      });
      setIsEditing(true);
    }
  }, [character]);

  /**
   * Отменить редактирование - вернуть исходные данные
   */
  const cancelEdit = useCallback(() => {
    setEditedData({});
    setIsEditing(false);
  }, []);

  /**
   * Обновить конкретное поле
   */
  const updateField = useCallback(
    (field: keyof LocalCharacterEdits, value: string) => {
      setEditedData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  /**
   * Сохранить изменения в localStorage
   */
  const saveEdit = useCallback(() => {
    if (!character || !originalCharacter) return;

    // Получаем текущие сохраненные изменения
    const existingEdits = getCharacterEdits(characterId) || {};

    // Создаем новый объект с изменениями
    const updatedEdits: LocalCharacterEdits = { ...existingEdits };

    // Проверяем каждое поле - сохраняем только если оно отличается от оригинала
    (Object.keys(editedData) as Array<keyof LocalCharacterEdits>).forEach((key) => {
      const editedValue = editedData[key];
      const originalValue = originalCharacter[key];

      // Сохраняем только если значение изменилось по сравнению с оригиналом
      if (editedValue !== undefined && editedValue !== originalValue) {
        updatedEdits[key] = editedValue;
      } else if (editedValue === originalValue) {
        // Если вернули к оригиналу - удаляем из изменений
        delete updatedEdits[key];
      }
    });

    // Сохраняем объединенные изменения (или удаляем если пусто)
    if (Object.keys(updatedEdits).length > 0) {
      saveCharacterEdits(characterId, updatedEdits);
    } else {
      clearCharacterEdits(characterId);
    }

    setIsEditing(false);
    setEditedData({});

    // Вызываем callback для обновления данных
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  }, [character, originalCharacter, characterId, editedData, onSaveSuccess]);

  /**
   * Сбросить все локальные изменения (удалить из localStorage)
   */
  const resetEdits = useCallback(() => {
    clearCharacterEdits(characterId);
    setEditedData({});
    setIsEditing(false);

    // Вызываем callback для обновления данных
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  }, [characterId, onSaveSuccess]);

  /**
   * Сбросить конкретное поле
   */
  const resetField = useCallback((field: keyof LocalCharacterEdits) => {
    // Получаем текущие сохраненные изменения
    const currentEdits = { ...editedData };
    delete currentEdits[field];

    // Сохраняем обновленные изменения
    saveCharacterEdits(characterId, currentEdits);

    // Вызываем callback для обновления данных
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  }, [characterId, editedData, onSaveSuccess]);

  /**
   * Проверить, было ли поле отредактировано
   */
  const isFieldEdited = useCallback((field: keyof LocalCharacterEdits) => {
    if (!character) return false;
    const savedEdits = getCharacterEdits(characterId);
    return savedEdits ? field in savedEdits : false;
  }, [character, characterId]);

  /**
   * Получить оригинальное значение поля из API
   */
  const getOriginalValue = useCallback((field: keyof LocalCharacterEdits) => {
    if (!originalCharacter) return '';
    return originalCharacter[field] || '';
  }, [originalCharacter]);

  return {
    isEditing,
    editedData,
    startEdit,
    cancelEdit,
    updateField,
    saveEdit,
    resetEdits,
    resetField,
    isFieldEdited,
    getOriginalValue,
  };
};
