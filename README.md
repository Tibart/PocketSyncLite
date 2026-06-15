# Pocket Sync Lite

Minimal Obsidian plugin that syncs [Pocket](https://heypocket.com) recordings to your vault.

## Setup
1. Copy your API key from [Pocket Settings → API Keys](https://app.heypocket.com/app/settings/api-keys).
2. In Obsidian: Settings → Pocket Sync Lite → paste API key.
3. Run command: **Sync Pocket recordings**.

## Settings

| Setting | Default | Description |
|---|---|---|
| Pocket API key | — | Your Pocket API key |
| Vault folder | `Pocket` | Base folder |
| Filename template | `{{date}} {{title}} - {{type}}` | Tokens: `{{date}}`, `{{title}}`, `{{type}}` |
| Summary folder | `Pocket/Summaries` | Flat folder for summary files |
| Transcript folder | `Pocket/Transcripts` | Flat folder for transcript files |
| Show sync notification | on | Show result count after sync |
| Frontmatter tags | — | Comma-separated tags added to every note, e.g. `pocket,meeting` |

## What is synced
- Summary (when processing is complete)
- Transcript (when segments or text are available)

## What is NOT synced
- Insights / highlights
- Auto-sync (manual command only)

## Frontmatter
Every note: `id`, `date`, `duration`, `language`, `tags`, `pocket_type`.
Summary notes additionally: `source: "[[transcript filename]]"` — wikilink to the transcript.

## License
0BSD
