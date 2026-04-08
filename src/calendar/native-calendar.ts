import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import type { NotionCalendarPalette } from './palette.types.js';
import { applyPaletteToElement, mergeNotionCalendarPalette } from './palette.js';
import {
  addDays,
  allDayEventsOnDay,
  buildEventsByDay,
  formatCalendarPeriodTitle,
  monthCells,
  startOfDay,
  startOfWeekMonday,
  startOfWeekSunday,
  timedEventsOnDay,
  timedSegmentPercentOnDay,
  toLocalDateKey,
} from './calendar-utils.js';
import {
  CALENDAR_MOBILE_MAX_PX,
  CAL_MIN_HEIGHT,
  calendarViewOptionsForMobile,
  DAY_TIMELINE_HEIGHT_PX,
  HOUR_ROW_PX,
  rangeStyleForEventId,
  type CalendarViewMode,
  WEEKDAYS_SUN,
  WORK_HEADERS,
} from './notion-calendar-constants.js';
import { mountCalendarChipPeek, mountDayAgendaPeek } from '../react/mount-calendar-peeks.js';

/** Mobile column = 1/3 of calendar card (cqw); fallback vw when container queries unsupported. */
const EXTRA_STYLES = `
.nec-toolbar--mobile{align-items:flex-start;flex-direction:column;flex-wrap:nowrap}
.nec-toolbar-mobile-head{display:flex;flex-direction:column;align-items:flex-start;gap:6px;width:100%;min-width:0}
.nec-view-select{font:inherit;font-size:0.875rem;padding:4px 8px;border-radius:2px;border:1px solid var(--nec-control-border);background:var(--nec-button-bg);color:var(--nec-text);width:max-content;max-width:100%}
.nec-toolbar-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:100%;min-width:0}
.nec-toolbar-desktop-top{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px;width:100%;min-width:0}
.nec-toolbar-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0;max-width:100%}
.nec-view-tabs{display:inline-flex;flex-wrap:wrap;max-width:100%;border-radius:2px;border:1px solid var(--nec-control-border);background:var(--nec-week-header-bg);padding:2px;gap:0}
.nec-view-tab{cursor:pointer;border:none;font:inherit;font-size:0.875rem;padding:6px 12px;border-radius:2px;background:transparent;color:var(--nec-text)}
.nec-view-tab:hover{background:rgba(255,255,255,0.9)}
.nec-view-tab--active{background:var(--nec-blue);color:#fff;box-shadow:0 1px 2px rgba(0,0,0,0.08)}
.nec-view-tab--active:hover{background:var(--nec-blue);color:#fff}
.nec-cal-scroll{flex:1;min-height:0;min-width:0;width:100%;box-sizing:border-box;padding-left:16px;padding-right:16px}
@media (min-width:640px){.nec-cal-scroll{padding-left:20px;padding-right:20px}}
@media (max-width:767px){
  .nec-cal-scroll{overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory}
}
@media (min-width:768px){
  .nec-cal-scroll{overflow:visible;scroll-snap-type:none;padding-left:0;padding-right:0}
}
.nec-cal-scroll-inner{display:flex;flex-direction:column;width:100%;min-width:0;box-sizing:border-box}
@media (max-width:767px){
  .nec-cal-scroll-inner{width:max-content;min-width:100%}
}
@media (max-width:767px){
  .nec-week-row--7,.nec-week-row--5{display:flex;flex-direction:row;box-sizing:border-box}
  @supports (width:1cqw){
    .nec-week-row--7{width:calc(7 * (100cqw / 3));min-width:calc(7 * (100cqw / 3))}
    .nec-week-row--5{width:calc(5 * (100cqw / 3));min-width:calc(5 * (100cqw / 3))}
    .nec-week-row--7 > .nec-grid-head-cell,
    .nec-week-row--7 > .nec-day-cell,
    .nec-week-row--7 > .nec-week-head,
    .nec-week-row--5 > .nec-grid-head-cell,
    .nec-week-row--5 > .nec-day-cell,
    .nec-week-row--5 > .nec-week-head{
      flex:0 0 calc(100cqw / 3);
      width:calc(100cqw / 3);
      min-width:calc(100cqw / 3);
      max-width:calc(100cqw / 3);
      scroll-snap-align:start;
      box-sizing:border-box
    }
  }
  @supports not (width:1cqw){
    .nec-week-row--7{width:calc(7 * ((100vw - 2rem) / 3));min-width:calc(7 * ((100vw - 2rem) / 3))}
    .nec-week-row--5{width:calc(5 * ((100vw - 2rem) / 3));min-width:calc(5 * ((100vw - 2rem) / 3))}
    .nec-week-row--7 > .nec-grid-head-cell,
    .nec-week-row--7 > .nec-day-cell,
    .nec-week-row--7 > .nec-week-head,
    .nec-week-row--5 > .nec-grid-head-cell,
    .nec-week-row--5 > .nec-day-cell,
    .nec-week-row--5 > .nec-week-head{
      flex:0 0 calc((100vw - 2rem) / 3);
      min-width:calc((100vw - 2rem) / 3);
      max-width:calc((100vw - 2rem) / 3);
      scroll-snap-align:start;
      box-sizing:border-box
    }
  }
}
@media (min-width:768px){
  .nec-week-row--7,.nec-week-row--5{display:grid;width:100%;min-width:0}
  .nec-week-row--7{grid-template-columns:repeat(7,1fr)}
  .nec-week-row--5{grid-template-columns:repeat(5,1fr)}
  .nec-week-row--7 > .nec-grid-head-cell,
  .nec-week-row--7 > .nec-day-cell,
  .nec-week-row--7 > .nec-week-head,
  .nec-week-row--5 > .nec-grid-head-cell,
  .nec-week-row--5 > .nec-day-cell,
  .nec-week-row--5 > .nec-week-head{
    flex:unset;width:auto;min-width:0;max-width:none;scroll-snap-align:unset
  }
}
.nec-week-head{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 4px;text-align:center;border-right:1px solid var(--nec-border);border-bottom:1px solid var(--nec-border);background:var(--nec-week-header-bg)}
.nec-week-row--7 > .nec-week-head:nth-child(7n),
.nec-week-row--5 > .nec-week-head:nth-child(5n){border-right:none}
.nec-week-head-dow{font-size:11px;font-weight:600;letter-spacing:0.025em;text-transform:uppercase;color:var(--nec-muted)}
.nec-week-head-day{font-size:0.875rem;font-weight:600;color:var(--nec-text-strong)}
.nec-day-view{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;overflow:auto;background:var(--nec-surface)}
.nec-allday{padding:8px 12px;border-bottom:1px solid var(--nec-border);background:var(--nec-week-header-bg);min-height:40px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;box-sizing:border-box}
.nec-timeline-wrap{display:flex;flex:1;min-height:var(--nec-day-timeline-height,1248px);min-width:0;width:100%}
.nec-time-gutter{width:52px;flex-shrink:0;border-right:1px solid var(--nec-border);background:var(--nec-surface)}
.nec-hour-label{height:${HOUR_ROW_PX}px;font-size:10px;line-height:1;color:var(--nec-muted);display:flex;align-items:flex-start;justify-content:flex-end;padding-right:6px;padding-top:2px;box-sizing:border-box;border-bottom:1px solid var(--nec-border)}
.nec-timeline-canvas{flex:1;position:relative;min-height:var(--nec-day-timeline-height,1248px);min-width:0;background:var(--nec-surface)}
.nec-hour-slot{height:${HOUR_ROW_PX}px;border-bottom:1px solid var(--nec-border);box-sizing:border-box}
.nec-timeline-event{display:block;width:100%;height:100%;min-height:32px;text-align:left;font-size:11px;line-height:1.25;font-weight:600;padding:4px 6px;border-radius:4px;cursor:pointer;font-family:inherit;overflow:hidden;box-sizing:border-box}
`;

