export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}
export function requestUrl(opts: any): Promise<any> {
  return Promise.resolve({ json: {}, text: '', status: 200, headers: {} });
}
export class TFile { constructor(public path: string) {} }
export class TFolder { constructor(public path: string) {} }
export class App {
  vault = new Vault();
}
export class Vault {
  private files = new Map<string, string>();
  adapter = {
    exists: async (p: string) => this.files.has(p),
    write: async (p: string, c: string) => { this.files.set(p, c); },
    read: async (p: string) => this.files.get(p) ?? '',
  };
  getAbstractFileByPath(p: string) { return this.files.has(p) ? { path: p } : null; }
  async createFolder(p: string) { this.files.set(p + '/.keep', ''); }
  _seed(p: string, c: string) { this.files.set(p, c); }
  _read(p: string) { return this.files.get(p); }
  _all() { return [...this.files.keys()]; }
}
export class Plugin { app = new App(); async loadData() { return {}; } async saveData(_: any) {} addCommand(_: any) {} addSettingTab(_: any) {} }
export class PluginSettingTab { constructor(public app: App, public plugin: any) {} display() {} hide() {} containerEl = { createEl: (_: any, __: any) => ({ setText: () => {} }) } as any; }
export class Setting {
  constructor(public containerEl: any) {}
  setName(_: string) { return this; }
  setDesc(_: string) { return this; }
  addText(cb: (t: any) => any) { cb({ setValue: (_: string) => ({ onChange: (_f: any) => this }), inputEl: { type: 'text' } }); return this; }
  addToggle(cb: (t: any) => any) { cb({ setValue: (_: boolean) => ({ onChange: (_f: any) => this }) }); return this; }
}
export class Notice { constructor(public message: string, public timeout?: number) {} }
