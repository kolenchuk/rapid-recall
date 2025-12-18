# RapidRecall

PWA for speed-reading single words to recall foreign vocabulary. Supports multiple word sets stored locally, per-set progress, and keyboard shortcuts for quick control.

## Stack
- Vite 7 + Vue 3 + TypeScript
- Pinia for state, Vue Router
- Tailwind CSS for styling
- Vitest + Vue Test Utils for tests
- `vite-plugin-pwa` for offline/installable usage

## Scripts
- `npm install` — install dependencies.
- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check and build for production.
- `npm run preview` — preview the production build.
- `npm test` — run Vitest.

## Core features
- Library view: create/delete/rename sets, import (one word per line) with duplicate filtering, export to clipboard, choose active set.
- Reader view: play/pause, prev/next/start/end navigation, WPM slider (50–800, default 100), keyboard shortcuts (Space/Arrow keys), and per-set progress/WPM persistence in `localStorage`.
- Highlight focus letter using an ORP rule (position based on word length).
- Theme toggle (light/dark) persisted locally.

Screenshots in repo: `photo_2025-12-18_11-03-17.jpg`, `photo_2025-12-18_11-04-16.jpg`.
