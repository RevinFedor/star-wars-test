import { useState, useCallback } from 'react';
import { saveCharacterEdits, clearCharacterEdits } from '@/api/localStorage';
import type { Character, LocalCharacterEdits } from '@/api/types';

interface UseCharacterEditReturn {
  isEditing: boolean;
  editedData: LocalCharacterEdits;
  startEdit: () => void;
  cancelEdit: () => void;
  updateField: (field: keyof LocalCharacterEdits, value: string) => void;
  saveEdit: () => void;
  resetEdits: () => void;
}

/**
 * Хук для управления состоянием редактирования персонажа
 */
export const useCharacterEdit = (
  character: Character | null,
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
    if (!character) return;

    // Сохраняем только измененные поля
    const changedFields: LocalCharacterEdits = {};
    const originalCharacter = character;

    (Object.keys(editedData) as Array<keyof LocalCharacterEdits>).forEach((key) => {
      const editedValue = editedData[key];
      const originalValue = originalCharacter[key];

      // Сохраняем только если значение изменилось
      if (editedValue !== originalValue && editedValue !== undefined) {
        changedFields[key] = editedValue;
      }
    });

    saveCharacterEdits(characterId, changedFields);
    setIsEditing(false);
    setEditedData({});

    // Вызываем callback для обновления данных
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  }, [character, characterId, editedData, onSaveSuccess]);

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

  return {
    isEditing,
    editedData,
    startEdit,
    cancelEdit,
    updateField,
    saveEdit,
    resetEdits,
  };
};
