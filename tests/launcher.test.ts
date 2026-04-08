import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEmbed } from '../src/index.js';

describe('launcher widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.querySelectorAll('[data-notion-embed-launcher-root]').forEach((el) => el.remove());
  });

  it('mounts floating button to body and skips container append when mountTarget is body', async () => {
    const url = 'https://workspace.notion.site/page-id';
    const { element, destroy, open, close, isOpen } = createEmbed(
      {
        url,
        launcher: { mountTarget: 'body' },
      },
      container
    );

    expect(container.querySelector('[data-notion-embed]')).toBeNull();
    expect(document.body.contains(element)).toBe(true);
    expect(element.querySelector('[data-notion-embed-launcher-button]')).toBeTruthy();
    expect(open).toBeDefined();
    expect(close).toBeDefined();
    expect(isOpen?.()).toBe(false);

    open!();
    await vi.waitFor(() => expect(isOpen?.()).toBe(true));
    expect(document.querySelector('[data-notion-embed-launcher-panel]')).toBeTruthy();
    await vi.waitFor(() => {
      const iframe = document.querySelector(
        '[data-notion-embed-launcher-body] iframe'
      ) as HTMLIFrameElement | null;
      expect(iframe?.getAttribute('src')).toBe(url);
    });

    close!();
    expect(isOpen?.()).toBe(false);

    destroy();
    expect(document.body.contains(element)).toBe(false);
    expect(document.querySelector('[data-notion-embed-launcher-root]')).toBeNull();
  });

  it('mounts button into container when mountTarget is container', () => {
    const url = 'https://workspace.notion.site/page-id';
    const { element, destroy } = createEmbed(
      {
        url,
        launcher: { mountTarget: 'container' },
      },
      container
    );

    expect(container.contains(element)).toBe(true);
    expect(container.parentElement).toBe(document.body);

    destroy();
  });

  it('works with calendar-api mode', async () => {
    const { element, open, destroy } = createEmbed({
      mode: 'calendar-api',
      events: [{ id: '1', title: 'Ev', start: '2026-04-08', end: null }],
      launcher: true,
    });

    expect(document.body.contains(element)).toBe(true);
    open!();
    await vi.waitFor(() =>
      expect(
        document.querySelector(
          '[data-notion-embed-launcher-body] [data-notion-embed="calendar-api"]'
        )
      ).toBeTruthy()
    );
    destroy();
  });
});
