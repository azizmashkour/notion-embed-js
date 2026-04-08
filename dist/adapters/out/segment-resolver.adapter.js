import { DEFAULT_SEGMENT_KEY } from '../../domain/constants.js';
/**
 * Adapter: Resolve segment from embed options (segment, getSegment, segmentFromUrl)
 */
export class OptionsSegmentResolverAdapter {
    options;
    constructor(options) {
        this.options = options;
    }
    resolve() {
        if (this.options.segment)
            return this.options.segment;
        if (this.options.getSegment)
            return this.options.getSegment();
        if (this.options.segmentFromUrl && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const value = params.get(this.options.segmentFromUrl);
            if (value)
                return value;
        }
        return this.options.defaultSegment ?? DEFAULT_SEGMENT_KEY;
    }
}
//# sourceMappingURL=segment-resolver.adapter.js.map