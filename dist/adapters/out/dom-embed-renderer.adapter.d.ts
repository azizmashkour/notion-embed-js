import type { EmbedRendererPort, RenderedEmbed, RenderOptions } from '../../ports/out/embed-renderer.port.js';
import type { EmbedSpec } from '../../domain/entities/embed-spec.js';
/**
 * Adapter: Render embed to DOM (browser)
 */
export declare class DomEmbedRendererAdapter implements EmbedRendererPort {
    render(spec: EmbedSpec, options: RenderOptions, mountContainer?: HTMLElement | null): RenderedEmbed;
    private renderCalendarApi;
    private renderIframe;
}
//# sourceMappingURL=dom-embed-renderer.adapter.d.ts.map