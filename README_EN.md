# Flavortown VN

An experimental visual novel with a scene editor, system‑style effects, and a fake terminal. The project is designed for Electron and includes localization.

## Contents
1. Project Overview
2. Game Interface
3. Controls
4. Settings
5. Quick Start
6. Scene Editor
7. Story & Localization
8. Fake CMD
9. Build EXE
10. Project Structure
11. Known Notes
12. Easter Egg

## 1) Project Overview
- Format: visual novel (Web + Electron).
- Focus: story + mechanics (timeline, text effects, system illusions).
- Languages: RU / EN.
- Modes: game, editor, fake CMD.

## 2) Game Interface
- Scene: background + characters.
- Dialogue: speaker name + text.
- Choices: response buttons.
- Quick menu: Back / Auto / Skip / Save / Load / Settings.

## 3) Controls
- Enter / Space — continue.
- 1–9 — select a choice.
- Ctrl+1…3 — save.
- Alt+1…3 — load.
- A — Auto.
- S — Skip.
- B — Back.
- O — Settings.
- L — Log.
- M — Mute.
- H — Hide UI.
- C — Checkpoints.
- Esc — close panels or restore UI.

## 4) Settings
- Text: text speed, size, opacity.
- Audio: music/voice/sfx/ambience volume.
- Gameplay: auto delay, timed choices, skip unread.
- System: effects, pressure, language, utilities.

Language selection appears on startup and is available in Settings.

## 5) Quick Start
1. Install dependencies:
```
npm install
```
2. Run the game:
```
npm run dev
```
3. Run the editor:
```
npm run editor
```
4. Web mode:
```
npm run web
```

## 6) Scene Editor
The editor lets you:
- add and edit scenes;
- manage characters, positions, and effects;
- build timeline events;
- test a scene directly.

## 7) Story & Localization
- Main story lives in `story.js`.
- Translations live in `story.js → locales`.
Example:
```
locales: {
  en: { scenes: { "1": { text: "Hello!" } } }
}
```
If no locales exist, the original text is used.

## 8) Fake CMD
Supported via timeline:
- terminal.open
- terminal.print
- terminal.type
- terminal.choice
- terminal.close

The editor includes a CMD tab and templates.

## 9) Build EXE
```
npm run dist
```
Installer appears in `dist/`.

## 10) Project Structure
- index.html, game.js, styles.css — game.
- story.js — story and scenes.
- characters.js — character library.
- editor.html/.js/.css — editor.
- cmd.html/.js — fake terminal.
- credits.* — credits sequence.

## 11) Known Notes
- Audio will not start before the first user gesture (browser restriction).
- Chroma key requires http/https, not file://. Use:
```
npx serve .
```
- Dev tools are enabled only if `dev.key` exists in the root.
- If build fails due to NSIS cache:
```
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\nsis"
```