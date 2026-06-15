export const POCKET_API_BASE_URL = 'https://api.heypocket.com';
export const DEFAULT_FOLDER = 'Pocket';
export const DEFAULT_SUMMARY_FOLDER = 'Pocket/Summaries';
export const DEFAULT_TRANSCRIPT_FOLDER = 'Pocket/Transcripts';
export const DEFAULT_FILENAME_TEMPLATE = '{{date}} {{title}} - {{type}}';
export const REQUEST_TIMEOUT_MS = 30_000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1_000;

// Aliases used by the Pocket API client (align with PocketSync naming)
export const DEFAULT_REQUEST_TIMEOUT_MS = REQUEST_TIMEOUT_MS;
export const DEFAULT_RETRY_COUNT = MAX_RETRIES;
export const DEFAULT_RETRY_DELAY_MS = RETRY_DELAY_MS;
export const MAX_PAGE_SIZE = 100;
