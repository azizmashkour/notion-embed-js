export function parseNotionDate(iso) {
    if (iso.length <= 10) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(iso);
}
export function toLocalDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function addDays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
}
/** Week starting Sunday (US calendar). */
export function startOfWeekSunday(d) {
    const s = startOfDay(d);
    s.setDate(s.getDate() - s.getDay());
    return s;
}
/** ISO work week starting Monday. */
export function startOfWeekMonday(d) {
    const s = startOfDay(d);
    const dow = s.getDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    s.setDate(s.getDate() + offset);
    return s;
}
/**
 * Timed segment on a local calendar day as top/height % of 24h (for day timeline).
 * Returns null for all-day-only rows or if event does not intersect the day.
 */
export function timedSegmentPercentOnDay(ev, day) {
    const key = toLocalDateKey(day);
    if (!dayKeysForEvent(ev).includes(key))
        return null;
    if (ev.start.length <= 10)
        return null;
    const start = parseNotionDate(ev.start);
    const end = ev.end && ev.end.length > 10 ? parseNotionDate(ev.end) : new Date(start.getTime() + 3600000);
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    const segStart = start < dayStart ? dayStart : start;
    const segEnd = end > dayEnd ? dayEnd : end;
    if (segEnd <= segStart)
        return null;
    const startMin = (segStart.getTime() - dayStart.getTime()) / 60000;
    const durMin = (segEnd.getTime() - segStart.getTime()) / 60000;
    return {
        topPct: (startMin / 1440) * 100,
        heightPct: Math.max((durMin / 1440) * 100, 1.25),
    };
}
export function allDayEventsOnDay(events, day) {
    const key = toLocalDateKey(day);
    return events.filter((ev) => dayKeysForEvent(ev).includes(key) && ev.start.length <= 10);
}
export function timedEventsOnDay(events, day) {
    const key = toLocalDateKey(day);
    return events.filter((ev) => dayKeysForEvent(ev).includes(key) && ev.start.length > 10);
}
/** Toolbar title for the active view (locale-aware). */
export function formatCalendarPeriodTitle(mode, focusDate) {
    if (mode === 'day') {
        return new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(focusDate);
    }
    if (mode === 'month') {
        return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1));
    }
    if (mode === 'week') {
        const start = startOfWeekSunday(focusDate);
        const end = addDays(start, 6);
        const md = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
        const y = end.getFullYear();
        if (start.getFullYear() !== y) {
            return `${md.format(start)}, ${start.getFullYear()} – ${md.format(end)}, ${y}`;
        }
        return `${md.format(start)} – ${md.format(end)}, ${y}`;
    }
    const start = startOfWeekMonday(focusDate);
    const end = addDays(start, 4);
    const md = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const y = end.getFullYear();
    if (start.getFullYear() !== y) {
        return `${md.format(start)}, ${start.getFullYear()} – ${md.format(end)}, ${y}`;
    }
    return `${md.format(start)} – ${md.format(end)}, ${y}`;
}
export function dayKeysForEvent(ev) {
    const s = parseNotionDate(ev.start);
    const e = ev.end ? parseNotionDate(ev.end) : s;
    const keys = [];
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    if (end < cur)
        return [toLocalDateKey(cur)];
    while (cur <= end) {
        keys.push(toLocalDateKey(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return keys;
}
export function buildEventsByDay(events) {
    const map = new Map();
    for (const ev of events) {
        for (const key of dayKeysForEvent(ev)) {
            const list = map.get(key);
            if (list)
                list.push(ev);
            else
                map.set(key, [ev]);
        }
    }
    for (const list of map.values()) {
        list.sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
}
export function monthCells(year, monthIndex) {
    const first = new Date(year, monthIndex, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startPad; i++)
        cells.push(null);
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(d);
    while (cells.length % 7 !== 0)
        cells.push(null);
    return cells;
}
export function formatEventTime(iso) {
    if (iso.length <= 10)
        return 'All day';
    try {
        return new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(iso));
    }
    catch {
        return '';
    }
}
const PEEK_NOTES_FALLBACK = 'Agenda and other details appear here when your database includes a notes or description column.';
/** Plain-text notes line for Outlook-style peek when description is empty. */
export function outlookPeekNotesBody(description) {
    const t = description?.trim();
    return t && t.length > 0 ? t : PEEK_NOTES_FALLBACK;
}
/** Outlook-style “when” line (locale-aware). */
export function formatOutlookWhen(ev) {
    const start = parseNotionDate(ev.start);
    const startDay = ev.start.slice(0, 10);
    const endDay = ev.end ? ev.end.slice(0, 10) : startDay;
    const isAllDay = ev.start.length <= 10;
    const dateFmt = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
    if (isAllDay) {
        if (ev.end && endDay !== startDay) {
            return `${dateFmt.format(start)} – ${dateFmt.format(parseNotionDate(ev.end))} (All day)`;
        }
        return `${dateFmt.format(start)} (All day)`;
    }
    const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
    const startTime = timeFmt.format(start);
    if (ev.end && ev.end.length > 10) {
        return `${dateFmt.format(start)} ${startTime} – ${timeFmt.format(parseNotionDate(ev.end))}`;
    }
    return `${dateFmt.format(start)} ${startTime}`;
}
//# sourceMappingURL=calendar-utils.js.map