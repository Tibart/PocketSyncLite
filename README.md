# Pocket Sync Lite

Minimal Obsidian plugin that syncs [Pocket](https://heypocket.com) recordings to your vault. One file per artifact, flat folders, no tracking state.

## Setup

1. Copy your API key from [Pocket Settings → API Keys](https://app.heypocket.com/app/settings/api-keys).
2. In Obsidian: **Settings → Pocket Sync Lite** → paste API key.
3. Run command: **Sync Pocket recordings**.

On first run the plugin fetches the last 30 days. Subsequent syncs pick up from where the last one left off (with a 2-day safety overlap).

## Settings

| Setting | Default | Description |
|---|---|---|
| Pocket API key | — | Your Pocket API key |
| Vault folder | `Pocket` | Base folder used when specific folders are empty |
| Filename template | `{{date}} {{title}} - {{type}}` | Template for all file names. Available tokens: `{{date}}`, `{{title}}`, `{{type}}` |
| Summary folder | `Pocket/Summaries` | Flat folder where summary files are written |
| Transcript folder | `Pocket/Transcripts` | Flat folder where transcript files are written |
| Always overwrite existing files | off | When off, files already in the vault are skipped. When on, they are always overwritten |
| Show sync notification | on | Show a result notice after sync completes |
| Add type tag to frontmatter | on | Adds `#summary` or `#transcript` as a tag in every note |
| Frontmatter tags | — | Comma-separated tags added to every note, e.g. `pocket,meeting`. Leading `#` is stripped |

## What is synced

| Artifact | Written when |
|---|---|
| Summary | Processing is complete and markdown content is available |
| Transcript | Segments or plain text are available |

## What is not synced

- Insights and highlights
- Action items as separate files (included in the summary body)
- Auto-sync — sync is always manual via the command palette

## Frontmatter

**Transcript files** include `id`, `date`, `duration`, and `tags`.

**Summary files** include `tags` and `source` — a wikilink to the corresponding transcript file:

```yaml
---
tags:
  - summary          # added when "Add type tag" is on
  - pocket           # from "Frontmatter tags" setting
source: "[[2025-06-10 Team Standup - transcript]]"
---
```

If no transcript is available, `source` is written as an empty string (field is always present).

## Sync notification

After each sync a notice shows the result:

```
Pocket Sync Lite: Synced 3 files (2 summaries, 1 transcripts, 4 skipped).
```

Skipped count only appears when files were skipped. Disable the notice in settings — errors are always shown regardless.

## Network requests

This plugin makes requests to the Pocket API (`https://public.heypocketai.com/api/v1`) to fetch your recordings. No vault content is sent. The only data transmitted is your API key (in the `Authorization` header) and date range parameters. No telemetry or analytics are collected.

## Inspiration

This plugin was inspired by [obsidian-pocket](https://github.com/Maclean-D/obsidian-pocket) by Maclean-D — a full-featured Pocket sync plugin with per-artifact folders, templates, and more.

## License

0BSD
