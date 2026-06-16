import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { App } from 'obsidian';
import { sync, resolveFolder } from '../syncer';
import type { PocketSettings } from '../types';

// Hoisted mock functions — shared reference across vi.mock factories and test code.
const {
  MockPocketApi,
  mockListAllRecordings,
  mockGetRecordingDetails,
  mockNormalizeListItem,
  mockNormalizeDetail,
  mockRenderNote,
  mockResolveFilename,
} = vi.hoisted(() => ({
  MockPocketApi: vi.fn(),
  mockListAllRecordings: vi.fn(),
  mockGetRecordingDetails: vi.fn(),
  mockNormalizeListItem: vi.fn(),
  mockNormalizeDetail: vi.fn(),
  mockRenderNote: vi.fn(),
  mockResolveFilename: vi.fn(),
}));

vi.mock('../pocket/api', () => ({
  PocketApi: MockPocketApi,
}));

vi.mock('../pocket/mappers', () => ({
  normalizeRecordingListItem: mockNormalizeListItem,
  normalizeRecordingDetail: mockNormalizeDetail,
}));

vi.mock('../renderer', () => ({
  renderNote: mockRenderNote,
  resolveFilename: mockResolveFilename,
}));

const BASE_SETTINGS: PocketSettings = {
  apiKey: 'test-key',
  folder: 'Pocket',
  filenameTemplate: '{{date}} {{title}} - {{type}}',
  summaryFolder: 'Pocket/Summaries',
  transcriptFolder: 'Pocket/Transcripts',
  showSyncNotification: true,
  frontmatterTags: '',
};

const MOCK_LIST_ITEM = {
  id: 'rec-1',
  title: 'Test Recording',
  durationSeconds: 120,
  state: 'completed',
  language: 'en',
  recordingAt: '2026-06-10T10:00:00.000Z',
  createdAt: '2026-06-10T10:00:00.000Z',
  updatedAt: '2026-06-10T10:01:00.000Z',
  tags: [],
};

const MOCK_RECORDING = {
  id: 'rec-1',
  title: 'Test Recording',
  kind: 'conversation',
  state: 'completed',
  durationSeconds: 120,
  language: 'en',
  recordingAt: new Date('2026-06-10T10:00:00.000Z'),
  createdAt: '2026-06-10T10:00:00.000Z',
  updatedAt: '2026-06-10T10:01:00.000Z',
  tags: [],
  summary: null,
  transcript: null,
};

describe('syncer', () => {
  let app: App;

  beforeEach(() => {
    vi.resetAllMocks();

    // Restore PocketApi constructor mock after resetAllMocks clears it.
    MockPocketApi.mockImplementation(() => ({
      listAllRecordings: mockListAllRecordings,
      getRecordingDetails: mockGetRecordingDetails,
    }));

    app = new App();
    vi.spyOn(app.vault.adapter, 'write');

    // Default: one raw item that normalizes cleanly, renders nothing.
    mockListAllRecordings.mockResolvedValue([{}]);
    mockNormalizeListItem.mockReturnValue(MOCK_LIST_ITEM);
    mockGetRecordingDetails.mockResolvedValue({});
    mockNormalizeDetail.mockReturnValue(MOCK_RECORDING);
    mockRenderNote.mockReturnValue('');
    mockResolveFilename.mockReturnValue('test-file');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes summary to summaryFolder', async () => {
    const settings = { ...BASE_SETTINGS, summaryFolder: 'MyNotes/Summaries' };
    mockRenderNote.mockImplementation((_rec: unknown, type: string) =>
      type === 'summary' ? 'SUMMARY_CONTENT' : '',
    );
    mockResolveFilename.mockImplementation((_rec: unknown, _tmpl: string, type: string) =>
      type === 'summary' ? 'summary-file' : 'transcript-file',
    );

    await sync(app, settings, null);

    expect(app.vault.adapter.write).toHaveBeenCalledWith(
      'MyNotes/Summaries/summary-file.md',
      'SUMMARY_CONTENT',
    );
  });

  it('writes transcript to transcriptFolder', async () => {
    const settings = { ...BASE_SETTINGS, transcriptFolder: 'MyNotes/Transcripts' };
    mockRenderNote.mockImplementation((_rec: unknown, type: string) =>
      type === 'transcript' ? 'TRANSCRIPT_CONTENT' : '',
    );
    mockResolveFilename.mockImplementation((_rec: unknown, _tmpl: string, type: string) =>
      type === 'transcript' ? 'transcript-file' : 'summary-file',
    );

    await sync(app, settings, null);

    expect(app.vault.adapter.write).toHaveBeenCalledWith(
      'MyNotes/Transcripts/transcript-file.md',
      'TRANSCRIPT_CONTENT',
    );
  });

  it('uses a 30-day window on first run', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-06-15T12:00:00.000Z');
    vi.setSystemTime(now);

    await sync(app, BASE_SETTINGS, null);

    const expectedStart = new Date(now);
    expectedStart.setDate(expectedStart.getDate() - 30);
    const [callArgs] = mockListAllRecordings.mock.calls;
    expect(callArgs[0].startDate).toBe(expectedStart.toISOString().slice(0, 10));
  });

  it('uses lastSyncAt minus 2 days on incremental sync', async () => {
    const lastSyncAt = '2026-06-13T00:00:00.000Z';

    await sync(app, BASE_SETTINGS, lastSyncAt);

    const expectedStart = new Date(lastSyncAt);
    expectedStart.setDate(expectedStart.getDate() - 2);
    const [callArgs] = mockListAllRecordings.mock.calls;
    expect(callArgs[0].startDate).toBe(expectedStart.toISOString().slice(0, 10));
  });

  it('isolates errors: one failing recording does not stop others', async () => {
    const listItem2 = { ...MOCK_LIST_ITEM, id: 'rec-2' };
    const recording2 = { ...MOCK_RECORDING, id: 'rec-2' };

    mockListAllRecordings.mockResolvedValue([{}, {}]);
    mockNormalizeListItem
      .mockReturnValueOnce(MOCK_LIST_ITEM)
      .mockReturnValueOnce(listItem2);
    mockGetRecordingDetails
      .mockRejectedValueOnce(new Error('network failure'))
      .mockResolvedValueOnce({});
    mockNormalizeDetail.mockReturnValueOnce(recording2);
    mockRenderNote.mockImplementation((_rec: unknown, type: string) =>
      type === 'summary' ? 'CONTENT' : '',
    );
    mockResolveFilename.mockReturnValue('test-file');

    const result = await sync(app, BASE_SETTINGS, null);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch('rec-1');
    expect(result.summaries).toBe(1);
  });

  it('resolveFolder falls back to folder + /Summaries when summaryFolder is empty', () => {
    const settings = { ...BASE_SETTINGS, summaryFolder: '', folder: 'MyVault' };
    expect(resolveFolder(settings, 'summary')).toBe('MyVault/Summaries');
  });

  it('resolveFolder falls back to folder + /Transcripts when transcriptFolder is empty', () => {
    const settings = { ...BASE_SETTINGS, transcriptFolder: '', folder: 'MyVault' };
    expect(resolveFolder(settings, 'transcript')).toBe('MyVault/Transcripts');
  });
});
