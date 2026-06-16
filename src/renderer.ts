import { NormalizedPocketRecording, PocketSettings } from './types';

export function resolveFilename(
  recording: NormalizedPocketRecording,
  template: string,
  type: 'summary' | 'transcript',
): string {
  const date = formatDate(recording.recordingAt);
  const title = recording.title?.trim() || 'Untitled';
  let name = template
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{type\}\}/g, type);
  name = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  name = name.replace(/ {2,}/g, ' ').trim().replace(/[. ]+$/, '');
  if (!name) name = recording.id;
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name)) name = name + '_';
  return name;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function renderNote(
  recording: NormalizedPocketRecording,
  type: 'summary' | 'transcript',
  settings: Pick<PocketSettings, 'frontmatterTags' | 'filenameTemplate' | 'addTypeTag'>,
): string {
  if (type === 'summary') {
    if (!recording.summary?.markdown || recording.summary.processingStatus !== 'completed') return '';
  } else {
    if (!recording.transcript?.segments?.length && !recording.transcript?.text) return '';
  }

  // Tags: recording tags + extra settings tags + type tag (optional)
  const recordingTagNames = recording.tags.map(t => t.name);
  const extraTags = settings.frontmatterTags
    ? settings.frontmatterTags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
    : [];
  const typeTag = settings.addTypeTag ? [type] : [];
  const allTags = [...recordingTagNames, ...extraTags, ...typeTag];

  // source wikilink for summary only
  let sourceField = '';
  if (type === 'summary') {
    const hasTranscript = !!(recording.transcript?.segments?.length || recording.transcript?.text);
    if (hasTranscript) {
      const transcriptFilename = resolveFilename(recording, settings.filenameTemplate, 'transcript');
      sourceField = `source: "[[${transcriptFilename}]]"\n`;
    } else {
      sourceField = `source: ""\n`;
    }
  }

  // Frontmatter: id, date, duration (when present), tags (when present), source (summary only)
  const tagYaml = allTags.length > 0
    ? `tags:\n${allTags.map(t => `  - ${t}`).join('\n')}\n`
    : '';
  const durationYaml = recording.durationSeconds != null ? `duration: ${recording.durationSeconds}\n` : '';
  const frontmatter = `---\nid: ${recording.id}\ndate: ${formatDate(recording.recordingAt)}\n${durationYaml}${tagYaml}${sourceField}---\n`;

  const title = `\n# ${recording.title || 'Untitled'}\n`;

  let body = '';
  if (type === 'summary') {
    body += `\n## Summary\n\n${recording.summary!.markdown}\n`;
    if (recording.summary!.bulletPoints?.length) {
      body += `\n### Highlights\n\n${recording.summary!.bulletPoints.map(b => `- ${b}`).join('\n')}\n`;
    }
    if (recording.summary!.actionItems?.length) {
      body += `\n### Action items\n\n${recording.summary!.actionItems.map(a => `- [ ] ${a}`).join('\n')}\n`;
    }
  } else {
    body += `\n## Transcript\n\n`;
    if (recording.transcript!.segments?.length) {
      body += recording.transcript!.segments.map(seg => {
        const speaker = seg.speaker ? `**${seg.speaker}** ` : '';
        return `${speaker}[${formatTime(seg.startTime)}] ${seg.text}`;
      }).join('\n') + '\n';
    } else {
      body += recording.transcript!.text + '\n';
    }
  }

  return frontmatter + title + body;
}
