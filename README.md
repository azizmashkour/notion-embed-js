# notion-embed-js

Embed Notion public pages and calendar views into any website. Supports **page** and **calendar** iframe embeds (published `notion.site` URLs), plus **calendar-api**: a native month calendar driven by events you fetch on the server with `NOTION_API_KEY` and `NOTION_CALENDAR_DATABASE_ID`.

## Features

- **Page embed** – Embed any public Notion page with configurable dimensions
- **Calendar embed (iframe)** – Published Notion calendar view, full-width in its container
- **Calendar API (native UI)** – Server-side fetch via official Notion client; browser renders a month grid (no API key in the client)
- **Color palette** – Optional `calendarPalette` / `defaultNotionCalendarPalette` for the native calendar
- **Floating launcher** – Optional `launcher: true` (or config): rounded corner button fixed on the viewport; opens a **Radix UI Popover** (modal) with the same embed, using the same border/shadow treatment as the chai.org popover primitive
- **Outlook-style event peek** – In **`calendar-api`** mode, each event chip opens an **anchored `@radix-ui/react-popover`** whose layout matches the former **chai.org `CalendarEventPeek`** sample (blue top bar, Clock / Location / Notes rows, optional link row—using your event’s `linkUrl`, not a Notion page URL)
- **TypeScript** – Full type definitions included

**Peer dependencies (browser):** install **`react`**, **`react-dom`**, and **`@radix-ui/react-popover`** alongside this package. They power **`calendar-api`** (Outlook-style peeks) and **`launcher`** (modal panel). The main `createEmbed` bundle references that module graph, so your package manager should resolve those peers even if you only use iframe **page** / **calendar** mode (unused code may be tree-shaken by your bundler). The server entry **`notion-embed-js/server`** only needs **`@notionhq/client`**.

## Installation

```bash
pnpm add notion-embed-js react react-dom @radix-ui/react-popover
# or
npm install notion-embed-js react react-dom @radix-ui/react-popover
# or
yarn add notion-embed-js react react-dom @radix-ui/react-popover
```

### Local development (test without publishing)

From your app directory, link the package by path:

```bash
pnpm add ../notion-embed-js
# or with absolute path:
pnpm add /path/to/notion-embed-js
```

Then build the package (runs automatically on install via `prepare`):

```bash
cd ../notion-embed-js && pnpm build && cd -
```

**If using Vite** and you get "Module not found", add to `vite.config.ts`:

```ts
export default defineConfig({
  resolve: {
    dedupe: ['notion-embed-js'],
  },
  optimizeDeps: {
    include: ['notion-embed-js'],
  },
});
```

## Prerequisites

Your Notion page must be **published to the web** before it can be embedded:

1. Open your Notion page
2. Click **Share** → **Publish**
3. Toggle **Publish** on
4. Click **Embed this page** and copy the URL

**Important:** Use the URL from the embed dialog. It must use the `notion.site` domain (e.g. `https://workspace.notion.site/page-id`). URLs with `www.notion.so` will not work—they block iframe embedding.

For calendar embeds, use a Notion database with a **Calendar view**. The URL format is typically:

`https://[workspace].notion.site/[database-id]?v=[calendar-view-id]`

**Segment setup:** To show different calendars to different audiences, create multiple views of the same Notion database (each with its own filters—e.g. by status, assignee, or property). Each view has a unique `?v=` ID. Use these view URLs in the `segments` map.

## Notion API calendar (`calendar-api`)

