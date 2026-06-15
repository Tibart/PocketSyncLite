import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { PocketSettings, DEFAULT_SETTINGS } from './types';
import { DEFAULT_FILENAME_TEMPLATE } from './constants';

export { DEFAULT_SETTINGS };

export class PocketSyncLiteSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: any) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Pocket Sync Lite' });

    new Setting(containerEl)
      .setName('Pocket API key')
      .setDesc('Copy from app.heypocket.com → Settings → API keys.')
      .addText(text => {
        text.inputEl.type = 'password';
        text.setValue(this.plugin.settings.apiKey)
            .onChange(async (v) => { this.plugin.settings.apiKey = v.trim(); await this.plugin.saveSettings(); });
      });

    new Setting(containerEl)
      .setName('Vault folder')
      .setDesc('Base folder for synced notes.')
      .addText(text => text
        .setPlaceholder('Pocket')
        .setValue(this.plugin.settings.folder)
        .onChange(async (v) => { this.plugin.settings.folder = v.trim() || 'Pocket'; await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Filename template')
      .setDesc('Tokens: {{title}}, {{date}}, {{type}}. Extension .md added automatically.')
      .addText(text => text
        .setPlaceholder(DEFAULT_FILENAME_TEMPLATE)
        .setValue(this.plugin.settings.filenameTemplate)
        .onChange(async (v) => {
          const trimmed = v.trim();
          if (!trimmed) { new Notice('Filename template must not be empty.'); return; }
          this.plugin.settings.filenameTemplate = trimmed;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Summary folder')
      .setDesc('Flat folder for summary files. Leave empty to use base folder.')
      .addText(text => text
        .setPlaceholder('Pocket/Summaries')
        .setValue(this.plugin.settings.summaryFolder)
        .onChange(async (v) => { this.plugin.settings.summaryFolder = v.trim(); await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Transcript folder')
      .setDesc('Flat folder for transcript files. Leave empty to use base folder.')
      .addText(text => text
        .setPlaceholder('Pocket/Transcripts')
        .setValue(this.plugin.settings.transcriptFolder)
        .onChange(async (v) => { this.plugin.settings.transcriptFolder = v.trim(); await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Show sync notification')
      .setDesc('Show a notice after sync completes with counts.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showSyncNotification)
        .onChange(async (v) => { this.plugin.settings.showSyncNotification = v; await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Frontmatter tags')
      .setDesc('Comma-separated tags added to every note, e.g. pocket,meeting. Leading # is stripped.')
      .addText(text => text
        .setPlaceholder('pocket,meeting')
        .setValue(this.plugin.settings.frontmatterTags)
        .onChange(async (v) => { this.plugin.settings.frontmatterTags = v; await this.plugin.saveSettings(); }));
  }
}
