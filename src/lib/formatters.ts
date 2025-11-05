/**
 * Helper функции для форматирования данных SWAPI
 */

/**
 * Форматирование поля с обработкой unknown/n/a значений
 */
export const formatField = (value: string, unit?: string): string => {
  if (!value || value === 'unknown') {
    return 'Not recorded';
  }
  if (value === 'n/a') {
    return 'N/A';
  }
  if (value === 'none') {
    return 'None';
  }
  return unit ? `${value} ${unit}` : value;
};

/**
 * Форматирование даты в читаемый формат
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Извлечение ID из SWAPI URL
 * Example: https://swapi.py4e.com/api/planets/1/ -> "1"
 */
export const extractIdFromUrl = (url: string): string => {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? match[1] : '';
};

/**
 * Извлечение типа ресурса из URL
 * Example: https://swapi.py4e.com/api/planets/1/ -> "planets"
 */
export const extractResourceType = (url: string): string => {
  const match = url.match(/\/api\/(\w+)\//);
  return match ? match[1] : '';
};

/**
 * Форматирование массива для отображения
 */
export const formatArray = (arr: string[]): string => {
  if (!arr || arr.length === 0) {
    return 'None';
  }
  return arr.length.toString();
};
