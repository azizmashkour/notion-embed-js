import { describe, it, expect } from 'vitest';
import {
  calendarViewOptionsForMobile,
  VIEW_OPTIONS,
} from '../src/calendar/notion-calendar-constants.js';

describe('calendar view options', () => {
  it('desktop list includes Month', () => {
    expect(VIEW_OPTIONS.some((o) => o.mode === 'month')).toBe(true);
    expect(calendarViewOptionsForMobile(false).length).toBe(4);
  });

  it('mobile list omits Month', () => {
    const mobile = calendarViewOptionsForMobile(true);
    expect(mobile.some((o) => o.mode === 'month')).toBe(false);
    expect(mobile.map((o) => o.mode)).toEqual(['day', 'workWeek', 'week']);
  });
});
