# Smart Contract

Soroban contract source: `contract/src/lib.rs`

Network: **Stellar Testnet**

## Purpose

On-chain ownership and watering timestamps for flowers purchased with native XLM.

## Entrypoints

### `buy_flower_with_payment`

- Auth: buyer must authorize
- Transfers XLM from buyer → shop
- Increments persistent flower balance for `(buyer, flower_id)`
- Increments total flowers for buyer
- Valid `flower_id`: `1..5`

### `water_single_flower`

- Auth: user must authorize
- Transfers watering fee in XLM
- Stores ledger timestamp for `(user, flower_id)`

### `get_last_watering`

- Read-only helper used by the frontend to compute soil moisture / cooldown

## Frontend integration

`src/services/stellar.ts` builds transactions with Stellar SDK, prepares them via Soroban RPC,
and signs through Albedo (`window.albedo.tx`).

Contract / shop / native token addresses live in `src/constants/stellar.ts`.

## Local persistence

After a successful purchase, the app also writes to IndexedDB (`gardenDB`) so the garden UI
can render quickly without re-scanning all chain history.
