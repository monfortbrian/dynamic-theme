<p align="center">
  <img alt="Dynamic" src="https://raw.githubusercontent.com/monfortbrian/dynamic-theme/main/images/logo.png" width="80" />
</p>

<h1 align="center">Dynamic Theme</h1>

<p align="center">A dynamic theme for VS Code, Cursor, Windsurf, and more.</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=monfortbrian.dynamic-theme">
    <img alt="Version" src="https://img.shields.io/visual-studio-marketplace/v/monfortbrian.dynamic-theme?color=brightgreen&label=vs%20code" />
  </a>
  <a href="https://open-vsx.org/extension/monfortbrian/dynamic-theme">
    <img alt="Open VSX" src="https://img.shields.io/open-vsx/v/monfortbrian/dynamic-theme?color=blueviolet&label=open%20vsx" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=monfortbrian.dynamic-theme">
    <img alt="Installs" src="https://img.shields.io/visual-studio-marketplace/i/monfortbrian.dynamic-theme" />
  </a>
  <a href="https://github.com/monfortbrian/dynamic-theme/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/monfortbrian/dynamic-theme" />
  </a>
</p>

<p align="center">
  <img alt="Dynamic Theme Engine UI" src="https://raw.githubusercontent.com/monfortbrian/dynamic-theme/main/images/demo.png" />
</p>

---

## What it is

Dynamic is not a theme. It is a theme engine.

Pick colors [background, text, accent] and **Dynamic** maps them instantly across your entire editor: sidebar, statusbar, tabs, terminal, inputs, scrollbars, and more.

---

## Installation

### VS Code
1. Open Extensions `Ctrl+Shift+X`
2. Search **Dynamic**
3. Click Install

### Cursor
```bash
cursor --install-extension dynamic-theme-0.1.0.vsix
```

### Windsurf
```bash
windsurf --install-extension dynamic-theme-0.1.0.vsix
```

### Anysphere / manual
Download `.vsix` from [Releases](https://github.com/monfortbrian/dynamic-theme/releases) and drag it into the Extensions panel.

---

## Usage

```
Ctrl+Shift+P → Dynamic: Open Theme Engine
```

1. Pick a built-in preset or set your own colors
2. Preview updates live in the panel
3. Click **Apply**

---

## Presets

| Name      | Background | Text      | Accent    |
|-----------|------------|-----------|-----------|
| Dark      | `#1e1e1e`  | `#cccccc` | `#007acc` |
| Soft Dark | `#2b2b2b`  | `#d4d4d4` | `#c586c0` |
| Light     | `#f5f5f5`  | `#1e1e1e` | `#0066b8` |
| Mocha     | `#1c1917`  | `#e7e5e4` | `#f97316` |
| Nord      | `#2e3440`  | `#d8dee9` | `#88c0d0` |
| Midnight  | `#0d0d14`  | `#c8c8e0` | `#7c6af7` |

---

## Features

- Live preview before applying
- Save unlimited named presets, persists across sessions
- Load and delete saved presets instantly
- Full reset to VS Code defaults in one click
- Works on VS Code, Cursor, Windsurf, and Anysphere

---

## Publishing to other editors (maintainer notes)

```bash
# VS Code Marketplace
vsce publish

# Open VSX - used by Cursor, Windsurf, Anysphere, Gitpod
ovsx publish dynamic-theme-X.X.X.vsix -p YOUR_OPEN_VSX_TOKEN
```

Both registries should be kept in sync on every release.

---

## Author

**Monfort Brian N.**
[github.com/monfortbrian](https://github.com/monfortbrian)

---

## License

[MIT](LICENSE) © 2026 Monfort Brian N.