# Star Wars Characters App

Приложение для просмотра и редактирования персонажей Star Wars с использованием SWAPI API.

## Обзор проекта

**Основной функционал:**
- Загрузка данных из SWAPI API
- Редактирование полей персонажей с сохранением в `localStorage`
- Поиск с debounce 300ms
- Пагинация с URL state
- Flip-анимация карточек при наведении
- Badge "Edited" для измененных персонажей

Изменения отображаются только локально и не отправляются на сервер. API данные мержатся с локальными правками через приоритет `localStorage`.

## Технологии

**Stack:**
- React 19
- Vite 7
- TypeScript 5.9
- Tailwind CSS 4
- React Router 7
- Framer Motion
- shadcn/ui
- yet-another-react-lightbox

**API:**
- SWAPI: `swapi.py4e.com/api/people` (82 персонажа с пагинацией по 10 штук)
- Изображения: `akabab.github.io/starwars-api/id/{id}.jpg`

## Структура проекта

```
src/
├── api/
│   ├── swapi.ts              # SWAPI API клиент
│   ├── localStorage.ts       # Работа с localStorage
│   └── types.ts              # TypeScript типы
│
├── components/
│   ├── ui/                   # shadcn/ui компоненты
│   ├── CharacterCard.tsx     # Карточка персонажа с flip-анимацией
│   ├── CharacterCardSkeleton.tsx
│   ├── SearchBar.tsx
│   └── Pagination.tsx
│
├── hooks/
│   ├── useCharacters.ts      # Список персонажей
│   ├── useCharacter.ts       # Детали персонажа
│   ├── useCharacterEdit.ts   # Редактирование
│   ├── useCharacterImage.ts  # Загрузка изображений
│   ├── useResourceName.ts    # Resolve SWAPI URLs
│   └── useDebounce.ts        # Debounce hook
│
├── lib/
│   ├── formatters.ts         # Форматирование данных
│   └── utils.ts              # Утилиты (cn helper)
│
├── pages/
│   ├── CharactersPage.tsx    # Главная страница со списком
│   └── CharacterDetailPage.tsx # Детальная страница персонажа
│
├── App.tsx                   # Роутинг
├── main.tsx                  # Точка входа
└── index.css                 # Tailwind + CSS переменные

tests/
├── unit/                     # Unit тесты (Vitest)
├── integration/              # Integration тесты (RTL + MSW)
└── e2e/                      # E2E тесты (Playwright)
```

## Ключевые решения

### Flip-анимация карточек

При наведении карточка плавно переворачивается в 3D через `framer-motion` с `rotateY(180deg)`. Фронтальная сторона показывает изображение и имя, обратная — детали персонажа. Используется `backfaceVisibility: hidden` и `transformStyle: preserve-3d`.

### Race Conditions Prevention + Memory Leaks

При быстром переключении страниц используется `cancelled` флаг в cleanup функции `useEffect`. Когда запускается новый запрос или компонент размонтируется, результаты предыдущих запросов игнорируются. Все таймеры отменяются через `clearTimeout`, не остаётся "зомби" процессов.

### Параллельная загрузка через Promise.all

Вместо последовательной загрузки связанных ресурсов (films, vehicles, starships) используется `Promise.all`. При 1 секунде на запрос разница: 5+ секунд последовательно vs 1 секунда параллельно.

### Incremental Data Loading (Progressive Rendering)

Показываем fallback сразу (`"Film #1, Film #2"`), затем асинхронно заменяем на реальные данные (`"A New Hope, Empire Strikes Back"`). Пользователь видит контент мгновенно, как progressive JPEG.

### Graceful Error Handling

Каждый асинхронный вызов обёрнут в `try-catch`. Ошибки показываются через Alert, при отсутствии данных — плейсхолдеры. Приложение продолжает работать даже при падении API.

### Умный поиск с пагинацией

- Запрос отправляется через 300ms после остановки ввода (debounce)
- Пагинация автоматически сбрасывается на первую страницу при новом поиске
- Номера страниц: первая ... текущая ... последняя (компактный вид)

### localStorage + API merge

Локальные изменения накладываются поверх данных API через `{ ...apiData, ...localEdits }`. Оригинальные данные не теряются, можно редактировать без регистрации.

### HoverCard с оригинальным значением

При наведении на отредактированное поле показывается всплывающая подсказка с оригинальным значением из API. Не нужно отменять изменения чтобы вспомнить исходное значение.

### Undo для отдельных полей

Рядом с каждым измененным полем кнопка *Undo* для отката к оригиналу. Можно откатить одно поле не сбрасывая остальные изменения.

### URL state для шаринга

Текущая страница и поисковый запрос сохраняются в URL. Можно скопировать ссылку — получатель увидит те же результаты.

### Архитектура

Вся бизнес-логика в custom hooks (`useCharacters`, `useDebounce`, `useCharacterEdit`) вместо раздувания компонентов. Чистое разделение слоёв:
- `/api` — работа с данными
- `/hooks` — состояние и эффекты
- `/components` — рендеринг UI
- `/pages` — композиция

Каждый модуль решает одну задачу (Single Responsibility Principle), компоненты тонкие и декларативные, логика инкапсулирована и тестируема.

### Accessibility

- Semantic HTML (`<button>`, `<input type="search">`, `<main>`, `<header>`)
- `alt` атрибуты на изображениях
- Keyboard navigation (Enter/Escape, Tab)
- ARIA labels для интерактивных элементов
- Focus management в lightbox и формах

### Дополнительно

- Skeleton loaders пока грузятся данные
- Кнопки *Cancel* и *Reset* для управления редактированием
- Автоформатирование пустых значений (`unknown` → `Not recorded`, единицы измерения)
- Badge *"Edited"* на карточках с локальными изменениями
- Lightbox для полноэкранного просмотра изображений

## Тестирование

**Полная пирамида тестов: 75 тестов**

- **Unit (37 тестов):** чистые функции (formatters, localStorage, swapi)
- **Integration (22 теста):** хуки и компоненты (RTL + MSW)
- **E2E (16 тестов):** критичные флоу (Playwright)

Детальное описание в [`tests/README.md`](tests/README.md).

### Команды

```bash
# Development
npm run dev              # Запуск dev сервера
npm run build            # Production build
npm run preview          # Превью production build

# Testing
npm run test             # Vitest в watch режиме
npm run test:unit        # Unit тесты
npm run test:integration # Integration тесты
npm run test:e2e         # E2E тесты (Playwright)
npm run test:all         # Все тесты
npm run test:coverage    # Coverage отчет
```

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
```

Приложение откроется на `http://localhost:5173`
