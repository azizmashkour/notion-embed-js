import type { CSSProperties } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import { CalendarChipPopover } from './calendar-chip-popover.js';
import { DayAgendaPopover } from './day-agenda-popover.js';

export function mountCalendarChipPeek(
  host: HTMLElement,
  event: NotionCalendarEvent,
  chipStyle: CSSProperties
): () => void {
  const root = createRoot(host);
  root.render(<CalendarChipPopover event={event} chipStyle={chipStyle} />);
  return () => {
    root.unmount();
  };
}

export function mountDayAgendaPeek(
  doc: Document,
  events: NotionCalendarEvent[],
  title: string,
  anchorRect: DOMRect
): () => void {
  const host = doc.createElement('div');
  doc.body.appendChild(host);
  const root = createRoot(host);
  const exit = (): void => {
    root.unmount();
    host.remove();
  };
  root.render(
    <DayAgendaPopover events={events} title={title} anchorRect={anchorRect} onExit={exit} />
  );
  return exit;
}
