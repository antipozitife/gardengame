# Клиентская часть

## Технологический стек

- React 18 и TypeScript
- React Router
- Context API для кошелька и темы
- CSS-переменные и дизайн в стиле glassmorphism
- Framer Motion для анимаций
- `react-hot-toast` для уведомлений
- Webpack через Create React App (`react-scripts`)

## Основные хуки

- `useWallet()` — подключение и отключение Albedo, восстановление ключа из `localStorage`
- `useFlowers()` — каталог, баланс и этапы покупки
- `useGarden()` — приобретённые цветы, полив и cooldown
- `useTheme()` — светлая и тёмная темы
- `useToast()` — единый интерфейс уведомлений

## UI-примитивы

- `Skeleton` и `FlowerCardSkeleton`
- `Spinner`
- `ErrorState`
- `PageLoader`
- модальное окно `WalletModal` с portal, focus trap и возвратом фокуса

Карусель автоматически переключает слайды и учитывает системную настройку
`prefers-reduced-motion`.

## Работа с ошибками

- Error Boundary перехватывает неожиданные ошибки рендеринга.
- Для ошибок 404, 500, кошелька и сети предусмотрены отдельные страницы.
- `getErrorMessage()` преобразует технические ошибки в понятные сообщения.
- В production внутренние детали ошибки не показываются пользователю.

## Тестирование

Используются Jest и React Testing Library — нативный для CRA тестовый стек.

Покрыты основные сценарии:

- подключение и отключение кошелька;
- успешная покупка цветка;
- пустой и заполненный сад;
- преобразование ошибок;
- переключение темы;
- чистая логика полива и влажности.

## Обязательные проверки

- ESLint
- TypeScript: `tsc --noEmit`
- Jest и React Testing Library
- Production-сборка Webpack через `react-scripts`

Локально полный набор проверок запускается командами:

```bash
npm run lint
npm run typecheck
npm run test:ci
npm run build
```
