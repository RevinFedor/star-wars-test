import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCharacters } from '@/hooks/useCharacters';
import { useDebounce } from '@/hooks/useDebounce';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterCardSkeleton } from '@/components/CharacterCardSkeleton';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const CharactersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Получаем page и search из URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Debounce search чтобы не слать запрос на каждую букву
  const debouncedSearch = useDebounce(searchInput, 300);

  // Загружаем данные
  const { data, isLoading, error } = useCharacters(pageFromUrl, debouncedSearch);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Сбрасываем на первую страницу при поиске
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Star Wars Characters</h1>
        <p className="text-muted-foreground">
          Browse and search through all Star Wars characters
        </p>
      </header>

      <div className="mb-6">
        <SearchBar
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search characters by name..."
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Pagination TOP - показываем всегда, если есть данные */}
      {data && data.results.length > 0 && (
        <div className="mb-6">
          <Pagination
            currentPage={pageFromUrl}
            totalCount={data.count}
            pageSize={10}
            onPageChange={handlePageChange}
            hasNext={!!data.next}
            hasPrevious={!!data.previous}
          />
        </div>
      )}

      {/* Skeleton для пагинации на первой загрузке */}
      {isLoading && !data && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-5 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )}

      {/* Grid с карточками или скелетонами */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {isLoading ? (
          // Показываем скелетоны во время загрузки
          [...Array(9)].map((_, i) => <CharacterCardSkeleton key={i} />)
        ) : data && data.results.length > 0 ? (
          // Показываем карточки персонажей
          data.results.map((character) => (
            <CharacterCard key={character.url} character={character} />
          ))
        ) : null}
      </div>

      {/* Empty state */}
      {!isLoading && data && data.results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No characters found matching "{debouncedSearch}"
          </p>
        </div>
      )}

      {/* Pagination BOTTOM - показываем всегда, если есть данные */}
      {data && data.results.length > 0 && (
        <Pagination
          currentPage={pageFromUrl}
          totalCount={data.count}
          pageSize={10}
          onPageChange={handlePageChange}
          hasNext={!!data.next}
          hasPrevious={!!data.previous}
        />
      )}
    </div>
  );
};
