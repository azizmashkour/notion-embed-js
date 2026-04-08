/**
 * Default visual tokens for the Outlook-inspired month grid and event peek (hex / rgba).
 * Re-exported for apps that want the same palette values in their own UI.
 */
export const calendarVisualTokens = {
  surface: '#ffffff',
  border: '#edebe9',
  weekHeader: '#f3f2f1',
  weekendCell: '#faf9f8',
  emptyCell: '#faf9f8',
  text: '#323130',
  textStrong: '#242424',
  muted: '#605e5c',
  controlBorder: '#8a8886',
  blue: '#006689',
  blueLight: '#9ed4e5',
  eventBarBg: 'rgba(158, 212, 229, 0.45)',
  eventBarHoverBg: 'rgba(158, 212, 229, 0.70)',
  todayCellBg: 'rgba(158, 212, 229, 0.12)',
  todayInsetRing: 'rgba(0, 102, 137, 0.12)',
  todayBadgeBg: 'rgba(255, 255, 255, 0.85)',
  todayBadgeRing: 'rgba(0, 102, 137, 0.18)',
  moreLink: '#006689',
  cardShadow: '0 1.6px 3.6px rgba(0, 0, 0, 0.132), 0 0.3px 0.9px rgba(0, 0, 0, 0.108)',
  monthCellMinHeight: '8.5rem',
} as const;

export const WEEKDAYS_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const WORK_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr'] as const;

/** Matches Tailwind `md` (768px). Viewport width ≤ this uses mobile calendar layout. */
export const CALENDAR_MOBILE_MAX_PX = 767;

export type CalendarViewMode = 'day' | 'workWeek' | 'week' | 'month';

export const VIEW_OPTIONS: ReadonlyArray<{ mode: CalendarViewMode; label: string }> = [
  { mode: 'day', label: 'Day' },
  { mode: 'workWeek', label: 'Work week' },
  { mode: 'week', label: 'Week' },
  { mode: 'month', label: 'Month' },
];

/** Mobile hides month (3-column horizontal scroll for other views). */
export function calendarViewOptionsForMobile(isMobile: boolean): typeof VIEW_OPTIONS {
  if (isMobile) return VIEW_OPTIONS.filter((o) => o.mode !== 'month');
  return [...VIEW_OPTIONS];
}

/** One row per hour; full 24h day (local). */
export const HOUR_ROW_PX = 52;
export const DAY_TIMELINE_HEIGHT_PX = 24 * HOUR_ROW_PX;

export const CAL_MIN_HEIGHT = {
  month: '8.5rem',
  week: '18rem',
  workWeek: '20rem',
} as const;

/** Solid fills for timed blocks (cycle by event id). */
export const EVENT_RANGE_STYLES = [
  { bg: '#006689', border: '#003e56', text: '#ffffff' },
  { bg: '#6c9b35', border: '#6c9b35', text: '#ffffff' },
  { bg: '#ff9933', border: '#ff9933', text: '#ffffff' },
  { bg: '#003e56', border: '#9ed4e5', text: '#ffffff' },
] as const;

export function rangeStyleForEventId(id: string): (typeof EVENT_RANGE_STYLES)[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return EVENT_RANGE_STYLES[h % EVENT_RANGE_STYLES.length]!;
}
