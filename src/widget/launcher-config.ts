import type { WidgetMode } from '../types.js';

export type NotionEmbedLauncherPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

/**
 * Floating launcher (Intercom-style) that opens a panel with the embed.
 * When omitted or `false`, the embed renders inline in its container (normal “page” layout).
 */
export interface NotionEmbedLauncherOptions {
  /**
   * Set `false` to disable when merging a preset object.
   * @default true when `launcher` is `true` or a config object
   */
  enabled?: boolean;
  position?: NotionEmbedLauncherPosition;
  /** Distance from viewport edge (px). @default 24 */
  offsetX?: number;
  /** Distance from viewport edge (px). @default 24 */
  offsetY?: number;
  /** @default "Open calendar" / "Open Notion" from mode */
  ariaLabel?: string;
  /** Optional short text beside the icon */
  label?: string;
  /**
   * `body` = fixed to viewport like Intercom (recommended).
   * `container` = append the launcher button to the element passed to `createEmbed`.
   * @default 'body'
   */
  mountTarget?: 'body' | 'container';
  /** @default 2147483000 */
  zIndex?: number;
  /** Panel header. @default "Calendar" or "Notion" from mode */
  panelTitle?: string;
  /** @default min(720px, 94vw) */
  panelMaxWidth?: string;
  /** @default min(90vh, 900px) */
  panelMaxHeight?: string;
  /** @default #0078d4 */
  buttonBackground?: string;
  /** Show built-in calendar glyph in the round button. @default true */
  showIcon?: boolean;
}

export interface ResolvedLauncherSpec {
  position: NotionEmbedLauncherPosition;
  offsetX: number;
  offsetY: number;
  ariaLabel: string;
  label?: string;
  mountTarget: 'body' | 'container';
  zIndex: number;
  panelTitle: string;
  panelMaxWidth: string;
  panelMaxHeight: string;
  buttonBackground: string;
  showIcon: boolean;
}

function defaultPanelTitle(mode: WidgetMode): string {
  if (mode === 'page') return 'Notion';
  return 'Calendar';
}

function defaultAriaLabel(mode: WidgetMode): string {
  if (mode === 'page') return 'Open Notion';
  return 'Open calendar';
}

export function resolveLauncherSpec(
  raw: boolean | NotionEmbedLauncherOptions | undefined,
  mode: WidgetMode
): ResolvedLauncherSpec | undefined {
  if (raw === undefined || raw === false) return undefined;
  const o: NotionEmbedLauncherOptions = raw === true ? {} : raw;
  if (o.enabled === false) return undefined;

  return {
    position: o.position ?? 'bottom-right',
    offsetX: o.offsetX ?? 24,
    offsetY: o.offsetY ?? 24,
    ariaLabel: o.ariaLabel ?? defaultAriaLabel(mode),
    ...(o.label !== undefined && o.label !== '' ? { label: o.label } : {}),
    mountTarget: o.mountTarget ?? 'body',
    zIndex: o.zIndex ?? 2147483000,
    panelTitle: o.panelTitle ?? defaultPanelTitle(mode),
    panelMaxWidth: o.panelMaxWidth ?? 'min(720px, 94vw)',
    panelMaxHeight: o.panelMaxHeight ?? 'min(90vh, 900px)',
    buttonBackground: o.buttonBackground ?? '#0078d4',
    showIcon: o.showIcon !== false,
  };
}
