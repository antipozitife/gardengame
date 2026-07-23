# Garden Game

<p align="center">
  <img src="src/assets/logo.png" alt="Garden Game" width="120" />
</p>

<p align="center">
  <strong>Web3 flower garden on Stellar Soroban</strong><br/>
  Grow flowers, sign with Albedo, settle on-chain.
</p>

<p align="center">
  <a href="https://garden-game.vercel.app"><img src="https://img.shields.io/badge/demo-live-1f8a5b?style=for-the-badge" alt="Live demo" /></a>
  <a href="https://github.com/antipozitife/gardengame/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/antipozitife/gardengame/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2f6fed?style=for-the-badge" alt="MIT" /></a>
  <img src="https://img.shields.io/badge/react-18-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/typescript-4.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/stellar-soroban-000000?style=for-the-badge" alt="Stellar" />
</p>

<p align="center">
  <a href="https://garden-game.vercel.app"><b>https://garden-game.vercel.app</b></a>
</p>

<p align="center">
  <img src="docs/screenshots/banner.jpg" alt="Garden Game banner" width="900" />
</p>

---

## Features

- Buy flowers with XLM via Soroban contract
- Water plants with cooldown + moisture UI
- Albedo wallet connect / sign flow
- IndexedDB garden persistence
- Dark mode
- Toast notifications (`react-hot-toast`)
- Skeleton + spinner async states
- Error Boundary + 404 / wallet / network pages
- Purchase UX steps: buying → wallet confirm → network → done

---

## Tech stack

| Layer | Choices |
| --- | --- |
| UI | React 18, TypeScript, Framer Motion, CSS variables / glassmorphism |
| Bundler | Webpack via Create React App (`react-scripts`) |
| State | Context API (`Wallet`, `Theme`) + custom hooks |
| Web3 | Stellar SDK, Soroban RPC, Albedo |
| Storage | IndexedDB (`idb`) |
| Quality | ESLint, Prettier, Jest, React Testing Library, Husky, lint-staged |
| CI/CD | GitHub Actions, Vercel |
| Ops | Docker + nginx |

> Tests stay on **Jest + RTL** (CRA-native). The app is intentionally Webpack-based (not Vite).

---

## Architecture

```text
src/
├── components/        # Feature UI + ui/ primitives
├── pages/             # Routes (Main, Game, error pages)
├── hooks/             # useWallet, useFlowers, useGarden, useToast, useTheme
├── context/           # WalletProvider, ThemeProvider
├── services/          # stellar, gardenDB, priceService
├── constants/         # contract addresses, purchase steps, garden rules
├── types/             # shared TS types
├── utils/             # pure helpers
├── data/              # flower catalog
└── assets/            # images
```

Docs:

- [Architecture](docs/architecture.md)
- [Smart contract](docs/smart-contract.md)
- [Frontend](docs/frontend.md)
- [Deployment](docs/deployment.md)

---

## Quick start

```bash
git clone https://github.com/antipozitife/gardengame.git
cd gardengame
npm install
npm start
```

Open http://localhost:3000

```bash
npm run lint
npm run test:ci
npm run build
docker compose up --build   # http://localhost:8080
```

---

## What was hardest

The hardest part was **Albedo + Soroban integration**:

- preparing/simulating transactions
- wallet signing and user rejection paths
- mapping network / contract failures into friendly UX
- syncing on-chain purchases with local IndexedDB garden state

---

## Technical decisions

- **Hooks over fat components** — purchase/garden rules live in `useFlowers` / `useGarden`
- **Constants for chain addresses** — easy environment swaps later
- **Error mapping utility** — one place for wallet/network/contract messages
- **Glass design tokens** — light/dark themes via `data-theme`
- **CRA/Webpack kept** — stable portfolio baseline without Vite migration risk

---

## What I learned

- End-to-end Web3 UX (connect → sign → confirm → recover from failure)
- Separating blockchain I/O from React rendering
- Designing async feedback users can trust
- Building a portfolio repo with CI, docs, Docker, and contribution files

---

## Roadmap

- [ ] Achievements / daily rewards
- [ ] Leaderboard
- [ ] Richer plant animations & SFX
- [ ] More contract reads (on-chain balances as source of truth)
- [ ] E2E tests (Playwright)

---

## Lighthouse targets

Optimized for portfolio demos:

| Category | Target |
| --- | --- |
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Applied: semantic landmarks, focus states, lazy images, meta/OG tags, deferred Albedo script, compressed static assets via production build / nginx gzip.

---

## FAQ

**Do I need real money?**  
No — Stellar **testnet** + Friendbot.

**Which wallet?**  
Albedo.

**Why is `node_modules` / `build` not in git?**  
Install with `npm install`, build with `npm run build`.

**Where is the contract?**  
`contract/src/lib.rs` + notes in `docs/smart-contract.md`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Pre-commit (Husky): ESLint + Prettier via lint-staged.

---

## Release

Current release: **v1.0.0** — see [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
