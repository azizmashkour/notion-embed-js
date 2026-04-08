import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createEmbed } from '../src/index.js';

describe('calendar-api mode', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders native calendar without iframe', () => {
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
    expect(element.textContent).toContain('Test event');

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
});
