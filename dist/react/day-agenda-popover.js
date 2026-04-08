import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { popoverContentBase } from './styles.js';
import { Popover, PopoverAnchor, PopoverContent } from './popover.js';
import { OutlookPeekContent } from './outlook-peek-content.js';
export function DayAgendaPopover({ events, anchorRect, onExit, }) {
    const [open, setOpen] = React.useState(true);
    return (_jsxs(Popover, { modal: true, open: open, onOpenChange: (next) => {
            setOpen(next);
            if (!next)
                onExit();
        }, children: [_jsx(PopoverAnchor, { asChild: true, children: _jsx("div", { "aria-hidden": true, style: {
                        position: 'fixed',
                        left: anchorRect.left,
                        top: anchorRect.top,
                        width: Math.max(anchorRect.width, 1),
                        height: Math.max(anchorRect.height, 1),
                        pointerEvents: 'none',
                    } }) }), _jsx(PopoverContent, { side: "bottom", align: "start", sideOffset: 8, collisionPadding: { top: 16, right: 16, bottom: 16, left: 16 }, "aria-label": events.length === 1 ? events[0].title : `${events.length} calendar events`, style: {
                    ...popoverContentBase,
                    maxHeight: 'min(85vh, 640px)',
                    overflowY: 'auto',
                    padding: 0,
                    width: 'min(calc(100vw - 1.5rem), 380px)',
                }, children: _jsx("div", { children: events.map((ev, i) => (_jsx("div", { style: {
                            borderBottom: i < events.length - 1 ? '1px solid #edebe9' : undefined,
                        }, children: _jsx(OutlookPeekContent, { event: ev }) }, ev.id))) }) })] }));
}
//# sourceMappingURL=day-agenda-popover.js.map