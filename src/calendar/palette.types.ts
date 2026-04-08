export interface NotionCalendarPalette {
  surface: string;
  border: string;
  weekHeaderBg: string;
  weekendBg: string;
  emptyCellBg: string;
  text: string;
  textStrong: string;
  muted: string;
  controlBorder: string;
  /** Left accent / primary event tone */
  eventAccent: string;
  eventBarBg: string;
  eventBarHoverBg: string;
  /** Cycle for stacked event chips (min 1) */
  eventChipColors: string[];
  /** Text on chips that use a solid accent background */
  eventChipTextOnAccent: string;
  peekBackdrop: string;
  buttonBg: string;
  buttonHoverBg: string;
  todayRing: string;
}
