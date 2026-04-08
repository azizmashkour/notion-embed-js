import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import type { NotionCalendarPalette } from './palette.types.js';
export interface NativeCalendarOptions {
    events: NotionCalendarEvent[];
    palette?: Partial<NotionCalendarPalette>;
}
export declare function renderNativeCalendar(mount: HTMLElement, options: NativeCalendarOptions): {
    destroy: () => void;
};
//# sourceMappingURL=native-calendar.d.ts.map