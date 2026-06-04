# CS2 Match Analyzer Guide

## 1. Mục tiêu dự án

Xây dựng một hệ thống cá nhân hoặc SaaS nhỏ có khả năng lấy lịch sử trận CS2 từ Steam/Valve, tải demo, phân tích thông số người chơi, phát hiện điểm mạnh/yếu qua từng trận, tổng hợp xu hướng dài hạn và hỗ trợ xem lại demo dưới dạng video có timeline marker.

Dự án không tập trung vào replay 2D/minimap. Thay vào đó, hướng chính là xem video demo bình thường, nhưng có các mốc sự kiện trên thanh thời gian để người dùng bấm vào và tua đến ngay.

Ví dụ marker trên video timeline:

- Kill: icon tâm ngắm / crosshair.
- Death: icon đầu lâu.
- Assist: icon hỗ trợ.
- Bomb plant: icon bom.
- Bomb defuse: icon kìm / defuse.
- Clutch: icon ngôi sao / highlight.
- Multi-kill: icon đặc biệt hoặc marker nổi bật hơn.

---

## 2. Scope tổng quan

### 2.1. Nên làm trong MVP

MVP nên tập trung vào các phần sau:

1. Kết nối tài khoản Steam.
2. Người dùng nhập Match Token gần nhất và Authentication Code.
3. Backend tự lấy match mới.
4. Tải file demo.
5. Parse demo để lấy event và thống kê.
6. Lưu dữ liệu vào database.
7. Hiển thị match history.
8. Hiển thị thống kê từng trận.
9. Phân tích điểm mạnh/yếu bằng rule-based analysis.
10. Tạo timeline event cho video.
11. Cho người dùng xem video hoặc demo recording với marker kill/death/highlight.

### 2.2. Không nên làm trong MVP

Các phần sau nên để phase sau:

1. Tự động render video chất lượng cao trên server.
2. Tự động cắt highlight thành video clip.
3. AI coach phức tạp.
4. So sánh với toàn bộ cộng đồng người chơi.
5. Ranking nội bộ theo skill model riêng.
6. Mobile app riêng.
7. Anti-cheat hoặc cheat detection.

---

## 3. Luồng xử lý chính

```text
User
  |
  | nhập Steam account / match token / auth code
  v
Web App
  |
  | gửi request tạo tracking profile
  v
Backend API
  |
  | gọi Steam / Valve match history API hoặc GameCoordinator flow
  v
Match Fetcher Worker
  |
  | tìm match mới
  | lấy demo URL
  v
Demo Downloader Worker
  |
  | tải .dem hoặc .dem.bz2
  | lưu vào object storage
  v
Demo Parser Worker
  |
  | parse kills / deaths / damage / grenade / bomb / round / tick
  | tính stats
  | tạo timeline markers
  v
Database
  |
  | lưu match, player stats, round stats, events, markers, reports
  v
Frontend Dashboard
  |
  | hiển thị match list
  | hiển thị phân tích từng trận
  | hiển thị video viewer + timeline marker
```

---

## 4. Stack đề xuất

### 4.1. Stack chính

```text
Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query hoặc TanStack Query

Auth / Database:
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security

Backend:
- Next.js Route Handlers cho API nhẹ
- Hoặc NestJS nếu muốn tách backend rõ ràng

Queue:
- Redis
- BullMQ

Object Storage:
- Cloudflare R2
- Supabase Storage
- Hoặc S3-compatible storage

Demo Parser Worker:
- Go + demoinfocs-golang
- Hoặc Python + demoparser/Awpy nếu muốn prototype nhanh

Video Processing:
- FFmpeg
- Worker riêng cho phase sau

Deployment:
- Vercel cho web app
- Railway/Fly.io/VPS cho worker
- Supabase cho DB/Auth
- R2/S3 cho demo/video storage
```

### 4.2. Stack khuyến nghị cho dự án cá nhân/MVP

```text
Next.js + Supabase + Redis/BullMQ + Go Parser Worker + R2 + FFmpeg later
```

Lý do:

- Next.js hợp làm dashboard nhanh.
- Supabase hợp auth, database, storage, RLS.
- Redis/BullMQ giúp xử lý demo bất đồng bộ.
- Go parser worker phù hợp file demo lớn và xử lý event nhanh.
- R2/S3 phù hợp lưu demo/video vì file có thể nặng.
- FFmpeg chỉ nên đưa vào sau khi pipeline parse/stats đã ổn.

