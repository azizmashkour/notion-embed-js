import type { NotionCalendarEvent } from '../../notion-calendar/event.js';
import type { NotionCalendarPalette } from '../../calendar/palette.types.js';
import type { ResolvedLauncherSpec } from '../../widget/launcher-config.js';
/**
 * Domain value object: specification for rendering an embed
 */
export interface EmbedSpec {
    readonly url: string;
    readonly mode: 'page' | 'calendar' | 'calendar-api';
    readonly wrapperStyles: Record<string, string>;
    readonly iframeStyles: Record<string, string>;
    readonly className: string;
    readonly customStyle: Record<string, string>;
    /** API-driven calendar (browser): events from {@link fetchNotionCalendarEvents} */
    readonly events?: NotionCalendarEvent[];
    readonly calendarPalette?: NotionCalendarPalette;
    /** Floating launcher + modal panel (omit for normal inline “page” layout) */
    readonly launcher?: ResolvedLauncherSpec;
}
//# sourceMappingURL=embed-spec.d.ts.map