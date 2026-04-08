import * as React from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import { popoverContentBase } from './styles.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';
import { OutlookPeekContent } from './outlook-peek-content.js';

export function CalendarChipPopover({
  event,
  chipStyle,
}: {
  event: NotionCalendarEvent;
  chipStyle: React.CSSProperties;
}) {
  const buttonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    fontSize: 11,
    lineHeight: 1.35,
    padding: '2px 6px',
    marginTop: 2,
    borderRadius: 4,
    border: 'none',
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...chipStyle,
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" style={buttonStyle} onClick={(e) => e.stopPropagation()}>
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
