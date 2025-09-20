-- Weather App Database Schema for Supabase
-- Apply this in Supabase SQL Editor

-- Extensions (enable if not already)
create extension if not exists pgcrypto;
create extension if not exists vector; -- optional, if doing semantic search for cities

-- Helper: updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  provider text default 'open_meteo',
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