---

## 5. Kiến trúc module

```text
apps/web
  - Next.js frontend
  - dashboard
  - match detail
  - video viewer
  - settings

apps/api hoặc Next.js route handlers
  - Steam account connection
  - match tracking API
  - signed URL API
  - analysis API

workers/match-fetcher
  - lấy match mới từ Steam/Valve
  - enqueue demo download job

workers/demo-downloader
  - tải demo
  - giải nén nếu cần
  - upload object storage
  - enqueue parse job

workers/demo-parser
  - parse .dem
  - extract events
  - calculate stats
  - generate timeline markers
  - generate highlight candidates

workers/video-renderer
  - phase sau
  - render hoặc cắt video highlight bằng FFmpeg
```

---

## 6. Database schema đề xuất

### 6.1. profiles

Lưu thông tin user trong hệ thống.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6.2. steam_accounts

Lưu liên kết giữa user nội bộ và Steam account.

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

### 6.3. match_tracking_credentials

Lưu thông tin cần thiết để track match history.

Lưu ý: Authentication Code cần được mã hóa trước khi lưu. Không lưu plain text nếu hệ thống public hoặc có nhiều user.

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

### 6.4. matches

Lưu thông tin từng trận.

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

Gợi ý status:

```text
pending
fetching_demo
demo_downloaded
parsing
parsed
failed
```

### 6.5. match_players

Lưu người chơi trong match.

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

### 6.6. rounds

Lưu thông tin từng round.

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

### 6.7. match_events

Bảng event tổng quát cho timeline và phân tích.

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

Ví dụ event_type:

```text
kill
death
assist
damage
grenade_throw
flash_assist
bomb_plant
bomb_defuse
round_start
round_end
clutch_start
clutch_win
clutch_loss
```

### 6.8. player_match_stats

Thống kê tổng hợp theo người chơi trong một trận.

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

### 6.9. timeline_markers

Bảng marker để hiển thị trên video timeline.

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

Ví dụ marker_type:

```text
kill
death
assist
multi_kill
clutch
bomb_plant
bomb_defuse
round_win
round_loss
highlight
```

Ví dụ icon:

```text
crosshair
skull
assist
bomb
defuse
star
fire
```

Ví dụ severity:

```text
low
normal
high
highlight
```

### 6.10. analysis_reports

Lưu phân tích điểm mạnh/yếu từng trận.

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

---

## 7. Video viewer design

### 7.1. Mục tiêu

Video viewer cần cho phép người dùng xem lại trận hoặc đoạn demo đã render, đồng thời thấy các mốc quan trọng trên thanh thời gian.

Không cần làm minimap 2D trong MVP.

### 7.2. UI cơ bản

```text
+------------------------------------------------------+
|                    Video Player                      |
|                                                      |
|                                                      |
+------------------------------------------------------+
| 00:00 ━━━━x━━━━☠━━━━🎯━━━━★━━━━💣━━━━━━ 35:20       |
|       kill death kill highlight plant                |
+------------------------------------------------------+
| Round 1 | Round 2 | Round 3 | ...                    |
+------------------------------------------------------+
| Event list / Analysis panel                          |
+------------------------------------------------------+
```

### 7.3. Thành phần chính

1. Video player.
2. Custom progress bar.
3. Timeline marker layer.
4. Marker tooltip.
5. Event list bên cạnh.
6. Round selector.
7. Highlight filter.
8. Nút jump tới event.
9. Nút export/cut highlight trong phase sau.

### 7.4. Marker behavior

Khi hover vào marker:

```text
Round 8 - 01:24
Kill: PlayerA killed PlayerB
Weapon: AK-47
Headshot: yes
```

Khi click vào marker:

```ts
video.currentTime = marker.time_seconds
video.play()
```

Khi filter marker:

```text
All
Kills
Deaths
Highlights
Bomb
Clutches
```

### 7.5. Marker rendering strategy

Mỗi marker có `time_seconds`. Frontend tính vị trí marker theo công thức:

```ts
const leftPercent = marker.time_seconds / videoDurationSeconds * 100
```

Ví dụ component ý tưởng:

