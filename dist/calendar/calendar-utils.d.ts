import type { NotionCalendarEvent } from '../notion-calendar/event.js';
export declare function parseNotionDate(iso: string): Date;
export declare function toLocalDateKey(d: Date): string;
export declare function startOfDay(d: Date): Date;
export declare function dayKeysForEvent(ev: NotionCalendarEvent): string[];
export declare function buildEventsByDay(events: NotionCalendarEvent[]): Map<string, NotionCalendarEvent[]>;
export declare function monthCells(year: number, monthIndex: number): (number | null)[];
export declare function formatEventTime(iso: string): string;
//# sourceMappingURL=calendar-utils.d.ts.map