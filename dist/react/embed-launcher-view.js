import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { popoverContentBase } from './styles.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';
const CALENDAR_GLYPH = (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), _jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }), _jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }), _jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })] }));
function launcherButtonStyle(cfg) {
    const { position, offsetX, offsetY } = cfg;
    const base = {
        position: 'fixed',
        zIndex: cfg.zIndex + 2,
        width: cfg.label ? 'auto' : 56,
        minWidth: 56,
        height: 56,
        padding: cfg.label ? '0 18px' : 0,
        border: 'none',
        borderRadius: 28,
        background: cfg.buttonBackground,
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
        fontSize: 14,
        fontWeight: 600,
    };
    if (position === 'bottom-right') {
        base.right = offsetX;
        base.bottom = offsetY;
    }
    else if (position === 'bottom-left') {
        base.left = offsetX;
        base.bottom = offsetY;
    }
    else if (position === 'top-right') {
        base.right = offsetX;
        base.top = offsetY;
    }
    else {
        base.left = offsetX;
        base.top = offsetY;
    }
    return base;
}
export function EmbedLauncherRadixView({ cfg, buildInner, context, bridge, }) {
    const [open, setOpen] = useState(false);
    const openRef = useRef(false);
    openRef.current = open;
    const innerRef = useRef(null);
    const pendingSegment = useRef(null);
    const embedHostRef = useRef(null);
    useLayoutEffect(() => {
        bridge.open = () => {
            flushSync(() => {
                setOpen(true);
            });
        };
        bridge.close = () => {
            flushSync(() => {
                setOpen(false);
            });
        };
        bridge.isOpen = () => openRef.current;
        bridge.getInner = () => innerRef.current;
        if (context.segmentSupport) {
            bridge.setSegment = (segment) => {
                pendingSegment.current = segment;
                innerRef.current?.setSegment?.(segment);
            };
            bridge.getActiveSegment = () => innerRef.current?.getActiveSegment?.() ?? pendingSegment.current ?? context.initialSegment;
        }
        return () => {
            bridge.open = () => { };
            bridge.close = () => { };
            bridge.isOpen = () => false;
            bridge.getInner = () => null;
            bridge.setSegment = undefined;
            bridge.getActiveSegment = undefined;
        };
    }, [bridge, context.initialSegment, context.segmentSupport]);
    useEffect(() => {
        if (!open)
            return;
        const id = window.requestAnimationFrame(() => {
            const hostEl = embedHostRef.current;
            if (!hostEl)
                return;
            if (innerRef.current?.element.isConnected && hostEl.contains(innerRef.current.element)) {
                return;
            }
            if (innerRef.current) {
                innerRef.current.destroy();
                innerRef.current = null;
                hostEl.replaceChildren();
            }
            const inner = buildInner();
            innerRef.current = inner;
            const el = inner.element;
            Object.assign(el.style, {
                width: '100%',
                height: '100%',
                minHeight: 'min(400px, 55vh)',
                flex: '1',
                borderRadius: '0',
            });
            hostEl.appendChild(el);
            if (pendingSegment.current !== null && inner.setSegment) {
                inner.setSegment(pendingSegment.current);
            }
        });
        return () => window.cancelAnimationFrame(id);
    }, [open, buildInner]);
    return (_jsxs(Popover, { modal: true, open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs("button", { type: "button", "data-notion-embed-launcher-button": "", "aria-label": cfg.ariaLabel, "aria-expanded": open, style: launcherButtonStyle(cfg), children: [cfg.showIcon ? (_jsx("span", { style: { display: 'flex', color: '#fff' }, children: CALENDAR_GLYPH })) : null, cfg.label ? _jsx("span", { children: cfg.label }) : null] }) }), _jsx(PopoverContent, { side: "top", align: "center", sideOffset: 16, collisionPadding: { top: 16, right: 16, bottom: 16, left: 16 }, onOpenAutoFocus: (e) => e.preventDefault(), style: {
                    ...popoverContentBase,
                    zIndex: cfg.zIndex,
                    width: cfg.panelMaxWidth,
                    maxWidth: cfg.panelMaxWidth,
                    maxHeight: cfg.panelMaxHeight,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderTop: '0.5px solid #e8e6e3',
                    borderRight: '1px solid #edebe9',
                    borderBottom: '1px solid #edebe9',
                    borderLeft: '1px solid #edebe9',
                    borderRadius: 4,
                }, "aria-label": cfg.panelTitle, children: _jsxs("div", { "data-notion-embed-launcher-panel": "", style: {
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '100%',
                        flex: 1,
                        minHeight: 0,
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                padding: '12px 14px',
                                borderBottom: '0.5px solid #e8e6e3',
                                borderTopLeftRadius: 4,
                                borderTopRightRadius: 4,
                                flexShrink: 0,
                                fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
                            }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 16, color: '#242424' }, children: cfg.panelTitle }), _jsx("button", { type: "button", "aria-label": "Close", onClick: () => setOpen(false), style: {
                                        border: 'none',
                                        background: '#f3f2f1',
                                        borderRadius: 6,
                                        width: 36,
                                        height: 36,
                                        cursor: 'pointer',
                                        fontSize: 18,
                                        lineHeight: 1,
                                        color: '#323130',
                                    }, children: "\u2715" })] }), _jsx("div", { ref: embedHostRef, "data-notion-embed-launcher-body": "", style: {
                                flex: 1,
                                minHeight: 'min(400px, 60vh)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            } })] }) })] }));
}
//# sourceMappingURL=embed-launcher-view.js.map