import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import type { CalendarViewMode } from './notion-calendar-constants.js';
export declare function parseNotionDate(iso: string): Date;
export declare function toLocalDateKey(d: Date): string;
export declare function startOfDay(d: Date): Date;
export declare function addDays(d: Date, n: number): Date;
/** Week starting Sunday (US calendar). */
export declare function startOfWeekSunday(d: Date): Date;
/** ISO work week starting Monday. */
export declare function startOfWeekMonday(d: Date): Date;
/**
 * Timed segment on a local calendar day as top/height % of 24h (for day timeline).
 * Returns null for all-day-only rows or if event does not intersect the day.
 */
export declare function timedSegmentPercentOnDay(ev: NotionCalendarEvent, day: Date): {
    topPct: number;
    heightPct: number;
} | null;
export declare function allDayEventsOnDay(events: NotionCalendarEvent[], day: Date): NotionCalendarEvent[];
export declare function timedEventsOnDay(events: NotionCalendarEvent[], day: Date): NotionCalendarEvent[];
/** Toolbar title for the active view (locale-aware). */
export declare function formatCalendarPeriodTitle(mode: CalendarViewMode, focusDate: Date): string;
export declare function dayKeysForEvent(ev: NotionCalendarEvent): string[];
export declare function buildEventsByDay(events: NotionCalendarEvent[]): Map<string, NotionCalendarEvent[]>;
export declare function monthCells(year: number, monthIndex: number): (number | null)[];
export declare function formatEventTime(iso: string): string;
/** Plain-text notes line for Outlook-style peek when description is empty. */
export declare function outlookPeekNotesBody(description: string | undefined): string;
/** Outlook-style “when” line (locale-aware). */
export declare function formatOutlookWhen(ev: NotionCalendarEvent): string;
//# sourceMappingURL=calendar-utils.d.ts.map