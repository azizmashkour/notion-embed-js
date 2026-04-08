import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { CalendarChipPopover } from './calendar-chip-popover.js';
import { DayAgendaPopover } from './day-agenda-popover.js';
export function mountCalendarChipPeek(host, event) {
    const root = createRoot(host);
    root.render(_jsx(CalendarChipPopover, { event: event }));
    return () => {
        root.unmount();
    };
}
export function mountDayAgendaPeek(doc, events, anchorRect) {
    const host = doc.createElement('div');
    doc.body.appendChild(host);
    const root = createRoot(host);
    const exit = () => {
        root.unmount();
        host.remove();
    };
    root.render(_jsx(DayAgendaPopover, { events: events, anchorRect: anchorRect, onExit: exit }));
    return exit;
}
//# sourceMappingURL=mount-calendar-peeks.js.map