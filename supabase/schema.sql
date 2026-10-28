-- GameVerdict Supabase schema. Apply once in the Supabase SQL editor
-- (or via scripts/migrate.js). Safe to re-run: every object below is
-- idempotent (IF NOT EXISTS / DROP IF EXISTS / OR REPLACE).
--
-- Tables mirror localStorage keys so sync is a dumb upsert both ways:
--   gv:wishlist:v1       -> wishlist_items
--   gv:manual-games:v1   -> manual_games
--   gv:steam-library:v1  -> steam_libraries (one row per user: whole library blob)
--   gv:device:v1 + weekly hours -> prefs
--
-- Community + sharing tables (no localStorage equivalent):
--   ratings (+ rating_averages view), verdict_snapshots, watchlists
--   (watchlists are read by the future weekly price-drop cron)

-- gen_random_uuid() for snapshot ids (no-op on Supabase, needed elsewhere).
create extension if not exists "pgcrypto";

-- ---------- profiles (one row per auth user, auto-created on signup) ----------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  steam_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- wishlist (gv:wishlist:v1) ----------
create table if not exists wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id text not null,
  title text not null,
  price numeric check (price is null or price >= 0),
  added_at bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

-- ---------- manual backlog games (gv:manual-games:v1) ----------
create table if not exists manual_games (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  est_main_hrs numeric check (est_main_hrs is null or est_main_hrs > 0),
  playtime_mins numeric not null default 0 check (playtime_mins >= 0),
  added_at bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------- prefs (gv:device:v1 + weekly hours) ----------
create table if not exists prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_hours int check (weekly_hours is null or (weekly_hours >= 1 and weekly_hours <= 168)),
  device text,
  updated_at timestamptz not null default now()
);

-- ---------- owned Steam library (gv:steam-library:v1, one row per user) ----------
-- The library blob (persona + games array) is opaque to Postgres; the app
-- merges it client-side exactly like the other localStorage keys.
create table if not exists steam_libraries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  steam_id text,
  persona jsonb not null default '{}'::jsonb,
  games jsonb not null default '[]'::jsonb,
  game_count int not null default 0 check (game_count >= 0),
  imported_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------- community ratings (one row per user per game) ----------
create table if not exists ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_key text not null,
  title text,
  score numeric not null check (score >= 1 and score <= 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_key)
);

create or replace view rating_averages with (security_invoker = true) as
  select game_key,
         max(title) as title,
         round(avg(score)::numeric, 1) as avg_score,
         count(*) as votes
  from ratings group by game_key;

-- ---------- shareable verdict snapshots (?v= links) ----------
create table if not exists verdict_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  game_key text not null,
  title text not null,
  score int check (score is null or (score >= 0 and score <= 100)),
  badge text,
  card jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  view_count int not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now()
);

-- ---------- price-drop watchlist (cron reads these) ----------
create table if not exists watchlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_key text not null,
  title text not null,
  target_price numeric check (target_price is null or target_price > 0),
  webhook text,
  last_price numeric check (last_price is null or last_price >= 0),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_key)
);

-- ---------- auto-touch updated_at (keeps last-write-wins merges honest) ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- auto-create a profiles row on every signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_touch_profiles on profiles;
create trigger trg_touch_profiles before update on profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_wishlist on wishlist_items;
create trigger trg_touch_wishlist before update on wishlist_items
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_manual on manual_games;
create trigger trg_touch_manual before update on manual_games
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_prefs on prefs;
create trigger trg_touch_prefs before update on prefs
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_libraries on steam_libraries;
create trigger trg_touch_libraries before update on steam_libraries
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_ratings on ratings;
create trigger trg_touch_ratings before update on ratings
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_watchlists on watchlists;
create trigger trg_touch_watchlists before update on watchlists
  for each row execute function public.touch_updated_at();

-- ---------- indexes for the app's hot paths ----------
create index if not exists idx_wishlist_user on wishlist_items (user_id);
create index if not exists idx_manual_user on manual_games (user_id);
create index if not exists idx_ratings_game on ratings (game_key);
create index if not exists idx_snapshots_game on verdict_snapshots (game_key);
create index if not exists idx_snapshots_user on verdict_snapshots (user_id);
create index if not exists idx_watchlists_user on watchlists (user_id);

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table wishlist_items enable row level security;
alter table manual_games enable row level security;
alter table prefs enable row level security;
alter table steam_libraries enable row level security;
alter table ratings enable row level security;
alter table verdict_snapshots enable row level security;
alter table watchlists enable row level security;

-- Dropping first keeps the file re-runnable (CREATE POLICY has no IF NOT EXISTS).
drop policy if exists "owner all profiles" on profiles;
drop policy if exists "owner all wishlist" on wishlist_items;
drop policy if exists "owner all manual" on manual_games;
drop policy if exists "owner all prefs" on prefs;
drop policy if exists "owner all libraries" on steam_libraries;
drop policy if exists "owner all watchlists" on watchlists;
drop policy if exists "public read ratings" on ratings;
drop policy if exists "owner write ratings" on ratings;
drop policy if exists "public read snapshots" on verdict_snapshots;
drop policy if exists "auth create snapshots" on verdict_snapshots;
drop policy if exists "owner edit snapshots" on verdict_snapshots;

-- owner-only tables
create policy "owner all profiles" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "owner all wishlist" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner all manual" on manual_games
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner all prefs" on prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner all libraries" on steam_libraries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner all watchlists" on watchlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ratings: anyone reads the raw rows (averages view inherits this via
-- security_invoker), owners write their own rows
create policy "public read ratings" on ratings for select using (true);
create policy "owner write ratings" on ratings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- snapshots: public read for shared ?v= links (private rows stay owner-visible),
-- authenticated users insert their own, owners edit/delete their own
create policy "public read snapshots" on verdict_snapshots
  for select using (is_public = true or auth.uid() = user_id);
create policy "auth create snapshots" on verdict_snapshots
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);
create policy "owner edit snapshots" on verdict_snapshots
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner delete snapshots" on verdict_snapshots
  for delete using (auth.uid() = user_id);

-- ---------- PostgREST grants (without these the API returns empty/401) ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on profiles, wishlist_items, manual_games, prefs, steam_libraries,
     ratings, verdict_snapshots, watchlists
  to authenticated;
grant select on ratings, rating_averages, verdict_snapshots to anon;