Use this when you want a **native calendar** (no iframe) and events from a **Notion database** your integration can access.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_API_KEY` | Yes | Secret from your Notion integration (server-only; never expose to the browser) |
| `NOTION_CALENDAR_DATABASE_ID` | Yes | Database ID or **database page URL** (32 hex chars, hyphens optional) |
| `NOTION_CALENDAR_DATA_SOURCE_ID` | No | If the database has multiple data sources |
| `NOTION_CALENDAR_DATE_PROPERTY` | No | Exact **date** column name if there are several |
| `NOTION_CALENDAR_DESCRIPTION_PROPERTY` | No | Rich text / notes column for event details |
| `NOTION_CALENDAR_LINK_PROPERTY` | No | URL column for “read more” links in the peek UI |
| `NOTION_CALENDAR_RELAXED_QUERY` | No | Set to `1` to allow a fallback query when the date-filtered query returns no rows (also enabled in `NODE_ENV=development`) |

Helpers (server):

```ts
import {
  fetchNotionCalendarEvents,
  isNotionCalendarConfigured,
} from 'notion-embed-js/server';
```

- **`fetchNotionCalendarEvents()`** – Reads env above; returns `{ events, fetchError? }`. You can pass a partial config object to override env per call (e.g. `{ apiKey, databaseId, dateProperty }`).
- **`isNotionCalendarConfigured()`** – Whether a key and parsable database id are present.

Wrap `fetchNotionCalendarEvents` in your framework’s cache if you need it (e.g. Next.js `unstable_cache` / `fetch` with `next.revalidate`). This package does not cache responses.

### Browser: `mode: 'calendar-api'`

Pass **`events`** from the server to the client (serialized JSON). Do **not** put `NOTION_API_KEY` in client bundles.

```javascript
import { createEmbed } from 'notion-embed-js';

const { element, destroy } = createEmbed({
  mode: 'calendar-api',
  events, // NotionCalendarEvent[] from fetchNotionCalendarEvents
  calendarPalette: {
    eventAccent: '#0078d4',
    eventChipColors: ['#0078d4', '#107c10', '#ca5010', '#004578'],
  },
}, document.getElementById('calendar-root'));
```

Palette helpers (main entry):

```ts
import {
  defaultNotionCalendarPalette,
  mergeNotionCalendarPalette,
  type NotionCalendarPalette,
} from 'notion-embed-js';
```

### Next.js (App Router): RSC + client component

**1. Server – load events**

```tsx
// app/calendar/page.tsx
import {
  fetchNotionCalendarEvents,
  isNotionCalendarConfigured,
} from 'notion-embed-js/server';
import { NotionCalendarClient } from './notion-calendar-client';

export default async function CalendarPage() {
  if (!isNotionCalendarConfigured()) {
    return (
      <p>Set NOTION_API_KEY and NOTION_CALENDAR_DATABASE_ID to show the calendar.</p>
    );
  }

  const { events, fetchError } = await fetchNotionCalendarEvents();

  if (fetchError) {
    return <p role="alert">{fetchError}</p>;
  }

  return (
    <div style={{ width: '100%', minHeight: 480 }}>
      <NotionCalendarClient events={events} />
    </div>
  );
}
```

**2. Client – mount the widget**

```tsx
// app/calendar/notion-calendar-client.tsx
'use client';

import { useEffect, useRef } from 'react';
import {
  createEmbed,
  type NotionCalendarEvent,
} from 'notion-embed-js';

type Props = {
  events: NotionCalendarEvent[];
};

export function NotionCalendarClient({ events }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { destroy } = createEmbed(
      {
        mode: 'calendar-api',
        events,
        // optional: calendarPalette: { eventAccent: '#0b6bcb' },
      },
      el
    );
    return destroy;
  }, [events]);

  return <div ref={ref} style={{ width: '100%', minHeight: 400 }} />;
}
```

To cache server fetches, wrap `fetchNotionCalendarEvents` in `unstable_cache` or use your preferred revalidation strategy in the server file.

## Floating launcher widget (Intercom-style)

Set **`launcher: true`** or **`launcher: { ... }`** on any mode (`page`, `calendar`, `calendar-api`). The embed **does not** fill the parent by default: a **round primary button** is shown (fixed to the viewport by default). Clicking it opens a **centered panel** with the full embed inside. Close with the header control, backdrop click, or **Escape**.

- **Without `launcher`** – The embed behaves as before: inline in the element you pass to `createEmbed` (classic “page” layout).
- **`mountTarget: 'body'`** (default) – Button is attached to `document.body` (recommended). Passing a `container` to `createEmbed` does **not** move the button; use this when your layout has `overflow: hidden`.
- **`mountTarget: 'container'`** – Button is appended to the `container` you pass to `createEmbed` (still `position: fixed` so it floats on the viewport). The modal **backdrop** is always on `document.body` so it is not clipped.

Programmatic control (when `launcher` is set): **`open()`**, **`close()`**, **`isOpen()`** on the result of `createEmbed`.

```javascript
import { createEmbed } from 'notion-embed-js';

