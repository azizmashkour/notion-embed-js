import * as React from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import { popoverContentBase } from './styles.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';
import { OutlookPeekContent } from './outlook-peek-content.js';

export function CalendarChipPopover({ event }: { event: NotionCalendarEvent }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="nec-event-chip"
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
          overflowY: 'auto',
          padding: 0,
          width: 'min(calc(100vw - 1.5rem), 380px)',
        }}
      >
        <OutlookPeekContent event={event} />
      </PopoverContent>
    </Popover>
  );
}
