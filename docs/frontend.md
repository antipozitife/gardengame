# Frontend

## Stack

- React 18 + TypeScript
- React Router
- Context API (wallet + theme)
- CSS variables + glassmorphism design system
- Framer Motion for motion / presence
- react-hot-toast for notifications
- Webpack via Create React App (`react-scripts`)

## Key hooks

- `useWallet()` — connect / disconnect Albedo, restore from localStorage
- `useFlowers()` — catalog, balance, purchase flow with step labels
- `useGarden()` — owned flowers, watering, cooldown
- `useTheme()` — light / dark mode

## UI primitives

- `Skeleton` / `FlowerCardSkeleton`
- `Spinner`
- `ErrorState`
- Modal (`WalletModal`) with portal rendering

## Error UX

- Error Boundary for unexpected render crashes
- Dedicated routes/pages for 404 / 500 / wallet / network issues
- Friendly mapping via `getErrorMessage()`

## Testing

Jest + React Testing Library (CRA-native; Webpack project — no Vite migration).

Coverage focus:

- wallet connect/disconnect
- flower purchase happy path
- garden empty/owned states
- error message mapping
- theme toggle
