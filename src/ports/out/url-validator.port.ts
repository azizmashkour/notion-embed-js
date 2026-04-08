/**
 * Port: URL validation and normalization
 */
export interface UrlValidatorPort {
  normalize(url: string): string;
  isValid(url: string): boolean;
  validate(url: string): string;
}