const BASE_STYLES = `
.nec-root{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.4;color:var(--nec-text);background:var(--nec-surface);border:1px solid var(--nec-border);border-radius:var(--nec-root-radius);box-sizing:border-box;box-shadow:var(--nec-card-shadow);display:flex;flex-direction:column;min-height:inherit;height:100%;overflow:hidden;container-type:inline-size;container-name:nec-cal}
.nec-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 16px;border-bottom:1px solid var(--nec-border)}
@media (min-width:640px){.nec-toolbar{padding:10px 20px}}
.nec-title{flex:1;min-width:0;max-width:100%;font-size:1.25rem;font-weight:600;letter-spacing:-0.025em;color:var(--nec-text-strong)}
.nec-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.nec-btn-today{cursor:pointer;font:inherit;font-size:0.875rem;font-weight:400;padding:6px 12px;border-radius:2px;border:1px solid var(--nec-control-border);background:var(--nec-button-bg);color:var(--nec-text)}
.nec-btn-today:hover{background:#f3f2f1}
.nec-btn-today:active{background:#edebe9}
.nec-btn-round{cursor:pointer;font:inherit;display:inline-flex;align-items:center;justify-content:center;min-width:36px;min-height:36px;padding:8px;border:none;border-radius:9999px;background:transparent;color:var(--nec-text);font-size:1.25rem;line-height:1}
.nec-btn-round:hover{background:#f3f2f1}
.nec-btn-round:active{background:#edebe9}
.nec-grid-scroll{flex:1;min-height:0;min-width:0;overflow-x:hidden;overflow-y:auto;display:flex;flex-direction:column}
.nec-grid-head-cell{text-align:center;border-right:1px solid var(--nec-border);border-bottom:1px solid var(--nec-border);padding:8px 4px;font-size:11px;font-weight:600;letter-spacing:0.025em;text-transform:uppercase;color:var(--nec-muted);background:var(--nec-week-header-bg)}
.nec-day-cell{display:flex;flex-direction:column;border-right:1px solid var(--nec-border);border-bottom:1px solid var(--nec-border);padding:4px;min-height:var(--nec-month-cell-min-height);box-sizing:border-box}
.nec-week-row--7 > .nec-grid-head-cell:nth-child(7n),
.nec-week-row--7 > .nec-day-cell:nth-child(7n),
.nec-week-row--5 > .nec-grid-head-cell:nth-child(5n),
.nec-week-row--5 > .nec-day-cell:nth-child(5n){border-right:none}
.nec-day-cell--muted{background:var(--nec-empty-cell-bg);cursor:default}
.nec-day-cell--weekend:not(.nec-day-cell--muted){background:var(--nec-weekend-bg)}
.nec-day-cell--today:not(.nec-day-cell--muted){background:var(--nec-today-cell-bg);box-shadow:inset 0 0 0 1px var(--nec-today-inset-ring)}
.nec-day-cell--interactive{cursor:pointer}
.nec-daynum-row{display:flex;justify-content:flex-end;padding:0 2px;margin-bottom:4px}
.nec-daynum{font-size:12px;font-weight:400;color:var(--nec-text);padding:0 4px}
.nec-daynum--today{display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border-radius:9999px;font-size:12px;font-weight:600;color:var(--nec-blue);background:var(--nec-today-badge-bg);box-shadow:0 0 0 1px var(--nec-today-badge-ring)}
.nec-event-list{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0;list-style:none;margin:0;padding:0}
.nec-event-list>li{min-width:0}
.nec-event-chip{display:block;width:100%;text-align:left;font-size:11px;line-height:1.375;font-weight:400;padding:2px 6px;margin:0;margin-top:2px;border:none;border-radius:2px;border-left:3px solid var(--nec-event-bar-border);background:var(--nec-event-bar-bg);color:var(--nec-text-strong);cursor:pointer;font-family:inherit;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nec-event-chip:hover{background:var(--nec-event-bar-hover-bg)}
.nec-event-chip:focus-visible{outline:2px solid var(--nec-blue);outline-offset:1px}
.nec-more{font-size:10px;font-weight:400;color:var(--nec-more-link);padding-left:2px;margin-top:2px;cursor:pointer}
${EXTRA_STYLES}
`;

