/**
 * Server-only: fetch calendar events from a Notion database via the official API.
 * Set NOTION_API_KEY and NOTION_CALENDAR_DATABASE_ID (or pass {@link NotionCalendarServerConfig}).
 */

import {
  APIErrorCode,
  APIResponseError,
  Client,
  extractDatabaseId,
  extractNotionId,
  isFullDataSource,
  isFullDatabase,
} from '@notionhq/client';
import type { DataSourceObjectResponse, PageObjectResponse } from '@notionhq/client';
import type { NotionCalendarEvent } from '../notion-calendar/event.js';

const DEFAULT_MONTHS_BACK = 6;
const DEFAULT_MONTHS_FORWARD = 18;

export type { NotionCalendarEvent } from '../notion-calendar/event.js';

export interface NotionCalendarServerConfig {
  apiKey: string;
  /** Database ID or database page URL (32 hex, optional hyphens) */
  databaseId: string;
  dataSourceId?: string;
  dateProperty?: string;
  descriptionProperty?: string;
  linkProperty?: string;
  /**
   * If the date-filtered query returns no rows, fetch recent pages and filter locally
   * (or set NOTION_CALENDAR_RELAXED_QUERY=1 via env).
   */
  relaxedQuery?: boolean;
  monthsBack?: number;
  monthsForward?: number;
}

function trimEnvValue(raw: string | undefined): string {
  if (!raw) return '';
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function rangeIsoBounds(monthsBack: number, monthsForward: number): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthsForward + 1, 0);
  const toDateOnly = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: toDateOnly(start), end: toDateOnly(end) };
}

function richTextToPlain(richText: Array<{ plain_text?: string }> | undefined | null): string {
  if (!richText?.length) return '';
  return richText
    .map((r) => r.plain_text ?? '')
    .join('')
    .trim();
}

function extractPageDescription(
  properties: PageObjectResponse['properties'],
  preferredPropertyName?: string | null
): string | undefined {
  const tryRichText = (prop: unknown): string | undefined => {
    if (!prop || typeof prop !== 'object' || !('type' in prop)) return undefined;
    const p = prop as { type: string; rich_text?: Array<{ plain_text?: string }> };
    if (p.type !== 'rich_text' || !p.rich_text) return undefined;
    const t = richTextToPlain(p.rich_text);
    return t.length > 0 ? t : undefined;
  };

  const tryFormulaString = (prop: unknown): string | undefined => {
    if (!prop || typeof prop !== 'object' || !('type' in prop)) return undefined;
    const p = prop as { type: string; formula?: { type: string; string?: string | null } };
    if (p.type !== 'formula' || p.formula?.type !== 'string') return undefined;
    const t = p.formula.string?.trim();
    return t && t.length > 0 ? t : undefined;
  };

  if (preferredPropertyName) {
    const raw = properties[preferredPropertyName];
    const fromRich = tryRichText(raw);
    if (fromRich) return fromRich;
    const fromFormula = tryFormulaString(raw);
    if (fromFormula) return fromFormula;
  }

  const aliasNames = [
    'Text',
    'text',
    'Description',
    'description',
    'Content',
    'content',
    'Notes',
    'notes',
    'Details',
    'details',
    'Agenda',
    'agenda',
    'Summary',
    'summary',
    'Body',
    'body',
  ];
  const keys = new Set(Object.keys(properties));
  for (const name of aliasNames) {
    if (!keys.has(name)) continue;
    const raw = properties[name];
    const fromRich = tryRichText(raw);
    if (fromRich) return fromRich;
    const fromFormula = tryFormulaString(raw);
    if (fromFormula) return fromFormula;
  }

  for (const val of Object.values(properties)) {
    const fromRich = tryRichText(val);
    if (fromRich) return fromRich;
    const fromFormula = tryFormulaString(val);
    if (fromFormula) return fromFormula;
  }

  return undefined;
}

const LINK_PROPERTY_ALIASES = [
  'Link',
  'link',
  'URL',
  'Url',
  'url',
  'Registration',
  'registration',
  'Meeting link',
  'Meeting Link',
  'Join',
  'join',
  'Join link',
  'Join Link',
  'Event link',
  'Event Link',
];

function isProbablyHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function extractPageLinkUrl(
  properties: PageObjectResponse['properties'],
  preferredPropertyName?: string | null
): string | undefined {
  const tryUrlColumn = (prop: unknown): string | undefined => {
    if (!prop || typeof prop !== 'object' || !('type' in prop)) return undefined;
    const p = prop as { type: string; url?: string | null };
    if (p.type !== 'url') return undefined;
    const t = typeof p.url === 'string' ? p.url.trim() : '';
    return t.length > 0 ? t : undefined;
  };

  const tryFormulaStringUrl = (prop: unknown): string | undefined => {
    if (!prop || typeof prop !== 'object' || !('type' in prop)) return undefined;
    const p = prop as { type: string; formula?: { type: string; string?: string | null } };
    if (p.type !== 'formula' || p.formula?.type !== 'string') return undefined;
    const t = p.formula.string?.trim();
    if (!t || !isProbablyHttpUrl(t)) return undefined;
    return t;
  };

  if (preferredPropertyName) {
    const raw = properties[preferredPropertyName];
    const fromUrl = tryUrlColumn(raw);
    if (fromUrl) return fromUrl;
    const fromFormula = tryFormulaStringUrl(raw);
    if (fromFormula) return fromFormula;
  }

  const keys = new Set(Object.keys(properties));
  for (const name of LINK_PROPERTY_ALIASES) {
    if (!keys.has(name)) continue;
    const raw = properties[name];
    const fromUrl = tryUrlColumn(raw);
    if (fromUrl) return fromUrl;
    const fromFormula = tryFormulaStringUrl(raw);
    if (fromFormula) return fromFormula;
  }

  for (const val of Object.values(properties)) {
    const fromUrl = tryUrlColumn(val);
    if (fromUrl) return fromUrl;
  }

  return undefined;
}

function findDatePropertyName(
  properties: DataSourceObjectResponse['properties'],
  preferred?: string
): string | null {
  const dates = Object.values(properties).filter((p) => p.type === 'date');
  if (dates.length === 0) return null;
  if (preferred) {
    const match = dates.find((p) => p.name === preferred);
    if (match?.name) return match.name;
  }
  return dates[0]?.name ?? null;
}

type PageLike = {
  id: string;
  properties: PageObjectResponse['properties'];
};

function rowToPageLike(row: unknown): PageLike | null {
  if (!row || typeof row !== 'object' || !('object' in row) || row.object !== 'page') {
    return null;
  }
  if (!('id' in row) || typeof row.id !== 'string') {
    return null;
  }
  if (!('properties' in row) || !row.properties || typeof row.properties !== 'object') {
    return null;
  }
  return {
    id: row.id,
    properties: row.properties as PageObjectResponse['properties'],
  };
}

function pageToEvent(
  page: PageLike,
  datePropertyName?: string | null,
  descriptionPropertyName?: string | null,
  linkPropertyPreferred?: string | null
): NotionCalendarEvent | null {
  let title = 'Untitled';
  let start: string | null = null;
  let end: string | null = null;

  for (const val of Object.values(page.properties)) {
    if (!val || typeof val !== 'object' || !('type' in val)) continue;
    if (val.type === 'title' && 'title' in val && Array.isArray(val.title)) {
      title =
        val.title
          .map((t: { plain_text?: string }) => t.plain_text ?? '')
          .join('')
          .trim() || 'Untitled';
    }
  }

  const primary =
    datePropertyName && datePropertyName.length > 0 ? page.properties[datePropertyName] : undefined;
  if (
    primary &&
    typeof primary === 'object' &&
    'type' in primary &&
    primary.type === 'date' &&
    'date' in primary &&
    primary.date?.start
  ) {
    start = primary.date.start;
    end = primary.date.end ?? null;
  } else {
    for (const val of Object.values(page.properties)) {
      if (!val || typeof val !== 'object' || !('type' in val)) continue;
      if (val.type === 'date' && 'date' in val && val.date?.start) {
        start = val.date.start;
        end = val.date.end ?? null;
        break;
      }
    }
  }

  if (!start) return null;

  const description = extractPageDescription(page.properties, descriptionPropertyName);
  const linkUrl = extractPageLinkUrl(page.properties, linkPropertyPreferred);

  return {
    id: page.id,
    title,
    start,
    end,
    ...(description ? { description } : {}),
    ...(linkUrl ? { linkUrl } : {}),
  };
}

