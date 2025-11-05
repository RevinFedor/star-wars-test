import { describe, it, expect } from 'vitest';
import {
  formatField,
  formatDate,
  extractIdFromUrl,
  extractResourceType,
  formatArray,
} from '@/lib/formatters';

describe('formatters', () => {
  describe('formatField', () => {
    it('should handle unknown values', () => {
      expect(formatField('unknown')).toBe('Not recorded');
      expect(formatField('')).toBe('Not recorded');
    });

    it('should handle n/a values', () => {
      expect(formatField('n/a')).toBe('N/A');
    });

    it('should handle none values', () => {
      expect(formatField('none')).toBe('None');
    });

    it('should format value with unit', () => {
      expect(formatField('172', 'cm')).toBe('172 cm');
      expect(formatField('80', 'kg')).toBe('80 kg');
    });

    it('should format value without unit', () => {
      expect(formatField('blond')).toBe('blond');
      expect(formatField('male')).toBe('male');
    });
  });

  describe('formatDate', () => {
    it('should format valid date string', () => {
      const result = formatDate('2014-12-09T13:50:51.644000Z');
      expect(result).toMatch(/December 9, 2014/);
    });

    it('should return original string for invalid date', () => {
      const invalidDate = 'invalid-date';
      expect(formatDate(invalidDate)).toBe(invalidDate);
    });
  });

  describe('extractIdFromUrl', () => {
    it('should extract ID from SWAPI URL', () => {
      expect(extractIdFromUrl('https://swapi.py4e.com/api/people/1/')).toBe('1');
      expect(extractIdFromUrl('https://swapi.py4e.com/api/planets/3/')).toBe('3');
      expect(extractIdFromUrl('https://swapi.py4e.com/api/films/5/')).toBe('5');
    });

    it('should extract ID from URL without trailing slash', () => {
      expect(extractIdFromUrl('https://swapi.py4e.com/api/people/1')).toBe('1');
    });

    it('should return empty string for invalid URL', () => {
      expect(extractIdFromUrl('invalid-url')).toBe('');
      expect(extractIdFromUrl('')).toBe('');
    });
  });

  describe('extractResourceType', () => {
    it('should extract resource type from SWAPI URL', () => {
      expect(extractResourceType('https://swapi.py4e.com/api/people/1/')).toBe('people');
      expect(extractResourceType('https://swapi.py4e.com/api/planets/3/')).toBe('planets');
      expect(extractResourceType('https://swapi.py4e.com/api/films/5/')).toBe('films');
    });

    it('should return empty string for invalid URL', () => {
      expect(extractResourceType('invalid-url')).toBe('');
      expect(extractResourceType('')).toBe('');
    });
  });

  describe('formatArray', () => {
    it('should return count for non-empty array', () => {
      expect(formatArray(['item1', 'item2', 'item3'])).toBe('3');
      expect(formatArray(['single'])).toBe('1');
    });

    it('should return "None" for empty array', () => {
      expect(formatArray([])).toBe('None');
    });

    it('should handle null or undefined', () => {
      expect(formatArray(null as any)).toBe('None');
      expect(formatArray(undefined as any)).toBe('None');
    });
  });
});
