# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Stack

- **Next.js 16.2.0** with App Router — read `node_modules/next/dist/docs/` before making changes
- **React 19.2.4**, **TypeScript 5**, **Tailwind CSS v4** (PostCSS-based, no tailwind.config.js)
- **Leaflet 1.9.4** + **react-leaflet 5.0.0** for the interactive world map

## Architecture

The app is an interactive world food map. Countries are grouped into 5 regional cuisine groups, each rendered with a distinct color on the map. Clicking a group opens a side panel listing countries and their recipes.

**Data flow:** `app/lib/mockRecipes.ts` is the single source of truth — an in-memory object keyed by ISO-2 country code. The API routes read from it:
- `GET /api/countries` — returns all countries that have recipes
- `GET /api/countries/[id]/recipes` — accepts ISO-2 code or country name, returns that country's recipes

**Map rendering:** Leaflet requires `window`, so the map is split into two files:
- `WorldMapClient.tsx` — `"use client"` wrapper with `dynamic(..., { ssr: false })`
- `WorldMap.tsx` — actual Leaflet/react-leaflet component

**Styling:** Tailwind v4 (configured via `postcss.config.mjs`, no separate config file needed). Component-level styles use CSS Modules (`WorldMap.module.css`). Brand colors are defined in `color-palette.md`.

## Next.js version notes

This is Next.js 16 — it may have breaking changes vs. your training data. Always check `node_modules/next/dist/docs/` for current API reference. Known hint from docs: for slow client-side navigations, export `unstable_instant` from the route — Suspense alone is not enough (see `node_modules/next/dist/docs/index.md`).
