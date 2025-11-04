import { Link } from 'react-router-dom';
import type { Character } from '@/api/types';
import { getCharacterId } from '@/api/swapi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard = ({ character }: CharacterCardProps) => {
  const id = getCharacterId(character.url);

  return (
    <Link to={`/character/${id}`} className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer">
        <CardHeader>
          <CardTitle>{character.name}</CardTitle>
          <CardDescription>
            {character.birth_year} • {character.gender}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Height:</dt>
              <dd className="font-medium">{character.height} cm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mass:</dt>
              <dd className="font-medium">{character.mass} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hair:</dt>
              <dd className="font-medium capitalize">{character.hair_color}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Eyes:</dt>
              <dd className="font-medium capitalize">{character.eye_color}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
};
