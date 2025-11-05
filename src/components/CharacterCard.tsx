import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Character } from '@/api/types';
import { getCharacterId } from '@/api/swapi';
import { useCharacterImage } from '@/hooks/useCharacterImage';
import { hasCharacterEdits } from '@/api/localStorage';
import { formatField } from '@/lib/formatters';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit3 } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard = ({ character }: CharacterCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const id = getCharacterId(character.url);
  const { imageUrl, isLoading: imageLoading } = useCharacterImage(id);
  const hasEdits = hasCharacterEdits(id);

  return (
    <Link
      to={`/character/${id}`}
      className="block h-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full min-h-[450px]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 w-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className={`h-full overflow-hidden hover:shadow-xl transition-shadow relative ${hasEdits ? 'ring-2 ring-primary/50' : ''}`}>
            {/* Character Image - aspect-[3/4] для вертикального отображения */}
            <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
              {imageLoading ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Loading image...</span>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex-1 truncate">{character.name}</CardTitle>
                {hasEdits && (
                  <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                    <Edit3 className="h-3 w-3" />
                    <span className="text-xs">Edited</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        <div
          className="absolute inset-0 w-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow flex flex-col justify-center p-6 bg-gradient-to-br from-card to-muted/30">
            <CardTitle className="text-lg mb-6 text-center">{character.name}</CardTitle>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <dt className="text-muted-foreground font-medium">Birth Year:</dt>
                <dd className="font-semibold text-foreground">{formatField(character.birth_year)}</dd>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <dt className="text-muted-foreground font-medium">Gender:</dt>
                <dd className="font-semibold text-foreground capitalize">{formatField(character.gender)}</dd>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <dt className="text-muted-foreground font-medium">Height:</dt>
                <dd className="font-semibold text-foreground">{formatField(character.height, 'cm')}</dd>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <dt className="text-muted-foreground font-medium">Mass:</dt>
                <dd className="font-semibold text-foreground">{formatField(character.mass, 'kg')}</dd>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <dt className="text-muted-foreground font-medium">Hair:</dt>
                <dd className="font-semibold text-foreground capitalize">{formatField(character.hair_color)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground font-medium">Eyes:</dt>
                <dd className="font-semibold text-foreground capitalize">{formatField(character.eye_color)}</dd>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Click to view details
            </div>
          </Card>
        </div>
      </motion.div>
    </Link>
  );
};
