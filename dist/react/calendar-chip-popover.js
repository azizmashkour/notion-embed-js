import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { popoverContentBase } from './styles.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';
import { OutlookPeekContent } from './outlook-peek-content.js';
export function CalendarChipPopover({ event, triggerClassName = 'nec-event-chip', triggerStyle, }) {
    return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx("button", { type: "button", className: triggerClassName, style: triggerStyle, onClick: (e) => e.stopPropagation(), children: event.title }) }), _jsx(PopoverContent, { side: "bottom", align: "center", sideOffset: 8, collisionPadding: { top: 16, right: 16, bottom: 16, left: 16 }, style: {
                    ...popoverContentBase,
                    maxHeight: 'min(85vh, 640px)',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    padding: 0,
                    width: 'min(calc(100vw - 1.5rem), 380px)',
                    borderRadius: 4,
                }, children: _jsx(OutlookPeekContent, { event: event }) })] }));
}
//# sourceMappingURL=calendar-chip-popover.js.map