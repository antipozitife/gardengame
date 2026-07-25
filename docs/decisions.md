# Architecture Decision Records

Short notes on why key technical choices were made.

## ADR-001: Keep CRA + Webpack (not Vite)

**Decision:** Stay on Create React App / Webpack.

**Why:** The project already ships on CRA; migrating to Vite mid-portfolio iteration adds risk without changing product value. Interviewers care more about architecture, tests, CI, and Web3 UX than the bundler brand.

**Consequence:** Jest + RTL remain the test stack (CRA-native). Vitest was intentionally not introduced.

## ADR-002: Context + hooks instead of Redux/Zustand

**Decision:** Use Context for wallet/theme and custom hooks for domain logic.

**Why:** State surface is small (wallet key, theme, flower/garden async flows). Hooks keep components thin and testable without extra store boilerplate.

## ADR-003: IndexedDB mirror of purchases

**Decision:** Persist purchases locally after successful Soroban tx.

**Why:** Instant garden UI without reconstructing full chain history on every visit. Contract remains source of payment truth; local DB is a read-optimized cache.

## ADR-004: Friendly error mapping

**Decision:** Centralize message normalization in `getErrorMessage()`.

**Why:** Albedo / Horizon / Soroban errors are noisy. Consistent UX copy improves trust during wallet reject / network / contract failures.

## ADR-005: Route-level code splitting

**Decision:** Load pages with `React.lazy` + `Suspense`.

**Why:** Landing and game bundles separate cleanly; improves Lighthouse Performance on first paint for `/`.

## ADR-006: Accessibility as a first-class UX concern

**Decision:** Add landmarks, aria-labels, keyboard-friendly controls, and visible `:focus-visible` styles.

**Why:** Many companies score a11y in interviews and Lighthouse Accessibility audits.
