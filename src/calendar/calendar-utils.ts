import type { NotionCalendarEvent } from '../notion-calendar/event.js';

export function parseNotionDate(iso: string): Date {
  if (iso.length <= 10) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
}

export function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function dayKeysForEvent(ev: NotionCalendarEvent): string[] {
  const s = parseNotionDate(ev.start);
  const e = ev.end ? parseNotionDate(ev.end) : s;
  const keys: string[] = [];
  const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
  if (end < cur) return [toLocalDateKey(cur)];
  while (cur <= end) {
    keys.push(toLocalDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
}

export function buildEventsByDay(
  events: NotionCalendarEvent[]
): Map<string, NotionCalendarEvent[]> {
  const map = new Map<string, NotionCalendarEvent[]>();
  for (const ev of events) {
    for (const key of dayKeysForEvent(ev)) {
      const list = map.get(key);
      if (list) list.push(ev);
      else map.set(key, [ev]);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.start.localeCompare(b.start));
  }
  return map;
}

export function monthCells(year: number, monthIndex: number): (number | null)[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatEventTime(iso: string): string {
  if (iso.length <= 10) return 'All day';
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}
