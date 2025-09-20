## Weather App — Flow & Feature Specification

> Clear, developer‑ready spec for a realtime weather application with onboarding, search, dashboards, caching, and accessibility.

---

## Table of Contents

1. [High‑Level Goals](#high-level-goals)
2. [User Flows](#user-flows)
3. [Screen‑by‑Screen Specification](#screen-by-screen-specification)
4. [Components & UI Layout](#components--ui-layout)
5. [Data Model & API Contract](#data-model--api-contract)
6. [Feature Implementation Details](#feature-implementation-details)
7. [State Management & Architecture](#state-management--architecture)
8. [Offline, Caching & Realtime](#offline-caching--realtime)
9. [Accessibility, Localization & Timezones](#accessibility-localization--timezones)
10. [Error Handling & Edge Cases](#error-handling--edge-cases)
11. [Testing Checklist](#testing-checklist)
12. [Security & Privacy](#security--privacy)
13. [Acceptance Criteria](#acceptance-criteria)
14. [Mock / Sample Payloads](#mock--sample-payloads)
15. [Database Schema (Supabase)](#database-schema-supabase)
16. [Project Folder Structure (Expo Router)](#project-folder-structure-expo-router)
17. [Step-by-Step Build Guide](#step-by-step-build-guide)

---

## High‑Level Goals

- **Realtime accuracy**: Show current conditions for the user’s location and searched cities.
- **Clear dashboard**: Current conditions, 24‑hour (3‑hour steps) hourly panel, 5‑day forecast.
- **Unit toggle**: Fast Celsius ↔ Fahrenheit switch with persisted preference.
- **Dynamic visuals**: Background gradients reflecting weather and day/night.
- **Performance**: Fast, offline‑friendly (last known data), accessible, easy to extend.

---

##Tech Stack:
Frontend: React Native with TypeScript, Expo, and Expo Router
Backend/Database: Supabase
UI Framework: React Native Paper
AI Processing: DeepSeek


## User Flows

### A. First‑Time User

1. Launch → Welcome screen (brand + short copy + CTA: Sign up / Sign in).
2. Email sign up (email + password or passwordless link).
3. Post‑signup: request location permission.
   - If allowed → fetch location → main dashboard for current location.
   - If denied → focus search input and show enable‑location hint.

### B. Returning User

1. Launch → splash/brief animation → main dashboard.
2. Load cached data immediately; fetch fresh data in the background.
3. Use top search bar to find any city → open city weather.
4. Toggle units (C°/F°) via top‑right button; temperatures update instantly.

### C. Hourly Interactions

- Horizontal, scrollable hourly forecast. Tap a card to see details (precip %, wind).

### D. Settings

- Units, account, data refresh interval, privacy & location preferences.

---

## Screen‑by‑Screen Specification

### 1) Welcome / Onboarding

- Elements: App logo, one‑line description, “Sign up with email”, “Sign in”.
- Optional: “Continue as guest” (search enabled; local weather requires permission).

### 2) Email Sign Up / Sign In

- Email + password (or email‑only magic link). Validate input and verify email.
- After success, request geolocation permission.

### 3) Main Dashboard (post‑auth)

- Layout: Top search bar + suggestion, top‑right unit toggle (C°/F°).
- Primary weather card for active city (current location by default).
- Below: horizontal hourly forecast (scrollable), then 5‑day forecast list.

Primary Weather Card includes:

- City name + country
- Local date & time (city timezone)
- Big temperature (current) + “feels like”
- Weather description and icon (SVG)
- Dynamic background
- Row: humidity (%), wind speed (user units), pressure (hPa/inHg), sunrise & sunset (local times)

Hourly (next 24h, 3‑hour intervals):

- Horizontally scrollable cards with local time (e.g., 15:00), icon, temperature, precip chance (%).

Five‑Day Forecast:

- Compact tiles showing day name (Mon), icon, expected high/low or single temp.

### 4) City Detail (from search)

- Expanded primary card; optional: extended 7‑day forecast, air quality, historical charts.

### 5) Settings

- Unit toggle, refresh interval, account management, privacy (delete account), help & feedback.

---

## Components & UI Layout

```
App
├─ AuthStack
│  └─ WelcomeScreen
├─ MainStack
│  ├─ Header (SearchBar + UnitToggle + ProfileButton)
│  ├─ WeatherDashboard
│  │  ├─ PrimaryWeatherCard
│  │  ├─ HourlyScroll (horizontal list of HourlyCard)
│  │  └─ FiveDayForecast (list of DayCard)
│  └─ BottomNav (optional: Home, Map, Settings)
└─ Modals (LocationPermissionModal, ErrorModal)
```

**Key components**

- `SearchBar`: autocomplete, debounce, suggestions
- `UnitToggle`: C/F switch
- `PrimaryWeatherCard`: responsive, large
- `HourlyScroll`: virtualized horizontal list
- `FiveDayForecast`: compact day tiles
- `BackgroundManager`: gradient + transitions
- `LocationManager`: permission prompts + fallback

Styling notes:

- Fluid layout; primary card top, hourly scroll overlays lower portion.
- Smooth gradient transitions on weather or day/night change.
- Provide light/dark compatibility for UI chrome.

---

## Data Model & API Contract

> Maintain a standardized internal model (`current`, `hourly`, `daily`) so providers can be swapped.

TypeScript‑style types (pseudocode):

```ts
type Coordinates = { lat: number; lon: number }

type City = {
  id?: string | number
  name: string
  country?: string
  coords: Coordinates
  timezone: string // IANA tz name (e.g., "Europe/Paris")
  tz_offset: number // seconds offset from UTC
}

type CurrentWeather = {
  tempC: number
  tempF: number
  feelsLikeC: number
  feelsLikeF: number
  humidity: number // %
  windSpeedMs: number
  windSpeedKmh: number
  pressureHpa: number
  weatherCode: number
  weatherDescription: string
  weatherIcon: string
  sunrise: number // epoch UTC
  sunset: number // epoch UTC
  lastUpdated: number // epoch UTC when fetched
}

type HourlyEntry = {
  time: number // epoch UTC
  tempC: number
  tempF: number
  precipProb?: number // 0..100
  windSpeedMs: number
  weatherCode: number
}

type DailyEntry = {
  date: number // epoch UTC at local midnight
  tempMinC: number
  tempMaxC: number
  tempMinF: number
  tempMaxF: number
  weatherCode: number
}

type WeatherPayload = {
  city: City
  current: CurrentWeather
  hourly: HourlyEntry[]
  daily: DailyEntry[]
}
```

API provider recommendations:

- Choose a provider with current, hourly, daily, and timezone data.
- Include location name, coordinates, timezone or offset.
- Consider a lightweight backend proxy to hide keys, add rate limits, caching, and combine providers.

---

## Feature Implementation Details

### 1) Fetching Realtime Weather

- On app active/foreground: request fresh data for active city.
- Poll current weather every 5–15 minutes (default 15; configurable in settings).
- Use stale‑while‑revalidate: show cached data immediately, then replace with fresh.

### 2) Temperature & Unit Toggling (C°/F°)

- Store canonical temps in metric (C) and convert for display.
- Persist user preference in local storage and profile (if authenticated).
- Update all visible temperatures on toggle: current, feels like, hourly, daily.

Conversion formulas:

```
To Fahrenheit: F = C * 9/5 + 32
To Celsius:    C = (F - 32) * 5/9
```

### 3) Hourly Forecast (24h, 3‑Hour Steps)

- If hourly‑by‑hour, group into 3‑hour buckets; if provider is 3‑hourly, take first 8 entries.

Pseudocode:

```js
const hourly = api.hourly;
const now = Date.now() / 1000;
const next24 = hourly.filter(h => h.time >= now).slice(0, 24);
const grouped = [];
for (let i = 0; i < next24.length; i += 3) {
  grouped.push(next24[i]); // or aggregate i..i+2
}
// use first 8 grouped entries
```

UI: horizontally scrollable fixed‑width cards; virtualize for performance.

### 4) Five‑Day Forecast

- Use `daily` data; compute local day names via `Intl.DateTimeFormat` and the city timezone.
- Tile shows day name, icon, high/low (or single forecast temp), short description.

### 5) Sunrise & Sunset (Local Time)

- Convert UTC epoch using timezone offset or IANA tz with `Intl.DateTimeFormat`.

Example (JS):

```js
const local = new Date((sunriseEpoch + tzOffsetSeconds) * 1000);
// Or use Intl.DateTimeFormat with timeZone
```

### 6) Dynamic Backgrounds

- Map weather condition + day/night to gradient keys:
  - `clear_day`, `clear_night`, `partly_cloudy_day`, `partly_cloudy_night`, `cloudy`, `rain`, `thunderstorm`, `snow`, `fog`.
- Use provider `weatherCode` to map.
- Implement via CSS gradients (web) or animated overlays (mobile).
- Smooth cross‑fade (200–600ms); respect reduced‑motion preference.

Example gradients (subject to design tuning):

- `clear_day`: #FFD87A → #FF9F43
- `clear_night`: #2C3E50 → #4CA1AF
- `rain`: #4E6E8E → #2C3A47
- `snow`: #E6F0FA → #BBD1EA

### 7) Search & Autocomplete

- Debounce 300–500ms; use geocoding/autocomplete (lat/lon + name).
- Show suggestions with country (and state when relevant).
- On selection: fetch weather for coordinates; add to recent searches.

### 8) Geolocation & Fallbacks

- Primary: system geolocation with clear pre‑prompt context.
- Fallback: IP‑based lookup (less accurate) or manual search.

### 9) Caching & Offline Behavior

- Cache last successful payload per city (IndexedDB/web, SQLite/mobile).
- On start: display cached payload, then fetch fresh.
- Show indicator when data is stale (age in minutes); use exponential backoff on repeated failures.

### 10) Realtime Refresh Cadence

- Current conditions: every 5–15 minutes.
- Forecast: every 30–60 minutes.
- Optional: backend‑driven alerts via push notifications.

---

## State Management & Architecture

- **Single source of truth**: keep `activeCity` and `unit` at app root; consumers subscribe.
- **Cache layer**: `WeatherRepository` handles network, transform, caching, rate limiting.
- **Separation of concerns**: presentational components; logic in hooks/services/managers.
- **Suggested stacks**:
  - Web: React + Redux/RTK Query or React Query + TypeScript.
  - Mobile: React Native + Zustand/Redux/React Query OR Flutter + Riverpod.
- **Optional backend**: proxy to hide API keys, combine providers, push alerts.

---

## Offline, Caching & Realtime

- Stale‑while‑revalidate UX: show cached immediately; shimmer only if no data.
- Maintain `lastUpdated`; warn when older than 1 hour.
- Use exponential backoff for retries.
- Mobile: schedule background refreshes (platform APIs).

---

## Accessibility, Localization & Timezones

- Semantic HTML / native a11y APIs; ARIA labels for interactive controls.
- Respect reduced motion preference.
- Localize day names and time using `Intl.DateTimeFormat` with city timezone.
- Prefer IANA timezone names (e.g., `America/Chicago`). If only offset, convert and document DST ambiguity.

---

## Error Handling & Edge Cases

Common errors:

- Location permission denied → CTA to enable or search manually.
- City not found → “No results” with suggestions.
- Network error → show cached data + prominent retry.
- Rate limited → informative message + exponential backoff.

Edge cases:

- Duplicate city names → show country + state; expose coordinates.
- Polar day/night → sunrise/sunset may be missing; display: “No sunrise/sunset this date”.
- Timezone transitions (DST) → rely on IANA tz names.

---

## Testing Checklist

Unit tests:

- Temperature conversions (C↔F)
- Wind conversions (m/s ↔ km/h)
- Timezone + sunrise/sunset conversions
- Grouping hourly into 3‑hour buckets

Integration tests:

- API parsing and model mapping

E2E tests:

- Login, location permission flows, search/autocomplete, unit toggle, hourly scroll behavior

Accessibility tests:

- Keyboard navigation, screen reader labels, color contrast

---

## Security & Privacy

- Never store passwords in plain text; use secure auth or hashed storage.
- If storing location, request explicit permission; provide a settings toggle to clear stored locations.
- Backend proxy: secure API keys and rate‑limit clients.
- Comply with local privacy laws (GDPR/CCPA) if collecting PII.

---

## Acceptance Criteria

Minimum Viable Product (MVP):

- [ ] Welcome screen and email signup/signin
- [ ] Request/handle location permission; show local weather after grant
- [ ] Search bar with autocomplete; view a city’s weather
- [ ] Display current weather (temp, feels like, humidity, wind, pressure, sunrise/sunset)
- [ ] Hourly 24‑hour forecast in 3‑hour intervals (horizontal scroll)
- [ ] Five‑day forecast with day‑of‑week, icon, temperature
- [ ] Unit toggle (C°/F°) persists between launches
- [ ] Dynamic background gradients (weather + day/night)
- [ ] Cache last payload and show stale indicator

Polish & extras:

- Smooth background transitions
- Offline support and background refresh
- Accessibility audit passed
- Tests for conversions & API parsing

---

## Mock / Sample Payloads

Simplified `WeatherPayload` example:

```json
{
  "city": {
    "name": "Paris",
    "country": "FR",
    "coords": { "lat": 48.8566, "lon": 2.3522 },
    "timezone": "Europe/Paris",
    "tz_offset": 7200
  },
  "current": {
    "tempC": 18.3,
    "tempF": 64.94,
    "feelsLikeC": 17.2,
    "humidity": 72,
    "windSpeedMs": 4.5,
    "pressureHpa": 1017,
    "weatherCode": 500,
    "weatherDescription": "Light rain",
    "sunrise": 1694475600,
    "sunset": 1694518800,
    "lastUpdated": 1694482800
  },
  "hourly": [],
  "daily": []
}
```

Notes for UI testing:

- Prepare mocked arrays for `hourly` and `daily` with diverse `weatherCode`s to exercise `BackgroundManager` and icons.

---

## Developer Tips & Gotchas

- Centralize conversions and timezone helpers in a single utility module with tests.
- Use SVG icons; provide fallbacks.
- On unit switch, always compute from canonical values (do not re‑fetch).
- Prefer native `Intl` over heavy datetime libraries; if needed, use `luxon` or `date‑fns‑tz` sparingly.
- Keep provider code→app status mapping deterministic and centralized.

---

## Next Steps (Implementation Plan)

1. Define internal types and the `WeatherRepository` contract.
2. Build `PrimaryWeatherCard` and `HourlyScroll` using mock data.
3. Integrate geocoding and the chosen weather API behind a proxy service.
4. Implement unit toggle with persisted preference.
5. Implement background manager and initial gradient set.
6. Add caching, stale indicator, and tests.

Optional deliverables on request:

- Component templates for `PrimaryWeatherCard`, `HourlyScroll`, `BackgroundManager` (React/Flutter)
- Mock JSON with 24h and 7d data
- Lightweight backend proxy specification (combine providers, hide API keys)



---

## Database Schema (Supabase)

> Postgres schema tailored for Supabase with RLS enabled. Auth is handled by Supabase Auth; we keep a `profiles` table keyed by `auth.uid()` and user‑scoped data tables. Replace `weather_provider` as needed.

```sql
-- Extensions (enable if not already)
create extension if not exists pgcrypto;
create extension if not exists vector; -- optional, if doing semantic search for cities

-- Helper: updated_at trigger function (idempotent)
do $$ begin
  create or replace function public.set_current_timestamp_updated_at()
  returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;
exception when duplicate_function then null; end $$;

-- 1) profiles: one row per authenticated user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_current_timestamp_updated_at();

-- 2) user_settings: preferences like units, refresh interval, privacy flags
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  temp_unit text not null default 'C', -- 'C' | 'F'
  wind_unit text not null default 'kmh', -- 'kmh' | 'ms' | 'mph'
  refresh_current_minutes int not null default 15,
  refresh_forecast_minutes int not null default 60,
  allow_location_storage boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.set_current_timestamp_updated_at();

-- 3) locations: saved or frequently accessed cities per user
create table if not exists public.locations (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  country text,
  admin1 text, -- state/province
  lat double precision not null,
  lon double precision not null,
  timezone text,
  provider text default 'weather_provider',
  provider_id text, -- optional provider city id
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name, admin1, country, lat, lon)
);
create index if not exists idx_locations_user_id on public.locations(user_id);
create index if not exists idx_locations_coords on public.locations(lat, lon);
create trigger set_locations_updated_at
  before update on public.locations
  for each row execute procedure public.set_current_timestamp_updated_at();

-- 4) recent_searches: quick access to last searched cities
create table if not exists public.recent_searches (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  country text,
  admin1 text,
  lat double precision not null,
  lon double precision not null,
  searched_at timestamptz not null default now()
);
create index if not exists idx_recent_searches_user_time on public.recent_searches(user_id, searched_at desc);

-- 5) weather_cache: last known payload per user+location (stale‑while‑revalidate)
create table if not exists public.weather_cache (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id bigint not null references public.locations(id) on delete cascade,
  payload jsonb not null,
  last_updated timestamptz not null,
  created_at timestamptz not null default now(),
  constraint uniq_weather_cache unique(user_id, location_id)
);
create index if not exists idx_weather_cache_updated on public.weather_cache(last_updated desc);

-- 6) refresh_logs: optional diagnostics for auto refresh
create table if not exists public.refresh_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id bigint references public.locations(id) on delete set null,
  kind text not null, -- 'current' | 'forecast'
  success boolean not null,
  status_code int,
  duration_ms int,
  created_at timestamptz not null default now()
);
create index if not exists idx_refresh_logs_user_time on public.refresh_logs(user_id, created_at desc);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.locations enable row level security;
alter table public.recent_searches enable row level security;
alter table public.weather_cache enable row level security;
alter table public.refresh_logs enable row level security;

-- RLS Policies
create policy profiles_select_self on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_self on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_self on public.profiles for update using (auth.uid() = id);

create policy user_settings_rw on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy locations_rw on public.locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy recent_searches_rw on public.recent_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy weather_cache_rw on public.weather_cache
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy refresh_logs_rw on public.refresh_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Notes:

- Store canonical temps in metric within `payload`; UI converts on toggle.
- `weather_cache.payload` follows the internal `WeatherPayload` model.
- Use `last_updated` for stale indicators and refresh cadence.
- `locations` uniqueness prevents duplicates while allowing identical names in different regions.

---

## Project Folder Structure (Expo Router)

> Scalable structure for React Native + Expo Router, TypeScript, React Query/Zustand (or Redux), and Supabase.

```
.
├─ app/
│  ├─ (auth)/
│  │  ├─ sign-in.tsx
│  │  ├─ sign-up.tsx
│  │  └─ welcome.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx
│  │  ├─ search.tsx
│  │  └─ settings.tsx
│  ├─ city/
│  │  └─ [id].tsx
│  ├─ modals/
│  │  ├─ location-permission.tsx
│  │  └─ error.tsx
│  └─ _layout.tsx
├─ assets/
│  ├─ icons/
│  ├─ images/
│  └─ lottie/
├─ components/
│  ├─ SearchBar.tsx
│  ├─ UnitToggle.tsx
│  ├─ cards/
│  │  ├─ PrimaryWeatherCard.tsx
│  │  ├─ HourlyCard.tsx
│  │  └─ DayCard.tsx
│  └─ layout/
│     └─ BackgroundManager.tsx
├─ features/
│  ├─ weather/
│  │  ├─ api/
│  │  │  ├─ weatherRepository.ts
│  │  │  └─ providers/
│  │  │     ├─ openWeather.ts
│  │  │     └─ metNo.ts
│  │  ├─ hooks/
│  │  │  ├─ useWeather.ts
│  │  │  └─ useBackgroundGradient.ts
│  │  ├─ model/
│  │  │  ├─ types.ts
│  │  │  └─ mappers.ts
│  │  └─ components/
│  │     ├─ HourlyScroll.tsx
│  │     └─ FiveDayForecast.tsx
│  ├─ search/
│  │  ├─ api/geocoding.ts
│  │  ├─ hooks/useCitySearch.ts
│  │  └─ components/SearchResults.tsx
│  └─ settings/
│     ├─ hooks/useSettings.ts
│     └─ components/SettingsForm.tsx
├─ hooks/
│  ├─ useDebounce.ts
│  └─ useLocationManager.ts
├─ lib/
│  ├─ supabase.ts
│  ├─ queryClient.ts
│  └─ storage.ts
├─ services/
│  ├─ geolocation.ts
│  ├─ backgroundRefresh.ts
│  └─ notifications.ts
├─ store/
│  ├─ unitSlice.ts
│  └─ activeCitySlice.ts
├─ theme/
│  ├─ colors.ts
│  ├─ gradients.ts
│  └─ paperTheme.ts
├─ utils/
│  ├─ conversions.ts
│  ├─ dateTime.ts
│  └─ weatherCodeMap.ts
├─ types/
│  └─ index.ts
├─ tests/
│  ├─ conversions.test.ts
│  └─ mappers.test.ts
├─ scripts/
│  └─ seedCities.ts
├─ app.config.ts
├─ tsconfig.json
├─ package.json
└─ README.md
```

Guidelines:

- Organize by feature under `features/` with local models, hooks, and components.
- Cross‑cutting concerns live in `lib/`, `services/`, `utils/`, and `store/`.
- Wire providers in `app/_layout.tsx` (React Query, Paper theme, SafeArea, etc.).
- Avoid deep nesting; prefer small, cohesive modules.


---

## Step-by-Step Build Guide

> Follow this sequence. Each step stands alone and unblocks the next.

### Step 1 — Project Initialization & Tooling

Goals:

- Create Expo project (TypeScript), install core libraries, and set up providers.

Commands (run in project root):

```bash
pnpm create expo@latest weather-app --template expo-template-blank-typescript
cd weather-app
pnpm add @tanstack/react-query zustand @react-native-async-storage/async-storage
pnpm add react-native-paper react-native-safe-area-context react-native-svg
pnpm add @expo/vector-icons
pnpm add @supabase/supabase-js
pnpm add zod date-fns
pnpm add expo-router
pnpm expo install expo-constants expo-linking expo-location
```

Project wiring:

- Create `lib/queryClient.ts` and `lib/supabase.ts` singletons.
- Create `theme/paperTheme.ts` and `theme/gradients.ts`.
- Wrap providers in `app/_layout.tsx` (PaperProvider, QueryClientProvider, SafeAreaProvider).

Example provider layout (`app/_layout.tsx`):

```tsx
import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { paperTheme } from "../theme/paperTheme";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <Slot />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

Environment variables:

- Add Supabase keys to `.env` and load via `expo-constants`.

Files to create/edit in this step:

- `lib/queryClient.ts`, `lib/supabase.ts`
- `theme/paperTheme.ts`, `theme/gradients.ts`
- `app/_layout.tsx`

Outcome:

- App boots with theming, safe areas, and React Query ready.

---

### Step 2 — Supabase Setup (Auth, Schema, Env)

Goals:

- Configure Supabase project, apply database schema, and wire environment variables.

Steps:

1. Create a Supabase project (`Project Settings → API` copy `URL` and `anon` key).
2. Apply the SQL from [Database Schema (Supabase)](#database-schema-supabase) in the SQL editor.
3. Add to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. `lib/supabase.ts` should read from `process.env.EXPO_PUBLIC_*`.
5. In `app/(auth)/sign-in.tsx` and `sign-up.tsx`, implement email/password auth using `@supabase/supabase-js`.

Outcome:

- Users can create accounts and sign in; RLS protects per‑user data.

---

### Step 3 — Internal Weather Types & Repository (Mock)

Goals:

- Define `features/weather/model/types.ts` and a `weatherRepository.ts` with mock data returning `WeatherPayload`.

Steps:

1. Create types matching [Data Model & API Contract](#data-model--api-contract).
2. Implement `getCurrentAndForecast(coords)` returning mocked payloads.
3. Add `hooks/useWeather.ts` that fetches via React Query.

Outcome:

- Dashboard can render with mock data without network dependencies.

---

### Step 4 — Primary Card & Hourly Scroll (Mock Data)

Goals:

- Implement `PrimaryWeatherCard`, `HourlyScroll`, and `FiveDayForecast` reading from mocked `useWeather`.

Steps:

1. Build components under `components/cards/` and `features/weather/components/`.
2. Wire them into `app/(tabs)/index.tsx`.
3. Add basic styling and icons; verify responsive layout.

Outcome:

- Main dashboard UI functional with mock data.

---

### Step 5 — Geocoding + Weather API (Proxy Pattern)

Goals:

- Integrate geocoding and chosen weather provider behind a small proxy (or direct if keys are public‑safe in backend only).

Steps:

1. Implement `features/search/api/geocoding.ts` (debounced search, suggestions).
2. Implement provider in `features/weather/api/providers/` and map to internal model in `mappers.ts`.
3. Replace mock repository calls with real network calls; keep caching in place.

Outcome:

- Search returns real cities; dashboard shows real weather.

---

### Step 6 — Unit Toggle & Persistence

Goals:

- Add C/F toggle, persist in `user_settings` (Supabase) and local storage for quick boot.

Steps:

1. Implement `store/unitSlice.ts` (or settings hook) with optimistic updates.
2. Persist locally via `AsyncStorage`; sync to Supabase when online.
3. Ensure all temperatures update instantly across UI.

Outcome:

- Unit preference persists and updates app‑wide.

---

### Step 7 — BackgroundManager & Gradients

Goals:

- Implement dynamic gradients keyed by weather code + day/night with smooth transitions.

Steps:

1. Add gradient maps to `theme/gradients.ts`.
2. Implement `BackgroundManager` with reduced‑motion support.
3. Hook into `useBackgroundGradient` based on current weather state.

Outcome:

- Visuals adapt to weather and time with smooth transitions.

---

### Step 8 — Caching, Stale Indicator, and Tests

Goals:

- Cache payloads, show stale indicators, and add key tests.

Steps:

1. Cache last payload in `weather_cache` (remote) and AsyncStorage (local).
2. Show “last updated X min ago” and refresh cadence.
3. Add tests: conversions, timezone helpers, mappers, hourly grouping.

Outcome:

- App is resilient offline, performant, and test‑covered.

