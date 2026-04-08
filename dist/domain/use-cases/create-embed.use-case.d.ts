import type { NotionEmbedOptions } from '../../types.js';
import type { EmbedSpec } from '../entities/embed-spec.js';
import type { UrlValidatorPort } from '../../ports/out/url-validator.port.js';
import type { SegmentResolverPort } from '../../ports/out/segment-resolver.port.js';
export interface CreateEmbedResult {
    spec: EmbedSpec;
    segments?: Record<string, string>;
    initialSegment: string | null;
    getSegmentUrl: (segment: string) => string | null;
}
/**
 * Use case: Create a Notion embed from options
 */
export declare class CreateEmbedUseCase {
    private readonly urlValidator;
    private readonly segmentResolver;
    constructor(urlValidator: UrlValidatorPort, segmentResolver: SegmentResolverPort);
    execute(options: NotionEmbedOptions): CreateEmbedResult;
    private resolveUrl;
}
//# sourceMappingURL=create-embed.use-case.d.ts.map