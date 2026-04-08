import { describe, it, expect } from 'vitest';
import {
  addDays,
  buildEventsByDay,
  dayKeysForEvent,
  formatCalendarPeriodTitle,
  monthCells,
  startOfWeekMonday,
  startOfWeekSunday,
  timedSegmentPercentOnDay,
  toLocalDateKey,
} from '../src/calendar/calendar-utils.js';
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

  it('addDays moves local calendar date', () => {
    const base = new Date(2026, 3, 8);
    expect(toLocalDateKey(addDays(base, 1))).toBe('2026-04-09');
  });

  it('startOfWeekSunday and Monday', () => {
    const wed = new Date(2026, 3, 8);
    expect(toLocalDateKey(startOfWeekSunday(wed))).toBe('2026-04-05');
    expect(toLocalDateKey(startOfWeekMonday(wed))).toBe('2026-04-06');
  });

  it('timedSegmentPercentOnDay returns percent range', () => {
    const day = new Date(2026, 3, 8);
    const ev: NotionCalendarEvent = {
      id: 'x',
      title: 'T',
      start: '2026-04-08T12:00:00',
      end: '2026-04-08T13:00:00',
    };
    const seg = timedSegmentPercentOnDay(ev, day);
    expect(seg).not.toBeNull();
    expect(seg!.topPct).toBeCloseTo(50, 5);
    expect(seg!.heightPct).toBeGreaterThan(0);
  });

  it('formatCalendarPeriodTitle covers view modes', () => {
    const d = new Date(2026, 3, 8);
    expect(formatCalendarPeriodTitle('day', d).length).toBeGreaterThan(6);
    expect(formatCalendarPeriodTitle('month', d)).toContain('2026');
    expect(formatCalendarPeriodTitle('week', d).length).toBeGreaterThan(4);
    expect(formatCalendarPeriodTitle('workWeek', d)).toContain('2026');
  });
});
