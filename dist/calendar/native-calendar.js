import { applyPaletteToElement, mergeNotionCalendarPalette, } from './palette.js';
import { buildEventsByDay, formatEventTime, monthCells, toLocalDateKey, } from './calendar-utils.js';
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
.nec-chip{display:block;font-size:11px;padding:2px 6px;margin-top:2px;border-radius:4px;border-left:3px solid var(--nec-event-accent);background:var(--nec-event-bar-bg);color:var(--nec-text-strong);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nec-chip:hover{background:var(--nec-event-bar-hover-bg)}
.nec-more{font-size:11px;color:var(--nec-muted);margin-top:4px}
.nec-peek{position:fixed;inset:0;background:var(--nec-peek-backdrop);display:flex;align-items:center;justify-content:center;padding:16px;z-index:99999;box-sizing:border-box}
.nec-card{max-width:420px;width:100%;max-height:85vh;overflow:auto;background:var(--nec-surface);border:1px solid var(--nec-border);border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.12);padding:16px}
.nec-card h3{margin:0 0 8px;font-size:18px;color:var(--nec-text-strong)}
.nec-card p{margin:0 0 12px;color:var(--nec-text);white-space:pre-wrap}
.nec-card a{color:var(--nec-event-accent);word-break:break-all}
.nec-ev{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--nec-border)}
.nec-ev:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.nec-ev time{color:var(--nec-muted);font-size:12px;display:block;margin-bottom:4px}
.nec-close{margin-top:12px;width:100%}
`;
function chipAccentForEvent(ev, colors) {
    const n = Math.max(1, colors.length);
    let h = 0;
    for (let i = 0; i < ev.id.length; i++)
        h = (h * 31 + ev.id.charCodeAt(i)) >>> 0;
    return colors[h % n] ?? colors[0];
}
export function renderNativeCalendar(mount, options) {
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
    const byDay = () => buildEventsByDay(options.events);
    function openPeek(dayEvents, label) {
        const backdrop = document.createElement('div');
        backdrop.className = 'nec-peek';
        applyPaletteToElement(backdrop, palette);
        const card = document.createElement('div');
        card.className = 'nec-card';
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-label', label);
        const h = document.createElement('h3');
        h.textContent = label;
        card.appendChild(h);
        for (const ev of dayEvents) {
            const block = document.createElement('div');
            block.className = 'nec-ev';
            const timeEl = document.createElement('time');
            const endPart = ev.end && ev.end !== ev.start
                ? ` – ${formatEventTime(ev.end)}`
                : '';
            timeEl.textContent = `${formatEventTime(ev.start)}${endPart}`;
            const t = document.createElement('div');
            t.style.fontWeight = '600';
            t.style.color = 'var(--nec-text-strong)';
            t.textContent = ev.title;
            block.append(timeEl, t);
            if (ev.description) {
                const p = document.createElement('p');
                p.textContent = ev.description;
                block.appendChild(p);
            }
            if (ev.linkUrl) {
                const a = document.createElement('a');
                a.href = ev.linkUrl;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = ev.linkUrl;
                block.appendChild(a);
            }
            card.appendChild(block);
        }
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'nec-btn nec-close';
        closeBtn.textContent = 'Close';
        card.appendChild(closeBtn);
        const close = () => {
            backdrop.remove();
            document.removeEventListener('keydown', onKey);
        };
        const onKey = (e) => {
            if (e.key === 'Escape')
                close();
        };
        document.addEventListener('keydown', onKey);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop)
                close();
        });
        closeBtn.addEventListener('click', close);
        backdrop.appendChild(card);
        document.body.appendChild(backdrop);
    }
    function renderGrid() {
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
        let weekRow = null;
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
            for (let j = 0; j < Math.min(maxShow, list.length); j++) {
                const ev = list[j];
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'nec-chip';
                chip.style.borderLeftColor = chipAccentForEvent(ev, chipColors);
                chip.style.background = palette.eventBarBg;
                chip.style.color = palette.textStrong;
                chip.textContent = ev.title;
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openPeek([ev], ev.title);
                });
                cell.appendChild(chip);
            }
            if (list.length > maxShow) {
                const more = document.createElement('div');
                more.className = 'nec-more';
                more.textContent = `+${list.length - maxShow} more`;
                cell.appendChild(more);
            }
            if (list.length > 0) {
                cell.addEventListener('click', () => {
                    openPeek(list, new Intl.DateTimeFormat(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    }).format(cellDate));
                });
            }
            weekRow.appendChild(cell);
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
            mount.replaceChildren();
            mount.classList.remove('nec-root');
            mount.removeAttribute('style');
        },
    };
}
//# sourceMappingURL=native-calendar.js.map