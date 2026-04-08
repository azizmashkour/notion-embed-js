/**
 * Server-only: fetch calendar events from a Notion database via the official API.
 * Set NOTION_API_KEY and NOTION_CALENDAR_DATABASE_ID (or pass {@link NotionCalendarServerConfig}).
 */
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
export type { NotionCalendarEvent } from '../notion-calendar/event.js';
export interface NotionCalendarServerConfig {
    apiKey: string;
    /** Database ID or database page URL (32 hex, optional hyphens) */
    databaseId: string;
    dataSourceId?: string;
    dateProperty?: string;
    descriptionProperty?: string;
    linkProperty?: string;
    /**
     * If the date-filtered query returns no rows, fetch recent pages and filter locally
     * (or set NOTION_CALENDAR_RELAXED_QUERY=1 via env).
     */
    relaxedQuery?: boolean;
    monthsBack?: number;
    monthsForward?: number;
}
/**
 * True when an API key and a parsable database ID are present (env and/or explicit config).
 */
export declare function isNotionCalendarConfigured(explicit?: Partial<NotionCalendarServerConfig>): boolean;
/**
 * Load events using NOTION_API_KEY and NOTION_CALENDAR_DATABASE_ID from the environment,
 * optionally overridden by `explicit`. Safe to wrap with your framework cache (e.g. Next.js `unstable_cache`).
 */
export declare function fetchNotionCalendarEvents(explicit?: Partial<NotionCalendarServerConfig>): Promise<{
    events: NotionCalendarEvent[];
    fetchError?: string;
}>;
//# sourceMappingURL=notion-calendar.d.ts.map