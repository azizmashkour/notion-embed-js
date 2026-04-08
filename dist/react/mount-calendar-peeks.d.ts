import type { CSSProperties } from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
export declare function mountCalendarChipPeek(host: HTMLElement, event: NotionCalendarEvent, chipStyle: CSSProperties): () => void;
export declare function mountDayAgendaPeek(doc: Document, events: NotionCalendarEvent[], title: string, anchorRect: DOMRect): () => void;
//# sourceMappingURL=mount-calendar-peeks.d.ts.map