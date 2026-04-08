/**
 * Event row from a Notion database, normalized for calendar display.
 */
export type NotionCalendarEvent = {
    id: string;
    title: string;
    /** ISO 8601 date or datetime from Notion */
    start: string;
    end: string | null;
    /**
     * External URL from a URL column (or configured link property). Not the Notion page URL.
     */
    linkUrl?: string;
    /** Plain text from description / notes when present */
    description?: string;
};
//# sourceMappingURL=event.d.ts.map