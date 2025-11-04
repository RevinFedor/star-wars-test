import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader для CharacterCard
 * Повторяет структуру настоящей карточки персонажа
 */
export const CharacterCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* 4 строки данных (Height, Mass, Hair, Eyes) */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
