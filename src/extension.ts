import * as vscode from 'vscode';

interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
}

interface SavedPreset {
  name: string;
  colors: ThemeColors;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'dynamic-theme-engine.openThemeEngine',
    () => {
      ThemeEnginePanel.createOrShow(context.extensionUri, context);
    },
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}

class ThemeEnginePanel {
  static currentPanel: ThemeEnginePanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  static createOrShow(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
  ) {
    const column =
      vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
    if (ThemeEnginePanel.currentPanel) {
      ThemeEnginePanel.currentPanel._panel.reveal(column);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'dynamicTheme',
      'Dynamic',
      column,
      { enableScripts: true },
    );
    ThemeEnginePanel.currentPanel = new ThemeEnginePanel(panel, context);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
  ) {
    this._panel = panel;
    this._context = context;
    this._refresh();

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'applyTheme':
            await this._applyTheme(message.colors);
            break;
          case 'resetTheme':
            await this._resetTheme();
            break;
          case 'savePreset':
            this._savePreset(message.name, message.colors);
            // send updated list back without full reload
            this._panel.webview.postMessage({
              command: 'presetsUpdated',
              presets: this._getSavedPresets(),
            });
            break;
          case 'deletePreset':
            this._deletePreset(message.name);
            this._panel.webview.postMessage({
              command: 'presetsUpdated',
              presets: this._getSavedPresets(),
            });
            break;
        }
      },
      null,
      this._disposables,
    );

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _refresh() {
    this._panel.webview.html = this._getHtml(this._getSavedPresets());
  }

  private _getSavedPresets(): SavedPreset[] {
    return this._context.globalState.get<SavedPreset[]>(
      'dynamic.savedPresets',
      [],
    );
  }

  private _savePreset(name: string, colors: ThemeColors) {
    const presets = this._getSavedPresets();
    const idx = presets.findIndex((p) => p.name === name);
    if (idx >= 0) {
      presets[idx] = { name, colors };
    } else {
      presets.push({ name, colors });
    }
    this._context.globalState.update('dynamic.savedPresets', presets);
    vscode.window.showInformationMessage(`Preset "${name}" saved.`);
  }

  private _deletePreset(name: string) {
    const presets = this._getSavedPresets().filter((p) => p.name !== name);
    this._context.globalState.update('dynamic.savedPresets', presets);
  }

  private async _applyTheme(colors: ThemeColors) {
    const { background, foreground, accent } = colors;
    const config = vscode.workspace.getConfiguration('workbench');
    await config.update(
      'colorCustomizations',
      {
        'editor.background': background,
        'editor.foreground': foreground,
        'editorLineNumber.foreground': foreground + '44',
        'editorLineNumber.activeForeground': foreground + 'aa',
        'editorCursor.foreground': accent,
        'editor.selectionBackground': accent + '35',
        'editor.lineHighlightBackground': foreground + '07',
        'editorIndentGuide.background1': foreground + '15',
        'activityBar.background': background,
        'activityBar.foreground': foreground,
        'activityBar.activeBorder': accent,
        'activityBar.inactiveForeground': foreground + '44',
        'activityBarBadge.background': accent,
        'activityBarBadge.foreground': background,
        'sideBar.background': background,
        'sideBar.foreground': foreground,
        'sideBarSectionHeader.background': background,
        'sideBarSectionHeader.foreground': foreground + '88',
        'sideBarSectionHeader.border': foreground + '12',
        'statusBar.background': accent,
        'statusBar.foreground': background,
        'statusBar.noFolderBackground': accent,
        'statusBarItem.hoverBackground': background + '25',
        'titleBar.activeBackground': background,
        'titleBar.activeForeground': foreground,
        'titleBar.inactiveBackground': background,
        'titleBar.inactiveForeground': foreground + '55',
        'titleBar.border': foreground + '10',
        'tab.activeBackground': background,
        'tab.activeForeground': foreground,
        'tab.inactiveBackground': background,
        'tab.inactiveForeground': foreground + '44',
        'tab.activeBorder': accent,
        'tab.border': foreground + '10',
        'editorGroupHeader.tabsBackground': background,
        'panel.background': background,
        'panel.border': foreground + '15',
        'terminal.background': background,
        'terminal.foreground': foreground,
        'terminal.ansiBlue': accent,
        'button.background': accent,
        'button.foreground': background,
        'button.hoverBackground': accent + 'cc',
        focusBorder: accent + '80',
        'input.background': foreground + '0a',
        'input.foreground': foreground,
        'input.border': foreground + '20',
        'input.placeholderForeground': foreground + '44',
        'dropdown.background': background,
        'dropdown.foreground': foreground,
        'dropdown.border': foreground + '20',
        'list.activeSelectionBackground': accent + '22',
        'list.activeSelectionForeground': foreground,
        'list.hoverBackground': foreground + '08',
        'list.inactiveSelectionBackground': accent + '12',
        'breadcrumb.background': background,
        'breadcrumb.foreground': foreground + '77',
        'breadcrumb.activeSelectionForeground': foreground,
        'scrollbarSlider.background': foreground + '18',
        'scrollbarSlider.hoverBackground': foreground + '30',
        'scrollbarSlider.activeBackground': accent + '50',
        'editorWidget.background': background,
        'editorWidget.border': foreground + '20',
        'editorSuggestWidget.background': background,
        'editorSuggestWidget.border': foreground + '20',
        'editorSuggestWidget.selectedBackground': accent + '25',
        'peekView.border': accent,
        'peekViewEditor.background': background,
        'peekViewResult.background': background,
        'notifications.background': background,
        'notifications.border': foreground + '20',
        'notificationLink.foreground': accent,
      },
      vscode.ConfigurationTarget.Global,
    );
    vscode.window.showInformationMessage('Theme applied.');
  }

  private async _resetTheme() {
    const config = vscode.workspace.getConfiguration('workbench');
    await config.update(
      'colorCustomizations',
      {},
      vscode.ConfigurationTarget.Global,
    );
    vscode.window.showInformationMessage('Theme reset to default.');
  }

  private _getHtml(savedPresets: SavedPreset[]): string {
    const presetsJson = JSON.stringify(savedPresets);
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dynamic</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #141414;
    --surface: #1c1c1c;
    --border: #262626;
    --text: #c8c8c8;
    --text-dim: #888888;
    --text-bright: #f0f0f0;
    --accent: #007acc;
  }

  body {
    font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 0 16px 48px;
  }

  .container {
    width: 100%;
    max-width: 720px;
    padding-top: 32px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 28px;
  }

  .header h1 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-bright);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .header .version {
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 0.05em;
  }

  /* Editor preview */
  .editor-preview {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 28px;
    transition: border-color 0.3s;
  }

  .editor-titlebar {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 34px;
    background: #1a1a1a;
    border-bottom: 1px solid var(--border);
    gap: 10px;
  }

  .traffic-lights {
    display: flex;
    gap: 5px;
    margin-right: 4px;
  }

  .tl {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .tl-red    { background: #ff5f57; }
  .tl-yellow { background: #febc2e; }
  .tl-green  { background: #28c840; }

  .editor-tab {
    font-size: 11px;
    color: #666;
    padding: 4px 12px;
    border-bottom: 1px solid transparent;
  }

  .editor-tab.active {
    color: #ccc;
    border-bottom-color: var(--accent-preview, #007acc);
    transition: border-color 0.3s;
  }

  .editor-body {
    display: flex;
    min-height: 140px;
    transition: background 0.3s;
  }

  .gutter {
    width: 44px;
    padding: 14px 10px 14px 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-right: 1px solid var(--border);
    align-items: flex-end;
    flex-shrink: 0;
  }

  .ln {
    font-size: 11px;
    color: #383838;
    line-height: 1;
    transition: color 0.3s;
  }

  .code-area {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .code-line {
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0;
  }

  .tk { color: #c586c0; }
  .tf { color: #dcdcaa; }
  .ts { color: #ce9178; }
  .tc { color: #6a9955; font-style: italic; }
  .tv { color: #9cdcfe; }
  .tn { color: #b5cea8; }
  .tp { transition: color 0.3s; }

  .editor-statusbar {
    height: 22px;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 12px;
    font-size: 10px;
    letter-spacing: 0.03em;
    transition: background 0.3s, color 0.3s;
  }

  /* Controls grid */
  .controls {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
}

  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 12px;
  }

  .panel-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }

  /* Built-in presets */
  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .preset-btn {
    padding: 5px 10px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
    font-family: inherit;
    letter-spacing: 0.04em;
    transition: all 0.15s;
  }

  .preset-btn:hover { border-color: #444; color: var(--text); }
  .preset-btn.active { border-color: var(--accent); color: var(--accent); }

  /* Color inputs */
  .color-inputs { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }

  .color-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-label {
    font-size: 12px;
    color: var(--text);
    width: 80px;
    letter-spacing: 0.04em;
  }

  input[type="color"] {
    width: 28px;
    height: 24px;
    border: 1px solid var(--border);
    border-radius: 3px;
    cursor: pointer;
    background: none;
    padding: 1px;
    flex-shrink: 0;
  }

  input[type="text"].hex-input {
    width: 72px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text);
    font-size: 10px;
    padding: 4px 7px;
    font-family: inherit;
    letter-spacing: 0.04em;
    transition: border-color 0.15s;
  }

  input[type="text"].hex-input:focus {
    outline: none;
    border-color: #444;
  }

  /* Saved presets */
  .saved-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 40px;
    margin-bottom: 8px;
  }

  .saved-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .saved-item:hover { border-color: #383838; }

  .swatches {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
  }

  .swatch {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .saved-name {
    font-size: 12px;
    color: var(--text-bright);
    flex: 1;
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .del-btn {
    font-size: 10px;
    color: var(--text-dim);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 2px;
    font-family: inherit;
    flex-shrink: 0;
    transition: color 0.15s;
    line-height: 1;
  }

  .del-btn:hover { color: #e05252; }

  .empty-msg {
    font-size: 12px;
    color: var(--text);
    padding: 10px 0;
    letter-spacing: 0.03em;
  }

  .save-row {
    display: flex;
    gap: 6px;
  }

  .save-row input[type="text"] {
    flex: 1;
    min-width: 0;
  }

  .btn-save {
    padding: 5px 10px;
    background: transparent;
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
    font-family: inherit;
    letter-spacing: 0.04em;
    white-space: nowrap;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .btn-save:hover { color: var(--text); border-color: #444; }

  /* Actions */
  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .btn-apply {
    padding: 8px 24px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    font-family: inherit;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: opacity 0.15s;
  }

  .btn-apply:hover { opacity: 0.85; }

  .btn-reset {
    padding: 8px 16px;
    background: transparent;
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    font-family: inherit;
    letter-spacing: 0.04em;
    transition: all 0.15s;
  }

  .btn-reset:hover { color: var(--text); border-color: #444; }

  @media (max-width: 500px) {
    .controls { grid-template-columns: 1fr; gap: 10px; }
    body { padding: 0 12px 32px; }
    .container { padding-top: 20px; }
  }
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1>Dynamic</h1>
    <span class="version">v0.1.0 - theme engine</span>
  </div>

  <div class="editor-preview" id="ep">
    <div class="editor-titlebar" id="ep-titlebar">
      <div class="traffic-lights">
        <div class="tl tl-red"></div>
        <div class="tl tl-yellow"></div>
        <div class="tl tl-green"></div>
      </div>
      <div class="editor-tab active" id="ep-tab">index.ts</div>
    </div>
    <div class="editor-body" id="ep-body">
      <div class="gutter">
        <div class="ln">1</div>
        <div class="ln">2</div>
        <div class="ln">3</div>
        <div class="ln">4</div>
        <div class="ln">5</div>
        <div class="ln">6</div>
        <div class="ln">7</div>
      </div>
      <div class="code-area">
        <div class="code-line"><span class="tk">import</span><span class="tp">&nbsp;*&nbsp;</span><span class="tk">as</span><span class="tp">&nbsp;vscode&nbsp;</span><span class="tk">from</span><span class="ts">&nbsp;'vscode'</span><span class="tp">;</span></div>
        <div class="code-line"><span class="tp">&nbsp;</span></div>
        <div class="code-line"><span class="tk">const</span><span class="tp">&nbsp;</span><span class="tv">engine</span><span class="tp">&nbsp;=&nbsp;{</span></div>
        <div class="code-line"><span class="tp">&nbsp;&nbsp;</span><span class="tv">version</span><span class="tp">:&nbsp;</span><span class="ts">'0.1.0'</span><span class="tp">,</span></div>
        <div class="code-line"><span class="tp">&nbsp;&nbsp;</span><span class="tv">port</span><span class="tp">:&nbsp;</span><span class="tn">5678</span><span class="tp">,</span></div>
        <div class="code-line"><span class="tp">&nbsp;&nbsp;</span><span class="tc">// colors applied instantly</span></div>
        <div class="code-line"><span class="tp">};</span></div>
      </div>
    </div>
    <div class="editor-statusbar" id="ep-status">
      <span>Dynamic</span>
      <span>TypeScript</span>
      <span>UTF-8</span>
    </div>
  </div>

  <div class="controls">
    <div class="panel">
      <div class="panel-label">Built-in presets</div>
      <div class="preset-grid">
        <button class="preset-btn active" onclick="applyBuiltin('catppuccin',this)">Catppuccin</button>
        <button class="preset-btn" onclick="applyBuiltin('dracula',this)">Dracula</button>
        <button class="preset-btn" onclick="applyBuiltin('tokyo',this)">Tokyo Night</button>
        <button class="preset-btn" onclick="applyBuiltin('rosepine',this)">Rosé Pine</button>
        <button class="preset-btn" onclick="applyBuiltin('poimandres',this)">Poimandres</button>
      </div>

      <div class="color-inputs" style="margin-top:16px;">
        <div class="color-row">
          <span class="color-label">Background</span>
          <input type="color" id="bg-p" value="#1e1e1e" oninput="onPicker('bg')">
          <input type="text" class="hex-input" id="bg-h" value="#1e1e1e" oninput="onHex('bg')" maxlength="7">
        </div>
        <div class="color-row">
          <span class="color-label">Text</span>
          <input type="color" id="fg-p" value="#cccccc" oninput="onPicker('fg')">
          <input type="text" class="hex-input" id="fg-h" value="#cccccc" oninput="onHex('fg')" maxlength="7">
        </div>
        <div class="color-row">
          <span class="color-label">Accent</span>
          <input type="color" id="ac-p" value="#007acc" oninput="onPicker('ac')">
          <input type="text" class="hex-input" id="ac-h" value="#007acc" oninput="onHex('ac')" maxlength="7">
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-label">Saved presets</div>
      <div class="saved-list" id="saved-list"></div>
      <div class="save-row">
        <input type="text" class="hex-input" id="preset-name" placeholder="name your preset" maxlength="28" style="width:auto; flex:1;">
        <button class="btn-save" onclick="savePreset()">Save</button>
      </div>
    </div>
  </div>

  <div class="actions">
    <button class="btn-apply" onclick="apply()">Apply</button>
    <button class="btn-reset" onclick="reset()">Reset</button>
  </div>

</div>
<script>
  const vscode = acquireVsCodeApi();

  const BUILTIN = {
  catppuccin: { background: '#1e1e2e', foreground: '#cdd6f4', accent: '#cba6f7' },
  dracula:    { background: '#282a36', foreground: '#f8f8f2', accent: '#bd93f9' },
  tokyo:      { background: '#1a1b26', foreground: '#c0caf5', accent: '#7dcfff' },
  rosepine:   { background: '#191724', foreground: '#e0def4', accent: '#f6c177' },
  poimandres: { background: '#1b1e28', foreground: '#a6accd', accent: '#5de4c7' },
  };

  let savedPresets = ${presetsJson};

  // init
  function init() {
    setFields('#1e1e2e', '#cdd6f4', '#cba6f7');
    renderSaved();
    updatePreview();
  }

  function setFields(bg, fg, ac) {
    document.getElementById('bg-p').value = bg;
    document.getElementById('bg-h').value = bg;
    document.getElementById('fg-p').value = fg;
    document.getElementById('fg-h').value = fg;
    document.getElementById('ac-p').value = ac;
    document.getElementById('ac-h').value = ac;
  }

  function getFields() {
    return {
      background: document.getElementById('bg-h').value,
      foreground: document.getElementById('fg-h').value,
      accent: document.getElementById('ac-h').value
    };
  }

  function onPicker(key) {
    const val = document.getElementById(key + '-p').value;
    document.getElementById(key + '-h').value = val;
    clearActive();
    updatePreview();
  }

  function onHex(key) {
    const val = document.getElementById(key + '-h').value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      document.getElementById(key + '-p').value = val;
      clearActive();
      updatePreview();
    }
  }

  function clearActive() {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  }

  function applyBuiltin(name, btn) {
    const p = BUILTIN[name];
    setFields(p.background, p.foreground, p.accent);
    clearActive();
    btn.classList.add('active');
    updatePreview();
  }

  function updatePreview() {
    const { background, foreground, accent } = getFields();

    document.getElementById('ep').style.borderColor = accent + '55';
    document.getElementById('ep-titlebar').style.background = background;
    document.getElementById('ep-body').style.background = background;
    document.getElementById('ep-tab').style.borderBottomColor = accent;
    document.getElementById('ep-tab').style.color = foreground;

    document.querySelectorAll('.tp').forEach(el => el.style.color = foreground);
    document.querySelectorAll('.ln').forEach(el => el.style.color = foreground + '40');

    const status = document.getElementById('ep-status');
    status.style.background = accent;
    status.style.color = background;

    document.querySelector(':root').style.setProperty('--accent-preview', accent);
  }

  function renderSaved() {
    const list = document.getElementById('saved-list');
    if (!savedPresets.length) {
      list.innerHTML = '<div class="empty-msg">No saved presets.</div>';
      return;
    }
    list.innerHTML = savedPresets.map(p => \`
      <div class="saved-item" onclick="loadSaved('\${p.name}')">
        <div class="swatches">
          <div class="swatch" style="background:\${p.colors.background}"></div>
          <div class="swatch" style="background:\${p.colors.foreground}"></div>
          <div class="swatch" style="background:\${p.colors.accent}"></div>
        </div>
        <span class="saved-name">\${p.name}</span>
        <button class="del-btn" onclick="event.stopPropagation();delPreset('\${p.name}')">×</button>
      </div>
    \`).join('');
  }

  function loadSaved(name) {
    const p = savedPresets.find(x => x.name === name);
    if (!p) return;
    setFields(p.colors.background, p.colors.foreground, p.colors.accent);
    clearActive();
    updatePreview();
  }

  function savePreset() {
    const name = document.getElementById('preset-name').value.trim();
    if (!name) return;
    const colors = getFields();
    const idx = savedPresets.findIndex(p => p.name === name);
    if (idx >= 0) { savedPresets[idx] = { name, colors }; }
    else { savedPresets.push({ name, colors }); }
    renderSaved();
    document.getElementById('preset-name').value = '';
    vscode.postMessage({ command: 'savePreset', name, colors });
  }

  function delPreset(name) {
    savedPresets = savedPresets.filter(p => p.name !== name);
    renderSaved();
    vscode.postMessage({ command: 'deletePreset', name });
  }

  function apply() {
    vscode.postMessage({ command: 'applyTheme', colors: getFields() });
  }

  function reset() {
    vscode.postMessage({ command: 'resetTheme' });
  }

  window.addEventListener('message', e => {
    if (e.data.command === 'presetsUpdated') {
      savedPresets = e.data.presets;
      renderSaved();
    }
  });

  init();
</script>
</body>
</html>`;
  }

  public dispose() {
    ThemeEnginePanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach((d) => d.dispose());
  }
}
