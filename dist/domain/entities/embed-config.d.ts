/**
 * Domain entity: parsed and validated embed configuration
 */
export interface EmbedConfig {
    readonly url: string;
    readonly mode: 'page' | 'calendar';
    readonly width: string;
    readonly height: string;
    readonly className: string;
    readonly style: Record<string, string>;
    readonly segments?: Record<string, string>;
    readonly defaultSegment: string;
}
//# sourceMappingURL=embed-config.d.ts.map