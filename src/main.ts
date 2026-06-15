import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, PocketSettings, PluginData } from './types';
import { PocketSyncLiteSettingsTab } from './settings';
import { sync } from './syncer';

export default class PocketSyncLitePlugin extends Plugin {
  settings: PocketSettings = { ...DEFAULT_SETTINGS };
  lastSyncAt: string | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new PocketSyncLiteSettingsTab(this.app, this));
    this.addCommand({
      id: 'sync-pocket-recordings',
      name: 'Sync Pocket recordings',
      callback: () => this.runSync(),
    });
  }

  onunload() {}

  async loadSettings() {
    const data: Partial<PluginData> = (await this.loadData()) ?? {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings ?? {});
    this.lastSyncAt = data.lastSyncAt ?? null;
  }

  async saveSettings() {
    const data: PluginData = { settings: this.settings, lastSyncAt: this.lastSyncAt };
    await this.saveData(data);
  }

  private async runSync() {
    if (!this.settings.apiKey.trim()) {
      new Notice('Pocket Sync Lite: Set your API key in settings.');
      return;
    }
    new Notice('Syncing Pocket recordings\u2026');
    try {
      const result = await sync(this.app, this.settings, this.lastSyncAt);
      this.lastSyncAt = new Date().toISOString();
      await this.saveSettings();
      if (result.errors.length > 0) {
        new Notice(`Pocket Sync Lite: Synced with ${result.errors.length} error(s). Check console.`);
        result.errors.forEach(e => console.error('[PocketSyncLite]', e));
      } else if (this.settings.showSyncNotification) {
        new Notice(`Pocket Sync Lite: Synced ${result.summaries + result.transcripts} files (${result.summaries} summaries, ${result.transcripts} transcripts).`);
      }
    } catch (e: any) {
      new Notice(`Pocket Sync Lite: Sync failed \u2014 ${e?.message ?? e}`);
      console.error('[PocketSyncLite] sync error', e);
    }
  }
}
