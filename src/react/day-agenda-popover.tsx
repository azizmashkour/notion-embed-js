import * as React from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import { popoverContentBase } from './styles.js';
import { Popover, PopoverAnchor, PopoverContent } from './popover.js';
import { OutlookPeekContent } from './outlook-peek-content.js';

export function DayAgendaPopover({
  events,
  anchorRect,
  onExit,
}: {
  events: NotionCalendarEvent[];
  anchorRect: DOMRect;
  onExit: () => void;
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onExit();
      }}
    >
      <PopoverAnchor asChild>
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: anchorRect.left,
            top: anchorRect.top,
            width: Math.max(anchorRect.width, 1),
            height: Math.max(anchorRect.height, 1),
            pointerEvents: 'none',
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={{ top: 16, right: 16, bottom: 16, left: 16 }}
        aria-label={events.length === 1 ? events[0]!.title : `${events.length} calendar events`}
        style={{
          ...popoverContentBase,
          maxHeight: 'min(85vh, 640px)',
          overflowX: 'hidden',
          overflowY: 'auto',
          padding: 0,
          width: 'min(calc(100vw - 1.5rem), 380px)',
          borderRadius: 4,
        }}
      >
        <div>
          {events.map((ev, i) => (
            <div
              key={ev.id}
              style={{
                borderBottom: i < events.length - 1 ? '1px solid #edebe9' : undefined,
              }}
            >
              <OutlookPeekContent event={ev} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
