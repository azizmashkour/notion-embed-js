import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { EmbedLauncherRadixView } from '../react/embed-launcher-view.js';
/**
 * Floating launcher + embed panel using Radix Popover (modal).
 */
export function mountEmbedLauncher(doc, cfg, buildInner, context) {
    let pendingSegment = null;
    const host = doc.createElement('div');
    host.setAttribute('data-notion-embed-launcher-root', '');
    Object.assign(host.style, { display: 'contents' });
    const bridge = {
        open: () => { },
        close: () => { },
        isOpen: () => false,
        getInner: () => null,
    };
    const root = createRoot(host);
    flushSync(() => {
        root.render(_jsx(EmbedLauncherRadixView, { cfg: cfg, buildInner: buildInner, context: {
                initialSegment: context.initialSegment,
                segmentSupport: context.segmentSupport,
            }, bridge: bridge }));
    });
    const buttonParent = cfg.mountTarget === 'body' ? doc.body : (context.mountContainer ?? doc.body);
    buttonParent.appendChild(host);
    const destroy = () => {
        bridge.close();
        const inner = bridge.getInner();
        inner?.destroy();
        root.unmount();
        host.remove();
    };
    const setSegment = context.segmentSupport
        ? (segment) => {
            pendingSegment = segment;
            bridge.setSegment?.(segment);
        }
        : undefined;
    const getActiveSegment = context.segmentSupport
        ? () => {
            if (bridge.getActiveSegment)
                return bridge.getActiveSegment();
            return pendingSegment ?? context.initialSegment;
        }
        : undefined;
    const updateUrl = (url) => {
        bridge.getInner()?.updateUrl?.(url);
    };
    const base = {
        element: host,
        destroy,
        open: () => bridge.open(),
        close: () => bridge.close(),
        isOpen: () => bridge.isOpen(),
        updateUrl,
    };
    if (setSegment)
        base.setSegment = setSegment;
    if (getActiveSegment)
        base.getActiveSegment = getActiveSegment;
    return base;
}
//# sourceMappingURL=embed-launcher.js.map