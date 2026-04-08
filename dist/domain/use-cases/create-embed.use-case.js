import { mergeNotionCalendarPalette } from '../../calendar/palette.js';
import { resolveLauncherSpec } from '../../widget/launcher-config.js';
import { DEFAULT_PAGE_HEIGHT, DEFAULT_CALENDAR_MIN_HEIGHT, CALENDAR_DEFAULT_HEIGHT, DEFAULT_SEGMENT_KEY, } from '../constants.js';
/**
 * Use case: Create a Notion embed from options
 */
export class CreateEmbedUseCase {
    urlValidator;
    segmentResolver;
    constructor(urlValidator, segmentResolver) {
        this.urlValidator = urlValidator;
        this.segmentResolver = segmentResolver;
    }
    execute(options) {
        const mode = options.mode ?? 'page';
        if (mode === 'calendar-api') {
            if (options.segments) {
                throw new Error('[notion-embed-js] mode "calendar-api" does not support segments. Use iframe calendar mode or pass a single events array.');
            }
            const launcher = resolveLauncherSpec(options.launcher, mode);
            const height = options.height ?? CALENDAR_DEFAULT_HEIGHT;
            const heightValue = typeof height === 'number' ? `${height}px` : height;
            const palette = mergeNotionCalendarPalette(options.calendarPalette);
            const wrapperStyles = {
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                borderRadius: '8px',
                border: 'none',
                boxSizing: 'border-box',
                minHeight: DEFAULT_CALENDAR_MIN_HEIGHT,
                height: heightValue,
                display: 'flex',
                flexDirection: 'column',
                ...(options.style ?? {}),
            };
            const spec = {
                url: '',
                mode: 'calendar-api',
                wrapperStyles,
                iframeStyles: {},
                className: options.className ?? '',
                customStyle: options.style ?? {},
                events: options.events ?? [],
                calendarPalette: palette,
                ...(launcher ? { launcher } : {}),
            };
            return {
                spec,
                segments: undefined,
                initialSegment: null,
                getSegmentUrl: () => null,
            };
        }
        const height = options.height ??
            (mode === 'calendar' ? CALENDAR_DEFAULT_HEIGHT : DEFAULT_PAGE_HEIGHT);
        const width = options.width ?? '100%';
        const widthValue = typeof width === 'number' ? `${width}px` : width;
        const heightValue = typeof height === 'number' ? `${height}px` : height;
        const isCalendarMode = mode === 'calendar';
        const url = this.resolveUrl(options);
        const validatedUrl = this.urlValidator.validate(url);
        const launcher = resolveLauncherSpec(options.launcher, mode);
        const wrapperStyles = {
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxSizing: 'border-box',
            ...(options.style ?? {}),
        };
        if (isCalendarMode) {
            wrapperStyles.minHeight = DEFAULT_CALENDAR_MIN_HEIGHT;
            wrapperStyles.height = heightValue;
            wrapperStyles.display = 'flex';
            wrapperStyles.flexDirection = 'column';
        }
        else {
            wrapperStyles.width = widthValue;
            wrapperStyles.height = heightValue;
        }
        const iframeStyles = {
            border: 'none',
            width: '100%',
        };
        if (isCalendarMode) {
            iframeStyles.flex = '1';
            iframeStyles.minHeight = DEFAULT_CALENDAR_MIN_HEIGHT;
            iframeStyles.height = '100%';
        }
        else {
            iframeStyles.height = heightValue;
        }
        const spec = {
            url: validatedUrl,
            mode,
            wrapperStyles,
            iframeStyles,
            className: options.className ?? '',
            customStyle: options.style ?? {},
            ...(launcher ? { launcher } : {}),
        };
        const segments = options.segments;
        let initialSegment = null;
        const getSegmentUrl = (segment) => {
            if (!segments)
                return null;
            const segmentUrl = segments[segment] ?? segments[DEFAULT_SEGMENT_KEY];
            if (!segmentUrl)
                return null;
            try {
                return this.urlValidator.validate(segmentUrl);
            }
            catch {
                return null;
            }
        };
        if (segments) {
            initialSegment = this.segmentResolver.resolve();
        }
        return {
            spec,
            segments,
            initialSegment,
            getSegmentUrl,
        };
    }
    resolveUrl(options) {
        const segments = options.segments;
        if (segments) {
            const segmentKey = this.segmentResolver.resolve();
            const url = segments[segmentKey] ?? segments[DEFAULT_SEGMENT_KEY];
            if (!url) {
                throw new Error(`Segment "${segmentKey}" not found in segments. Ensure "default" or the resolved segment exists.`);
            }
            return url;
        }
        if (!options.url) {
            throw new Error('[notion-embed-js] `url` is required for page and calendar modes. For API-driven calendars use mode: "calendar-api" and `events`.');
        }
        return options.url;
    }
}
//# sourceMappingURL=create-embed.use-case.js.map