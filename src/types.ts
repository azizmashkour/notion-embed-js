import type { NotionCalendarEvent } from './notion-calendar/event.js';
import type { NotionCalendarPalette } from './calendar/palette.types.js';
import type { NotionEmbedLauncherOptions } from './widget/launcher-config.js';

export type {
  NotionEmbedLauncherOptions,
  NotionEmbedLauncherPosition,
} from './widget/launcher-config.js';

/**
 * Widget mode for the Notion embed
 * - page: Embed full Notion page with standard dimensions
 * - calendar: Embed Notion calendar view (published notion.site iframe)
 * - calendar-api: Native month calendar from events (fetch on the server with `notion-embed-js/server`)
 */
export type WidgetMode = 'page' | 'calendar' | 'calendar-api';

/**
 * Segment configuration for audience-specific embeds.
 * Map segment IDs (e.g. "leads", "premium", "enterprise") to different Notion calendar/page URLs.
 */
export type SegmentMap = Record<string, string>;

/**
 * Options for embedding a Notion page
 */
export interface NotionEmbedOptions {
  /**
   * The public Notion page URL.
   * For calendar view: use the URL with ?v= view parameter (e.g. notion.site/db-id?v=view-id)
   * Not required when `mode` is `calendar-api` (use `events` instead).
   * Ignored when `segments` is provided (iframe modes only).
   */
  url?: string;

  /**
   * Widget mode: 'page' for full page embed, 'calendar' for calendar-only expandable embed
   * @default 'page'
   */
  mode?: WidgetMode;

  /**
   * For `calendar-api`: events from server-side `fetchNotionCalendarEvents` (`notion-embed-js/server`). Never expose your API key in the browser.
   */
  events?: NotionCalendarEvent[];

  /**
   * Customize colors for `calendar-api` (partial override of the default CHAI-style palette).
   */
  calendarPalette?: Partial<NotionCalendarPalette>;

  /**
   * Intercom-style floating button that opens a large panel with the embed.
   * Omit or `false` for normal inline layout in the parent container.
   */
  launcher?: boolean | NotionEmbedLauncherOptions;

  /**
   * Segment options: map audience/lead types to different Notion URLs.
   * Use this to show different calendars to different visitors (e.g. leads vs premium vs enterprise).
   */
  segments?: SegmentMap;

  /**
   * Active segment when using `segments`. Overrides getSegment and segmentFromUrl.
   */
  segment?: string;

  /**
   * Callback to resolve the active segment dynamically (e.g. from user data, A/B test, CRM).
   */
  getSegment?: () => string;

  /**
   * URL parameter name to read segment from (e.g. "audience" reads ?audience=premium).
   */
  segmentFromUrl?: string;

  /**
   * Fallback segment when resolved segment is not in the map.
   * @default 'default'
   */
  defaultSegment?: string;

  /**
   * Width for page mode. Ignored in calendar mode (always 100%)
   * @default '100%'
   */
  width?: string | number;

  /**
   * Height for page mode. In calendar mode, used as min-height
   * @default '600px' for page, '400px' for calendar (min-height)
   */
  height?: string | number;

  /**
   * CSS class to add to the container element
   */
  className?: string;

  /**
   * Inline styles to apply to the container
   */
  style?: Record<string, string>;
}

/**
 * Result of creating an embed - contains the container element and cleanup function
 */
export interface NotionEmbedResult {
  /** Inline: wrapper with iframe/calendar. Launcher: the floating round button. */
  element: HTMLElement;

  /** Remove the embed from DOM */
  destroy: () => void;

  /**
   * Switch to a different segment (when using segments).
   */
  setSegment?: (segment: string) => void;

  /**
   * Get the currently active segment (when using segments).
   */
  getActiveSegment?: () => string | null;

  /** Present when `launcher` is enabled */
  open?: () => void;
  close?: () => void;
  isOpen?: () => boolean;
}