export interface NativeCalendarOptions {
  events: NotionCalendarEvent[];
  palette?: Partial<NotionCalendarPalette>;
}

function navAriaPrev(mode: CalendarViewMode): string {
  if (mode === 'month') return 'Previous month';
  if (mode === 'day') return 'Previous day';
  if (mode === 'week') return 'Previous week';
  return 'Previous work week';
}

function navAriaNext(mode: CalendarViewMode): string {
  if (mode === 'month') return 'Next month';
  if (mode === 'day') return 'Next day';
  if (mode === 'week') return 'Next week';
  return 'Next work week';
}

export function renderNativeCalendar(
  mount: HTMLElement,
  options: NativeCalendarOptions
): { destroy: () => void } {
  const palette = mergeNotionCalendarPalette(options.palette);

  mount.classList.add('nec-root');
  applyPaletteToElement(mount, palette);
  mount.style.setProperty('--nec-day-timeline-height', `${DAY_TIMELINE_HEIGHT_PX}px`);

  const styleEl = document.createElement('style');
  styleEl.textContent = BASE_STYLES;
  mount.appendChild(styleEl);

  const toolbar = document.createElement('div');
  const gridScroll = document.createElement('div');
  gridScroll.className = 'nec-grid-scroll';
  mount.append(toolbar, gridScroll);

  const mql: MediaQueryList =
    typeof window.matchMedia === 'function'
      ? window.matchMedia(`(max-width: ${CALENDAR_MOBILE_MAX_PX}px)`)
      : ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as unknown as MediaQueryList);
  let isMobile = mql.matches;

  let focusDate = startOfDay(new Date());
  let viewMode: CalendarViewMode = isMobile ? 'day' : 'month';

  const chipUnmounts: Array<() => void> = [];
  let closeDayAgenda: (() => void) | null = null;

  const byDay = (): Map<string, NotionCalendarEvent[]> => buildEventsByDay(options.events);

  function clearPeeks(): void {
    chipUnmounts.forEach((u) => u());
    chipUnmounts.length = 0;
    closeDayAgenda?.();
    closeDayAgenda = null;
  }

  function openDayAgenda(list: NotionCalendarEvent[], anchorEl: HTMLElement): void {
    closeDayAgenda?.();
    const rect = anchorEl.getBoundingClientRect();
    closeDayAgenda = mountDayAgendaPeek(document, list, rect);
  }

  function navigatePrev(): void {
    if (viewMode === 'month') {
      focusDate = startOfDay(new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, 1));
    } else if (viewMode === 'day') {
      focusDate = addDays(focusDate, -1);
    } else {
      focusDate = addDays(focusDate, -7);
    }
  }

  function navigateNext(): void {
    if (viewMode === 'month') {
      focusDate = startOfDay(new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 1));
    } else if (viewMode === 'day') {
      focusDate = addDays(focusDate, 1);
    } else {
      focusDate = addDays(focusDate, 7);
    }
  }

  function goToday(): void {
    focusDate = startOfDay(new Date());
  }

  function fillDayCell(
    cell: HTMLDivElement,
    cellDate: Date,
    map: Map<string, NotionCalendarEvent[]>,
    todayKey: string,
    maxShow: number,
    monthBound: { y: number; m: number } | null,
    minHeight: string
  ): void {
    const inMonth =
      monthBound === null ||
      (cellDate.getFullYear() === monthBound.y && cellDate.getMonth() === monthBound.m);
    const dateKey = toLocalDateKey(cellDate);
    const dow = cellDate.getDay();

    cell.className = 'nec-day-cell';
    cell.style.minHeight = minHeight;

    if (monthBound !== null && !inMonth) {
      cell.classList.add('nec-day-cell--muted');
      return;
    }

    if (dateKey === todayKey) cell.classList.add('nec-day-cell--today');
    else if (dow === 0 || dow === 6) cell.classList.add('nec-day-cell--weekend');

    const numRow = document.createElement('div');
    numRow.className = 'nec-daynum-row';
    const num = document.createElement('span');
    num.className = dateKey === todayKey ? 'nec-daynum--today' : 'nec-daynum';
    num.textContent = String(cellDate.getDate());
    numRow.appendChild(num);
    cell.appendChild(numRow);

    const list = map.get(dateKey) ?? [];
    if (list.length > 0) cell.classList.add('nec-day-cell--interactive');

    const ul = document.createElement('ul');
    ul.className = 'nec-event-list';

    for (let j = 0; j < Math.min(maxShow, list.length); j++) {
      const ev = list[j]!;
      const li = document.createElement('li');
      const wrap = document.createElement('div');
      chipUnmounts.push(mountCalendarChipPeek(wrap, ev));
      li.appendChild(wrap);
      ul.appendChild(li);
    }

    if (list.length > maxShow) {
      const li = document.createElement('li');
      const more = document.createElement('div');
      more.className = 'nec-more';
      more.textContent = `+${list.length - maxShow} more`;
      more.addEventListener('click', (e) => {
        e.stopPropagation();
        openDayAgenda(list, cell);
      });
      li.appendChild(more);
      ul.appendChild(li);
    }

    cell.appendChild(ul);

    if (list.length > 0) {
      cell.addEventListener('click', () => {
        openDayAgenda(list, cell);
      });
    }
  }

  function renderDayTimeline(): void {
    const wrap = document.createElement('div');
    wrap.className = 'nec-day-view';

    const allDay = allDayEventsOnDay(options.events, focusDate);
    const strip = document.createElement('div');
    strip.className = 'nec-allday';
    if (allDay.length === 0) {
      strip.style.minHeight = '8px';
      strip.style.padding = '4px 12px';
    } else {
      for (const ev of allDay) {
        const w = document.createElement('div');
        w.style.display = 'inline-block';
        w.style.maxWidth = '100%';
        chipUnmounts.push(mountCalendarChipPeek(w, ev));
        strip.appendChild(w);
      }
    }
    wrap.appendChild(strip);

    const main = document.createElement('div');
    main.className = 'nec-timeline-wrap';

    const gutter = document.createElement('div');
    gutter.className = 'nec-time-gutter';
    for (let h = 0; h < 24; h++) {
      const lab = document.createElement('div');
      lab.className = 'nec-hour-label';
      const t = new Date(2000, 0, 1, h, 0, 0);
      lab.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(t);
      gutter.appendChild(lab);
    }

    const canvas = document.createElement('div');
    canvas.className = 'nec-timeline-canvas';
    for (let h = 0; h < 24; h++) {
      const slot = document.createElement('div');
      slot.className = 'nec-hour-slot';
      canvas.appendChild(slot);
    }

    const timed = timedEventsOnDay(options.events, focusDate);
    for (const ev of timed) {
      const seg = timedSegmentPercentOnDay(ev, focusDate);
      if (!seg) continue;
      const st = rangeStyleForEventId(ev.id);
      const block = document.createElement('div');
      block.style.position = 'absolute';
      block.style.left = '4px';
      block.style.right = '8px';
      block.style.top = `${seg.topPct}%`;
      block.style.height = `${seg.heightPct}%`;
      block.style.zIndex = '2';
      const inner = document.createElement('div');
      inner.style.height = '100%';
      block.appendChild(inner);
      chipUnmounts.push(
        mountCalendarChipPeek(inner, ev, {
          triggerClassName: 'nec-timeline-event',
          triggerStyle: {
            background: st.bg,
            borderLeft: `3px solid ${st.border}`,
            color: st.text,
          },
        })
      );
      canvas.appendChild(block);
    }

    main.append(gutter, canvas);
    wrap.appendChild(main);
    gridScroll.appendChild(wrap);
  }

  function renderMonthLikeGrid(
    rowClass: 'nec-week-row--7' | 'nec-week-row--5',
    buildHeader: (row: HTMLElement) => void,
    buildBody: (row: HTMLElement, rowIndex: number) => void,
    bodyRows: number
  ): void {
    const outer = document.createElement('div');
    outer.className = 'nec-cal-scroll';
    const inner = document.createElement('div');
    inner.className = 'nec-cal-scroll-inner';
    const headRow = document.createElement('div');
    headRow.className = rowClass;
    buildHeader(headRow);
    inner.appendChild(headRow);
    for (let r = 0; r < bodyRows; r++) {
      const wr = document.createElement('div');
      wr.className = rowClass;
      buildBody(wr, r);
      inner.appendChild(wr);
    }
    outer.appendChild(inner);
    gridScroll.appendChild(outer);
  }

  function render(): void {
    clearPeeks();
    toolbar.replaceChildren();
    gridScroll.replaceChildren();

    const titleEl = document.createElement('div');
    titleEl.className = 'nec-title';
    titleEl.textContent = formatCalendarPeriodTitle(viewMode, focusDate);

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'nec-btn-today';
    todayBtn.textContent = 'Today';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'nec-btn-round';
    prevBtn.setAttribute('aria-label', navAriaPrev(viewMode));
    prevBtn.textContent = '←';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'nec-btn-round';
    nextBtn.setAttribute('aria-label', navAriaNext(viewMode));
    nextBtn.textContent = '→';

    todayBtn.addEventListener('click', () => {
      goToday();
      render();
    });
    prevBtn.addEventListener('click', () => {
      navigatePrev();
      render();
    });
    nextBtn.addEventListener('click', () => {
      navigateNext();
      render();
    });

    const viewChoices = calendarViewOptionsForMobile(isMobile);

    if (isMobile) {
      toolbar.className = 'nec-toolbar nec-toolbar--mobile';
      const head = document.createElement('div');
      head.className = 'nec-toolbar-mobile-head';
      head.appendChild(titleEl);

      const sel = document.createElement('select');
      sel.className = 'nec-view-select';
      sel.setAttribute('aria-label', 'Calendar view');
      for (const opt of viewChoices) {
        const o = document.createElement('option');
        o.value = opt.mode;
        o.textContent = opt.label;
        if (opt.mode === viewMode) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener('change', () => {
        viewMode = sel.value as CalendarViewMode;
        render();
      });
      head.appendChild(sel);

      const row = document.createElement('div');
      row.className = 'nec-toolbar-row';
      row.append(todayBtn, prevBtn, nextBtn);
      toolbar.append(head, row);
    } else {
      toolbar.className = 'nec-toolbar';
      const top = document.createElement('div');
      top.className = 'nec-toolbar-desktop-top';
      top.appendChild(titleEl);

      const controls = document.createElement('div');
      controls.className = 'nec-toolbar-controls';

      const tabs = document.createElement('div');
      tabs.className = 'nec-view-tabs';
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Calendar view');
      for (const opt of viewChoices) {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'nec-view-tab' + (opt.mode === viewMode ? ' nec-view-tab--active' : '');
        tab.textContent = opt.label;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(opt.mode === viewMode));
        tab.addEventListener('click', () => {
          viewMode = opt.mode;
          render();
        });
        tabs.appendChild(tab);
      }
      controls.append(tabs, todayBtn, prevBtn, nextBtn);
      top.appendChild(controls);
      toolbar.appendChild(top);
    }

    const map = byDay();
    const todayKey = toLocalDateKey(new Date());

    if (viewMode === 'day') {
      renderDayTimeline();
      return;
    }

    if (viewMode === 'month') {
      const vy = focusDate.getFullYear();
      const vm = focusDate.getMonth();
      const cells = monthCells(vy, vm);
      const firstOfMonth = new Date(vy, vm, 1);
      const gridStart = new Date(firstOfMonth);
      gridStart.setDate(gridStart.getDate() - gridStart.getDay());

      renderMonthLikeGrid(
        'nec-week-row--7',
        (headRow) => {
          for (const wd of WEEKDAYS_SUN) {
            const h = document.createElement('div');
            h.className = 'nec-grid-head-cell';
            h.textContent = wd;
            headRow.appendChild(h);
          }
        },
        (weekRow, row) => {
          for (let c = 0; c < 7; c++) {
            const i = row * 7 + c;
            const day = cells[i]!;
            const cell = document.createElement('div');
            if (day === null) {
              cell.className = 'nec-day-cell nec-day-cell--muted';
              cell.style.minHeight = CAL_MIN_HEIGHT.month;
              weekRow.appendChild(cell);
              continue;
            }
            const cellDate = new Date(gridStart);
            cellDate.setDate(gridStart.getDate() + i);
            fillDayCell(cell, cellDate, map, todayKey, 3, { y: vy, m: vm }, CAL_MIN_HEIGHT.month);
            weekRow.appendChild(cell);
          }
        },
        cells.length / 7
      );
      return;
    }

    if (viewMode === 'week') {
      const start = startOfWeekSunday(focusDate);
      renderMonthLikeGrid(
        'nec-week-row--7',
        (headRow) => {
          for (let i = 0; i < 7; i++) {
            const d = addDays(start, i);
            const h = document.createElement('div');
            h.className = 'nec-week-head';
            const d1 = document.createElement('div');
            d1.className = 'nec-week-head-dow';
            d1.textContent = WEEKDAYS_SUN[i]!;
            const d2 = document.createElement('div');
            d2.className = 'nec-week-head-day';
            d2.textContent = String(d.getDate());
            h.append(d1, d2);
            headRow.appendChild(h);
          }
        },
        (weekRow) => {
          for (let i = 0; i < 7; i++) {
            const cellDate = addDays(start, i);
            const cell = document.createElement('div');
            fillDayCell(cell, cellDate, map, todayKey, 8, null, CAL_MIN_HEIGHT.week);
            weekRow.appendChild(cell);
          }
        },
        1
      );
      return;
    }

    /* workWeek */
    const wstart = startOfWeekMonday(focusDate);
    renderMonthLikeGrid(
      'nec-week-row--5',
      (headRow) => {
        for (let i = 0; i < 5; i++) {
          const d = addDays(wstart, i);
          const h = document.createElement('div');
          h.className = 'nec-week-head';
          const d1 = document.createElement('div');
          d1.className = 'nec-week-head-dow';
          d1.textContent = WORK_HEADERS[i]!;
          const d2 = document.createElement('div');
          d2.className = 'nec-week-head-day';
          d2.textContent = String(d.getDate());
          h.append(d1, d2);
          headRow.appendChild(h);
        }
      },
      (weekRow) => {
        for (let i = 0; i < 5; i++) {
          const cellDate = addDays(wstart, i);
          const cell = document.createElement('div');
          fillDayCell(cell, cellDate, map, todayKey, 10, null, CAL_MIN_HEIGHT.workWeek);
          weekRow.appendChild(cell);
        }
      },
      1
    );
  }

  const onMql = (): void => {
    const next = mql.matches;
    if (next === isMobile) return;
    isMobile = next;
    if (isMobile && viewMode === 'month') viewMode = 'day';
    render();
  };
  mql.addEventListener('change', onMql);

  render();

  return {
    destroy: (): void => {
      mql.removeEventListener('change', onMql);
      clearPeeks();
      mount.replaceChildren();
      mount.classList.remove('nec-root');
      mount.removeAttribute('style');
    },
  };
}
