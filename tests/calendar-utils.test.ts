import { describe, it, expect } from 'vitest';
import { buildEventsByDay, dayKeysForEvent, monthCells } from '../src/calendar/calendar-utils.js';
import type { NotionCalendarEvent } from '../src/notion-calendar/event.js';

describe('calendar-utils', () => {
  it('dayKeysForEvent spans multi-day', () => {
    const ev: NotionCalendarEvent = {
      id: 'a',
      title: 'X',
      start: '2026-04-01',
      end: '2026-04-03',
    };
    expect(dayKeysForEvent(ev)).toEqual(['2026-04-01', '2026-04-02', '2026-04-03']);
  });

  it('buildEventsByDay groups and sorts by start time', () => {
    const events: NotionCalendarEvent[] = [
      { id: '2', title: 'B', start: '2026-04-08T14:00:00', end: null },
      { id: '1', title: 'A', start: '2026-04-08T09:00:00', end: null },
    ];
    const map = buildEventsByDay(events);
    expect(map.get('2026-04-08')?.map((e) => e.title)).toEqual(['A', 'B']);
  });

  it('monthCells pads to full weeks', () => {
    const cells = monthCells(2026, 3);
    expect(cells.length % 7).toBe(0);
    expect(cells.filter((c) => c !== null).length).toBe(30);
  });
});
