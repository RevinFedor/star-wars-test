import { http, HttpResponse } from 'msw';

const BASE_URL = 'https://swapi.py4e.com/api';

export const handlers = [
  // get characters list
  http.get(`${BASE_URL}/people/`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const search = url.searchParams.get('search') || '';

    // mock data
    const allCharacters = [
      {
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
        vehicles: ['https://swapi.py4e.com/api/vehicles/14/'],
        starships: ['https://swapi.py4e.com/api/starships/12/'],
        created: '2014-12-09T13:50:51.644000Z',
        edited: '2014-12-20T21:17:56.891000Z',
        url: 'https://swapi.py4e.com/api/people/1/',
      },
      {
        name: 'C-3PO',
        height: '167',
        mass: '75',
        hair_color: 'n/a',
        skin_color: 'gold',
        eye_color: 'yellow',
        birth_year: '112BBY',
        gender: 'n/a',
        homeworld: 'https://swapi.py4e.com/api/planets/1/',
        films: ['https://swapi.py4e.com/api/films/1/'],
        species: ['https://swapi.py4e.com/api/species/2/'],
        vehicles: [],
        starships: [],
        created: '2014-12-10T15:10:51.357000Z',
        edited: '2014-12-20T21:17:50.309000Z',
        url: 'https://swapi.py4e.com/api/people/2/',
      },
    ];

    // filter by search
    const filtered = search
      ? allCharacters.filter((char) =>
          char.name.toLowerCase().includes(search.toLowerCase())
        )
      : allCharacters;

    return HttpResponse.json({
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered,
    });
  }),

  // get single character
  http.get(`${BASE_URL}/people/:id/`, ({ params }) => {
    const { id } = params;

    const characters: Record<string, any> = {
      '1': {
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
        vehicles: ['https://swapi.py4e.com/api/vehicles/14/'],
        starships: ['https://swapi.py4e.com/api/starships/12/'],
        created: '2014-12-09T13:50:51.644000Z',
        edited: '2014-12-20T21:17:56.891000Z',
        url: 'https://swapi.py4e.com/api/people/1/',
      },
      '2': {
        name: 'C-3PO',
        height: '167',
        mass: '75',
        hair_color: 'n/a',
        skin_color: 'gold',
        eye_color: 'yellow',
        birth_year: '112BBY',
        gender: 'n/a',
        homeworld: 'https://swapi.py4e.com/api/planets/1/',
        films: ['https://swapi.py4e.com/api/films/1/'],
        species: ['https://swapi.py4e.com/api/species/2/'],
        vehicles: [],
        starships: [],
        created: '2014-12-10T15:10:51.357000Z',
        edited: '2014-12-20T21:17:50.309000Z',
        url: 'https://swapi.py4e.com/api/people/2/',
      },
    };

    const character = characters[id as string];

    if (!character) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(character);
  }),

  // planet info
  http.get(`${BASE_URL}/planets/:id/`, ({ params }) => {
    return HttpResponse.json({
      name: 'Tatooine',
      url: `${BASE_URL}/planets/${params.id}/`,
    });
  }),

  // film info
  http.get(`${BASE_URL}/films/:id/`, ({ params }) => {
    return HttpResponse.json({
      title: 'A New Hope',
      url: `${BASE_URL}/films/${params.id}/`,
    });
  }),

  // vehicle info
  http.get(`${BASE_URL}/vehicles/:id/`, ({ params }) => {
    return HttpResponse.json({
      name: 'Snowspeeder',
      url: `${BASE_URL}/vehicles/${params.id}/`,
    });
  }),

  // starship info
  http.get(`${BASE_URL}/starships/:id/`, ({ params }) => {
    return HttpResponse.json({
      name: 'X-wing',
      url: `${BASE_URL}/starships/${params.id}/`,
    });
  }),
];
