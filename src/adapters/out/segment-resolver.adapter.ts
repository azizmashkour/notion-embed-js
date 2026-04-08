import type { SegmentResolverPort } from '../../ports/out/segment-resolver.port.js';
import type { NotionEmbedOptions } from '../../types.js';
import { DEFAULT_SEGMENT_KEY } from '../../domain/constants.js';

/**
 * Adapter: Resolve segment from embed options (segment, getSegment, segmentFromUrl)
 */
export class OptionsSegmentResolverAdapter implements SegmentResolverPort {
  constructor(private readonly options: NotionEmbedOptions) {}

  resolve(): string {
    if (this.options.segment) return this.options.segment;
    if (this.options.getSegment) return this.options.getSegment();
    if (this.options.segmentFromUrl && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const value = params.get(this.options.segmentFromUrl);
      if (value) return value;
    }
    return this.options.defaultSegment ?? DEFAULT_SEGMENT_KEY;
  }
}
