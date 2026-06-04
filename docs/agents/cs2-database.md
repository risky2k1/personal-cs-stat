Source: `.cursor/rules/cs2-database.mdc`

# CS2 — Database schema

Dùng Supabase migrations. Authentication Code **mã hóa** trước khi lưu — xem `cs2-security.mdc`.

## profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## steam_accounts

```sql
create table steam_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  steam_id text not null,
  persona_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, steam_id)
);
```

## match_tracking_credentials

```sql
create table match_tracking_credentials (
  id uuid primary key default gen_random_uuid(),
  steam_account_id uuid not null references steam_accounts(id) on delete cascade,
  encrypted_auth_code text not null,
  latest_known_match_token text,
  latest_known_share_code text,
  code_issued_at date,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## matches

```sql
create table matches (
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
  status text not null default 'pending',
  parse_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**matches.status:** `pending` | `fetching_demo` | `demo_downloaded` | `parsing` | `parsed` | `failed`

## match_players

```sql
create table match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  steam_id text not null,
  player_name text,
  team_name text,
  side_start text,
  is_tracked_player boolean not null default false,
  created_at timestamptz not null default now(),
  unique(match_id, steam_id)
);
```

## rounds

```sql
create table rounds (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  round_number int not null,
  start_tick int,
  freeze_end_tick int,
  end_tick int,
  winning_side text,
  winning_team text,
  end_reason text,
  bomb_planted boolean not null default false,
  created_at timestamptz not null default now(),
  unique(match_id, round_number)
);
```

## match_events

```sql
create table match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  round_id uuid references rounds(id) on delete cascade,
  event_type text not null,
  tick int not null,
  time_seconds numeric,
  actor_steam_id text,
  target_steam_id text,
  weapon text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

**event_type:** `kill` | `death` | `assist` | `damage` | `grenade_throw` | `flash_assist` | `bomb_plant` | `bomb_defuse` | `round_start` | `round_end` | `clutch_start` | `clutch_win` | `clutch_loss`

## player_match_stats

```sql
create table player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
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
```

## timeline_markers

```sql
create table timeline_markers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  round_id uuid references rounds(id) on delete cascade,
  event_id uuid references match_events(id) on delete set null,
  steam_id text,
  marker_type text not null,
  label text,
  icon text,
  tick int not null,
  time_seconds numeric not null,
  severity text not null default 'normal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

**marker_type:** `kill` | `death` | `assist` | `multi_kill` | `clutch` | `bomb_plant` | `bomb_defuse` | `round_win` | `round_loss` | `highlight`

**icon:** `crosshair` | `skull` | `assist` | `bomb` | `defuse` | `star` | `fire`

**severity:** `low` | `normal` | `high` | `highlight`

## analysis_reports

```sql
create table analysis_reports (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  steam_id text not null,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  unique(match_id, steam_id)
);
```

## highlight_candidates (tùy chọn, hoặc dùng timeline_markers)

```sql
create table highlight_candidates (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  round_id uuid references rounds(id) on delete cascade,
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
```

## user_matches (RLS — xem cs2-security.mdc)

```sql
create table user_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  steam_account_id uuid references steam_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, match_id)
);
```
