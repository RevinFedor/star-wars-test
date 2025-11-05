import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CharacterCard } from '@/components/CharacterCard';
import type { Character } from '@/api/types';

vi.mock('@/hooks/useCharacterImage', () => ({
  useCharacterImage: () => ({
    imageUrl: 'https://example.com/luke.jpg',
    isLoading: false,
    error: null,
  }),
}));

const mockCharacter: Character = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.py4e.com/api/planets/1/',
  films: ['https://swapi.py4e.com/api/films/1/'],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.py4e.com/api/people/1/',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CharacterCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render character name', () => {
    renderWithRouter(<CharacterCard character={mockCharacter} />);

    expect(screen.getAllByText('Luke Skywalker')).toHaveLength(2);
  });

  it('should render character details on back side', () => {
    renderWithRouter(<CharacterCard character={mockCharacter} />);

    expect(screen.getAllByText('Luke Skywalker')).toHaveLength(2);
    expect(screen.getByText('Birth Year:')).toBeInTheDocument();
    expect(screen.getByText('19BBY')).toBeInTheDocument();
  });

  it('should link to character detail page with correct ID', () => {
    renderWithRouter(<CharacterCard character={mockCharacter} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/character/1');
  });

  it('should show "Edited" badge when character has local edits', () => {
    localStorage.setItem(
      'star-wars-character-edits',
      JSON.stringify({
        '1': { name: 'Luke Modified' },
      })
    );

    renderWithRouter(<CharacterCard character={mockCharacter} />);

    expect(screen.getByText('Edited')).toBeInTheDocument();
  });

  it('should NOT show "Edited" badge when character has no local edits', () => {
    renderWithRouter(<CharacterCard character={mockCharacter} />);

    expect(screen.queryByText('Edited')).not.toBeInTheDocument();
  });

  it('should render character image', () => {
    renderWithRouter(<CharacterCard character={mockCharacter} />);

    const images = screen.getAllByAltText('Luke Skywalker');
    expect(images[0]).toHaveAttribute('src', 'https://example.com/luke.jpg');
  });

  it('should format fields correctly', () => {
    renderWithRouter(<CharacterCard character={mockCharacter} />);

    expect(screen.getByText('172 cm')).toBeInTheDocument();
    expect(screen.getByText('77 kg')).toBeInTheDocument();
  });
});
