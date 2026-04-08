import type { EmbedSpec } from '../../domain/entities/embed-spec.js';

/**
 * Result of rendering an embed
 */
export interface RenderedEmbed {
  element: HTMLElement;
  destroy: () => void;
  setSegment?: (segment: string) => void;
  getActiveSegment?: () => string | null;
  updateUrl?: (url: string) => void;
  open?: () => void;
  close?: () => void;
  isOpen?: () => boolean;
}

/**
 * Port: Render embed to DOM
 */
export interface EmbedRendererPort {
  render(
    spec: EmbedSpec,
    options: RenderOptions,
    mountContainer?: HTMLElement | null
  ): RenderedEmbed;
}

export interface RenderOptions {
  segments?: Record<string, string>;
  initialSegment?: string | null;
  getSegmentUrl?: (segment: string) => string | null;
}
