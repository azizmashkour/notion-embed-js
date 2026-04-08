import type { SegmentResolverPort } from '../../ports/out/segment-resolver.port.js';
import type { NotionEmbedOptions } from '../../types.js';
/**
 * Adapter: Resolve segment from embed options (segment, getSegment, segmentFromUrl)
 */
export declare class OptionsSegmentResolverAdapter implements SegmentResolverPort {
    private readonly options;
    constructor(options: NotionEmbedOptions);
    resolve(): string;
}
//# sourceMappingURL=segment-resolver.adapter.d.ts.map