import { describe, it, expect } from 'vitest';
import { renderNote, resolveFilename } from '../renderer';
import type { NormalizedPocketRecording } from '../types';
import { DEFAULT_SETTINGS } from '../settings';

const base: NormalizedPocketRecording = {
  id: 'rec-1',
  title: 'Team Standup',
  recordingAt: new Date('2025-06-10T09:00:00Z'),
  language: 'en',
  durationSeconds: 600,
  tags: [{ id: 't1', name: 'standup' }],
  summary: {
    markdown: 'Key points',
    bulletPoints: ['Point one'],
    actionItems: ['Follow up'],
    processingStatus: 'completed',
  },
  transcript: {
    text: 'Hello world',
    segments: [
      { speaker: 'Alice', text: 'Hello', startTime: 0 },
      { speaker: null, text: 'World', startTime: 5 },
    ],
  },
};
const s = { ...DEFAULT_SETTINGS };

describe('summary', () => {
  it('renders frontmatter, title, sections', () => {
    const out = renderNote(base, 'summary', s);
    expect(out).toContain('pocket_type: summary');
    expect(out).toContain('# Team Standup');
    expect(out).toContain('## Summary');
    expect(out).toContain('### Action items');
    expect(out).toContain('- [ ] Follow up');
  });
  it('source wikilink points to transcript filename', () => {
    const out = renderNote(base, 'summary', s);
    expect(out).toContain('source: "[[2025-06-10 Team Standup - transcript]]"');
  });
  it('source empty when transcript absent', () => {
    const out = renderNote({ ...base, transcript: null }, 'summary', s);
    expect(out).toContain('source: ""');
  });
  it('returns empty string when summary missing', () => {
    expect(renderNote({ ...base, summary: null }, 'summary', s)).toBe('');
  });
  it('returns empty string when not completed', () => {
    expect(renderNote({ ...base, summary: { ...base.summary!, processingStatus: 'processing' } }, 'summary', s)).toBe('');
  });
});

describe('transcript', () => {
  it('renders speaker and timestamp', () => {
    const out = renderNote(base, 'transcript', s);
    expect(out).toContain('**Alice** [00:00] Hello');
  });
  it('omits null speaker', () => {
    const out = renderNote(base, 'transcript', s);
    expect(out).not.toMatch(/\*\*null\*\*/);
    expect(out).toContain('[00:05] World');
  });
  it('no source field on transcript', () => {
    expect(renderNote(base, 'transcript', s)).not.toContain('source:');
  });
  it('returns empty when transcript absent', () => {
    expect(renderNote({ ...base, transcript: null }, 'transcript', s)).toBe('');
  });
});

describe('frontmatter tags', () => {
  it('merges recording + settings tags', () => {
    const out = renderNote(base, 'transcript', { ...s, frontmatterTags: 'pocket,meeting' });
    expect(out).toContain('- standup');
    expect(out).toContain('- pocket');
    expect(out).toContain('- meeting');
  });
  it('empty frontmatterTags adds nothing', () => {
    const out = renderNote({ ...base, tags: [] }, 'transcript', { ...s, frontmatterTags: '' });
    expect(out).not.toContain('tags:');
  });
  it('strips leading # from settings tags', () => {
    const out = renderNote(base, 'transcript', { ...s, frontmatterTags: '#pocket,#note' });
    expect(out).toContain('- pocket');
    expect(out).not.toContain('- #pocket');
  });
});

describe('resolveFilename', () => {
  it('substitutes all tokens', () => {
    expect(resolveFilename(base, '{{date}} {{title}} - {{type}}', 'summary'))
      .toBe('2025-06-10 Team Standup - summary');
  });
  it('replaces illegal chars', () => {
    const rec = { ...base, title: 'Q2: Report/Review' };
    expect(resolveFilename(rec, '{{title}}', 'summary')).not.toMatch(/[:<>"/\\|?*]/);
  });
});
