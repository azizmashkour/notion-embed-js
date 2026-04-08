import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatOutlookWhen, outlookPeekNotesBody } from '../calendar/calendar-utils.js';
import { calendarVisualTokens } from '../calendar/notion-calendar-constants.js';
import { IconClock, IconExternalLink, IconFileText, IconMapPin } from './icons.js';
import { srOnly } from './styles.js';
const PEEK_BRAND = calendarVisualTokens.blue;
const iconMuted = '#605e5c';
const textPrimary = '#323130';
const textStrong = '#242424';
const borderHairline = '#edebe9';
export function OutlookPeekContent({ event }) {
    const notesBody = outlookPeekNotesBody(event.description);
    const link = event.linkUrl;
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            overflow: 'hidden',
        }, children: [_jsx("div", { style: { height: 6, flexShrink: 0, background: PEEK_BRAND }, "aria-hidden": true }), _jsxs("div", { style: { padding: '12px 16px 16px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 8 }, children: [_jsx("h4", { style: {
                                    minWidth: 0,
                                    flex: 1,
                                    margin: 0,
                                    fontSize: 16,
                                    lineHeight: 1.35,
                                    fontWeight: 600,
                                    color: textStrong,
                                }, children: event.title }), link ? (_jsx("a", { href: link, target: "_blank", rel: "noopener noreferrer", style: {
                                    marginTop: -2,
                                    marginRight: -4,
                                    flexShrink: 0,
                                    borderRadius: 4,
                                    padding: 6,
                                    color: iconMuted,
                                    textDecoration: 'none',
                                }, "aria-label": "Read more", title: "Read more", onClick: (e) => e.stopPropagation(), onMouseEnter: (e) => {
                                    e.currentTarget.style.background = '#f3f2f1';
                                    e.currentTarget.style.color = textStrong;
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = iconMuted;
                                }, children: _jsx(IconExternalLink, { "aria-hidden": true, strokeWidth: 1.75 }) })) : null] }), _jsxs("div", { style: { marginTop: 16 }, children: [_jsxs("div", { style: { display: 'flex', gap: 12, padding: '8px 0' }, children: [_jsx("div", { style: {
                                            display: 'flex',
                                            width: 32,
                                            flexShrink: 0,
                                            justifyContent: 'center',
                                            paddingTop: 2,
                                            color: iconMuted,
                                        }, children: _jsx(IconClock, { "aria-hidden": true }) }), _jsxs("div", { style: { minWidth: 0, fontSize: 14, lineHeight: 1.35, color: textPrimary }, children: [_jsx("span", { style: srOnly, children: "Time " }), formatOutlookWhen(event)] })] }), _jsx("div", { style: { margin: '4px 0', height: 1, background: borderHairline }, "aria-hidden": true }), _jsxs("div", { style: { display: 'flex', gap: 12, padding: '8px 0' }, children: [_jsx("div", { style: {
                                            display: 'flex',
                                            width: 32,
                                            flexShrink: 0,
                                            justifyContent: 'center',
                                            paddingTop: 2,
                                            color: iconMuted,
                                        }, children: _jsx(IconMapPin, { "aria-hidden": true }) }), _jsxs("div", { style: { fontSize: 14, color: iconMuted }, children: [_jsx("span", { style: srOnly, children: "Location " }), "No location added"] })] }), _jsx("div", { style: { margin: '4px 0', height: 1, background: borderHairline }, "aria-hidden": true }), _jsxs("div", { style: { display: 'flex', gap: 12, padding: '8px 0' }, children: [_jsx("div", { style: {
                                            display: 'flex',
                                            width: 32,
                                            flexShrink: 0,
                                            justifyContent: 'center',
                                            paddingTop: 2,
                                            color: iconMuted,
                                        }, children: _jsx(IconFileText, { "aria-hidden": true }) }), _jsxs("div", { style: {
                                            fontSize: 14,
                                            lineHeight: 1.35,
                                            whiteSpace: 'pre-wrap',
                                            color: textPrimary,
                                        }, children: [_jsx("span", { style: srOnly, children: "Notes " }), notesBody] })] })] }), link ? (_jsx("div", { style: { marginTop: 16, borderTop: `1px solid ${borderHairline}`, paddingTop: 12 }, children: _jsxs("a", { href: link, target: "_blank", rel: "noopener noreferrer", style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                color: PEEK_BRAND,
                                textDecoration: 'none',
                            }, children: ["Read more", _jsx(IconExternalLink, { "aria-hidden": true, size: 14, strokeWidth: 1.75 })] }) })) : null] })] }));
}
//# sourceMappingURL=outlook-peek-content.js.map