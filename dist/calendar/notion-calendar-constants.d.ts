/**
 * Default visual tokens for the Outlook-inspired month grid and event peek (hex / rgba).
 * Re-exported for apps that want the same palette values in their own UI.
 */
export declare const calendarVisualTokens: {
    readonly surface: "#ffffff";
    readonly border: "#edebe9";
    readonly weekHeader: "#f3f2f1";
    readonly weekendCell: "#faf9f8";
    readonly emptyCell: "#faf9f8";
    readonly text: "#323130";
    readonly textStrong: "#242424";
    readonly muted: "#605e5c";
    readonly controlBorder: "#8a8886";
    readonly blue: "#006689";
    readonly blueLight: "#9ed4e5";
    readonly eventBarBg: "rgba(158, 212, 229, 0.45)";
    readonly eventBarHoverBg: "rgba(158, 212, 229, 0.70)";
    readonly todayCellBg: "rgba(158, 212, 229, 0.12)";
    readonly todayInsetRing: "rgba(0, 102, 137, 0.12)";
    readonly todayBadgeBg: "rgba(255, 255, 255, 0.85)";
    readonly todayBadgeRing: "rgba(0, 102, 137, 0.18)";
    readonly moreLink: "#006689";
    readonly cardShadow: "0 1.6px 3.6px rgba(0, 0, 0, 0.132), 0 0.3px 0.9px rgba(0, 0, 0, 0.108)";
    readonly monthCellMinHeight: "8.5rem";
};
export declare const WEEKDAYS_SUN: readonly ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export declare const WORK_HEADERS: readonly ["Mo", "Tu", "We", "Th", "Fr"];
/** Matches Tailwind `md` (768px). Viewport width ≤ this uses mobile calendar layout. */
export declare const CALENDAR_MOBILE_MAX_PX = 767;
export type CalendarViewMode = 'day' | 'workWeek' | 'week' | 'month';
export declare const VIEW_OPTIONS: ReadonlyArray<{
    mode: CalendarViewMode;
    label: string;
}>;
/** Mobile hides month (3-column horizontal scroll for other views). */
export declare function calendarViewOptionsForMobile(isMobile: boolean): typeof VIEW_OPTIONS;
/** One row per hour; full 24h day (local). */
export declare const HOUR_ROW_PX = 52;
export declare const DAY_TIMELINE_HEIGHT_PX: number;
export declare const CAL_MIN_HEIGHT: {
    readonly month: "8.5rem";
    readonly week: "18rem";
    readonly workWeek: "20rem";
};
/** Solid fills for timed blocks (cycle by event id). */
export declare const EVENT_RANGE_STYLES: readonly [{
    readonly bg: "#006689";
    readonly border: "#003e56";
    readonly text: "#ffffff";
}, {
    readonly bg: "#6c9b35";
    readonly border: "#6c9b35";
    readonly text: "#ffffff";
}, {
    readonly bg: "#ff9933";
    readonly border: "#ff9933";
    readonly text: "#ffffff";
}, {
    readonly bg: "#003e56";
    readonly border: "#9ed4e5";
    readonly text: "#ffffff";
}];
export declare function rangeStyleForEventId(id: string): (typeof EVENT_RANGE_STYLES)[number];
//# sourceMappingURL=notion-calendar-constants.d.ts.map