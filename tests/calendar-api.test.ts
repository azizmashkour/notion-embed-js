import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createEmbed } from '../src/index.js';

function desktopMql(): MediaQueryList {
  return {
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
}

function mobileMql(): MediaQueryList {
  return { ...desktopMql(), matches: true } as MediaQueryList;
}

describe('calendar-api mode', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.mocked(window.matchMedia).mockImplementation(() => desktopMql());
  });

  afterEach(() => {
    container.remove();
    vi.mocked(window.matchMedia).mockImplementation(() => desktopMql());
  });

  it('renders native calendar without iframe', async () => {
    const { element, destroy } = createEmbed(
      {
        mode: 'calendar-api',
        events: [
          {
            id: '1',
            title: 'Test event',
            start: '2026-04-08T10:00:00.000Z',
            end: '2026-04-08T11:00:00.000Z',
          },
        ],
      },
      container
    );

    expect(element.getAttribute('data-notion-embed')).toBe('calendar-api');
    expect(element.querySelector('iframe')).toBeNull();
    expect(element.classList.contains('nec-root')).toBe(true);
    await vi.waitFor(() => {
      const labels = [...element.querySelectorAll('button')].map((b) => b.textContent ?? '');
      expect(labels.some((t) => t.includes('Test event'))).toBe(true);
    });

    destroy();
  });

  it('applies custom calendarPalette', () => {
    const { element, destroy } = createEmbed(
      {
        mode: 'calendar-api',
        events: [],
        calendarPalette: { eventAccent: '#ff00ff', surface: '#eeeeee' },
      },
      container
    );

    expect(element.style.getPropertyValue('--nec-event-accent')).toBe('#ff00ff');
    expect(element.style.getPropertyValue('--nec-surface')).toBe('#eeeeee');

    destroy();
  });

  it('rejects segments with calendar-api', () => {
    expect(() =>
      createEmbed({
        mode: 'calendar-api',
        events: [],
        segments: { default: 'https://workspace.notion.site/x' },
      })
    ).toThrow('calendar-api');
  });

  it('desktop shows inline view tabs including Month', async () => {
    const { element, destroy } = createEmbed({ mode: 'calendar-api', events: [] }, container);
    await vi.waitFor(() => {
      expect(element.querySelector('.nec-view-tabs')).toBeTruthy();
    });
    const labels = [...element.querySelectorAll('.nec-view-tab')].map((b) => b.textContent?.trim());
    expect(labels).toContain('Month');
    expect(labels).toContain('Day');
    destroy();
  });

  it('mobile defaults to day timeline and omits Month from select', async () => {
    vi.mocked(window.matchMedia).mockImplementation(() => mobileMql());
    const { element, destroy } = createEmbed({ mode: 'calendar-api', events: [] }, container);
    await vi.waitFor(() => {
      expect(element.querySelector('.nec-day-view')).toBeTruthy();
    });
    const dd = element.querySelector('[data-nec-view-dropdown]');
    expect(dd).toBeTruthy();
    const modes = [...dd!.querySelectorAll('[role="menuitem"]')].map(
      (n) => (n as HTMLElement).dataset.mode
    );
    expect(modes).not.toContain('month');
    expect(element.querySelector('.nec-toolbar--mobile')).toBeTruthy();
    destroy();
  });

  it('mobile day view renders colored timeline blocks for today timed events', async () => {
    vi.mocked(window.matchMedia).mockImplementation(() => mobileMql());
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const start = `${y}-${m}-${day}T10:00:00`;
    const end = `${y}-${m}-${day}T11:30:00`;
    const { element, destroy } = createEmbed(
      {
        mode: 'calendar-api',
        events: [{ id: 'tl1', title: 'Timed', start, end }],
      },
      container
    );
    await vi.waitFor(() => {
      expect(element.querySelector('.nec-timeline-event')).toBeTruthy();
    });
    const btn = element.querySelector('.nec-timeline-event') as HTMLButtonElement;
    expect(btn.textContent).toContain('Timed');
    expect(btn.style.backgroundColor || btn.style.background).toBeTruthy();
    destroy();
  });
});
