# notion-embed-js

## 1.2.0

### Minor Changes

- **Calendar API**: Day view with a 24-hour timeline and colored timed blocks; Work week, Week, and Month grids; desktop inline view tabs; mobile defaults to Day (today), hides Month, uses a compact `width: max-content` view select with left-aligned title row, and horizontal scroll with three visible day columns plus snap for week-style layouts.
- **Exports**: `VIEW_OPTIONS`, `calendarViewOptionsForMobile`, `CALENDAR_MOBILE_MAX_PX`, and `formatCalendarPeriodTitle` for integrators.
- **Tooling**: Prettier, ESLint (flat config), and `pnpm test:coverage` via `@vitest/coverage-v8`.

## 1.1.0

### Minor Changes

- **Calendar API**: Outlook-style event peek UI using `@radix-ui/react-popover` (anchored chips and day agenda), with Fluent-style panel chrome and tokens from `calendarVisualTokens`.
- **Launcher**: Floating launcher uses a Radix modal popover; inner embed mounts after the portal is ready for reliable iframe and `calendar-api` rendering.
- **Peers**: Declare `react`, `react-dom`, and `@radix-ui/react-popover` as peer dependencies for native calendar and launcher flows.
- **Tooling**: TypeScript `react-jsx`, Vitest setup with a `ResizeObserver` stub, and tests updated for Radix mount timing.
