import type { UrlValidatorPort } from '../../ports/out/url-validator.port.js';
/**
 * Adapter: Standard Notion URL validation
 */
export declare class UrlValidatorAdapter implements UrlValidatorPort {
    normalize(url: string): string;
    isValid(url: string): boolean;
    validate(url: string): string;
}
//# sourceMappingURL=url-validator.adapter.d.ts.map