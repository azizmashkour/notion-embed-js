import type { NotionEmbedOptions, NotionEmbedResult } from '../../types.js';
import { createEmbed } from './create-embed.adapter.js';

/**
 * Primary adapter: Embed into element by ID
 */
export function embedInto(
  elementId: string,
  options: NotionEmbedOptions
): NotionEmbedResult | null {
  const container = document.getElementById(elementId);
  if (!container) {
    return null;
  }
  return createEmbed(options, container);
}
