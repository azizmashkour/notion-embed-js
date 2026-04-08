import type { NotionCalendarPalette } from './palette.types.js';
import { calendarVisualTokens } from './notion-calendar-constants.js';

export type { NotionCalendarPalette } from './palette.types.js';

/** Default palette derived from {@link calendarVisualTokens}. */
export const defaultNotionCalendarPalette: NotionCalendarPalette = {
  surface: calendarVisualTokens.surface,
  border: calendarVisualTokens.border,
  weekHeaderBg: calendarVisualTokens.weekHeader,
  weekendBg: calendarVisualTokens.weekendCell,
  emptyCellBg: calendarVisualTokens.emptyCell,
  text: calendarVisualTokens.text,
  textStrong: calendarVisualTokens.textStrong,
  muted: calendarVisualTokens.muted,
  controlBorder: calendarVisualTokens.controlBorder,
  blue: calendarVisualTokens.blue,
  eventBarBorder: calendarVisualTokens.blue,
  eventAccent: calendarVisualTokens.blue,
  eventBarBg: calendarVisualTokens.eventBarBg,
  eventBarHoverBg: calendarVisualTokens.eventBarHoverBg,
  eventChipColors: [calendarVisualTokens.blue, '#107c10', '#ca5010', '#003e56'],
  eventChipTextOnAccent: '#ffffff',
  peekBackdrop: 'rgba(0, 0, 0, 0.35)',
  buttonBg: calendarVisualTokens.surface,
  buttonHoverBg: '#f3f2f1',
  todayInsetRing: calendarVisualTokens.todayInsetRing,
  todayCellBg: calendarVisualTokens.todayCellBg,
  todayBadgeBg: calendarVisualTokens.todayBadgeBg,
  todayBadgeRing: calendarVisualTokens.todayBadgeRing,
  moreLinkColor: calendarVisualTokens.moreLink,
  cardShadow: calendarVisualTokens.cardShadow,
  rootRadius: '2px',
  monthCellMinHeight: calendarVisualTokens.monthCellMinHeight,
};

export function mergeNotionCalendarPalette(
  partial?: Partial<NotionCalendarPalette>
): NotionCalendarPalette {
  if (!partial) return { ...defaultNotionCalendarPalette };
  const m = { ...defaultNotionCalendarPalette, ...partial };
  if (
    partial.eventAccent !== undefined &&
    partial.eventBarBorder === undefined &&
    partial.blue === undefined
  ) {
    m.eventBarBorder = partial.eventAccent;
    m.blue = partial.eventAccent;
  }
  return m;
}

export function applyPaletteToElement(el: HTMLElement, palette: NotionCalendarPalette): void {
  const p = palette;
  el.style.setProperty('--nec-surface', p.surface);
  el.style.setProperty('--nec-border', p.border);
  el.style.setProperty('--nec-week-header-bg', p.weekHeaderBg);
  el.style.setProperty('--nec-weekend-bg', p.weekendBg);
  el.style.setProperty('--nec-empty-cell-bg', p.emptyCellBg);
  el.style.setProperty('--nec-text', p.text);
  el.style.setProperty('--nec-text-strong', p.textStrong);
  el.style.setProperty('--nec-muted', p.muted);
  el.style.setProperty('--nec-control-border', p.controlBorder);
  el.style.setProperty('--nec-blue', p.blue);
  el.style.setProperty('--nec-event-bar-border', p.eventBarBorder);
  el.style.setProperty('--nec-event-accent', p.eventAccent);
  el.style.setProperty('--nec-event-bar-bg', p.eventBarBg);
  el.style.setProperty('--nec-event-bar-hover-bg', p.eventBarHoverBg);
  el.style.setProperty('--nec-peek-backdrop', p.peekBackdrop);
  el.style.setProperty('--nec-button-bg', p.buttonBg);
  el.style.setProperty('--nec-button-hover-bg', p.buttonHoverBg);
  el.style.setProperty('--nec-today-cell-bg', p.todayCellBg);
  el.style.setProperty('--nec-today-inset-ring', p.todayInsetRing);
  el.style.setProperty('--nec-today-badge-bg', p.todayBadgeBg);
  el.style.setProperty('--nec-today-badge-ring', p.todayBadgeRing);
  el.style.setProperty('--nec-more-link', p.moreLinkColor);
  el.style.setProperty('--nec-card-shadow', p.cardShadow);
  el.style.setProperty('--nec-root-radius', p.rootRadius);
  el.style.setProperty('--nec-month-cell-min-height', p.monthCellMinHeight);
  p.eventChipColors.forEach((c, i) => {
    el.style.setProperty(`--nec-chip-${i}`, c);
  });
  el.style.setProperty('--nec-chip-text-on-accent', p.eventChipTextOnAccent);
}
