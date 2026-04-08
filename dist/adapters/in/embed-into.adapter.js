import { createEmbed } from './create-embed.adapter.js';
/**
 * Primary adapter: Embed into element by ID
 */
export function embedInto(elementId, options) {
    const container = document.getElementById(elementId);
    if (!container) {
        return null;
    }
    return createEmbed(options, container);
}
//# sourceMappingURL=embed-into.adapter.js.map