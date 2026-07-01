# 🌸 Flower Garden

Браузерная игра-симулятор сада на блокчейне Stellar. Покупайте цветы за тестовые XLM, поливайте их и следите за садом через кошелёк Albedo. Проект создан как pet-проект для портфолио junior frontend-разработчика.

> **Live Demo:** _добавьте ссылку после деплоя (Vercel / Netlify / GitHub Pages)_

## Скриншоты

| Лендинг | Игра — магазин | Игра — сад | Профиль |
|---------|----------------|------------|---------|
| ![Лендинг](docs/screenshots/landing.png) | ![Магазин](docs/screenshots/shop.png) | ![Сад](docs/screenshots/garden.png) | ![Профиль](docs/screenshots/profile.png) |

![Игровой процесс](docs/screenshots/gameplay.gif)

> Скриншоты и GIF лежат в `docs/screenshots/`. Инструкция по созданию — в [docs/screenshots/README.md](docs/screenshots/README.md).

## Стек

| Категория | Технологии |
|-----------|------------|
| Frontend | React 18, TypeScript, React Router |
| Сборка | Create React App |
| Blockchain | Stellar SDK, Soroban smart contract, Albedo wallet |
| Хранение | IndexedDB (история покупок), localStorage (сессия кошелька) |
| API | Horizon Testnet, CoinGecko |
| Тесты | Jest, React Testing Library |
| Контракт | Rust (Soroban) — `contract/` |

## Основные возможности

- **Лендинг** — слайдер, описание игры, виды цветов, блок про XLM
- **Подключение кошелька** — Albedo (Stellar testnet)
- **Магазин цветов** — покупка через Soroban-контракт
- **Мой сад** — просмотр купленных цветов, полив, уровень влажности
- **Профиль** — публичный ключ, баланс XLM, отключение кошелька
- **Единый источник данных** — цветы описаны в `src/data/flowers.ts`
- **WalletContext** — централизованное управление состоянием кошелька

## Быстрый старт

### Требования

- Node.js 18+
- npm 9+
- Кошелёк [Albedo](https://albedo.link/) и тестовые XLM ([Friendbot](https://laboratory.stellar.org/#account-creator?network=test))

### Установка и запуск

```bash
git clone <url-репозитория>
cd gardengame
npm install
npm start
```

Приложение откроется на [http://localhost:3000](http://localhost:3000).

### Другие команды

```bash
npm run build     # production-сборка
npm run test      # тесты в watch-режиме
npm run test:ci   # тесты для CI (без watch)
npm run lint      # ESLint
npm run format    # Prettier
```

### Переменные окружения

Скопируйте `.env.example` в `.env` при необходимости:

```bash
cp .env.example .env
```

## Структура проекта

```
gardengame/
├── public/                 # Статика
├── contract/               # Soroban smart contract (Rust)
├── docs/screenshots/       # Скриншоты для README
├── src/
│   ├── components/         # UI-компоненты
│   │   ├── FlowerShop/     # Магазин
│   │   ├── MyGarden/       # Сад
│   │   ├── WalletModal/    # Модалка кошелька
│   │   └── XLMToken/       # Секция про XLM на лендинге
│   ├── context/
│   │   └── WalletContext.tsx
│   ├── data/
│   │   └── flowers.ts      # Единый каталог цветов
│   ├── pages/
│   │   ├── MainPage.tsx    # Лендинг
│   │   └── GamePage.tsx    # Игровая страница
│   ├── services/
│   │   ├── stellar.ts      # Stellar / Soroban API
│   │   ├── gardenDB.ts     # IndexedDB
│   │   └── priceService.ts # CoinGecko
│   └── utils/
│       └── getErrorMessage.ts
├── package.json
└── README.md
```

## Тесты

Покрыты ключевые сценарии:

- `FlowerShop` — без кошелька, disabled-кнопки «Купить», открытие модалки
- `WalletModal` — открытие / закрытие
- `WalletContext` — connect / disconnect / restore из localStorage
- `flowers.ts` — данные каталога
- `getErrorMessage` — человекочитаемые ошибки

```bash
npm run test:ci
```

## Валюта в игре

Игра использует **нативный XLM** (Stellar Lumens) в testnet. Отдельный токен FLW не реализован — это осознанное решение для MVP.

## Roadmap (запланировано)

- Создание и продажа букетов
- Деплой на Vercel/Netlify
- Lazy-loading игровой страницы
- Кастомный токен (опционально)

## Лицензия

MIT (или укажите свою лицензию)
