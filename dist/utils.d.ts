/**
 * Normalize Notion URL to ensure it's embeddable
 */
export declare function normalizeNotionUrl(url: string): string;
/**
 * Check if the URL uses the embeddable notion.site format.
 * www.notion.so and notion.so block iframe embedding (X-Frame-Options).
 */
export declare function isEmbeddableNotionUrl(url: string): boolean;
/**
 * Validate that the URL appears to be a Notion URL.
 * Also accepts proxy URLs (e.g. /api/notion-proxy?url=...) where the url param is a valid Notion URL.
 */
export declare function isValidNotionUrl(url: string): boolean;
//# sourceMappingURL=utils.d.ts.map