const result = createEmbed({
  url: 'https://workspace.notion.site/your-page',
  mode: 'calendar',
  launcher: {
    position: 'bottom-right',
    label: 'Calendar',
    panelTitle: 'Upcoming events',
  },
});

// result.open(); result.close(); result.isOpen()
```

## Usage

### Embed a full Notion page

```javascript
import { createEmbed } from 'notion-embed-js';

const { element, destroy } = createEmbed({
  url: 'https://your-workspace.notion.site/Your-Page-ID',
  mode: 'page',
  width: '100%',
  height: '600px',
});

document.getElementById('container').appendChild(element);

// Later: destroy();
```

### Embed a Notion calendar (expandable, Google Calendar-like)

```javascript
import { createEmbed } from 'notion-embed-js';

const { element } = createEmbed({
  url: 'https://your-workspace.notion.site/database-id?v=calendar-view-id',
  mode: 'calendar',
});

// Calendar fills 100% of parent container, min-height 400px
document.getElementById('calendar-container').appendChild(element);
```

### Quick embed by element ID

```javascript
import { embedInto } from 'notion-embed-js';

embedInto('my-embed-target', {
  url: 'https://workspace.notion.site/page-id',
  mode: 'calendar',
});
```

### Segment options (audience-specific calendars)

Show different Notion calendars to different lead/audience types:

```javascript
import { createEmbed } from 'notion-embed-js';

const { element, setSegment } = createEmbed({
  url: 'https://workspace.notion.site/db?v=default',
  mode: 'calendar',
  segments: {
    default: 'https://workspace.notion.site/db?v=public-calendar',
    leads: 'https://workspace.notion.site/db?v=leads-calendar',
    premium: 'https://workspace.notion.site/db?v=premium-calendar',
    enterprise: 'https://workspace.notion.site/db?v=enterprise-calendar',
  },
  segmentFromUrl: 'audience', // ?audience=premium shows premium calendar
}, document.getElementById('calendar'));

// Or resolve dynamically from your CRM/analytics
createEmbed({
  url: 'https://workspace.notion.site/db?v=default',
  mode: 'calendar',
  segments: { leads: '...', premium: '...' },
  getSegment: () => {
    // e.g. from user tier, A/B test, or cookie
    return window.__userTier__ ?? 'leads';
  },
}, container);

// Switch segment programmatically (e.g. when user upgrades)
setSegment('premium');
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | required* | Public Notion page URL (ignored when `segments` is set). Not required for `mode: 'calendar-api'` |
| `mode` | `'page' \| 'calendar' \| 'calendar-api'` | `'page'` | `page` / `calendar` = iframe; `calendar-api` = native month calendar from `events` |
| `events` | `NotionCalendarEvent[]` | `[]` | **calendar-api:** rows from `fetchNotionCalendarEvents` |
| `calendarPalette` | `Partial<NotionCalendarPalette>` | - | **calendar-api:** overrides default colors |
| `launcher` | `boolean \| NotionEmbedLauncherOptions` | - | Floating button + modal panel; omit for inline layout |
| `segments` | `Record<string, string>` | - | Map audience types to Notion URLs (iframe modes only; not supported with `calendar-api`) |
| `segment` | `string` | - | Active segment (overrides getSegment/segmentFromUrl) |
| `getSegment` | `() => string` | - | Callback to resolve segment (e.g. from CRM, A/B test) |
| `segmentFromUrl` | `string` | - | URL param name (e.g. `audience` reads `?audience=premium`) |
| `defaultSegment` | `string` | `'default'` | Fallback when resolved segment not in map |
| `width` | `string \| number` | `'100%'` | Width (page mode only) |
| `height` | `string \| number` | `'600px'` (page) / `'100%'` (calendar & calendar-api) | Height or min-height |
| `className` | `string` | `''` | CSS class for container |
| `style` | `Record<string, string>` | `{}` | Inline styles for container |

## Calendar mode

When `mode: 'calendar'`:

- The widget expands to **100% width and height** of its parent
- Minimum height is 400px for usability
- Uses flex layout so it fills the available space (similar to Google Calendar embed)
- Ensure the parent has a defined height (e.g. `height: 100%` or `min-height: 600px`)

When `mode: 'calendar-api'`:

- Renders a **native** month grid (no iframe); same min-height / flex behavior as iframe calendar
- Requires **`events`** from the server; optional **`calendarPalette`** for theming