```tsx
function TimelineMarker({ marker, duration, onClick }) {
  const left = `${(marker.time_seconds / duration) * 100}%`

  return (
    <button
      type="button"
      className="absolute -top-2 h-4 w-4 -translate-x-1/2"
      style={{ left }}
      title={marker.label}
      onClick={() => onClick(marker)}
    >
      {marker.icon === 'crosshair' ? '🎯' : null}
      {marker.icon === 'skull' ? '☠️' : null}
      {marker.icon === 'star' ? '★' : null}
      {marker.icon === 'bomb' ? '💣' : null}
    </button>
  )
}
```

### 7.6. Marker clustering

Nếu nhiều event xảy ra gần nhau, marker có thể bị chồng lên nhau. Cần gom cụm theo khoảng thời gian.

Ví dụ:

```text
Nếu nhiều marker cách nhau dưới 3 giây:
→ gom thành một cluster marker.
→ click mở popover list event.
```

Cluster marker:

```json
{
  "type": "cluster",
  "time_seconds": 542.3,
  "count": 4,
  "markers": ["kill", "kill", "death", "assist"]
}
```

---

## 8. Highlight detection

### 8.1. Rule MVP

Các highlight nên detect trước:

1. 3K, 4K, 5K.
2. Clutch 1v1, 1v2, 1v3, 1v4, 1v5.
3. Ace.
4. Multi-kill trong 10 giây.
5. Entry double kill.
6. Retake thắng.
7. Defuse sát giờ.
8. Bomb plant trong round thắng quan trọng.
9. Wallbang/headshot chain nếu parser lấy được metadata.
10. Round có impact score cao.

### 8.2. Highlight candidate schema

Có thể dùng chung bảng `timeline_markers`, hoặc tạo riêng bảng `highlight_candidates`.

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

### 8.3. Ví dụ logic multi-kill

```text
Input:
- Danh sách kill events của một player trong một round.

Rule:
- Nếu player có từ 3 kill trở lên trong cùng round:
  → tạo highlight 3K/4K/5K.

- Nếu player có ít nhất 2 kill trong vòng 10 giây:
  → tạo marker multi_kill.
```

### 8.4. Ví dụ logic clutch

```text
Input:
- Số player sống mỗi team theo tick.
- Kill events.
- Round winner.

Rule:
- Nếu tại một thời điểm player là người cuối cùng còn sống trong team.
- Đối thủ còn từ 1 người trở lên.
- Team của player thắng round.
  → clutch win.

- Nếu team thua round.
  → clutch attempt / clutch loss.
```

---

## 9. Phân tích điểm mạnh/yếu

### 9.1. Không nên cho AI đọc raw demo

Không nên đưa raw demo hoặc raw event quá dài cho AI. Nên xử lý theo pipeline:

```text
Raw demo events
  -> extracted stats
  -> detected patterns
  -> rule-based analysis
  -> optional LLM summary
```

### 9.2. Rule-based analysis trước

Ví dụ rule:

```text
Nếu opening_deaths cao và trade rate thấp:
→ Điểm yếu: thường chết sớm mà team không đổi mạng được.

Nếu utility_damage thấp và enemies_flashed thấp:
→ Điểm yếu: utility chưa tạo nhiều lợi thế.

Nếu ADR cao nhưng KAST thấp:
→ Gây damage tốt nhưng độ ổn định/impact round chưa cao.

Nếu clutch_attempts nhiều nhưng clutch_wins thấp:
→ Thường rơi vào tình huống khó hoặc xử lý late round chưa tốt.

Nếu CT side deaths tập trung ở một site:
→ Cần xem lại cách giữ site, timing fallback hoặc cách xin flash hỗ trợ.
```

### 9.3. Output report mẫu

```json
{
  "strengths": [
    {
      "title": "Damage ổn định",
      "detail": "ADR cao hơn mức trung bình của chính bạn trong 5 trận gần nhất.",
      "evidence": ["ADR: 86.4", "Damage rounds: 15/24"]
    }
  ],
  "weaknesses": [
    {
      "title": "Chết mở round quá nhiều",
      "detail": "Bạn có 5 opening deaths, trong đó chỉ 1 lần được trade.",
      "evidence": ["Opening deaths: 5", "Traded deaths: 1"]
    }
  ],
  "recommendations": [
    {
      "title": "Giảm solo peek đầu round",
      "detail": "Ở Mirage A ramp/palace, nên chờ flash hoặc đi cùng người trade thay vì tự peek khô."
    }
  ]
}
```

