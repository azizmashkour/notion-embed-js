import { renderNativeCalendar } from '../../calendar/native-calendar.js';
import { mountEmbedLauncher } from '../../widget/embed-launcher.js';
/**
 * Adapter: Render embed to DOM (browser)
 */
export class DomEmbedRendererAdapter {
    render(spec, options, mountContainer) {
        const buildInner = () => {
            if (spec.mode === 'calendar-api') {
                return this.renderCalendarApi(spec);
            }
            return this.renderIframe(spec, options);
        };
        if (spec.launcher) {
            return mountEmbedLauncher(document, spec.launcher, buildInner, {
                initialSegment: options.initialSegment ?? null,
                mountContainer: mountContainer ?? null,
                segmentSupport: Boolean(options.segments && options.getSegmentUrl),
            });
        }
        return buildInner();
    }
    renderCalendarApi(spec) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-notion-embed', 'calendar-api');
        Object.assign(wrapper.style, spec.wrapperStyles);
        if (spec.className) {
            wrapper.className = spec.className;
        }
        const { destroy: destroyCalendar } = renderNativeCalendar(wrapper, {
            events: spec.events ?? [],
            palette: spec.calendarPalette,
        });
        const destroy = () => {
            destroyCalendar();
            wrapper.remove();
        };
        return {
            element: wrapper,
            destroy,
        };
    }
    renderIframe(spec, options) {
        const { segments, initialSegment, getSegmentUrl } = options;
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-notion-embed', spec.mode);
        Object.assign(wrapper.style, spec.wrapperStyles);
        if (spec.className) {
            wrapper.className = spec.className;
        }
        const iframe = document.createElement('iframe');
        iframe.src = spec.url;
        iframe.title = 'Notion embed';
        iframe.setAttribute('loading', 'lazy');
        Object.assign(iframe.style, spec.iframeStyles);
        wrapper.appendChild(iframe);
        let currentSegment = initialSegment ?? null;
        const destroy = () => {
            wrapper.remove();
        };
        const updateUrl = (url) => {
            iframe.src = url;
        };
        const setSegment = segments && getSegmentUrl
            ? (segment) => {
                const url = getSegmentUrl(segment);
                if (!url) {
                    console.warn(`[notion-embed-js] Segment "${segment}" not found, keeping current`);
                    return;
                }
                updateUrl(url);
                currentSegment = segment;
            }
            : undefined;
        const getActiveSegment = segments
            ? () => currentSegment
            : undefined;
        return {
            element: wrapper,
            destroy,
            setSegment,
            getActiveSegment,
            updateUrl,
        };
    }
}
//# sourceMappingURL=dom-embed-renderer.adapter.js.map