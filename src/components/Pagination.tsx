import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Генерирует массив номеров страниц для отображения
 * Показываем только первую, последнюю и текущую страницу
 */
const generatePageNumbers = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
  // Если страниц мало (≤5), показываем все
  if (totalPages <= 5) {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  const pages: (number | 'ellipsis')[] = [];

  // Всегда показываем первую
  pages.push(1);

  // Если текущая не первая и не вторая, добавляем ellipsis
  if (currentPage > 2) {
    pages.push('ellipsis');
  }

  // Показываем только текущую страницу (если она не первая и не последняя)
  if (currentPage !== 1 && currentPage !== totalPages) {
    pages.push(currentPage);
  }

  // Если текущая не последняя и не предпоследняя, добавляем ellipsis
  if (currentPage < totalPages - 1) {
    pages.push('ellipsis');
  }

  // Всегда показываем последнюю
  pages.push(totalPages);

  return pages;
};

export const Pagination = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  hasNext,
  hasPrevious,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing page {currentPage} of {totalPages} ({totalCount} total characters)
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`h-9 w-9 p-0 ${
                  isActive ? 'pointer-events-none' : ''
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="h-9"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
