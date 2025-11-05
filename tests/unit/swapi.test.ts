import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCharacters, fetchCharacter, getCharacterId } from '@/api/swapi';

describe('swapi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getCharacterId', () => {
    it('should extract ID from character URL', () => {
      expect(getCharacterId('https://swapi.py4e.com/api/people/1/')).toBe('1');
      expect(getCharacterId('https://swapi.py4e.com/api/people/42/')).toBe('42');
    });

    it('should return empty string for invalid URL', () => {
      expect(getCharacterId('invalid-url')).toBe('');
      expect(getCharacterId('')).toBe('');
    });
  });

  describe('fetchCharacters', () => {
    it('should fetch characters with page parameter', async () => {
      const mockData = {
        count: 82,
        next: 'https://swapi.py4e.com/api/people/?page=2',
        previous: null,
        results: [
          { name: 'Luke Skywalker', url: 'https://swapi.py4e.com/api/people/1/' },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchCharacters(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://swapi.py4e.com/api/people/?page=1'
      );
      expect(result).toEqual(mockData);
    });

    it('should include search parameter when provided', async () => {
      const mockData = {
        count: 1,
        next: null,
        previous: null,
        results: [
          { name: 'Luke Skywalker', url: 'https://swapi.py4e.com/api/people/1/' },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await fetchCharacters(1, 'luke');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://swapi.py4e.com/api/people/?page=1&search=luke'
      );
    });

    it('should trim search parameter', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, next: null, previous: null, results: [] }),
      });

      await fetchCharacters(1, '  luke  ');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://swapi.py4e.com/api/people/?page=1&search=luke'
      );
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchCharacters(1)).rejects.toThrow('Failed to fetch characters: Not Found');
    });
  });

  describe('fetchCharacter', () => {
    it('should fetch single character by ID', async () => {
      const mockCharacter = {
        name: 'Luke Skywalker',
        height: '172',
        url: 'https://swapi.py4e.com/api/people/1/',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharacter,
      });

      const result = await fetchCharacter('1');

      expect(global.fetch).toHaveBeenCalledWith('https://swapi.py4e.com/api/people/1/');
      expect(result).toEqual(mockCharacter);
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchCharacter('999')).rejects.toThrow('Failed to fetch character: Not Found');
    });
  });
});
