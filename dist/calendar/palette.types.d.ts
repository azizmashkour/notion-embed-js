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
    /** Primary brand blue — peek header bar, “+N more”, today number */
    blue: string;
    /** Left border on event chips */
    eventBarBorder: string;
    /** @deprecated Prefer `blue` / `eventBarBorder`; kept for API compatibility */
    eventAccent: string;
    eventBarBg: string;
    eventBarHoverBg: string;
    /** @deprecated Reserved; default month chips use `eventBarBorder` only */
    eventChipColors: string[];
    /** @deprecated Reserved for alternate chip treatments */
    eventChipTextOnAccent: string;
    peekBackdrop: string;
    buttonBg: string;
    buttonHoverBg: string;
    /** Inset ring for “today” cell (`ring-blue/12`) */
    todayInsetRing: string;
    todayCellBg: string;
    todayBadgeBg: string;
    todayBadgeRing: string;
    moreLinkColor: string;
    cardShadow: string;
    rootRadius: string;
    monthCellMinHeight: string;
}
//# sourceMappingURL=palette.types.d.ts.map