import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCharacter } from '@/hooks/useCharacter';
import { useCharacterEdit } from '@/hooks/useCharacterEdit';
import { useCharacterImage } from '@/hooks/useCharacterImage';
import { useResourceName, useResourceNames } from '@/hooks/useResourceName';
import { getCharacterEdits } from '@/api/localStorage';
import { formatField, formatDate } from '@/lib/formatters';
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
  Expand,
  Undo2,
  Loader2,
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import type { LocalCharacterEdits } from '@/api/types';

interface EditableFieldProps {
  label: string;
  value: string;
  field: keyof LocalCharacterEdits;
  isEdited: boolean;
  originalValue?: string;
  onReset: () => void;
  capitalize?: boolean;
}

const EditableFieldDisplay = ({
  label,
  value,
  field,
  isEdited,
  originalValue,
  onReset,
  capitalize = false,
}: EditableFieldProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-b-0">
      <Label className="text-sm font-medium text-muted-foreground shrink-0">{label}:</Label>
      <div className="flex items-center gap-2 flex-1 justify-end">
        {isEdited && originalValue ? (
          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <div
                className={`text-sm font-medium px-2 py-1 rounded-md transition-colors cursor-help ${
                  capitalize ? 'capitalize' : ''
                } bg-primary/10 border border-primary/30`}
              >
                {value}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
              <div className="text-xs font-medium text-muted-foreground mb-1">Original value:</div>
              <div className="text-sm font-semibold">{originalValue}</div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <div className={`text-sm font-medium ${capitalize ? 'capitalize' : ''}`}>
            {value}
          </div>
        )}
        {isEdited && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={onReset}
          >
            <Undo2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const characterId = id || '';

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { character, originalCharacter, isLoading, error, hasLocalEdits, refetch } =
    useCharacter(characterId);

  const {
    isEditing,
    editedData,
    startEdit,
    cancelEdit,
    updateField,
    saveEdit,
    resetEdits,
    resetField,
    isFieldEdited,
  } = useCharacterEdit(character, originalCharacter, characterId, refetch);

  // изображение персонажа
  const { imageUrl, isLoading: imageLoading } = useCharacterImage(characterId);

  const { name: homeworldName } = useResourceName(character?.homeworld || '');
  const { names: filmNames } = useResourceNames(character?.films || []);
  const { names: vehicleNames } = useResourceNames(character?.vehicles || []);
  const { names: starshipNames } = useResourceNames(character?.starships || []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-9 w-40 mb-4" />

        <div className="mb-6 flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Character image skeleton */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="relative w-full aspect-[3/4] lg:w-auto lg:h-[485px] rounded-lg overflow-hidden bg-muted shadow-lg" style={{ aspectRatio: '3/4' }}>
              <Skeleton className="h-full w-full" />
            </div>
          </div>

          {/* Character info skeleton */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-10 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="h-[1px] w-full mb-4" />
              {/* Physical Characteristics skeleton */}
              <div className="space-y-0">
                <Skeleton className="h-4 w-40 mb-2" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
                <Skeleton className="h-[1px] w-full my-3" />
                {/* Metadata */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards grid skeleton - Films + Vehicles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Films Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              {/* 5 фильмов */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vehicles & Starships Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicles section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
              {/* Starships section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-block">
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
        <Link to="/" className="inline-block">
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
      {/* Back Button */}
      <Link to="/" className="inline-block">
        <Button variant="outline" size="sm" className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Characters
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="mb-6 flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Character Image */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div
            className={`relative w-full aspect-[3/4] lg:w-auto lg:h-[485px] rounded-lg overflow-hidden bg-muted group shadow-lg ${imageUrl ? 'cursor-pointer' : ''}`}
            onClick={() => imageUrl && setLightboxOpen(true)}
            style={{ aspectRatio: '3/4' }}
          >
              {imageLoading ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Loading image...</span>
                </div>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={character.name}
                    className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                  />
                  {/* Expand icon on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Character Info */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <Input
                          value={editedData.name || ''}
                          onChange={(e) => updateField('name', e.target.value)}
                          className="text-3xl md:text-4xl font-bold h-auto px-2 py-1"
                        />
                      </div>
                      <CardDescription className="text-base">
                        <span className="flex flex-wrap items-center gap-2">
                          <span>Birth Year:</span>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editedData.birth_year?.replace(/[^0-9]/g, '') || ''}
                              onChange={(e) => {
                                const number = e.target.value;
                                const suffix = editedData.birth_year?.replace(/[0-9]/g, '') || 'BBY';
                                updateField('birth_year', number + suffix);
                              }}
                              className="w-20 h-7"
                            />
                            <span className="text-sm text-muted-foreground">
                              {editedData.birth_year?.replace(/[0-9]/g, '') || 'BBY'}
                            </span>
                          </div>
                          <span>•</span>
                          <span>Gender:</span>
                          <Input
                            value={editedData.gender || ''}
                            onChange={(e) => updateField('gender', e.target.value)}
                            className="w-32 h-7"
                          />
                        </span>
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      {/* Name with edit indicator */}
                      <div className="flex items-center gap-2 mb-2">
                        {isFieldEdited('name') && originalCharacter ? (
                          <HoverCard openDelay={0} closeDelay={0}>
                            <HoverCardTrigger asChild>
                              <h1 className="text-3xl md:text-4xl font-bold px-2 py-1 rounded-md transition-colors bg-primary/10 border-2 border-primary/30 cursor-help">
                                {character.name}
                              </h1>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Original value:</div>
                              <div className="text-sm font-semibold">{originalCharacter.name}</div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <h1 className="text-3xl md:text-4xl font-bold">
                            {character.name}
                          </h1>
                        )}
                        {isFieldEdited('name') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() => resetField('name')}
                          >
                            <Undo2 className="h-3 w-3" />
                          </Button>
                        )}
                        {hasLocalEdits && (
                          <Badge variant="secondary">Edited locally</Badge>
                        )}
                      </div>

                      {/* Birth Year, Gender, Homeworld with edit indicators */}
                      <CardDescription className="text-base flex flex-wrap items-center gap-2">
                        {/* Birth Year */}
                        {isFieldEdited('birth_year') && originalCharacter ? (
                          <HoverCard openDelay={0} closeDelay={0}>
                            <HoverCardTrigger asChild>
                              <span className="px-2 py-1 rounded-md transition-colors bg-primary/10 border border-primary/30 cursor-help">
                                {formatField(character.birth_year)}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Original value:</div>
                              <div className="text-sm font-semibold">{formatField(originalCharacter.birth_year)}</div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <span>{formatField(character.birth_year)}</span>
                        )}
                        {isFieldEdited('birth_year') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => resetField('birth_year')}
                          >
                            <Undo2 className="h-3 w-3" />
                          </Button>
                        )}

                        <span>•</span>

                        {/* Gender */}
                        {isFieldEdited('gender') && originalCharacter ? (
                          <HoverCard openDelay={0} closeDelay={0}>
                            <HoverCardTrigger asChild>
                              <span className="px-2 py-1 rounded-md transition-colors capitalize bg-primary/10 border border-primary/30 cursor-help">
                                {formatField(character.gender)}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Original value:</div>
                              <div className="text-sm font-semibold capitalize">{formatField(originalCharacter.gender)}</div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <span className="capitalize">{formatField(character.gender)}</span>
                        )}
                        {isFieldEdited('gender') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => resetField('gender')}
                          >
                            <Undo2 className="h-3 w-3" />
                          </Button>
                        )}

                        <span>•</span>
                        <span>{homeworldName}</span>
                      </CardDescription>
                    </>
                  )}
                </div>

                {/* Action buttons - справа в header */}
                <div className="flex flex-col gap-2 shrink-0">
                  {!isEditing ? (
                    <>
                      <Button onClick={startEdit} size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {hasLocalEdits && (
                        <Button variant="outline" onClick={resetEdits} size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button onClick={saveEdit} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={cancelEdit} size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
              <Separator className="mb-4" />

              {/* Physical Characteristics - компактная таблица */}
              <div className="space-y-0 pb-2">
                <h3 className="text-sm font-semibold mb-2">Physical Characteristics</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-20">Height:</Label>
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          type="number"
                          value={editedData.height || ''}
                          onChange={(e) => updateField('height', e.target.value)}
                          className="h-8 text-sm flex-1"
                        />
                        <span className="text-xs text-muted-foreground">cm</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-20">Mass:</Label>
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          type="number"
                          value={editedData.mass || ''}
                          onChange={(e) => updateField('mass', e.target.value)}
                          className="h-8 text-sm flex-1"
                        />
                        <span className="text-xs text-muted-foreground">kg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-20">Hair:</Label>
                      <Input
                        type="text"
                        value={editedData.hair_color || ''}
                        onChange={(e) => updateField('hair_color', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-20">Skin:</Label>
                      <Input
                        type="text"
                        value={editedData.skin_color || ''}
                        onChange={(e) => updateField('skin_color', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-20">Eyes:</Label>
                      <Input
                        type="text"
                        value={editedData.eye_color || ''}
                        onChange={(e) => updateField('eye_color', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <EditableFieldDisplay
                      label="Height"
                      value={formatField(character.height, 'cm')}
                      field="height"
                      isEdited={isFieldEdited('height')}
                      originalValue={originalCharacter ? formatField(originalCharacter.height, 'cm') : undefined}
                      onReset={() => resetField('height')}
                    />
                    <EditableFieldDisplay
                      label="Mass"
                      value={formatField(character.mass, 'kg')}
                      field="mass"
                      isEdited={isFieldEdited('mass')}
                      originalValue={originalCharacter ? formatField(originalCharacter.mass, 'kg') : undefined}
                      onReset={() => resetField('mass')}
                    />
                    <EditableFieldDisplay
                      label="Hair"
                      value={formatField(character.hair_color)}
                      field="hair_color"
                      isEdited={isFieldEdited('hair_color')}
                      originalValue={originalCharacter ? formatField(originalCharacter.hair_color) : undefined}
                      onReset={() => resetField('hair_color')}
                      capitalize
                    />
                    <EditableFieldDisplay
                      label="Skin"
                      value={formatField(character.skin_color)}
                      field="skin_color"
                      isEdited={isFieldEdited('skin_color')}
                      originalValue={originalCharacter ? formatField(originalCharacter.skin_color) : undefined}
                      onReset={() => resetField('skin_color')}
                      capitalize
                    />
                    <EditableFieldDisplay
                      label="Eyes"
                      value={formatField(character.eye_color)}
                      field="eye_color"
                      isEdited={isFieldEdited('eye_color')}
                      originalValue={originalCharacter ? formatField(originalCharacter.eye_color) : undefined}
                      onReset={() => resetField('eye_color')}
                      capitalize
                    />
                  </>
                )}

                <Separator className="my-3" />

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(character.created)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edited:</span>
                    <span>{formatDate(character.edited)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Content Grid - 2 columns: Films + Vehicles & Starships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Films */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle>Films</CardTitle>
                <CardDescription className="text-right">
                  {character.films.length} film(s)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {character.films.length > 0 ? (
                <ul className="space-y-1.5">
                  {filmNames.map((filmName, index) => (
                    <li
                      key={character.films[index]}
                      className="text-sm flex items-center gap-2"
                    >
                      <Badge variant="outline" className="h-5 px-1.5 text-xs">{index + 1}</Badge>
                      <span className="text-muted-foreground">{filmName}</span>
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
              <div className="flex items-start justify-between gap-4">
                <CardTitle>Vehicles & Starships</CardTitle>
                <CardDescription className="text-right">Transportation</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Vehicles ({character.vehicles.length})</Label>
                {character.vehicles.length > 0 ? (
                  <ul className="space-y-0.5">
                    {vehicleNames.map((vehicleName, index) => (
                      <li
                        key={character.vehicles[index]}
                        className="text-sm text-muted-foreground"
                      >
                        • {vehicleName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No vehicles</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Starships ({character.starships.length})</Label>
                {character.starships.length > 0 ? (
                  <ul className="space-y-0.5">
                    {starshipNames.map((starshipName, index) => (
                      <li
                        key={character.starships[index]}
                        className="text-sm text-muted-foreground"
                      >
                        • {starshipName}
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

      {/* Lightbox для полноразмерного просмотра изображения */}
      {imageUrl && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[
            {
              src: imageUrl,
              alt: character.name,
            },
          ]}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null,
          }}
          controller={{ closeOnBackdropClick: true }}
        />
      )}
    </div>
  );
};
