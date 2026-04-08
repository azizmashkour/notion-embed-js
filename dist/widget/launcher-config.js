function defaultPanelTitle(mode) {
    if (mode === 'page')
        return 'Notion';
    return 'Calendar';
}
function defaultAriaLabel(mode) {
    if (mode === 'page')
        return 'Open Notion';
    return 'Open calendar';
}
export function resolveLauncherSpec(raw, mode) {
    if (raw === undefined || raw === false)
        return undefined;
    const o = raw === true ? {} : raw;
    if (o.enabled === false)
        return undefined;
    return {
        position: o.position ?? 'bottom-right',
        offsetX: o.offsetX ?? 24,
        offsetY: o.offsetY ?? 24,
        ariaLabel: o.ariaLabel ?? defaultAriaLabel(mode),
        ...(o.label !== undefined && o.label !== '' ? { label: o.label } : {}),
        mountTarget: o.mountTarget ?? 'body',
        zIndex: o.zIndex ?? 2147483000,
        panelTitle: o.panelTitle ?? defaultPanelTitle(mode),
        panelMaxWidth: o.panelMaxWidth ?? 'min(720px, 94vw)',
        panelMaxHeight: o.panelMaxHeight ?? 'min(90vh, 900px)',
        buttonBackground: o.buttonBackground ?? '#0078d4',
        showIcon: o.showIcon !== false,
    };
}
//# sourceMappingURL=launcher-config.js.map