# Architecture

## Overview

Garden Game is a React SPA that talks to a Soroban smart contract on Stellar testnet
through the Albedo wallet, while keeping purchased flowers in IndexedDB for a fast local garden view.

```text
Browser
  ├── React UI (pages/components)
  ├── Hooks (useWallet / useFlowers / useGarden)
  ├── Services
  │     ├── stellar.ts  → Horizon + Soroban RPC + Albedo signing
  │     └── gardenDB.ts → IndexedDB persistence
  └── Context
        ├── WalletProvider
        └── ThemeProvider
```

## Folder responsibilities

| Folder | Responsibility |
| --- | --- |
| `components/` | Presentational UI and feature widgets |
| `components/ui/` | Reusable primitives (Skeleton, Spinner, ErrorState) |
| `pages/` | Route-level screens |
| `hooks/` | Business logic & async orchestration |
| `services/` | External systems (Stellar, IndexedDB, APIs) |
| `context/` | Cross-cutting providers (wallet, theme) |
| `constants/` | Addresses, cooldowns, storage keys |
| `types/` | Shared TypeScript contracts |
| `utils/` | Pure helpers |
| `data/` | Static game catalog |
| `assets/` | Images / media |

## Data flow (buy flower)

1. User clicks **Buy** in `FlowerShop`
2. `useFlowers.buy()` validates wallet + balance
3. UX steps update: buying → wallet confirm → network wait → done
4. `stellar.buyFlower()` prepares Soroban tx and asks Albedo to sign
5. On success, purchase is stored in IndexedDB
6. Toast confirms success and garden/balance refresh

## Why this split

- UI stays thin and testable
- Blockchain quirks live in `services/stellar.ts`
- Hooks encapsulate product rules (cooldown, balance checks)
- Context keeps auth/theme global without prop drilling
