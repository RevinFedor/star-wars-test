# Тестирование Star Wars App

═══════════════════════════════════════════════════════════════════════
# СТРУКТУРА ПРОЕКТА
═══════════════════════════════════════════════════════════════════════

tests/
├── unit/                        чистые функции через Vitest: *37 тестов*, ~1 сек
│   ├── formatters.test.ts       форматирование дат/полей, извлечение ID из URL SWAPI, обработка `unknown/n/a`
│   ├── localStorage.test.ts     CRUD операции `star-wars-character-edits`, merge логика, очистка пустых записей
│   └── swapi.test.ts            парсинг URL персонажей, mock `fetch` через `vi.fn()`, проверка query параметров
│
├── integration/                 React компоненты + хуки через RTL: *22 теста*, ~2 сек
│   ├── SearchBar.test.tsx       рендеринг, `onChange` события, `userEvent.type()` для симуляции ввода
│   ├── CharacterCard.test.tsx   проверка badge "Edited" через localStorage, flip карточка front/back, линки
│   ├── useCharacters.test.tsx   загрузка через MSW моки, фильтрация, обработка ошибок *500*, race conditions
│   └── useDebounce.test.tsx     задержка *300ms*, отмена предыдущего timeout, `waitFor` для асинхронности
│
├── e2e/                         критичные флоу через Playwright: *16 тестов*, ~11 сек
│   ├── 01-critical-flow.spec.ts         главная → клик Luke → Edit → изменить имя → Save → проверка localStorage
│   ├── 02-localStorage-persistence.spec.ts  множественное редактирование, инкрементальные изменения, merge
│   ├── 03-search-functionality.spec.ts  debounce поиска (1 запрос вместо 4), фильтрация, восстановление из URL
│   └── 04-error-handling.spec.ts        моки *500/404* ошибок, навигация после ошибок, отсутствие изображений
│
├── mocks/
│   ├── handlers.ts              MSW handlers для `/api/people`, возвращает Luke/C-3PO/planets/films
│   └── server.ts                `setupServer()` для Node окружения Vitest
│
├── setup.ts                     автозапуск MSW через `beforeAll/afterAll`, mock localStorage, `scrollTo`
├── vitest.config.ts             `jsdom` окружение, alias `@/*`, coverage исключения `ui/` компонентов
└── playwright.config.ts         `baseURL: localhost:5173`, webServer автостарт `npm run dev`, только chromium

═══════════════════════════════════════════════════════════════════════
# ПИРАМИДА ТЕСТИРОВАНИЯ
═══════════════════════════════════════════════════════════════════════

## Распределение по типам

**Unit (70%):** *37 тестов* покрывают чистые функции без зависимостей. Запускаются за миллисекунды, изолированы через `vi.fn()` моки для `fetch`. Тестируют `formatters.ts`, `localStorage.ts`, `swapi.ts` API парсеры.

**Integration (20%):** *22 теста* покрывают React компоненты + хуки с реальными данными через MSW. Запускаются за секунды, используют `renderHook()` для хуков, `render()` + `userEvent` для компонентов. MSW перехватывает `fetch` запросы и возвращает mock данные без реального API.

**E2E (10%):** *16 тестов* покрывают критичные user flows в реальном браузере. Запускаются за минуты, используют `page.route()` для mock API, проверяют интеграцию localStorage + UI + navigation. Playwright автоматически стартует dev сервер через `webServer` конфиг.

═══════════════════════════════════════════════════════════════════════
# MSW ИНТЕГРАЦИЯ
═══════════════════════════════════════════════════════════════════════

## Автоматический setup

**Глобальный запуск:** `setup.ts` стартует MSW сервер через `beforeAll()`, reset handlers через `afterEach()`, останавливает через `afterAll()`. Все integration тесты автоматически получают mock API без дополнительной настройки.

**Handlers структура:** `handlers.ts` содержит `http.get()` для всех SWAPI endpoints: `/people/` для списка, `/people/:id` для деталей, `/planets/:id`, `/films/:id`. Возвращает статичные данные Luke Skywalker и C-3PO для предсказуемости тестов.

**Поиск через query:** handler `/api/people/` читает `search` параметр из URL через `new URLSearchParams()`, фильтрует массив персонажей через `.filter()` по имени. Это позволяет тестировать search функционал без реального HH API.

───────────────────────────────────────────────────────────────────────
### Override handlers в тестах
───────────────────────────────────────────────────────────────────────

