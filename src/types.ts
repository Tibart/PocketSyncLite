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
  addTypeTag: boolean;
  alwaysOverwrite: boolean;
}

export const DEFAULT_SETTINGS: PocketSettings = {
  apiKey: '',
  folder: DEFAULT_FOLDER,
  filenameTemplate: DEFAULT_FILENAME_TEMPLATE,
  summaryFolder: DEFAULT_SUMMARY_FOLDER,
  transcriptFolder: DEFAULT_TRANSCRIPT_FOLDER,
  showSyncNotification: true,
  frontmatterTags: '',
  addTypeTag: true,
  alwaysOverwrite: false,
};

export interface PocketTag {
  id: string;
  name: string;
  color?: string | null;
  usageCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PocketTranscriptSegment {
  startTime: number;
  end?: number;
  speaker: string | null;
  text: string;
  originalText?: string | null;
}

export interface PocketTranscript {
  text: string;
  segments: PocketTranscriptSegment[];
  metadata?: Record<string, unknown>;
}

export interface PocketActionItemSubtask {
  id: string;
  title: string;
  assignee: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  category: string | null;
  completed: boolean;
}

export interface PocketActionItem {
  id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  category: string | null;
  completed: boolean;
  type: string | null;
  subtasks: PocketActionItemSubtask[];
}

export interface PocketSummary {
  id?: string;
  summarizationId?: string;
  processingStatus: string | null;
  title?: string;
  emoji?: string | null;
  markdown: string;
  bulletPoints: string[];
  actionItems: string[];
  mindMap?: unknown;
  autoInitiated?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  settings?: Record<string, unknown>;
  raw?: unknown;
}

export interface NormalizedPocketRecording {
  id: string;
  title: string | null;
  kind?: string;
  state?: string | null;
  durationSeconds: number | null;
  language: string | null;
  recordingAt: Date;
  createdAt?: string;
  updatedAt?: string;
  tags: PocketTag[];
  summary: PocketSummary | null;
  transcript: PocketTranscript | null;
}

export interface PocketRecordingListItem {
  id: string;
  title: string;
  durationSeconds: number | null;
  state: string | null;
  language: string | null;
  recordingAt: string;
  createdAt: string;
  updatedAt: string;
  tags: PocketTag[];
}

export interface PluginData {
  settings: PocketSettings;
  lastSyncAt: string | null;
}
