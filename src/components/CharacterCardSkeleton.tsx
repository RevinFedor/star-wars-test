import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader для CharacterCard
 * Повторяет структуру настоящей карточки персонажа с вертикальным изображением
 */
export const CharacterCardSkeleton = () => {
  return (
    <Card className="h-full overflow-hidden">
      {/* Image  */}
      <Skeleton className="aspect-[3/4] w-full" />

      <CardHeader className="pb-3">
        {/* Title  */}
        <Skeleton className="h-5 w-3/4 mb-2" />
        {/* Description  */}
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="space-y-1">
          {/* 4 строки данных (Height, Mass, Hair, Eyes) */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