## Framework examples

### React

```jsx
import { useEffect, useRef } from 'react';
import { createEmbed } from 'notion-embed-js';

function NotionEmbed({ url, mode = 'page' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const { destroy } = createEmbed({ url, mode }, containerRef.current);
    return destroy;
  }, [url, mode]);

  return <div ref={containerRef} style={{ width: '100%', minHeight: 400 }} />;
}
```

**calendar-api** (events from props, e.g. after server fetch):

```jsx
import { useEffect, useRef } from 'react';
import { createEmbed } from 'notion-embed-js';

function NotionApiCalendar({ events, palette }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const { destroy } = createEmbed(
      { mode: 'calendar-api', events, calendarPalette: palette },
      ref.current
    );
    return destroy;
  }, [events, palette]);

  return <div ref={ref} style={{ width: '100%', minHeight: 400 }} />;
}
```

### Vue

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { createEmbed } from 'notion-embed-js';

const container = ref(null);
let destroy = null;

onMounted(() => {
  if (container.value) {
    const result = createEmbed({ url: props.url, mode: props.mode }, container.value);
    destroy = result.destroy;
  }
});

onUnmounted(() => destroy?.());
</script>

<template>
  <div ref="container" style="width: 100%; min-height: 400px" />
</template>
```

## API

### `createEmbed(options, container?)`

Creates a Notion embed. Returns `{ element, destroy, setSegment?, getActiveSegment?, open?, close?, isOpen? }`.

- `setSegment(segment)` – Switch to a different segment (when using `segments`)
- `getActiveSegment()` – Get the current segment (when using `segments`)
- `open()` / `close()` / `isOpen()` – When `launcher` is enabled, control the modal panel

### `embedInto(elementId, options)`

Embeds into a DOM element by ID. Returns `{ element, destroy }` or `null` if element not found.

### `isValidNotionUrl(url)`

Validates that a string is a Notion URL.

### `normalizeNotionUrl(url)`

Normalizes a Notion URL (adds protocol, trims).

### `isEmbeddableNotionUrl(url)`

Returns `true` if the URL uses the embeddable `notion.site` format. Use this to validate before embedding.

### `notion-embed-js/server`

- **`fetchNotionCalendarEvents(config?)`** → `{ events, fetchError? }`
- **`isNotionCalendarConfigured(config?)`** → `boolean`
- Re-exports **`NotionCalendarEvent`**

### Palette (main entry)

- **`defaultNotionCalendarPalette`**
- **`mergeNotionCalendarPalette(partial?)`**
- **`type NotionCalendarPalette`**

### Launcher types (main entry)

- **`NotionEmbedLauncherOptions`**
- **`NotionEmbedLauncherPosition`** – `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'`

## Troubleshooting

### "www.notion.so refused to connect"

`www.notion.so` blocks iframe embedding. You must use the **publish URL** from Notion:

1. In Notion: **Share** → **Publish** → **Publish**
2. Click **Embed this page** and copy the URL shown there
3. The URL will look like `https://[workspace].notion.site/[page-id]` — use that

If you pass a `www.notion.so` URL, the package will throw a clear error. Use `isEmbeddableNotionUrl(url)` to validate before calling `createEmbed`.

## Architecture

This package uses **hexagonal architecture** (ports & adapters):

```
src/
├── domain/           # Core business logic
│   ├── entities/     # EmbedConfig, EmbedSpec
│   ├── use-cases/    # CreateEmbedUseCase
│   └── constants.ts
├── ports/out/        # Interfaces (UrlValidator, SegmentResolver, EmbedRenderer)
├── adapters/
│   ├── in/           # Primary: createEmbed, embedInto (API entry points)
│   └── out/          # Secondary: UrlValidatorAdapter, DomEmbedRendererAdapter, etc.
├── calendar/         # Native month grid (mounts Radix peeks via react/)
├── react/            # Radix Popover, Outlook peek UI, launcher shell (chai.org–aligned)
├── widget/           # Launcher mount (createRoot + Radix popover)
├── server/           # Notion API fetch (Node; uses @notionhq/client)
├── notion-calendar/  # Shared event type
├── types.ts
└── utils.ts
```

The domain layer has no dependency on `@notionhq/client`. The server entry composes the official Notion client; the browser entry uses DOM adapters only.

## License

MIT – see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
