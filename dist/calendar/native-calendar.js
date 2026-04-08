import { applyPaletteToElement, mergeNotionCalendarPalette, } from './palette.js';
import { buildEventsByDay, monthCells, toLocalDateKey, } from './calendar-utils.js';
import { WEEKDAYS_SUN } from './notion-calendar-constants.js';
import { mountCalendarChipPeek, mountDayAgendaPeek, } from '../react/mount-calendar-peeks.js';
const BASE_STYLES = `
.nec-root{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.4;color:var(--nec-text);background:var(--nec-surface);border:1px solid var(--nec-border);border-radius:var(--nec-root-radius);box-sizing:border-box;box-shadow:var(--nec-card-shadow);display:flex;flex-direction:column;min-height:inherit;height:100%;overflow:hidden}
.nec-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 16px;border-bottom:1px solid var(--nec-border)}
@media (min-width:640px){.nec-toolbar{padding:10px 20px}}
.nec-title{flex:1;min-width:0;font-size:1.25rem;font-weight:600;letter-spacing:-0.025em;color:var(--nec-text-strong)}
.nec-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.nec-btn-today{cursor:pointer;font:inherit;font-size:0.875rem;font-weight:400;padding:6px 12px;border-radius:2px;border:1px solid var(--nec-control-border);background:var(--nec-button-bg);color:var(--nec-text)}
.nec-btn-today:hover{background:#f3f2f1}
.nec-btn-today:active{background:#edebe9}
.nec-btn-round{cursor:pointer;font:inherit;display:inline-flex;align-items:center;justify-content:center;min-width:36px;min-height:36px;padding:8px;border:none;border-radius:9999px;background:transparent;color:var(--nec-text);font-size:1.25rem;line-height:1}
.nec-btn-round:hover{background:#f3f2f1}
.nec-btn-round:active{background:#edebe9}
.nec-grid-scroll{flex:1;overflow:auto}
.nec-grid-7{display:grid;grid-template-columns:repeat(7,1fr);width:100%}
.nec-grid-head-cell{text-align:center;border-right:1px solid var(--nec-border);border-bottom:1px solid var(--nec-border);padding:8px 4px;font-size:11px;font-weight:600;letter-spacing:0.025em;text-transform:uppercase;color:var(--nec-muted);background:var(--nec-week-header-bg)}
.nec-grid-head-cell:nth-child(7n){border-right:none}
.nec-day-cell{display:flex;flex-direction:column;border-right:1px solid var(--nec-border);border-bottom:1px solid var(--nec-border);padding:4px;min-height:var(--nec-month-cell-min-height);box-sizing:border-box}
.nec-day-cell:nth-child(7n){border-right:none}
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
`;
export function renderNativeCalendar(mount, options) {
    const palette = mergeNotionCalendarPalette(options.palette);
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
    prevBtn.className = 'nec-btn-round';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.textContent = '←';
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'nec-btn-round';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.textContent = '→';
    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'nec-btn-today';
    todayBtn.textContent = 'Today';
    nav.append(todayBtn, prevBtn, nextBtn);
    toolbar.append(titleEl, nav);
    mount.appendChild(toolbar);
    const gridScroll = document.createElement('div');
    gridScroll.className = 'nec-grid-scroll';
    mount.appendChild(gridScroll);
    let viewYear = new Date().getFullYear();
    let viewMonth = new Date().getMonth();
    const chipUnmounts = [];
    let closeDayAgenda = null;
    const byDay = () => buildEventsByDay(options.events);
    function openDayAgenda(list, anchorEl) {
        closeDayAgenda?.();
        const rect = anchorEl.getBoundingClientRect();
        closeDayAgenda = mountDayAgendaPeek(document, list, rect);
    }
    function renderGrid() {
        chipUnmounts.forEach((u) => u());
        chipUnmounts.length = 0;
        closeDayAgenda?.();
        closeDayAgenda = null;
        gridScroll.replaceChildren();
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
        headerRow.className = 'nec-grid-7';
        for (const wd of WEEKDAYS_SUN) {
            const h = document.createElement('div');
            h.className = 'nec-grid-head-cell';
            h.textContent = wd;
            headerRow.appendChild(h);
        }
        gridScroll.appendChild(headerRow);
        for (let row = 0; row < cells.length / 7; row++) {
            const weekRow = document.createElement('div');
            weekRow.className = 'nec-grid-7';
            for (let c = 0; c < 7; c++) {
                const i = row * 7 + c;
                const day = cells[i];
                const cell = document.createElement('div');
                if (day === null) {
                    cell.className = 'nec-day-cell nec-day-cell--muted';
                    weekRow.appendChild(cell);
                    continue;
                }
                const cellDate = new Date(gridStart);
                cellDate.setDate(gridStart.getDate() + i);
                const inMonth = cellDate.getMonth() === viewMonth;
                const dateKey = toLocalDateKey(cellDate);
                const dow = cellDate.getDay();
                cell.className = 'nec-day-cell';
                if (!inMonth) {
                    cell.classList.add('nec-day-cell--muted');
                }
                else if (dateKey === todayKey) {
                    cell.classList.add('nec-day-cell--today');
                }
                else if (dow === 0 || dow === 6) {
                    cell.classList.add('nec-day-cell--weekend');
                }
                const numRow = document.createElement('div');
                numRow.className = 'nec-daynum-row';
                const num = document.createElement('span');
                if (inMonth && dateKey === todayKey) {
                    num.className = 'nec-daynum--today';
                }
                else {
                    num.className = 'nec-daynum';
                }
                num.textContent = String(cellDate.getDate());
                numRow.appendChild(num);
                cell.appendChild(numRow);
                const list = inMonth ? (map.get(dateKey) ?? []) : [];
                const maxShow = 3;
                if (list.length > 0) {
                    cell.classList.add('nec-day-cell--interactive');
                }
                const ul = document.createElement('ul');
                ul.className = 'nec-event-list';
                for (let j = 0; j < Math.min(maxShow, list.length); j++) {
                    const ev = list[j];
                    const li = document.createElement('li');
                    const wrap = document.createElement('div');
                    const unmount = mountCalendarChipPeek(wrap, ev);
                    chipUnmounts.push(unmount);
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
                weekRow.appendChild(cell);
            }
            gridScroll.appendChild(weekRow);
        }
    }
    prevBtn.addEventListener('click', () => {
        if (viewMonth === 0) {
            viewMonth = 11;
            viewYear -= 1;
        }
        else {
            viewMonth -= 1;
        }
        renderGrid();
    });
    nextBtn.addEventListener('click', () => {
        if (viewMonth === 11) {
            viewMonth = 0;
            viewYear += 1;
        }
        else {
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
        destroy: () => {
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
//# sourceMappingURL=native-calendar.js.map