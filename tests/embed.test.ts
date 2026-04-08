import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEmbed, embedInto } from '../src/index.js';

describe('createEmbed', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('creates page embed with default options', () => {
    const url = 'https://workspace.notion.site/page-id-123';
    const { element, destroy } = createEmbed({ url });

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.getAttribute('data-notion-embed')).toBe('page');
    expect(element.querySelector('iframe')).toBeTruthy();
    expect(element.querySelector('iframe')?.src).toBe(url);

    destroy();
  });

  it('creates calendar embed when mode is calendar', () => {
    const url = 'https://workspace.notion.site/db-id?v=view-id';
    const { element, destroy } = createEmbed({ url, mode: 'calendar' });

    expect(element.getAttribute('data-notion-embed')).toBe('calendar');
    expect(element.style.minHeight).toBe('400px');
    expect(element.style.height).toBe('100%');

    destroy();
  });

  it('mounts into container when provided', () => {
    const url = 'https://workspace.notion.site/page-id';
    const { element, destroy } = createEmbed({ url }, container);

    expect(container.contains(element)).toBe(true);

    destroy();
  });

  it('destroy removes element from DOM', () => {
    const url = 'https://workspace.notion.site/page-id';
    const { element, destroy } = createEmbed({ url }, container);

    expect(document.body.contains(element) || container.contains(element)).toBe(true);
    destroy();
    expect(document.body.contains(element)).toBe(false);
  });

  it('throws on invalid Notion URL', () => {
    expect(() => createEmbed({ url: 'https://google.com' })).toThrow('Invalid Notion URL');
    expect(() => createEmbed({ url: 'not-a-url' })).toThrow('Invalid Notion URL');
  });

  it('throws on notion.so URL (blocks iframe embedding)', () => {
    expect(() => createEmbed({ url: 'https://www.notion.so/My-Page-abc123' })).toThrow('notion.so');
    expect(() => createEmbed({ url: 'https://notion.so/Page-abc123' })).toThrow('notion.so');
  });

  it('applies custom className', () => {
    const url = 'https://workspace.notion.site/page-id';
    const { element, destroy } = createEmbed({
      url,
      className: 'my-notion-widget',
    });

    expect(element.className).toBe('my-notion-widget');

    destroy();
  });

  it('applies custom dimensions for page mode', () => {
    const url = 'https://workspace.notion.site/page-id';
    const { element, destroy } = createEmbed({
      url,
      width: '800px',
      height: '800px',
    });

    const iframe = element.querySelector('iframe');
    expect(iframe?.style.height).toBe('800px');

    destroy();
  });
});

describe('embedInto', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'embed-target';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('embeds into element by ID', () => {
    const url = 'https://workspace.notion.site/page-id';
    const result = embedInto('embed-target', { url });

    expect(result).not.toBeNull();
    expect(container.querySelector('[data-notion-embed]')).toBeTruthy();
    result?.destroy();
  });

  it('returns null when element not found', () => {
    const result = embedInto('non-existent-id', {
      url: 'https://workspace.notion.site/page-id',
    });

    expect(result).toBeNull();
  });
});

describe('segment options', () => {
  let container: HTMLDivElement;

  const segments = {
    default: 'https://workspace.notion.site/db?v=default-view',
    leads: 'https://workspace.notion.site/db?v=leads-view',
    premium: 'https://workspace.notion.site/db?v=premium-view',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('uses segment option when provided', () => {
    const { element, destroy } = createEmbed({
      url: 'https://workspace.notion.site/fallback',
      segments,
      segment: 'premium',
    });

    const iframe = element.querySelector('iframe');
    expect(iframe?.src).toContain('premium-view');

    destroy();
  });

  it('uses getSegment callback when provided', () => {
    const getSegment = vi.fn().mockReturnValue('leads');
    const { element, destroy } = createEmbed({
      url: 'https://workspace.notion.site/fallback',
      segments,
      getSegment,
    });

    expect(getSegment).toHaveBeenCalled();
    const iframe = element.querySelector('iframe');
    expect(iframe?.src).toContain('leads-view');

    destroy();
  });

  it('falls back to default segment when resolved segment not in map', () => {
    const { element, destroy } = createEmbed({
      url: 'https://workspace.notion.site/fallback',
      segments,
      segment: 'unknown',
      defaultSegment: 'default',
    });

    const iframe = element.querySelector('iframe');
    expect(iframe?.src).toContain('default-view');

    destroy();
  });

  it('setSegment updates iframe src', () => {
    const { element, setSegment, destroy } = createEmbed({
      url: 'https://workspace.notion.site/fallback',
      segments,
      segment: 'default',
    });

    const iframe = element.querySelector('iframe');
    expect(iframe?.src).toContain('default-view');

    setSegment!('premium');
    expect(iframe?.src).toContain('premium-view');

    destroy();
  });

  it('getActiveSegment returns current segment', () => {
    const { getActiveSegment, setSegment, destroy } = createEmbed({
      url: 'https://workspace.notion.site/fallback',
      segments,
      segment: 'leads',
    });

    expect(getActiveSegment?.()).toBe('leads');
    setSegment!('premium');
    expect(getActiveSegment?.()).toBe('premium');

    destroy();
  });

  it('setSegment and getActiveSegment are undefined when not using segments', () => {
    const result = createEmbed({
      url: 'https://workspace.notion.site/page-id',
    });

    expect(result.setSegment).toBeUndefined();
    expect(result.getActiveSegment).toBeUndefined();
    result.destroy();
  });

  it('throws when segment not found and no default in map', () => {
    expect(() =>
      createEmbed({
        url: 'https://workspace.notion.site/fallback',
        segments: { premium: 'https://workspace.notion.site/db?v=premium' },
        segment: 'leads',
        defaultSegment: 'default',
      })
    ).toThrow('Segment "leads" not found');
  });

  it('reads segment from URL when segmentFromUrl is set', () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?audience=premium' },
      writable: true,
    });

    const { element, destroy } = createEmbed({
      url: 'https://workspace.notion.site/fallback',
      segments,
      segmentFromUrl: 'audience',
    });

    const iframe = element.querySelector('iframe');
    expect(iframe?.src).toContain('premium-view');

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });

    destroy();
  });
});
