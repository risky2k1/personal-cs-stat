create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.steam_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  steam_id text not null,
  persona_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, steam_id)
);

create table public.match_tracking_credentials (
  id uuid primary key default gen_random_uuid(),
  steam_account_id uuid not null references public.steam_accounts(id) on delete cascade,
  encrypted_auth_code text not null,
  latest_known_match_token text,
  latest_known_share_code text,
  code_issued_at date,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  share_code text unique,
  demo_url text,
  demo_storage_path text,
  map_name text,
  game_mode text,
  started_at timestamptz,
  duration_seconds int,
  team_a_score int,
  team_b_score int,
  status text not null default 'pending' check (
    status in ('pending', 'fetching_demo', 'demo_downloaded', 'parsing', 'parsed', 'failed')
  ),
  parse_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  steam_id text not null,
  player_name text,
  team_name text,
  side_start text check (side_start is null or side_start in ('ct', 't')),
  is_tracked_player boolean not null default false,
  created_at timestamptz not null default now(),
  unique(match_id, steam_id)
);

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  round_number int not null check (round_number > 0),
  start_tick int,
  freeze_end_tick int,
  end_tick int,
  winning_side text check (winning_side is null or winning_side in ('ct', 't')),
  winning_team text,
  end_reason text,
  bomb_planted boolean not null default false,
  created_at timestamptz not null default now(),
  unique(match_id, round_number)
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  round_id uuid references public.rounds(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'kill',
      'death',
      'assist',
      'damage',
      'grenade_throw',
      'flash_assist',
      'bomb_plant',
      'bomb_defuse',
      'round_start',
      'round_end',
      'clutch_start',
      'clutch_win',
      'clutch_loss'
    )
  ),
  tick int not null,
  time_seconds numeric,
  actor_steam_id text,
  target_steam_id text,
  weapon text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  steam_id text not null,
  kills int not null default 0,
  deaths int not null default 0,
  assists int not null default 0,
  adr numeric,
  kast numeric,
  hs_percent numeric,
  utility_damage int not null default 0,
  flash_assists int not null default 0,
  enemies_flashed int not null default 0,
  opening_kills int not null default 0,
  opening_deaths int not null default 0,
  trade_kills int not null default 0,
  traded_deaths int not null default 0,
  clutch_attempts int not null default 0,
  clutch_wins int not null default 0,
  impact_score numeric,
  created_at timestamptz not null default now(),
  unique(match_id, steam_id)
);

