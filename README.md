# RapidRecall

Offline-first speed reader to drill vocabulary one word at a time. Manage sets locally, track per-set progress/WPM, and read with keyboard-friendly controls.

## Stack
- Vite 7 + Vue 3 + TypeScript
- Pinia (state), Vue Router, Tailwind CSS
- Vitest + Vue Test Utils
- `vite-plugin-pwa` for install/offline

## Getting Started
```bash
npm install
npm run dev
```
Then open http://localhost:5173. Word sets persist in `localStorage` (no backend required).

### Scripts
- `npm run dev` – start HMR dev server.
- `npm run build` – type-check and build to `dist/` (PWA assets included).
- `npm run preview` – serve the production build locally.
- `npm test` – run unit tests.

## App Guide
- Library: create/rename/delete sets, import/export (one word per line), edit words, start reading a set.
- Reader: play/pause, start/end, prev/next, WPM slider (50–800, default 100), per-set progress. ORP highlighting shows the focus letter per word.
- Keyboard: Space = play/pause, ←/→ = prev/next, ↑/↓ = speed.
- Theme: light/dark toggle, persisted locally.

## Build & Deploy (GitHub Pages)
Vite base is preset to `/rapid-recall/` for https://kolenchuk.github.io/rapid-recall/.
```bash
npm run build
npx gh-pages -d dist     # publishes dist/ to gh-pages
```
Enable Pages on the `gh-pages` branch (folder `/`) in GitHub settings. For other hosts, adjust `base` in `vite.config.ts` as needed and rebuild.
