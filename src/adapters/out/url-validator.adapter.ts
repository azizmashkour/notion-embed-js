import type { UrlValidatorPort } from '../../ports/out/url-validator.port.js';
import {
  normalizeNotionUrl,
  isValidNotionUrl,
  isEmbeddableNotionUrl,
} from '../../utils.js';

/**
 * Adapter: Standard Notion URL validation
 */
export class UrlValidatorAdapter implements UrlValidatorPort {
  normalize(url: string): string {
    return normalizeNotionUrl(url);
  }

  isValid(url: string): boolean {
    return isValidNotionUrl(url);
  }

  validate(url: string): string {
    const normalized = this.normalize(url);
    if (!this.isValid(normalized)) {
      throw new Error(
        `Invalid Notion URL: "${url}". URL must be a public Notion page (e.g. https://workspace.notion.site/page-id)`
      );
    }
    if (!isEmbeddableNotionUrl(normalized)) {
      throw new Error(
        `URL "${url}" uses notion.so which blocks iframe embedding. ` +
          `Use the publish URL from Notion: Share → Publish → Embed this page. ` +
          `The embed URL uses notion.site (e.g. https://workspace.notion.site/page-id).`
      );
    }
    return normalized;
  }
}
