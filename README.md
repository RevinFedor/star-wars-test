# Star Wars Characters (shadcn/ui version)

## ✅ Base Setup Complete

Production-ready React + TypeScript + Vite + shadcn/ui setup for Star Wars API project.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (fast build tool)
- **Tailwind CSS v4** (next-gen utility-first styling with Vite plugin)
- **shadcn/ui** (high-quality components)
- **lucide-react** (icons)

## Project Structure

```
src/
├── api/           # API layer (SWAPI integration)
├── components/    # React components
│   └── ui/        # shadcn/ui components
├── lib/           # Utilities (cn helper)
├── pages/         # Page components
├── App.tsx        # Main app component
└── index.css      # Tailwind directives + CSS variables
```

## Features Configured

✅ **Tailwind CSS v4** with `@tailwindcss/vite` plugin (zero-config)
✅ shadcn/ui design system (CSS variables for theming)
✅ Dark mode support via CSS variables
✅ Path alias `@/*` → `./src/*`
✅ TypeScript strict mode
✅ Responsive design utilities

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding shadcn/ui Components

Since CLI doesn't work, manually add components:

1. Copy component from https://ui.shadcn.com/docs/components
2. Place in `src/components/ui/[component-name].tsx`
3. Import and use: `import { Button } from '@/components/ui/button'`

## Next Steps

1. Create API types (`src/api/types.ts`)
2. Implement SWAPI integration (`src/api/swapi.ts`)
3. Build pages:
   - `CharactersPage` (list + pagination + search)
   - `CharacterDetailPage` (details + local edit)
4. Add shadcn/ui components (Card, Input, Button, Skeleton)
5. Add React Router for navigation
6. Implement localStorage for local editing
7. Add tests (Testing Library)

## Current Status

🟢 Server running on **http://localhost:5173/**

Base project ready for Star Wars API integration!
