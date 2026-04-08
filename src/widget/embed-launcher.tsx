import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { RenderedEmbed } from '../ports/out/embed-renderer.port.js';
import { EmbedLauncherRadixView, type EmbedLauncherBridge } from '../react/embed-launcher-view.js';
import type { ResolvedLauncherSpec } from './launcher-config.js';

export interface MountEmbedLauncherContext {
  initialSegment: string | null;
  mountContainer?: HTMLElement | null;
  segmentSupport: boolean;
}

/**
 * Floating launcher + embed panel using Radix Popover (modal).
 */
export function mountEmbedLauncher(
  doc: Document,
  cfg: ResolvedLauncherSpec,
  buildInner: () => RenderedEmbed,
  context: MountEmbedLauncherContext
): RenderedEmbed & {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
} {
  let pendingSegment: string | null = null;

  const host = doc.createElement('div');
  host.setAttribute('data-notion-embed-launcher-root', '');
  Object.assign(host.style, { display: 'contents' });

  const bridge: EmbedLauncherBridge = {
    open: () => {},
    close: () => {},
    isOpen: () => false,
    getInner: () => null,
  };

  const root = createRoot(host);

  flushSync(() => {
    root.render(
      <EmbedLauncherRadixView
        cfg={cfg}
        buildInner={buildInner}
        context={{
          initialSegment: context.initialSegment,
          segmentSupport: context.segmentSupport,
        }}
        bridge={bridge}
      />
    );
  });

  const buttonParent = cfg.mountTarget === 'body' ? doc.body : (context.mountContainer ?? doc.body);
  buttonParent.appendChild(host);

  const destroy = (): void => {
    bridge.close();
    const inner = bridge.getInner();
    inner?.destroy();
    root.unmount();
    host.remove();
  };

  const setSegment = context.segmentSupport
    ? (segment: string): void => {
        pendingSegment = segment;
        bridge.setSegment?.(segment);
      }
    : undefined;

  const getActiveSegment = context.segmentSupport
    ? (): string | null => {
        if (bridge.getActiveSegment) return bridge.getActiveSegment();
        return pendingSegment ?? context.initialSegment;
      }
    : undefined;

  const updateUrl = (url: string): void => {
    bridge.getInner()?.updateUrl?.(url);
  };

  const base: RenderedEmbed & {
    open: () => void;
    close: () => void;
    isOpen: () => boolean;
  } = {
    element: host,
    destroy,
    open: () => bridge.open(),
    close: () => bridge.close(),
    isOpen: () => bridge.isOpen(),
    updateUrl,
  };

  if (setSegment) base.setSegment = setSegment;
  if (getActiveSegment) base.getActiveSegment = getActiveSegment;

  return base;
}
