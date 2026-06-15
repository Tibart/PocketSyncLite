import {
  DEFAULT_FOLDER,
  DEFAULT_SUMMARY_FOLDER,
  DEFAULT_TRANSCRIPT_FOLDER,
  DEFAULT_FILENAME_TEMPLATE,
} from './constants';

export interface PocketSettings {
  apiKey: string;
  folder: string;
  filenameTemplate: string;
  summaryFolder: string;
  transcriptFolder: string;
  showSyncNotification: boolean;
  frontmatterTags: string;
}

export const DEFAULT_SETTINGS: PocketSettings = {
  apiKey: '',
  folder: DEFAULT_FOLDER,
  filenameTemplate: DEFAULT_FILENAME_TEMPLATE,
  summaryFolder: DEFAULT_SUMMARY_FOLDER,
  transcriptFolder: DEFAULT_TRANSCRIPT_FOLDER,
  showSyncNotification: true,
  frontmatterTags: '',
};

export interface PocketTag {
  id: string;
  name: string;
}

export interface PocketTranscriptSegment {
  speaker: string | null;
  text: string;
  startTime: number; // seconds
}

export interface PocketTranscript {
  text: string;
  segments: PocketTranscriptSegment[];
}

export interface PocketSummary {
  markdown: string;
  bulletPoints: string[];
  actionItems: string[];
  processingStatus: string;
}

export interface NormalizedPocketRecording {
  id: string;
  title: string;
  recordingAt: Date;
  language: string | null;
  durationSeconds: number | null;
  tags: PocketTag[];
  summary: PocketSummary | null;
  transcript: PocketTranscript | null;
}

export interface PocketRecordingListItem {
  id: string;
  title: string;
  recordingAt: Date;
  language: string | null;
  durationSeconds: number | null;
  tags: PocketTag[];
}

export interface PluginData {
  settings: PocketSettings;
  lastSyncAt: string | null;
}
