/**
 * Normalize Notion URL to ensure it's embeddable
 */
export function normalizeNotionUrl(url) {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
    }
    return trimmed;
}
function isDirectNotionUrl(parsed) {
    return (parsed.hostname.endsWith('.notion.site') ||
        parsed.hostname.endsWith('.notion.so') ||
        parsed.hostname === 'notion.so' ||
        parsed.hostname === 'notion.site');
}
/**
 * Check if the URL uses the embeddable notion.site format.
 * www.notion.so and notion.so block iframe embedding (X-Frame-Options).
 */
export function isEmbeddableNotionUrl(url) {
    try {
        const normalized = normalizeNotionUrl(url);
        const parsed = new URL(normalized);
        // Proxy URLs: check the target url param
        if (parsed.pathname.includes('notion-proxy')) {
            const targetUrl = parsed.searchParams.get('url');
            if (!targetUrl)
                return false;
            return isEmbeddableNotionUrl(targetUrl);
        }
        // Only notion.site subdomains are embeddable (e.g. workspace.notion.site)
        return parsed.hostname.endsWith('.notion.site') || parsed.hostname === 'notion.site';
    }
    catch {
        return false;
    }
}
/**
 * Validate that the URL appears to be a Notion URL.
 * Also accepts proxy URLs (e.g. /api/notion-proxy?url=...) where the url param is a valid Notion URL.
 */
export function isValidNotionUrl(url) {
    try {
        const normalized = normalizeNotionUrl(url);
        const parsed = new URL(normalized);
        // Accept proxy URLs: path contains notion-proxy and url param is a direct Notion URL
        if (parsed.pathname.includes('notion-proxy')) {
            const targetUrl = parsed.searchParams.get('url');
            if (!targetUrl)
                return false;
            try {
                const targetParsed = new URL(normalizeNotionUrl(targetUrl));
                return isDirectNotionUrl(targetParsed);
            }
            catch {
                return false;
            }
        }
        return isDirectNotionUrl(parsed);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=utils.js.map