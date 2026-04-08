import type { RenderedEmbed } from '../ports/out/embed-renderer.port.js';
import type { ResolvedLauncherSpec } from './launcher-config.js';
export interface MountEmbedLauncherContext {
    initialSegment: string | null;
    mountContainer?: HTMLElement | null;
    segmentSupport: boolean;
}
/**
 * Floating launcher + embed panel using Radix Popover (modal).
 */
export declare function mountEmbedLauncher(doc: Document, cfg: ResolvedLauncherSpec, buildInner: () => RenderedEmbed, context: MountEmbedLauncherContext): RenderedEmbed & {
    open: () => void;
    close: () => void;
    isOpen: () => boolean;
};
//# sourceMappingURL=embed-launcher.d.ts.map