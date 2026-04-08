/**
 * Outlook-style event detail body for the anchored popover.
 */
import * as React from 'react';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';
import { formatOutlookWhen, outlookPeekNotesBody } from '../calendar/calendar-utils.js';
import { calendarVisualTokens } from '../calendar/notion-calendar-constants.js';
import { IconClock, IconExternalLink, IconFileText, IconMapPin } from './icons.js';
import { srOnly } from './styles.js';

const PEEK_BRAND = calendarVisualTokens.blue;
const iconMuted = '#605e5c';
const textPrimary = '#323130';
const textStrong = '#242424';
const borderHairline = '#edebe9';

export function OutlookPeekContent({ event }: { event: NotionCalendarEvent }) {
  const notesBody = outlookPeekNotesBody(event.description);
  const link = event.linkUrl;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 6, flexShrink: 0, background: PEEK_BRAND }} aria-hidden />

      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <h4
            style={{
              minWidth: 0,
              flex: 1,
              margin: 0,
              fontSize: 16,
              lineHeight: 1.35,
              fontWeight: 600,
              color: textStrong,
            }}
          >
            {event.title}
          </h4>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: -2,
                marginRight: -4,
                flexShrink: 0,
                borderRadius: 4,
                padding: 6,
                color: iconMuted,
                textDecoration: 'none',
              }}
              aria-label="Read more"
              title="Read more"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f2f1';
                e.currentTarget.style.color = textStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = iconMuted;
              }}
            >
              <IconExternalLink aria-hidden strokeWidth={1.75} />
            </a>
          ) : null}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
            <div
              style={{
                display: 'flex',
                width: 32,
                flexShrink: 0,
                justifyContent: 'center',
                paddingTop: 2,
                color: iconMuted,
              }}
            >
              <IconClock aria-hidden />
            </div>
            <div style={{ minWidth: 0, fontSize: 14, lineHeight: 1.35, color: textPrimary }}>
              <span style={srOnly}>Time </span>
              {formatOutlookWhen(event)}
            </div>
          </div>

          <div style={{ margin: '4px 0', height: 1, background: borderHairline }} aria-hidden />

          <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
            <div
              style={{
                display: 'flex',
                width: 32,
                flexShrink: 0,
                justifyContent: 'center',
                paddingTop: 2,
                color: iconMuted,
              }}
            >
              <IconMapPin aria-hidden />
            </div>
            <div style={{ fontSize: 14, color: iconMuted }}>
              <span style={srOnly}>Location </span>
              No location added
            </div>
          </div>

          <div style={{ margin: '4px 0', height: 1, background: borderHairline }} aria-hidden />

          <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
            <div
              style={{
                display: 'flex',
                width: 32,
                flexShrink: 0,
                justifyContent: 'center',
                paddingTop: 2,
                color: iconMuted,
              }}
            >
              <IconFileText aria-hidden />
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.35,
                whiteSpace: 'pre-wrap',
                color: textPrimary,
              }}
            >
              <span style={srOnly}>Notes </span>
              {notesBody}
            </div>
          </div>
        </div>

        {link ? (
          <div style={{ marginTop: 16, borderTop: `1px solid ${borderHairline}`, paddingTop: 12 }}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 600,
                color: PEEK_BRAND,
                textDecoration: 'none',
              }}
            >
              Read more
              <IconExternalLink aria-hidden size={14} strokeWidth={1.75} />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
