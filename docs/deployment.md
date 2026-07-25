# Развёртывание

## Vercel

Production-версия: [gardengame-peach.vercel.app](https://gardengame-peach.vercel.app)

Настройки проекта:

1. Подключить GitHub-репозиторий к Vercel.
2. Выбрать шаблон Create React App.
3. Указать команду сборки `npm run build`.
4. Указать выходной каталог `build`.
5. Использовать Node.js 20 или новее.
6. Выбрать `main` в качестве production-ветки.

Пуш в `main` запускает production-развёртывание. Ветки и Pull Request создают отдельные
предварительные развёртывания.

## GitHub Actions

Конфигурация: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Для каждого Pull Request и пуша в `main` выполняются:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:ci`
5. `npm run build`

## Docker

```bash
docker compose up --build
```

Приложение будет доступно по адресу [http://localhost:8080](http://localhost:8080).

Этапы создания образа:

1. `node:20-alpine` — установка зависимостей и production-сборка.
2. `nginx:alpine` — раздача статического SPA с резервной маршрутизацией на `index.html`.

## Переменные окружения

Скопируйте `.env.example` в `.env`, если нужны локальные переопределения:

```bash
cp .env.example .env
```

```bash
REACT_APP_STELLAR_NETWORK=testnet
REACT_APP_HORIZON_URL=https://horizon-testnet.stellar.org
REACT_APP_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
REACT_APP_CONTRACT_ADDRESS=...
REACT_APP_SHOP_ADDRESS=...
REACT_APP_NATIVE_TOKEN_ADDRESS=...
```

Публичные параметры имеют testnet-значения по умолчанию. Секретные ключи нельзя хранить в
переменных `REACT_APP_*`: CRA и Webpack встраивают их в клиентский bundle.