create table public.timeline_markers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  round_id uuid references public.rounds(id) on delete cascade,
  event_id uuid references public.match_events(id) on delete set null,
  steam_id text,
  marker_type text not null check (
    marker_type in (
      'kill',
      'death',
      'assist',
      'multi_kill',
      'clutch',
      'bomb_plant',
      'bomb_defuse',
      'round_win',
      'round_loss',
      'highlight'
    )
  ),
  label text,
  icon text check (
    icon is null
    or icon in ('crosshair', 'skull', 'assist', 'bomb', 'defuse', 'star', 'fire')
  ),
  tick int not null,
  time_seconds numeric not null,
  severity text not null default 'normal' check (
    severity in ('low', 'normal', 'high', 'highlight')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.analysis_reports (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  steam_id text not null,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  unique(match_id, steam_id)
);

create table public.highlight_candidates (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  round_id uuid references public.rounds(id) on delete cascade,
  steam_id text not null,
  highlight_type text not null,
  start_tick int not null,
  end_tick int not null,
  start_time_seconds numeric not null,
  end_time_seconds numeric not null,
  score numeric not null default 0,
  title text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.user_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  steam_account_id uuid references public.steam_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, match_id)
);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function private.owns_steam_account(steam_account_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.steam_accounts sa
    where sa.id = steam_account_uuid
      and sa.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_match_access(match_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_matches um
    where um.match_id = match_uuid
      and um.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_player_access(match_uuid uuid, player_steam_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_matches um
    join public.steam_accounts sa
      on sa.id = um.steam_account_id
    where um.match_id = match_uuid
      and um.user_id = (select auth.uid())
      and sa.steam_id = player_steam_id
  );
$$;

create index steam_accounts_user_id_idx on public.steam_accounts (user_id);
create index steam_accounts_steam_id_idx on public.steam_accounts (steam_id);
create index match_tracking_credentials_steam_account_id_idx on public.match_tracking_credentials (steam_account_id);
create index matches_status_started_at_idx on public.matches (status, started_at desc);
create index match_players_match_id_idx on public.match_players (match_id);
create index rounds_match_id_idx on public.rounds (match_id);
create index match_events_match_id_time_idx on public.match_events (match_id, time_seconds);
create index match_events_round_id_idx on public.match_events (round_id);
create index player_match_stats_match_id_idx on public.player_match_stats (match_id);
create index timeline_markers_match_id_time_idx on public.timeline_markers (match_id, time_seconds);
create index analysis_reports_match_id_idx on public.analysis_reports (match_id);
create index highlight_candidates_match_id_time_idx on public.highlight_candidates (match_id, start_time_seconds);
create index user_matches_user_id_idx on public.user_matches (user_id);
create index user_matches_match_id_idx on public.user_matches (match_id);
create index user_matches_steam_account_id_idx on public.user_matches (steam_account_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

create trigger set_steam_accounts_updated_at
before update on public.steam_accounts
for each row
execute function private.set_updated_at();

create trigger set_match_tracking_credentials_updated_at
before update on public.match_tracking_credentials
for each row
execute function private.set_updated_at();

create trigger set_matches_updated_at
before update on public.matches
for each row
execute function private.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

insert into public.profiles (id)
select u.id
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

revoke all on all tables in schema public from anon;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;

grant usage on schema public to authenticated;
grant usage on schema public to service_role;
grant usage on schema private to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.steam_accounts to authenticated;
grant select, insert, update, delete on public.match_tracking_credentials to authenticated;
grant select on public.matches to authenticated;
grant select on public.match_players to authenticated;
grant select on public.rounds to authenticated;
grant select on public.match_events to authenticated;
grant select on public.player_match_stats to authenticated;
grant select on public.timeline_markers to authenticated;
grant select on public.analysis_reports to authenticated;
grant select on public.highlight_candidates to authenticated;
grant select on public.user_matches to authenticated;

grant select, insert, update, delete on all tables in schema public to service_role;
grant execute on function private.owns_steam_account(uuid) to authenticated;
grant execute on function private.has_match_access(uuid) to authenticated;
grant execute on function private.has_player_access(uuid, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.steam_accounts enable row level security;
alter table public.match_tracking_credentials enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.rounds enable row level security;
alter table public.match_events enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.timeline_markers enable row level security;
alter table public.analysis_reports enable row level security;
alter table public.highlight_candidates enable row level security;
alter table public.user_matches enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id)
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

create policy "steam_accounts_select_own"
on public.steam_accounts
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "steam_accounts_insert_own"
on public.steam_accounts
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "steam_accounts_update_own"
on public.steam_accounts
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "steam_accounts_delete_own"
on public.steam_accounts
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "match_tracking_credentials_select_own"
on public.match_tracking_credentials
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.owns_steam_account(steam_account_id))
);

create policy "match_tracking_credentials_insert_own"
on public.match_tracking_credentials
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select private.owns_steam_account(steam_account_id))
);

create policy "match_tracking_credentials_update_own"
on public.match_tracking_credentials
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.owns_steam_account(steam_account_id))
)
with check (
  (select auth.uid()) is not null
  and (select private.owns_steam_account(steam_account_id))
);

create policy "match_tracking_credentials_delete_own"
on public.match_tracking_credentials
for delete
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.owns_steam_account(steam_account_id))
);

create policy "user_matches_select_own"
on public.user_matches
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "matches_select_accessible"
on public.matches
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_match_access(id))
);

create policy "match_players_select_accessible"
on public.match_players
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_match_access(match_id))
);

create policy "rounds_select_accessible"
on public.rounds
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_match_access(match_id))
);

create policy "match_events_select_accessible"
on public.match_events
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_match_access(match_id))
);

create policy "player_match_stats_select_accessible"
on public.player_match_stats
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_match_access(match_id))
);

create policy "timeline_markers_select_accessible"
on public.timeline_markers
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_match_access(match_id))
);

create policy "analysis_reports_select_own_player"
on public.analysis_reports
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_player_access(match_id, steam_id))
);

create policy "highlight_candidates_select_own_player"
on public.highlight_candidates
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select private.has_player_access(match_id, steam_id))
);