async function queryEventsForDataSource(
  client: Client,
  dataSourceId: string,
  datePropertyName: string,
  rangeStart: string,
  rangeEnd: string
): Promise<PageLike[]> {
  const pages: PageLike[] = [];
  let cursor: string | undefined;

  for (;;) {
    const res = await client.dataSources.query({
      data_source_id: dataSourceId,
      result_type: 'page',
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: datePropertyName, direction: 'ascending' }],
      filter: {
        and: [
          {
            property: datePropertyName,
            type: 'date',
            date: { on_or_after: rangeStart },
          },
          {
            property: datePropertyName,
            type: 'date',
            date: { on_or_before: rangeEnd },
          },
        ],
      },
    });

    for (const row of res.results) {
      const page = rowToPageLike(row);
      if (page) {
        pages.push(page);
      }
    }

    if (!res.has_more) break;
    cursor = res.next_cursor ?? undefined;
    if (!cursor) break;
  }

  return pages;
}

async function queryPagesWithoutDateFilter(
  client: Client,
  dataSourceId: string,
  maxRows: number
): Promise<PageLike[]> {
  const pages: PageLike[] = [];
  let cursor: string | undefined;

  for (;;) {
    const res = await client.dataSources.query({
      data_source_id: dataSourceId,
      result_type: 'page',
      page_size: Math.min(100, maxRows - pages.length),
      start_cursor: cursor,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    for (const row of res.results) {
      const page = rowToPageLike(row);
      if (page) {
        pages.push(page);
      }
      if (pages.length >= maxRows) {
        return pages;
      }
    }

    if (!res.has_more) break;
    cursor = res.next_cursor ?? undefined;
    if (!cursor) break;
  }

  return pages;
}

function mergeConfig(
  explicit?: Partial<NotionCalendarServerConfig>
): NotionCalendarServerConfig | null {
  const apiKey = (explicit?.apiKey ?? process.env.NOTION_API_KEY)?.trim();
  const databaseId = trimEnvValue(explicit?.databaseId ?? process.env.NOTION_CALENDAR_DATABASE_ID);
  if (!apiKey || !databaseId) return null;
  const dataSourceId =
    explicit?.dataSourceId ??
    (trimEnvValue(process.env.NOTION_CALENDAR_DATA_SOURCE_ID) || undefined);
  const dateProperty =
    explicit?.dateProperty ??
    (process.env.NOTION_CALENDAR_DATE_PROPERTY?.trim() || undefined);
  const descriptionProperty =
    explicit?.descriptionProperty ??
    (process.env.NOTION_CALENDAR_DESCRIPTION_PROPERTY?.trim() || undefined);
  const linkProperty =
    explicit?.linkProperty ??
    (process.env.NOTION_CALENDAR_LINK_PROPERTY?.trim() || undefined);

  const relaxedQuery =
    explicit?.relaxedQuery !== undefined
      ? explicit.relaxedQuery
      : process.env.NOTION_CALENDAR_RELAXED_QUERY === '1' ||
        process.env.NODE_ENV === 'development';

  return {
    apiKey,
    databaseId,
    ...(dataSourceId ? { dataSourceId } : {}),
    ...(dateProperty ? { dateProperty } : {}),
    ...(descriptionProperty ? { descriptionProperty } : {}),
    ...(linkProperty ? { linkProperty } : {}),
    relaxedQuery,
    monthsBack: explicit?.monthsBack ?? DEFAULT_MONTHS_BACK,
    monthsForward: explicit?.monthsForward ?? DEFAULT_MONTHS_FORWARD,
  };
}

/**
 * True when an API key and a parsable database ID are present (env and/or explicit config).
 */
export function isNotionCalendarConfigured(
  explicit?: Partial<NotionCalendarServerConfig>
): boolean {
  const c = mergeConfig(explicit);
  if (!c) return false;
  return Boolean(extractDatabaseId(trimEnvValue(c.databaseId)));
}

async function fetchNotionCalendarEventsCore(
  config: NotionCalendarServerConfig
): Promise<NotionCalendarEvent[]> {
  const client = new Client({ auth: config.apiKey });
  const rawDbId = trimEnvValue(config.databaseId);
  const overrideDataSourceRaw = config.dataSourceId ? trimEnvValue(config.dataSourceId) : '';
  const preferredDateName = config.dateProperty?.trim();
  const preferredDescriptionName = config.descriptionProperty?.trim();
  const preferredLinkPropertyName = config.linkProperty?.trim();

  const database_id = extractDatabaseId(rawDbId);
  if (!database_id) {
    throw new Error(
      'Notion calendar: NOTION_CALENDAR_DATABASE_ID must be a Notion database ID or a database page URL (32 hex characters, with or without hyphens). If you copied a normal page URL, open the database as its own page and use that URL instead.'
    );
  }

  const db = await client.databases.retrieve({ database_id });

  if (!isFullDatabase(db)) {
    throw new Error('Notion calendar: could not load database metadata.');
  }

  const overrideDataSourceId = overrideDataSourceRaw
    ? extractNotionId(overrideDataSourceRaw)
    : null;
  if (overrideDataSourceRaw && !overrideDataSourceId) {
    throw new Error('Notion calendar: NOTION_CALENDAR_DATA_SOURCE_ID is not a valid Notion ID.');
  }

  const monthsBack = config.monthsBack ?? DEFAULT_MONTHS_BACK;
  const monthsForward = config.monthsForward ?? DEFAULT_MONTHS_FORWARD;
  const { start: rangeStart, end: rangeEnd } = rangeIsoBounds(monthsBack, monthsForward);

  const dataSourcesToQuery = overrideDataSourceId
    ? [{ id: overrideDataSourceId }]
    : (db.data_sources ?? []);

  if (dataSourcesToQuery.length === 0) {
    throw new Error('Notion calendar: no data source found for this database.');
  }

  const byId = new Map<string, PageLike>();

  for (const dsRef of dataSourcesToQuery) {
    const ds = await client.dataSources.retrieve({
      data_source_id: dsRef.id,
    });

    if (!isFullDataSource(ds)) {
      continue;
    }

    const datePropertyName = findDatePropertyName(ds.properties, preferredDateName);

    if (!datePropertyName) {
      if (overrideDataSourceId || dataSourcesToQuery.length === 1) {
        throw new Error(
          'Notion calendar: no Date property on this database. Add a date column or set NOTION_CALENDAR_DATE_PROPERTY.'
        );
      }
      continue;
    }

    let pages = await queryEventsForDataSource(
      client,
      dsRef.id,
      datePropertyName,
      rangeStart,
      rangeEnd
    );

    const allowRelaxed = config.relaxedQuery === true;

    if (pages.length === 0 && allowRelaxed) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.info(
          '[notion-embed-js] Date-filtered query returned 0 rows; fetching recent pages and filtering locally (dev or relaxedQuery).'
        );
      }
      pages = await queryPagesWithoutDateFilter(client, dsRef.id, 200);
    }

    for (const page of pages) {
      byId.set(page.id, page);
    }
  }

  if (byId.size === 0 && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.info(
      '[notion-embed-js] No rows returned for the configured date range. Check: date on each row, integration access, NOTION_CALENDAR_DATABASE_ID, and NOTION_CALENDAR_DATE_PROPERTY if you have multiple date columns.'
    );
  }

  const events: NotionCalendarEvent[] = [];
  for (const page of byId.values()) {
    const ev = pageToEvent(
      page,
      preferredDateName,
      preferredDescriptionName || undefined,
      preferredLinkPropertyName || undefined
    );
    if (!ev) continue;
    const dayStart = ev.start.slice(0, 10);
    if (dayStart >= rangeStart && dayStart <= rangeEnd) {
      events.push(ev);
    }
  }

  events.sort((a, b) => a.start.localeCompare(b.start));

  return events;
}

