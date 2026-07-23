# Deployment

## Vercel (primary)

Live demo: https://garden-game.vercel.app

1. Connect the GitHub repository to Vercel
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`
5. Node version: 20+

## GitHub Actions

Workflow: `.github/workflows/ci.yml`

On every PR / push to `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run test:ci`
4. `npm run build`

## Docker

```bash
docker compose up --build
```

App: http://localhost:8080

Image stages:

1. `node:20-alpine` — install + build
2. `nginx:alpine` — serve static SPA with history fallback

## Environment

Copy `.env.example` → `.env` if you need local overrides.

```bash
REACT_APP_STELLAR_NETWORK=testnet
```
