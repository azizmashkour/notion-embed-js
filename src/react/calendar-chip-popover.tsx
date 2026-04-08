import * as React from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import { popoverContentBase } from './styles.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';
import { OutlookPeekContent } from './outlook-peek-content.js';

export function CalendarChipPopover({
  event,
  triggerClassName = 'nec-event-chip',
  triggerStyle,
}: {
  event: NotionCalendarEvent;
  /** Default: month/week grid chip. Use `nec-timeline-event` + inline styles for day timeline. */
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          style={triggerStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {event.title}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={8}
        collisionPadding={{ top: 16, right: 16, bottom: 16, left: 16 }}
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
        <OutlookPeekContent event={event} />
      </PopoverContent>
    </Popover>
  );
}
