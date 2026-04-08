import type { NotionCalendarEvent } from '../notion-calendar/event.js';
export declare function parseNotionDate(iso: string): Date;
export declare function toLocalDateKey(d: Date): string;
export declare function startOfDay(d: Date): Date;
export declare function dayKeysForEvent(ev: NotionCalendarEvent): string[];
export declare function buildEventsByDay(events: NotionCalendarEvent[]): Map<string, NotionCalendarEvent[]>;
export declare function monthCells(year: number, monthIndex: number): (number | null)[];
export declare function formatEventTime(iso: string): string;
/** Plain-text notes line for Outlook-style peek when description is empty. */
export declare function outlookPeekNotesBody(description: string | undefined): string;
/** Outlook-style “when” line (locale-aware). */
export declare function formatOutlookWhen(ev: NotionCalendarEvent): string;
//# sourceMappingURL=calendar-utils.d.ts.map