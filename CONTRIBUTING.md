# Contributing to Garden Game

Thanks for your interest in contributing!

## Development setup

```bash
git clone https://github.com/antipozitife/gardengame.git
cd gardengame
npm install
npm start
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Dev server (Webpack / CRA) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Jest + RTL (watch) |
| `npm run test:ci` | CI tests |
| `npm run build` | Production build |

## Branch & PR workflow

1. Create a feature branch from `main`
2. Keep commits focused and descriptive
3. Ensure `lint`, `test:ci`, and `build` pass
4. Open a Pull Request with a short summary and test plan

## Code style

- TypeScript for all new code
- Prefer hooks for business logic (`useWallet`, `useFlowers`, `useGarden`)
- Keep UI components presentational when possible
- Use design tokens from CSS variables (`--color-*`, `--glass-*`)
- Run Prettier before committing (Husky will enforce this)

## Commit hooks

Pre-commit runs:

- ESLint on staged `ts/tsx`
- Prettier on staged files
- Related tests via `lint-staged` / project scripts

## Reporting issues

Please include:

- Steps to reproduce
- Expected vs actual behavior
- Browser / network (Stellar testnet) details
- Screenshots if UI-related
