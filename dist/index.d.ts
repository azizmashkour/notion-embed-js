/**
 * notion-embed-js
 *
 * Embed Notion public pages and calendar views with Google Calendar-like expandable widgets.
 * Uses hexagonal architecture (ports & adapters).
 */
export { createEmbed } from './adapters/in/create-embed.adapter.js';
export { embedInto } from './adapters/in/embed-into.adapter.js';
export type { NotionEmbedLauncherOptions, NotionEmbedLauncherPosition, NotionEmbedOptions, NotionEmbedResult, SegmentMap, WidgetMode, } from './types.js';
export type { NotionCalendarEvent } from './notion-calendar/event.js';
export type { NotionCalendarPalette } from './calendar/palette.types.js';
export { defaultNotionCalendarPalette, mergeNotionCalendarPalette, } from './calendar/palette.js';
export { isValidNotionUrl, normalizeNotionUrl, isEmbeddableNotionUrl, } from './utils.js';
//# sourceMappingURL=index.d.ts.map