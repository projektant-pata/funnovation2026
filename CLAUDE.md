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
- **Leaflet 1.9.4** + **react-leaflet 5.0.0** — legacy, being replaced by stylized SVG map for World mode

## Architecture

**App overview:** žemLOVEka is a gamified cooking education platform (Duolingo for cooking). Full spec lives in `docs/zemLOVEka_MasterPrompt.md`.

**Routing:**
- `/[lang]` — Landing page (marketing, existing, untouched for now)
- `/[lang]/game` — Game shell (shared layout with floating bottom nav)
- `/[lang]/game/campaign` — Campaign mode (story node tree)
- `/[lang]/game/world` — World mode (stylized SVG map → region node trees)
- `/[lang]/game/freeplay` — Freeplay mode (filterable recipe browser)
- `/[lang]/game/social` — Social section (reels feed, groups)
- `/[lang]/game/profile` — Player profile (stats, badges, settings)

**Game shell layout** (`/[lang]/game/layout.tsx`):
- Dark background (matching wireframe)
- Top bar: logo (left, links back to landing page `/[lang]`), notifications + profile avatar (right)
- **Floating bottom nav** with 3 items (icons only, no emoji — use vector art/SVG icons):
  1. **Social** — reels feed, groups, discovery
  2. **Hrát** (center, prominent button) — expands upward to reveal 3 sub-items: Kampaň, Svět, Freeplay
  3. **Profil** — dropdown/popover with: stats, badges, settings (gear), pantry, shopping list, meal plan
- **Šéfkuchař (AI assistant)** — floating action button (circle) pinned to bottom-right corner, always visible on every game screen. Styled to match game aesthetic (e.g. chef hat icon, warm colors). Opens chat sidebar on click. NOT part of the bottom nav.
- Smooth client-side transitions between routes (shared layout = no full reload)
- **No emoji anywhere in the game UI** — use SVG icons / vector art throughout

**Three game modes:**
- **Kampaň (Campaign):** Interactive story node tree with butterfly-effect branching. Nodes = chapters with cutscenes + cooking levels. Own storyline about learning to cook through life situations.
- **Svět (World):** Stylized SVG world map (NOT political Leaflet map). Click region → sidebar with brief summary → enter region's own node tree with cultural storyline (learning about cuisine culture). Essentially "DLC packs" per region.
- **Freeplay:** Flat recipe browser. Filter by: official/verified/community, difficulty, time, cuisine, allergens, category. Search. No narrative wrapper.

**Node tree visualization:**
- Interactive graph of connected nodes (white + gold dots on dark background, per wireframe `image.png`).
- Shared visual component used by both Campaign and World region trees, but with different data/storylines.
- **Each node has:** main task (required recipe) + optional subtasks (additional recipes on same theme). Node shows completion % (0–100%).
- **Important nodes (branching points)** are visually distinct — larger size, different color/glow, or special border to signal upcoming story decisions.
- **Locked nodes** are visible but dimmed/greyed out with a lock icon.
- Connected by lines/edges showing the progression path and branches.

**Map (World mode):** Replacing current political Leaflet map with a playful, hand-drawn style SVG map. Options: `react-simple-maps` with custom styled topojson, or fully custom SVG. Must match the app's playful cooking aesthetic (warm colors, rounded shapes, food icons per region).

**Data flow:** `app/lib/mockRecipes.ts` is the single source of truth — an in-memory object keyed by ISO-2 country code (being progressively replaced by PostgreSQL-backed data from `schema.sql`). The API routes read from it:
- `GET /api/countries` — returns all countries that have recipes
- `GET /api/countries/[id]/recipes` — accepts ISO-2 code or country name, returns that country's recipes

**Map rendering (World mode only, legacy):** Leaflet requires `window`, so the map is split into two files:
- `WorldMapClient.tsx` — `"use client"` wrapper with `dynamic(..., { ssr: false })`
- `WorldMap.tsx` — actual Leaflet/react-leaflet component
- Planned migration from Leaflet to SVG-based approach for World mode

**Styling:** Tailwind v4 (configured via `postcss.config.mjs`, no separate config file needed). Component-level styles use CSS Modules (`WorldMap.module.css`). Brand colors are defined in `docs/color-palette.md`.

## Next.js version notes

This is Next.js 16 — it may have breaking changes vs. your training data. Always check `node_modules/next/dist/docs/` for current API reference. Known hint from docs: for slow client-side navigations, export `unstable_instant` from the route — Suspense alone is not enough (see `node_modules/next/dist/docs/index.md`).
