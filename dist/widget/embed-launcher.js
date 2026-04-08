const CALENDAR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
function positionStyles(cfg) {
    const { position, offsetX, offsetY } = cfg;
    const base = { position: 'fixed' };
    if (position === 'bottom-right') {
        base.right = `${offsetX}px`;
        base.bottom = `${offsetY}px`;
    }
    else if (position === 'bottom-left') {
        base.left = `${offsetX}px`;
        base.bottom = `${offsetY}px`;
    }
    else if (position === 'top-right') {
        base.right = `${offsetX}px`;
        base.top = `${offsetY}px`;
    }
    else {
        base.left = `${offsetX}px`;
        base.top = `${offsetY}px`;
    }
    return base;
}
/**
 * Wraps a lazy-built embed in a floating launcher + modal panel.
 */
export function mountEmbedLauncher(doc, cfg, buildInner, context) {
    let inner = null;
    let pendingSegment = null;
    let openState = false;
    const z = cfg.zIndex;
    const backdrop = doc.createElement('div');
    backdrop.setAttribute('data-notion-embed-launcher-backdrop', '');
    Object.assign(backdrop.style, {
        display: 'none',
        position: 'fixed',
        inset: '0',
        background: 'rgba(0,0,0,0.42)',
        zIndex: String(z),
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
    });
    const panel = doc.createElement('div');
    panel.setAttribute('data-notion-embed-launcher-panel', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', cfg.panelTitle);
    Object.assign(panel.style, {
        position: 'relative',
        width: '100%',
        maxWidth: cfg.panelMaxWidth,
        maxHeight: cfg.panelMaxHeight,
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: String(z + 1),
    });
    const header = doc.createElement('div');
    Object.assign(header.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 14px',
        borderBottom: '1px solid #edebe9',
        flexShrink: '0',
        fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
    });
    const titleEl = doc.createElement('div');
    titleEl.textContent = cfg.panelTitle;
    Object.assign(titleEl.style, {
        fontWeight: '600',
        fontSize: '16px',
        color: '#242424',
    });
    const closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
        border: 'none',
        background: '#f3f2f1',
        borderRadius: '8px',
        width: '36px',
        height: '36px',
        cursor: 'pointer',
        fontSize: '18px',
        lineHeight: '1',
        color: '#323130',
    });
    header.append(titleEl, closeBtn);
    const body = doc.createElement('div');
    body.setAttribute('data-notion-embed-launcher-body', '');
    Object.assign(body.style, {
        flex: '1',
        minHeight: 'min(400px, 60vh)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    });
    panel.append(header, body);
    backdrop.appendChild(panel);
    const launcherBtn = doc.createElement('button');
    launcherBtn.type = 'button';
    launcherBtn.setAttribute('data-notion-embed-launcher-button', '');
    launcherBtn.setAttribute('aria-label', cfg.ariaLabel);
    launcherBtn.setAttribute('aria-expanded', 'false');
    Object.assign(launcherBtn.style, {
        ...positionStyles(cfg),
        zIndex: String(z + 2),
        width: cfg.label ? 'auto' : '56px',
        minWidth: '56px',
        height: '56px',
        padding: cfg.label ? '0 18px' : '0',
        border: 'none',
        borderRadius: '28px',
        background: cfg.buttonBackground,
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
        fontSize: '14px',
        fontWeight: '600',
    });
    if (cfg.showIcon) {
        const iconWrap = doc.createElement('span');
        iconWrap.innerHTML = CALENDAR_ICON_SVG;
        iconWrap.style.display = 'flex';
        iconWrap.style.color = '#fff';
        launcherBtn.appendChild(iconWrap);
    }
    if (cfg.label) {
        const span = doc.createElement('span');
        span.textContent = cfg.label;
        launcherBtn.appendChild(span);
    }
    function ensureInner() {
        if (inner)
            return inner;
        inner = buildInner();
        const el = inner.element;
        Object.assign(el.style, {
            width: '100%',
            height: '100%',
            minHeight: 'min(400px, 55vh)',
            flex: '1',
            borderRadius: '0',
        });
        body.appendChild(el);
        if (pendingSegment !== null && inner.setSegment) {
            inner.setSegment(pendingSegment);
        }
        return inner;
    }
    const close = () => {
        openState = false;
        backdrop.style.display = 'none';
        launcherBtn.setAttribute('aria-expanded', 'false');
        doc.removeEventListener('keydown', onKeydown);
    };
    const open = () => {
        ensureInner();
        openState = true;
        backdrop.style.display = 'flex';
        launcherBtn.setAttribute('aria-expanded', 'true');
        doc.addEventListener('keydown', onKeydown);
        closeBtn.focus();
    };
    function onKeydown(e) {
        if (e.key === 'Escape')
            close();
    }
    const isOpen = () => openState;
    launcherBtn.addEventListener('click', () => {
        if (!openState)
            open();
    });
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
    });
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop)
            close();
    });
    doc.body.appendChild(backdrop);
    const buttonParent = cfg.mountTarget === 'body'
        ? doc.body
        : (context.mountContainer ?? doc.body);
    buttonParent.appendChild(launcherBtn);
    const destroy = () => {
        close();
        doc.removeEventListener('keydown', onKeydown);
        inner?.destroy();
        inner = null;
        backdrop.remove();
        launcherBtn.remove();
    };
    const setSegment = context.segmentSupport
        ? (segment) => {
            pendingSegment = segment;
            inner?.setSegment?.(segment);
        }
        : undefined;
    const getActiveSegment = context.segmentSupport
        ? () => {
            if (inner?.getActiveSegment)
                return inner.getActiveSegment();
            return pendingSegment ?? context.initialSegment;
        }
        : undefined;
    const updateUrl = (url) => {
        inner?.updateUrl?.(url);
    };
    const base = {
        element: launcherBtn,
        destroy,
        open,
        close,
        isOpen,
        updateUrl,
    };
    if (setSegment)
        base.setSegment = setSegment;
    if (getActiveSegment)
        base.getActiveSegment = getActiveSegment;
    return base;
}
//# sourceMappingURL=embed-launcher.js.map