import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import type { NotionCalendarPalette } from './palette.types.js';
import {
  applyPaletteToElement,
  mergeNotionCalendarPalette,
} from './palette.js';
import {
  buildEventsByDay,
  monthCells,
  toLocalDateKey,
} from './calendar-utils.js';
import {
  mountCalendarChipPeek,
  mountDayAgendaPeek,
} from '../react/mount-calendar-peeks.js';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const BASE_STYLES = `
.nec-root{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.4;color:var(--nec-text);background:var(--nec-surface);border:1px solid var(--nec-border);border-radius:8px;box-sizing:border-box;display:flex;flex-direction:column;min-height:inherit;height:100%;overflow:hidden}
.nec-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--nec-border);background:var(--nec-week-header-bg)}
.nec-title{font-weight:600;color:var(--nec-text-strong);flex:1;min-width:8rem}
.nec-nav{display:flex;align-items:center;gap:6px}
.nec-btn{background:var(--nec-button-bg);border:1px solid var(--nec-control-border);color:var(--nec-text-strong);border-radius:6px;padding:6px 10px;cursor:pointer;font:inherit}
.nec-btn:hover{background:var(--nec-button-hover-bg)}
.nec-grid-wrap{flex:1;overflow:auto;padding:8px}
.nec-weekrow{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--nec-border);border:1px solid var(--nec-border);border-radius:6px;overflow:hidden}
.nec-wd{text-align:center;font-size:11px;font-weight:600;color:var(--nec-muted);padding:6px 4px;background:var(--nec-week-header-bg)}
.nec-cell{min-height:5.5rem;background:var(--nec-surface);padding:4px;cursor:pointer;position:relative}
.nec-cell:hover{background:var(--nec-button-hover-bg)}
.nec-cell--muted{background:var(--nec-empty-cell-bg);cursor:default}
.nec-cell--muted:hover{background:var(--nec-empty-cell-bg)}
.nec-cell--weekend:not(.nec-cell--muted){background:var(--nec-weekend-bg)}
.nec-cell--today{box-shadow:inset 0 0 0 2px var(--nec-today-ring)}
.nec-daynum{font-size:12px;font-weight:600;color:var(--nec-muted);margin-bottom:2px}
.nec-more{font-size:11px;color:var(--nec-muted);margin-top:4px;cursor:pointer}
`;

function chipAccentForEvent(ev: NotionCalendarEvent, colors: string[]): string {
  const n = Math.max(1, colors.length);
  let h = 0;
  for (let i = 0; i < ev.id.length; i++) h = (h * 31 + ev.id.charCodeAt(i)) >>> 0;
  return colors[h % n] ?? colors[0]!;
}

export interface NativeCalendarOptions {
  events: NotionCalendarEvent[];
  palette?: Partial<NotionCalendarPalette>;
}

