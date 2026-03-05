# Crisis Resource Map

**Crowdsourced emergency resource locator** — find and share shelters, water, food, medical aid, WiFi, and transport in conflict zones via an interactive real-time map.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Last commit](https://img.shields.io/github/last-commit/RishabhSinha07/crisis-resource-map)](https://github.com/RishabhSinha07/crisis-resource-map/commits/main)

## Demo

https://github.com/user-attachments/assets/7c50f8f3-b81b-49f2-a1cc-24f600016953

---

## Why Crisis Resource Map?

| Problem | Solution |
|---------|----------|
| Emergency resources are scattered across word-of-mouth and social media | **Single interactive map** with all resources pinned and categorized |
| No way for civilians to contribute real-time information | **Crowdsourced submissions** — anyone can pin a resource on the map |
| Existing tools don't work without internet | **Offline-first PWA** with tile caching, queued submissions, and service worker |
| Language barriers in multilingual conflict zones | **4 languages** (English, Arabic, Ukrainian, French) with full RTL support |
| Hard to distinguish reliable from outdated information | **Community voting** with automatic flagging of unreliable resources |

---

## Key Features

### Interactive Map

- **6 resource categories** — Shelter, Water, Food, Medical, WiFi, Transport — each with distinct color-coded markers
- **Marker clustering** — groups nearby resources at low zoom, expands on zoom in (via `react-leaflet-cluster`)
- **Geocoded search** — find any city or place with Nominatim-powered location search
- **Geolocation** — one-tap "locate me" button with accuracy radius visualization
- **Light/Dark mode** — toggle between CartoDB Dark Matter and Voyager tile layers with full UI theme switching, persisted in `localStorage` with system preference detection

### Crowdsourced Resource Submissions

- **Pin placement workflow** — crosshair cursor mode lets users tap the map to place a resource pin
- **Structured form** — title, type, description, and contact info with validation
- **Offline queue** — submissions made without internet are stored in IndexedDB and synced automatically when connectivity returns
- **Real-time updates** — new resources appear immediately via Supabase Realtime subscriptions

### Community Voting & Moderation

- **Upvote/downvote** — community members vote on resource accuracy
- **Fingerprint-based deduplication** — prevents duplicate votes using browser fingerprinting (FingerprintJS)
- **Atomic vote toggling** — PostgreSQL function handles vote switching and removal in a single transaction
- **Auto-flagging** — resources with >60% downvote ratio (minimum 5 votes) are automatically flagged

### Offline-First PWA

- **Installable** — add to home screen on mobile or install as desktop app
- **Tile caching** — save map areas for offline browsing (up to 500 tiles, 30-day TTL, CacheFirst strategy)
- **API caching** — resource data cached via NetworkFirst strategy with 5-second timeout fallback
- **Offline submission queue** — resources queued locally and synced when back online

### Internationalization

- **4 languages** — English, Arabic (العربية), Ukrainian (Українська), French (Français)
- **RTL support** — full right-to-left layout for Arabic, including map controls and dropdown positioning
- **Locale-aware routing** — URL-based locale switching (`/en`, `/ar`, `/uk`, `/fr`)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client (PWA)                     │
│                                                      │
│  Next.js 16 + React 19 + Tailwind 4 + Zustand       │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐    │
│  │ Map View │ │ Filters  │ │ Resource Drawer    │    │
│  │ (Leaflet)│ │ & Search │ │ (Add/Vote/Browse)  │    │
│  └──────────┘ └──────────┘ └───────────────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐    │
│  │ Theme    │ │ i18n     │ │ Service Worker     │    │
│  │ Store    │ │(next-intl)│ │ (Serwist)         │    │
│  └──────────┘ └──────────┘ └───────────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Next.js API Routes                  │
│  /api/resources (GET, POST)  ·  /api/votes (POST)   │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                     Supabase                         │
│  PostgreSQL + Row Level Security + Realtime          │
│  ┌────────────┐  ┌────────┐  ┌──────────────────┐   │
│  │ resources  │  │ votes  │  │ cast_vote() RPC  │   │
│  └────────────┘  └────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Map | Leaflet + react-leaflet, CartoDB tiles |
| State | Zustand |
| Database | Supabase (PostgreSQL + Realtime + RLS) |
| i18n | next-intl (4 locales, RTL) |
| PWA | Serwist (service worker, tile caching) |
| Auth | FingerprintJS (anonymous vote dedup) |
| Language | TypeScript 5 |

---

## Quick Start

```bash
# Clone
git clone https://github.com/RishabhSinha07/crisis-resource-map.git
cd crisis-resource-map

# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Your Supabase anonymous key
```

### Database Setup

Run the schema in your Supabase SQL editor:

```bash
# Found at supabase/schema.sql
# Creates: resources table, votes table, cast_vote() RPC,
#          RLS policies, indexes, and realtime subscription
```

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n-aware pages (layout + map client)
│   ├── api/
│   │   ├── resources/      # GET/POST resources
│   │   └── votes/          # POST vote (cast_vote RPC)
│   ├── globals.css         # CSS variables (dark/light themes)
│   └── sw.ts               # Service worker (Serwist)
├── components/
│   ├── filters/            # FilterBar, SearchBar
│   ├── map/                # MapView, ResourceMarker, LocateButton, SaveOfflineButton
│   ├── resources/          # AddResourceDrawer, VoteButtons
│   └── ui/                 # LanguagePicker, ThemeToggle, OfflineBanner
├── hooks/                  # useResources, useFingerprint
├── i18n/                   # next-intl routing & request config
├── lib/                    # Constants, types, Supabase client, tile cache, marker icons
├── messages/               # Locale JSON files (en, ar, uk, fr)
└── stores/                 # Zustand stores (map, resource, theme)
```

---

## Resource Types

| Type | Color | Symbol | Description |
|------|-------|--------|-------------|
| Shelter | Blue | S | Emergency housing, community centers |
| Water | Cyan | W | Clean water access points |
| Food | Green | F | Food distribution, community kitchens |
| Medical | Red | + | Clinics, pharmacies, first aid |
| WiFi | Purple | @ | Internet access points |
| Transport | Amber | T | Evacuation routes, bus stops |

---

## Contributing

```bash
# Development
npm run dev         # Start dev server (Turbopack)
npm run build       # Production build
npm run lint        # ESLint
```

Contributions welcome — open an issue or submit a PR.

---

## License

MIT

---

Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/).
