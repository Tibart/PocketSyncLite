import { App, normalizePath } from 'obsidian';
import { PocketSettings } from './types';
import { PocketApi } from './pocket/api';
import { normalizeRecordingListItem, normalizeRecordingDetail } from './pocket/mappers';
import { renderNote, resolveFilename } from './renderer';

export interface SyncResult {
  summaries: number;
  transcripts: number;
  errors: string[];
}

function buildStartDate(lastSyncAt: string | null): Date {
  const now = new Date();
  if (lastSyncAt) {
    const d = new Date(lastSyncAt);
    d.setDate(d.getDate() - 2);
    return d;
  }
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d;
}

export function resolveFolder(settings: PocketSettings, type: 'summary' | 'transcript'): string {
  if (type === 'summary') return settings.summaryFolder || settings.folder + '/Summaries';
  return settings.transcriptFolder || settings.folder + '/Transcripts';
}

async function ensureFolder(app: App, folder: string): Promise<void> {
  if (!folder) return;
  const exists = await app.vault.adapter.exists(folder);
  if (!exists) await app.vault.createFolder(folder);
}

export async function sync(
  app: App,
  settings: PocketSettings,
  lastSyncAt: string | null,
): Promise<SyncResult> {
  const result: SyncResult = { summaries: 0, transcripts: 0, errors: [] };
  const api = new PocketApi({ apiKey: settings.apiKey });
  const startDate = buildStartDate(lastSyncAt);
  const endDate = new Date();

  let listItems;
  try {
    listItems = await api.listAllRecordings({
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    });
  } catch (e: any) {
    result.errors.push(`Failed to fetch recording list: ${e?.message ?? e}`);
    return result;
  }

  for (const raw of listItems) {
    const listItem = normalizeRecordingListItem(raw);
    if (!listItem) {
      result.errors.push('Skipping malformed recording list item');
      continue;
    }

    try {
      const detail = await api.getRecordingDetails(listItem.id, {
        includeTranscript: true,
        includeSummarizations: true,
      });
      const recording = normalizeRecordingDetail(detail, listItem);
      if (!recording) {
        result.errors.push(`Recording ${listItem.id}: failed to normalize detail`);
        continue;
      }

      const summaryContent = renderNote(recording, 'summary', settings);
      if (summaryContent) {
        const folder = resolveFolder(settings, 'summary');
        await ensureFolder(app, folder);
        const filename = resolveFilename(recording, settings.filenameTemplate, 'summary') + '.md';
        const path = normalizePath(`${folder}/${filename}`);
        await app.vault.adapter.write(path, summaryContent);
        result.summaries++;
      }

      const transcriptContent = renderNote(recording, 'transcript', settings);
      if (transcriptContent) {
        const folder = resolveFolder(settings, 'transcript');
        await ensureFolder(app, folder);
        const filename = resolveFilename(recording, settings.filenameTemplate, 'transcript') + '.md';
        const path = normalizePath(`${folder}/${filename}`);
        await app.vault.adapter.write(path, transcriptContent);
        result.transcripts++;
      }
    } catch (e: any) {
      result.errors.push(`Recording ${listItem.id}: ${e?.message ?? e}`);
    }
  }

  return result;
}
