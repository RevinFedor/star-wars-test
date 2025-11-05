# Тестирование Star Wars App

Полная документация по тестированию приложения: unit, integration и e2e тесты.

## Структура проекта

```
tests/
├── unit/                        # Vitest: 37 тестов, ~1 сек
│   ├── formatters.test.ts       # Форматирование дат/полей, извлечение ID
│   ├── localStorage.test.ts     # CRUD операции, merge логика
│   └── swapi.test.ts            # Парсинг URL, mock fetch
│
├── integration/                 # RTL + MSW: 22 теста, ~2 сек
│   ├── SearchBar.test.tsx       # Рендеринг, события onChange
│   ├── CharacterCard.test.tsx   # Badge "Edited", flip анимация
│   ├── useCharacters.test.tsx   # Загрузка данных, ошибки, race conditions
│   └── useDebounce.test.tsx     # Задержка 300ms, отмена timeout
│
├── e2e/                         # Playwright: 16 тестов, ~11 сек
│   ├── 01-critical-flow.spec.ts          # Полный флоу редактирования
│   ├── 02-localStorage-persistence.spec.ts # Множественное редактирование
│   ├── 03-search-functionality.spec.ts    # Debounce поиска
│   └── 04-error-handling.spec.ts          # Обработка ошибок 500/404
│
├── mocks/
│   ├── handlers.ts              # MSW handlers для SWAPI endpoints
│   └── server.ts                # setupServer() для Vitest
│
├── setup.ts                     # Автозапуск MSW, mock localStorage
├── vitest.config.ts             # jsdom, alias @/*, coverage настройки
└── playwright.config.ts         # baseURL, webServer автостарт
```

## Пирамида тестирования

### Распределение по типам

**Unit (70%): 37 тестов**
- Покрывают чистые функции без зависимостей
- Запускаются за миллисекунды
- Изолированы через `vi.fn()` моки для `fetch`
- Тестируют: `formatters.ts`, `localStorage.ts`, `swapi.ts`

**Integration (20%): 22 теста**
- Покрывают React компоненты + хуки с MSW
- Запускаются за секунды
- Используют `renderHook()` для хуков, `render()` + `userEvent` для компонентов
- MSW перехватывает `fetch` запросы без реального API

**E2E (10%): 16 тестов**
- Покрывают критичные user flows в браузере
- Запускаются за минуты
- Используют `page.route()` для mock API
- Проверяют интеграцию localStorage + UI + navigation

## MSW интеграция

### Автоматический setup

**Глобальный запуск:**
- `setup.ts` стартует MSW сервер через `beforeAll()`
- Reset handlers через `afterEach()`
- Останавливает через `afterAll()`
- Все integration тесты автоматически получают mock API

**Handlers структура:**
- `handlers.ts` содержит `http.get()` для SWAPI endpoints
- `/people/` для списка, `/people/:id` для деталей
- Возвращает статичные данные Luke Skywalker и C-3PO

**Поиск через query:**
- Handler `/api/people/` читает `search` параметр
- Фильтрует массив персонажей по имени
- Позволяет тестировать search без реального API

### Override handlers в тестах

**Локальные моки:**
- Любой тест может переопределить handler через `server.use(http.get(...))`
- Например: `useCharacters.test.tsx` переопределяет `/people/` на 500 ошибку
- После теста `afterEach()` автоматически сбрасывает handlers

## Playwright конфигурация

### WebServer автозапуск

**Dev сервер:**
- `playwright.config.ts` содержит `webServer` секцию
- Команда: `npm run dev`, URL: `localhost:5173`
- Playwright автоматически стартует Vite перед тестами
- Ждет доступности сервера, останавливает после завершения

**Retry стратегия:**
- `retries: 2` только в CI окружении (`process.env.CI`)
- Локально тесты НЕ retry — видим проблемы сразу
- Screenshots только при падении: `screenshot: 'only-on-failure'`

### API mocking в браузере

**Route intercept:**
- E2E тесты используют `page.route('**/api/people/*', ...)`
- Перехватывают fetch запросы в браузере
- Возвращают mock данные через `route.fulfill()`
- В отличие от MSW (Node), Playwright работает в браузере

**Real API fallback:**
- Если route НЕ перехвачен, делается реальный запрос
- Полезно для smoke тестов
- Большинство тестов мокируют для стабильности

## Паттерны тестирования

### Debounce тестирование

**Быстрый ввод:**
- `03-search-functionality.spec.ts` набирает "luke" с задержкой 50ms между буквами
- Быстрее чем debounce 300ms
- Перехватывает все fetch через `page.route()`
- Ожидаемый результат: только 1 запрос вместо 4

**waitFor асинхронность:**
- `useDebounce.test.tsx` использует `waitFor()` с timeout 400ms
- Проверяет что значение обновилось ПОСЛЕ debounce
- Без `waitFor()` тест упадет сразу

### localStorage validation

**Inspect storage:**
- E2E тесты используют `page.evaluate(() => localStorage.getItem(...))`
- Парсят JSON через `JSON.parse()`
- Проверяют структуру: `edits['1'].name`
- Проверяет не только UI, но и реальное сохранение

**Multiple edits merge:**
- `02-localStorage-persistence.spec.ts` редактирует Luke и C-3PO
- Проверяет что localStorage содержит оба объекта в одном ключе
- Проверяет merge логику

### Race conditions prevention

**Cleanup testing:**
- `useCharacters.test.tsx` вызывает `unmount()` сразу после запуска запроса
- Проверяет отсутствие ошибок state update
- Хук использует `cancelled` флаг в cleanup
- Предотвращает "Can't perform state update on unmounted component"

## Запуск тестов

### Команды

```bash
# Unit тесты
npm run test:unit        # 37 тестов за ~1 сек

# Integration тесты
npm run test:integration # 22 теста за ~2 сек

# E2E тесты
npm run test:e2e         # 16 тестов за ~11 сек

# Все тесты
npm run test:all         # 75 тестов за ~14 сек

# Watch mode
npm run test             # Vitest в watch режиме

# E2E UI mode
npm run test:e2e:ui      # Интерактивный режим Playwright
```

### Coverage отчет

```bash
# Генерация coverage
npm run test:coverage

# Открыть отчет
open coverage/index.html
```

**Настройки:**
- Provider: `v8`
- Исключения: `node_modules/`, `tests/`, `src/components/ui/`
- Форматы: text, json, html

## Итого

**75 тестов** покрывают все критичные части приложения:
- Unit: чистые функции и утилиты
- Integration: React компоненты и хуки
- E2E: полные user flows в браузере

Общее время выполнения: **~14 секунд**
