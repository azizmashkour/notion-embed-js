import type { RenderedEmbed } from '../ports/out/embed-renderer.port.js';
import type { ResolvedLauncherSpec } from '../widget/launcher-config.js';
export interface EmbedLauncherBridge {
    open: () => void;
    close: () => void;
    isOpen: () => boolean;
    getInner: () => RenderedEmbed | null;
    setSegment?: (segment: string) => void;
    getActiveSegment?: () => string | null;
}
export declare function EmbedLauncherRadixView({ cfg, buildInner, context, bridge, }: {
    cfg: ResolvedLauncherSpec;
    buildInner: () => RenderedEmbed;
    context: {
        initialSegment: string | null;
        segmentSupport: boolean;
    };
    bridge: EmbedLauncherBridge;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=embed-launcher-view.d.ts.map