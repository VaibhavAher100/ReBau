# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ReBau

AI marketplace for reclaimed construction materials (Team Toronto, AI Hackathon 2026). React 19 + TypeScript + Vite + Tailwind SPA, no backend: vision LLM calls go from the browser to the xAI API, state persists in localStorage.

## Commands

- Setup: `npm install`
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build` (must pass before committing)
- No test suite or linter configured.

## Architecture

- `services/grokService.ts` - all AI calls (xAI chat completions, OpenAI-compatible). `analyzeMaterialImage` (photo -> detected materials JSON), `analyzeBlueprint` (blueprint/BOM -> required materials JSON). Falls back to mock data when `VITE_XAI_API_KEY` is empty - never break this fallback.
- `services/sustainability.ts` - grade discounts (New/Good 50%, Fair 35%, Poor 20%, Scrap 10% of new price) and embodied-carbon factors (kg CO2e/kg per category). All pricing/CO2 math goes through here.
- `App.tsx` - global state (React hooks), four tabs, localStorage persistence under `hackmate_state_v2`. Bump the key suffix when seed data changes, or returning browsers keep stale state.
- Static assets live in `public/`; reference them with `BASE + 'path'` (`import.meta.env.BASE_URL`), never absolute `/path`, because GitHub Pages serves under `/ReBau/`.

## Gotchas

- `.env` holds the real xAI key (gitignored). Never bake the key into the public Pages build; the deploy workflow intentionally builds without it (mock mode).
- Vite's watcher crashes on Windows EBUSY when Office/PowerPoint drops temp files in the repo; restart `npm run dev` after such operations.
- Deploys: push to `main` triggers `.github/workflows/gen_gi_pages.yaml` -> https://vaibhavaher100.github.io/ReBau/

## Conventions

Global conventions (`~/.claude/CLAUDE.md`) apply: conventional commits <=50 chars, no em dashes, no AI attribution footers.