---

## 10. API design

### 10.1. Steam account

```http
POST /api/steam/connect
GET /api/steam/accounts
DELETE /api/steam/accounts/:id
```

### 10.2. Match tracking

```http
POST /api/match-tracking/setup
POST /api/match-tracking/sync-now
GET /api/match-tracking/status
```

### 10.3. Matches

```http
GET /api/matches
GET /api/matches/:matchId
GET /api/matches/:matchId/stats
GET /api/matches/:matchId/events
GET /api/matches/:matchId/timeline-markers
GET /api/matches/:matchId/analysis
```

### 10.4. Video

```http
GET /api/matches/:matchId/video
GET /api/matches/:matchId/video/signed-url
GET /api/matches/:matchId/highlights
POST /api/matches/:matchId/highlights/:highlightId/render
```

---

## 11. Queue jobs

### 11.1. Job types

```text
fetch-latest-matches
download-demo
parse-demo
generate-analysis
generate-video-markers
render-highlight-video
```

### 11.2. Job flow

```text
fetch-latest-matches
  -> download-demo
  -> parse-demo
  -> generate-video-markers
  -> generate-analysis
```

Phase sau:

```text
generate-analysis
  -> render-highlight-video
```

### 11.3. Retry policy

```text
fetch-latest-matches:
- retry 3 lần
- backoff 1 phút, 5 phút, 15 phút

download-demo:
- retry 5 lần
- backoff tăng dần

parse-demo:
- retry 2 lần
- nếu lỗi format thì đánh failed

render-highlight-video:
- retry 2 lần
- timeout rõ ràng
```

---

## 12. Video rendering và clipping phase sau

### 12.1. Giai đoạn 1: không render video server-side

Trong MVP, có thể chỉ lưu:

- Demo file.
- Event timeline.
- Marker.
- Highlight candidate.

Sau đó cho user tự xem hoặc dùng local tool.

### 12.2. Giai đoạn 2: render full match video

Nếu muốn phát video trực tiếp trên web, cần có pipeline tạo video từ demo.

Ý tưởng:

```text
Demo file
  -> launch CS2 client/render environment
  -> record playback
  -> encode MP4/HLS
  -> upload storage
  -> attach markers by time_seconds
```

Đây là phần khó vì phụ thuộc CS2 client, GPU, record automation và tài nguyên server.

### 12.3. Giai đoạn 3: cắt highlight

Khi đã có full video, clipping bằng FFmpeg dễ hơn.

```bash
ffmpeg -ss 120.5 -to 145.0 -i full_match.mp4 -c copy highlight.mp4
```

Nếu cần chính xác keyframe hơn:

```bash
ffmpeg -ss 120.5 -to 145.0 -i full_match.mp4 -c:v libx264 -c:a aac highlight.mp4
```

---

## 13. Bảo mật

### 13.1. Không lưu auth code plain text

Authentication Code cần được mã hóa trước khi lưu.

Nên dùng:

```text
- encryption key ở server env
- không expose ra frontend
- không log auth code
- không commit vào repo
```

### 13.2. Không public demo/private data tùy tiện

Demo, stats và report nên gắn với user sở hữu Steam account.

### 13.3. RLS cơ bản

Nếu dùng Supabase, cần bật RLS cho các bảng user-owned.

Ví dụ policy ý tưởng:

```sql
create policy "Users can read their own steam accounts"
on steam_accounts
for select
using (auth.uid() = user_id);
```

Với matches, do một match có thể liên quan nhiều user, nên nên có bảng join:

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

---

## 14. Gợi ý roadmap

### Phase 1: Match tracking + stats

- Steam account connect.
- Nhập match token/auth code.
- Fetch match mới.
- Download demo.
- Parse demo.
- Hiển thị match list.
- Hiển thị stats cơ bản.

### Phase 2: Analysis report

- Rule-based analysis.
- Điểm mạnh/yếu từng trận.
- Tổng hợp 5/10/20 trận gần nhất.
- So sánh phong độ theo map.
- Gợi ý cải thiện.

### Phase 3: Video timeline marker