export function renderNativeCalendar(
  mount: HTMLElement,
  options: NativeCalendarOptions
): { destroy: () => void } {
  const palette = mergeNotionCalendarPalette(options.palette);
  const chipColors = palette.eventChipColors;

  mount.classList.add('nec-root');
  applyPaletteToElement(mount, palette);

  const styleEl = document.createElement('style');
  styleEl.textContent = BASE_STYLES;
  mount.appendChild(styleEl);

  const toolbar = document.createElement('div');
  toolbar.className = 'nec-toolbar';

  const titleEl = document.createElement('div');
  titleEl.className = 'nec-title';

  const nav = document.createElement('div');
  nav.className = 'nec-nav';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'nec-btn';
  prevBtn.textContent = '←';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'nec-btn';
  nextBtn.textContent = '→';

  const todayBtn = document.createElement('button');
  todayBtn.type = 'button';
  todayBtn.className = 'nec-btn';
  todayBtn.textContent = 'Today';

  nav.append(prevBtn, todayBtn, nextBtn);
  toolbar.append(titleEl, nav);
  mount.appendChild(toolbar);

  const gridWrap = document.createElement('div');
  gridWrap.className = 'nec-grid-wrap';
  mount.appendChild(gridWrap);

  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();

  const chipUnmounts: Array<() => void> = [];
  let closeDayAgenda: (() => void) | null = null;

  const byDay = (): Map<string, NotionCalendarEvent[]> =>
    buildEventsByDay(options.events);

  function openDayAgenda(
    list: NotionCalendarEvent[],
    label: string,
    anchorEl: HTMLElement
  ): void {
    closeDayAgenda?.();
    const rect = anchorEl.getBoundingClientRect();
    closeDayAgenda = mountDayAgendaPeek(document, list, label, rect);
  }

  function renderGrid(): void {
    chipUnmounts.forEach((u) => u());
    chipUnmounts.length = 0;
    closeDayAgenda?.();
    closeDayAgenda = null;

    gridWrap.replaceChildren();
    const label = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(new Date(viewYear, viewMonth, 1));
    titleEl.textContent = label;

    const map = byDay();
    const cells = monthCells(viewYear, viewMonth);
    const todayKey = toLocalDateKey(new Date());
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const headerRow = document.createElement('div');
    headerRow.className = 'nec-weekrow';
    headerRow.style.marginBottom = '8px';
    for (const wd of WEEKDAYS) {
      const h = document.createElement('div');
      h.className = 'nec-wd';
      h.textContent = wd;
      headerRow.appendChild(h);
    }
    gridWrap.appendChild(headerRow);

    let weekRow: HTMLDivElement | null = null;

    for (let i = 0; i < cells.length; i++) {
      if (i % 7 === 0) {
        weekRow = document.createElement('div');
        weekRow.className = 'nec-weekrow';
        weekRow.style.minHeight = '5.5rem';
        gridWrap.appendChild(weekRow);
      }
      const cell = document.createElement('div');
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + i);
      const inMonth = cellDate.getMonth() === viewMonth;
      const dateKey = toLocalDateKey(cellDate);
      const dow = cellDate.getDay();

      cell.className = 'nec-cell';
      if (!inMonth) {
        cell.classList.add('nec-cell--muted');
      }
      if (inMonth && (dow === 0 || dow === 6)) {
        cell.classList.add('nec-cell--weekend');
      }
      if (dateKey === todayKey) {
        cell.classList.add('nec-cell--today');
      }

      const num = document.createElement('div');
      num.className = 'nec-daynum';
      num.textContent = String(cellDate.getDate());
      cell.appendChild(num);

      const list = map.get(dateKey) ?? [];
      const maxShow = 3;
      const dayTitle = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(cellDate);

      for (let j = 0; j < Math.min(maxShow, list.length); j++) {
        const ev = list[j]!;
        const wrap = document.createElement('div');
        wrap.style.display = 'block';
        const unmount = mountCalendarChipPeek(wrap, ev, {
          borderLeftColor: chipAccentForEvent(ev, chipColors),
          background: palette.eventBarBg,
          color: palette.textStrong,
        });
        chipUnmounts.push(unmount);
        cell.appendChild(wrap);
      }
      if (list.length > maxShow) {
        const more = document.createElement('div');
        more.className = 'nec-more';
        more.textContent = `+${list.length - maxShow} more`;
        more.addEventListener('click', (e) => {
          e.stopPropagation();
          openDayAgenda(list, dayTitle, cell);
        });
        cell.appendChild(more);
      }

      if (list.length > 0) {
        cell.addEventListener('click', () => {
          openDayAgenda(list, dayTitle, cell);
        });
      }

      weekRow!.appendChild(cell);
    }
  }

  prevBtn.addEventListener('click', () => {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear -= 1;
    } else {
      viewMonth -= 1;
    }
    renderGrid();
  });
  nextBtn.addEventListener('click', () => {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear += 1;
    } else {
      viewMonth += 1;
    }
    renderGrid();
  });
  todayBtn.addEventListener('click', () => {
    const n = new Date();
    viewYear = n.getFullYear();
    viewMonth = n.getMonth();
    renderGrid();
  });

  renderGrid();

  return {
    destroy: (): void => {
      chipUnmounts.forEach((u) => u());
      chipUnmounts.length = 0;
      closeDayAgenda?.();
      closeDayAgenda = null;
      mount.replaceChildren();
      mount.classList.remove('nec-root');
      mount.removeAttribute('style');
    },
  };
}
