import { useParams, Link } from 'react-router-dom';
import { useCharacter } from '@/hooks/useCharacter';
import { useCharacterEdit } from '@/hooks/useCharacterEdit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChevronLeft,
  Edit,
  Save,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const characterId = id || '';

  const { character, isLoading, error, hasLocalEdits, refetch } =
    useCharacter(characterId);

  const {
    isEditing,
    editedData,
    startEdit,
    cancelEdit,
    updateField,
    saveEdit,
    resetEdits,
  } = useCharacterEdit(character, characterId, refetch);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back button skeleton */}
        <div className="mb-6">
          <Skeleton className="h-9 w-40 mb-4" />

          {/* Header skeleton */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <Skeleton className="h-10 w-64 mb-3" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Characters
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // No character found
  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Characters
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Character not found</p>
        </div>
      </div>
    );
  }

  // Данные для отображения (либо из editedData в режиме редактирования, либо из character)
  const displayData = isEditing ? editedData : character;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Characters
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">
                {isEditing ? (
                  <Input
                    value={editedData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="text-4xl font-bold h-auto px-2 py-1"
                  />
                ) : (
                  character.name
                )}
              </h1>
              {hasLocalEdits && !isEditing && (
                <Badge variant="secondary">Edited locally</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isEditing ? (
                <span className="flex items-center gap-2">
                  <span>Birth Year:</span>
                  <Input
                    value={editedData.birth_year || ''}
                    onChange={(e) => updateField('birth_year', e.target.value)}
                    className="w-32 h-7"
                  />
                  <span>•</span>
                  <span>Gender:</span>
                  <Input
                    value={editedData.gender || ''}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-32 h-7"
                  />
                </span>
              ) : (
                `${character.birth_year} • ${character.gender}`
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button onClick={startEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {hasLocalEdits && (
                  <Button variant="outline" onClick={resetEdits}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Edits
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Physical Appearance</CardTitle>
            <CardDescription>Physical characteristics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              {isEditing ? (
                <Input
                  id="height"
                  type="text"
                  value={editedData.height || ''}
                  onChange={(e) => updateField('height', e.target.value)}
                />
              ) : (
                <div className="text-sm font-medium">{character.height}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mass">Mass (kg)</Label>
              {isEditing ? (
                <Input
                  id="mass"
                  type="text"
                  value={editedData.mass || ''}
                  onChange={(e) => updateField('mass', e.target.value)}
                />
              ) : (
                <div className="text-sm font-medium">{character.mass}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hair_color">Hair Color</Label>
              {isEditing ? (
                <Input
                  id="hair_color"
                  type="text"
                  value={editedData.hair_color || ''}
                  onChange={(e) => updateField('hair_color', e.target.value)}
                />
              ) : (
                <div className="text-sm font-medium capitalize">
                  {character.hair_color}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skin_color">Skin Color</Label>
              {isEditing ? (
                <Input
                  id="skin_color"
                  type="text"
                  value={editedData.skin_color || ''}
                  onChange={(e) => updateField('skin_color', e.target.value)}
                />
              ) : (
                <div className="text-sm font-medium capitalize">
                  {character.skin_color}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eye_color">Eye Color</Label>
              {isEditing ? (
                <Input
                  id="eye_color"
                  type="text"
                  value={editedData.eye_color || ''}
                  onChange={(e) => updateField('eye_color', e.target.value)}
                />
              ) : (
                <div className="text-sm font-medium capitalize">
                  {character.eye_color}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Other details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Homeworld</Label>
              <div className="text-sm font-medium text-muted-foreground">
                {character.homeworld}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Created</Label>
              <div className="text-sm font-medium text-muted-foreground">
                {new Date(character.created).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Edited</Label>
              <div className="text-sm font-medium text-muted-foreground">
                {new Date(character.edited).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Films */}
        <Card>
          <CardHeader>
            <CardTitle>Films</CardTitle>
            <CardDescription>
              Appeared in {character.films.length} film(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {character.films.length > 0 ? (
              <ul className="space-y-2">
                {character.films.map((film, index) => (
                  <li
                    key={film}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-mono text-xs">{film}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No films recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicles & Starships */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicles & Starships</CardTitle>
            <CardDescription>Transportation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicles ({character.vehicles.length})</Label>
              {character.vehicles.length > 0 ? (
                <ul className="space-y-1">
                  {character.vehicles.map((vehicle) => (
                    <li
                      key={vehicle}
                      className="text-sm text-muted-foreground font-mono text-xs"
                    >
                      {vehicle}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No vehicles</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Starships ({character.starships.length})</Label>
              {character.starships.length > 0 ? (
                <ul className="space-y-1">
                  {character.starships.map((starship) => (
                    <li
                      key={starship}
                      className="text-sm text-muted-foreground font-mono text-xs"
                    >
                      {starship}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No starships</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
