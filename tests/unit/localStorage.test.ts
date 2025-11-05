import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCharacterEdits,
  saveCharacterEdits,
  clearCharacterEdits,
  getAllEdits,
  hasCharacterEdits,
} from '@/api/localStorage';

describe('localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveCharacterEdits', () => {
    it('should save character edits to localStorage', () => {
      saveCharacterEdits('1', { name: 'Luke Modified', height: '180' });

      const stored = JSON.parse(localStorage.getItem('star-wars-character-edits') || '{}');
      expect(stored['1']).toEqual({ name: 'Luke Modified', height: '180' });
    });

    it('should merge with existing edits', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });
      saveCharacterEdits('1', { height: '180' });

      const stored = JSON.parse(localStorage.getItem('star-wars-character-edits') || '{}');
      expect(stored['1']).toEqual({ name: 'Luke Modified', height: '180' });
    });

    it('should remove entry if all fields are empty', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });
      saveCharacterEdits('1', { name: '', height: '' });

      const stored = JSON.parse(localStorage.getItem('star-wars-character-edits') || '{}');
      expect(stored['1']).toBeUndefined();
    });

    it('should handle multiple characters', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });
      saveCharacterEdits('2', { name: 'C-3PO Modified' });

      const stored = JSON.parse(localStorage.getItem('star-wars-character-edits') || '{}');
      expect(stored['1']).toEqual({ name: 'Luke Modified' });
      expect(stored['2']).toEqual({ name: 'C-3PO Modified' });
    });
  });

  describe('getCharacterEdits', () => {
    it('should return edits for existing character', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });

      const edits = getCharacterEdits('1');
      expect(edits).toEqual({ name: 'Luke Modified' });
    });

    it('should return null for non-existing character', () => {
      const edits = getCharacterEdits('999');
      expect(edits).toBeNull();
    });

    it('should return null when localStorage is empty', () => {
      const edits = getCharacterEdits('1');
      expect(edits).toBeNull();
    });
  });

  describe('clearCharacterEdits', () => {
    it('should remove character edits from localStorage', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });
      saveCharacterEdits('2', { name: 'C-3PO Modified' });

      clearCharacterEdits('1');

      const stored = JSON.parse(localStorage.getItem('star-wars-character-edits') || '{}');
      expect(stored['1']).toBeUndefined();
      expect(stored['2']).toEqual({ name: 'C-3PO Modified' });
    });

    it('should not throw error when clearing non-existing character', () => {
      expect(() => clearCharacterEdits('999')).not.toThrow();
    });
  });

  describe('getAllEdits', () => {
    it('should return all edits', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });
      saveCharacterEdits('2', { name: 'C-3PO Modified' });

      const allEdits = getAllEdits();
      expect(allEdits).toEqual({
        '1': { name: 'Luke Modified' },
        '2': { name: 'C-3PO Modified' },
      });
    });

    it('should return empty object when localStorage is empty', () => {
      const allEdits = getAllEdits();
      expect(allEdits).toEqual({});
    });
  });

  describe('hasCharacterEdits', () => {
    it('should return true if character has edits', () => {
      saveCharacterEdits('1', { name: 'Luke Modified' });

      expect(hasCharacterEdits('1')).toBe(true);
    });

    it('should return false if character has no edits', () => {
      expect(hasCharacterEdits('999')).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      expect(hasCharacterEdits('1')).toBe(false);
    });
  });
});
