import type { CSSProperties } from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
export declare function mountCalendarChipPeek(host: HTMLElement, event: NotionCalendarEvent, options?: {
    triggerClassName?: string;
    triggerStyle?: CSSProperties;
}): () => void;
export declare function mountDayAgendaPeek(doc: Document, events: NotionCalendarEvent[], anchorRect: DOMRect): () => void;
//# sourceMappingURL=mount-calendar-peeks.d.ts.map