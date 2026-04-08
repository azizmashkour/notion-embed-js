import type {
  EmbedRendererPort,
  RenderedEmbed,
  RenderOptions,
} from '../../ports/out/embed-renderer.port.js';
import type { EmbedSpec } from '../../domain/entities/embed-spec.js';
import { renderNativeCalendar } from '../../calendar/native-calendar.js';
import { mountEmbedLauncher } from '../../widget/embed-launcher.js';

/**
 * Adapter: Render embed to DOM (browser)
 */
export class DomEmbedRendererAdapter implements EmbedRendererPort {
  render(
    spec: EmbedSpec,
    options: RenderOptions,
    mountContainer?: HTMLElement | null
  ): RenderedEmbed {
    const buildInner = (): RenderedEmbed => {
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

  private renderCalendarApi(spec: EmbedSpec): RenderedEmbed {
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

    const destroy = (): void => {
      destroyCalendar();
      wrapper.remove();
    };

    return {
      element: wrapper,
      destroy,
    };
  }

  private renderIframe(spec: EmbedSpec, options: RenderOptions): RenderedEmbed {
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

    let currentSegment: string | null = initialSegment ?? null;

    const destroy = (): void => {
      wrapper.remove();
    };

    const updateUrl = (url: string): void => {
      iframe.src = url;
    };

    const setSegment =
      segments && getSegmentUrl
        ? (segment: string): void => {
            const url = getSegmentUrl(segment);
            if (!url) {
              console.warn(`[notion-embed-js] Segment "${segment}" not found, keeping current`);
              return;
            }
            updateUrl(url);
            currentSegment = segment;
          }
        : undefined;

    const getActiveSegment = segments ? (): string | null => currentSegment : undefined;

    return {
      element: wrapper,
      destroy,
      setSegment,
      getActiveSegment,
      updateUrl,
    };
  }
}