**Локальные моки:** любой integration тест может переопределить handler через `server.use(http.get(...))` для симуляции ошибок. Например `useCharacters.test.tsx` переопределяет `/people/` на *500 ошибку* для проверки error state. После теста `afterEach()` автоматически сбрасывает handlers.

═══════════════════════════════════════════════════════════════════════
# PLAYWRIGHT КОНФИГУРАЦИЯ
═══════════════════════════════════════════════════════════════════════

## WebServer автозапуск

**Dev сервер:** `playwright.config.ts` содержит `webServer` секцию с командой `npm run dev` и `url: localhost:5173`. Playwright автоматически стартует Vite dev сервер перед тестами, ждет когда сервер станет доступен, останавливает после завершения.

**Retry стратегия:** `retries: 2` только в CI окружении через `process.env.CI`. Локально тесты НЕ retry чтобы видеть реальные проблемы сразу. Screenshots делаются только при падении через `screenshot: 'only-on-failure'`.

## API mocking в браузере

**Route intercept:** E2E тесты используют `page.route('**/api/people/*', ...)` для перехвата fetch запросов в браузере. Можно вернуть mock данные через `route.fulfill()` или симулировать ошибки. В отличие от MSW (Node окружение), Playwright моки работают в реальном браузере.

**Real API fallback:** если route НЕ перехвачен, Playwright делает реальный запрос к SWAPI. Это полезно для smoke тестов где проверяем реальное API, но большинство тестов мокируют API для стабильности и скорости.

═══════════════════════════════════════════════════════════════════════
# ПАТТЕРНЫ ТЕСТИРОВАНИЯ
═══════════════════════════════════════════════════════════════════════

## Debounce тестирование

**Быстрый ввод:** `03-search-functionality.spec.ts` набирает "luke" с задержкой *50ms* между буквами (быстрее чем *300ms* debounce), перехватывает все fetch через `page.route()`, считает количество запросов. Ожидаемый результат: только *1 запрос* вместо 4, что доказывает работу debounce.

**waitFor асинхронность:** `useDebounce.test.tsx` использует `waitFor()` с timeout *400ms* для проверки что значение обновилось ПОСЛЕ debounce задержки. Без `waitFor()` тест проверит значение сразу и упадет.

## localStorage validation

**Inspect storage:** E2E тесты используют `page.evaluate(() => localStorage.getItem(...))` для чтения localStorage из браузера, парсят JSON через `JSON.parse()`, проверяют структуру объекта `edits['1'].name`. Это проверяет не только UI но и реальное сохранение данных.

**Multiple edits merge:** `02-localStorage-persistence.spec.ts` редактирует Luke, потом C-3PO, проверяет что localStorage содержит оба объекта в одном ключе. Это проверяет merge логику где каждый персонаж это отдельный ключ в объекте, а не отдельная запись.

## Race conditions prevention

**Cleanup testing:** `useCharacters.test.tsx` вызывает `unmount()` сразу после запуска запроса, проверяет что нет ошибок state update. Хук использует `cancelled` флаг в useEffect cleanup для игнорирования результатов после unmount. Без этого возможна ошибка "Can't perform state update on unmounted component".

═══════════════════════════════════════════════════════════════════════
# ЗАПУСК ТЕСТОВ
═══════════════════════════════════════════════════════════════════════

## Команды

**Unit только:** `npm run test:unit` запускает Vitest для `tests/unit/`, *37 тестов* за ~1 сек. Используй для быстрой проверки чистых функций без React.

**Integration только:** `npm run test:integration` запускает Vitest для `tests/integration/`, *22 теста* за ~2 сек. MSW автоматически стартует через `setup.ts`. Используй для проверки компонентов и хуков.

**E2E только:** `npm run test:e2e` запускает Playwright, *16 тестов* за ~11 сек. Dev сервер автоматически стартует через `webServer` конфиг. Используй перед деплоем для проверки критичных флоу.

**Все вместе:** `npm run test:all` запускает `vitest run && playwright test` последовательно. Unit + Integration быстро (~3 сек), E2E медленно (~11 сек). Итого *75 тестов* за ~14 сек.

**Watch mode:** `npm run test` (без :unit/integration) запускает Vitest в watch mode. Пересобирает тесты при изменении файлов. Playwright НЕ имеет watch mode, используй `npm run test:e2e:ui` для интерактивного режима.

## Coverage отчет

**Генерация:** `npm run test:coverage` запускает Vitest с `coverage.provider: 'v8'`, генерирует отчет в `coverage/` папке. Открой `coverage/index.html` для визуального отчета. Исключает `node_modules/`, `tests/`, `src/components/ui/` (shadcn компоненты).
