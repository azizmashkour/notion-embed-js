/** CHAI-style blues + Outlook-like neutrals (hex / rgba). */
export const defaultNotionCalendarPalette = {
    surface: '#ffffff',
    border: '#edebe9',
    weekHeaderBg: '#f3f2f1',
    weekendBg: '#faf9f8',
    emptyCellBg: '#faf9f8',
    text: '#323130',
    textStrong: '#242424',
    muted: '#605e5c',
    controlBorder: '#8a8886',
    eventAccent: '#0078d4',
    eventBarBg: 'rgba(0, 120, 212, 0.18)',
    eventBarHoverBg: 'rgba(0, 120, 212, 0.28)',
    eventChipColors: ['#0078d4', '#107c10', '#ca5010', '#004578'],
    eventChipTextOnAccent: '#ffffff',
    peekBackdrop: 'rgba(0, 0, 0, 0.35)',
    buttonBg: '#f3f2f1',
    buttonHoverBg: '#edebe9',
    todayRing: '#0078d4',
};
export function mergeNotionCalendarPalette(partial) {
    if (!partial)
        return { ...defaultNotionCalendarPalette };
    return { ...defaultNotionCalendarPalette, ...partial };
}
export function applyPaletteToElement(el, palette) {
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
    el.style.setProperty('--nec-event-accent', p.eventAccent);
    el.style.setProperty('--nec-event-bar-bg', p.eventBarBg);
    el.style.setProperty('--nec-event-bar-hover-bg', p.eventBarHoverBg);
    el.style.setProperty('--nec-peek-backdrop', p.peekBackdrop);
    el.style.setProperty('--nec-button-bg', p.buttonBg);
    el.style.setProperty('--nec-button-hover-bg', p.buttonHoverBg);
    el.style.setProperty('--nec-today-ring', p.todayRing);
    p.eventChipColors.forEach((c, i) => {
        el.style.setProperty(`--nec-chip-${i}`, c);
    });
    el.style.setProperty('--nec-chip-text-on-accent', p.eventChipTextOnAccent);
}
//# sourceMappingURL=palette.js.map