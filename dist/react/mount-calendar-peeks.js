import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { CalendarChipPopover } from './calendar-chip-popover.js';
import { DayAgendaPopover } from './day-agenda-popover.js';
export function mountCalendarChipPeek(host, event, chipStyle) {
    const root = createRoot(host);
    root.render(_jsx(CalendarChipPopover, { event: event, chipStyle: chipStyle }));
    return () => {
        root.unmount();
    };
}
export function mountDayAgendaPeek(doc, events, title, anchorRect) {
    const host = doc.createElement('div');
    doc.body.appendChild(host);
    const root = createRoot(host);
    const exit = () => {
        root.unmount();
        host.remove();
    };
    root.render(_jsx(DayAgendaPopover, { events: events, title: title, anchorRect: anchorRect, onExit: exit }));
    return exit;
}
//# sourceMappingURL=mount-calendar-peeks.js.map