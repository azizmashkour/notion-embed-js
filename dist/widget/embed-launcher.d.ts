import type { RenderedEmbed } from '../ports/out/embed-renderer.port.js';
import type { ResolvedLauncherSpec } from './launcher-config.js';
export interface MountEmbedLauncherContext {
    initialSegment: string | null;
    /** Where to attach the round button when mountTarget is `container` */
    mountContainer?: HTMLElement | null;
    segmentSupport: boolean;
}
/**
 * Wraps a lazy-built embed in a floating launcher + modal panel.
 */
export declare function mountEmbedLauncher(doc: Document, cfg: ResolvedLauncherSpec, buildInner: () => RenderedEmbed, context: MountEmbedLauncherContext): RenderedEmbed & {
    open: () => void;
    close: () => void;
    isOpen: () => boolean;
};
//# sourceMappingURL=embed-launcher.d.ts.map