- Video player.
- Timeline marker kill/death/bomb/clutch.
- Click marker để tua.
- Filter marker.
- Event list.
- Highlight candidate list.

### Phase 4: Video/highlight processing

- Full match video rendering.
- Cắt highlight bằng FFmpeg.
- Export clip.
- Share clip.
- Background render queue.

### Phase 5: AI coach

- Chuẩn hóa feature extraction.
- LLM viết report dễ hiểu.
- Trend analysis.
- Personal improvement plan.
- So sánh trước/sau theo từng kỹ năng.

---

## 15. Acceptance criteria cho MVP

MVP được coi là ổn khi đạt các tiêu chí sau:

1. User có thể connect Steam account.
2. User có thể nhập match token/auth code.
3. Hệ thống lấy được ít nhất một match mới.
4. Hệ thống tải được demo.
5. Hệ thống parse được kill/death/round/basic stats.
6. Match detail hiển thị được:
   - Map.
   - Score.
   - Player stats.
   - Round list.
   - Event list.
7. Analysis report hiển thị được:
   - Điểm mạnh.
   - Điểm yếu.
   - Gợi ý cải thiện.
8. Timeline marker hiển thị được:
   - Kill marker.
   - Death marker.
   - Bomb marker.
   - Highlight marker.
9. Click marker có thể tua video tới đúng thời điểm.
10. Queue worker có retry và trạng thái rõ ràng.

---

## 16. Prompt mẫu cho Codex

```text
You are implementing a CS2 match analyzer web app.

Goal:
Build the MVP foundation for a CS2 match tracking and analysis system.

Stack:
- Next.js App Router
- TypeScript
- Supabase Auth/Postgres
- Tailwind CSS
- shadcn/ui
- Redis + BullMQ for background jobs
- Worker-friendly architecture for future demo parsing

Important product direction:
- Do not build a 2D replay/minimap viewer.
- The replay UX should be based on normal video playback.
- The video timeline must support event markers.
- Kill markers should use a crosshair-style icon.
- Death markers should use a skull-style icon.
- Highlight markers should be visually distinct.
- Clicking a marker should seek the video to that timestamp.

Initial scope:
1. Add database schema/migrations for:
   - steam_accounts
   - match_tracking_credentials
   - matches
   - user_matches
   - match_players
   - rounds
   - match_events
   - player_match_stats
   - timeline_markers
   - analysis_reports
2. Add basic RLS policies for user-owned data.
3. Add API routes for:
   - setting up match tracking
   - listing matches
   - reading match detail
   - reading timeline markers
   - reading analysis reports
4. Add dashboard pages for:
   - match list
   - match detail
   - video viewer placeholder
   - event timeline markers
5. Add a reusable TimelineMarker component.
6. Do not implement real Steam API calls yet; create an interface and mock adapter.
7. Do not implement real demo parsing yet; create parser service interfaces and mock parsed data.
8. Keep the code modular so real Steam fetching and demo parsing can be added later.

Acceptance criteria:
- TypeScript passes.
- Build passes.
- Database migrations are readable and documented.
- Mock match detail page shows video player placeholder with kill/death/highlight markers.
- Clicking marker updates the video currentTime or mocked playback time.
- No auth code is logged or exposed to frontend after setup.
```

---

## 17. Ghi chú triển khai

Nên làm mock trước để đóng UI/UX và data model:

```text
Mock match
Mock rounds
Mock events
Mock markers
Mock analysis report
```

Sau khi UI + schema ổn mới nối thật:

```text
Steam fetcher
Demo downloader
Demo parser
Analysis generator
Video render pipeline
```

Điều này giúp tránh vỡ dự án vì phần Steam/demo/video khá nhiều biến số.

---

## 18. Kết luận

Hướng làm hợp lý nhất là không cố clone toàn bộ csstats/csrep ngay từ đầu. Nên bắt đầu bằng một hệ thống phân tích cá nhân có pipeline rõ ràng:

```text
Steam match tracking
  -> demo download
  -> demo parse
  -> stats extraction
  -> rule-based analysis
  -> video timeline markers
  -> highlight candidates
```

Phần video nên đi theo hướng timeline marker trước. Khi đã có full match video hoặc video render pipeline, việc cắt highlight bằng FFmpeg sẽ dễ kiểm soát hơn nhiều.
