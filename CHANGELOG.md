# notion-embed-js

## 1.1.0

### Minor Changes

- **Calendar API**: Outlook-style event peek UI using `@radix-ui/react-popover` (anchored chips and day agenda), with inline styles aligned with the chai.org `CalendarEventPeek` sample.
- **Launcher**: Floating launcher uses a Radix modal popover; inner embed mounts after the portal is ready for reliable iframe and `calendar-api` rendering.
- **Peers**: Declare `react`, `react-dom`, and `@radix-ui/react-popover` as peer dependencies for native calendar and launcher flows.
- **Tooling**: TypeScript `react-jsx`, Vitest setup with a `ResizeObserver` stub, and tests updated for Radix mount timing.