/**
 * Load events using NOTION_API_KEY and NOTION_CALENDAR_DATABASE_ID from the environment,
 * optionally overridden by `explicit`. Safe to wrap with your framework cache (e.g. Next.js `unstable_cache`).
 */
export async function fetchNotionCalendarEvents(
  explicit?: Partial<NotionCalendarServerConfig>
): Promise<{ events: NotionCalendarEvent[]; fetchError?: string }> {
  const merged = mergeConfig(explicit);
  if (!merged) {
    return {
      events: [],
      fetchError:
        'Notion calendar is not configured. Set NOTION_API_KEY and NOTION_CALENDAR_DATABASE_ID (database ID or database page URL).',
    };
  }

  try {
    const events = await fetchNotionCalendarEventsCore(merged);
    return { events };
  } catch (err) {
    console.error('[notion-embed-js]', err);
    if (err instanceof Error && err.message.startsWith('Notion calendar:')) {
      return { events: [], fetchError: err.message };
    }
    if (APIResponseError.isAPIResponseError(err) && err.code === APIErrorCode.InvalidRequestURL) {
      return {
        events: [],
        fetchError:
          'Notion rejected the database ID. Set NOTION_CALENDAR_DATABASE_ID to the full URL of your database page, or to the 32-character ID only (no quotes or spaces). Use the database’s own page link—not a link to a different Notion page.',
      };
    }
    return {
      events: [],
      fetchError:
        'Events could not be loaded. Check the Notion integration, database sharing, and NOTION_CALENDAR_DATABASE_ID.',
    };
  }
}
