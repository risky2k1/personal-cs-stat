Source: `.cursor/rules/cs2-product.mdc`

# CS2 Match Analyzer — Product

## Mục tiêu

Hệ thống lấy lịch sử trận CS2 từ Steam/Valve, tải demo, phân tích stats, phát hiện điểm mạnh/yếu theo trận, tổng hợp xu hướng dài hạn, xem lại demo dưới dạng **video có timeline marker**.

**Không** tập trung replay 2D/minimap. Hướng chính: video demo + mốc sự kiện trên timeline (click → tua ngay).

Marker ví dụ:

- Kill: crosshair
- Death: skull
- Assist: hỗ trợ
- Bomb plant: bom
- Bomb defuse: kìm
- Clutch: ngôi sao / highlight
- Multi-kill: icon đặc biệt / nổi bật hơn

## MVP — nên làm

1. Kết nối Steam
2. Nhập Match Token gần nhất + Authentication Code
3. Backend tự lấy match mới
4. Tải demo
5. Parse event + thống kê
6. Lưu DB
7. Match history
8. Stats từng trận
9. Rule-based analysis (điểm mạnh/yếu)
10. Timeline event cho video
11. Xem video / demo recording + marker kill/death/highlight

## MVP — không làm (phase sau)

1. Render video HQ trên server
2. Auto cắt highlight clip
3. AI coach phức tạp
4. So sánh toàn cộng đồng
5. Ranking skill model riêng
6. Mobile app riêng
7. Anti-cheat / cheat detection

## Luồng xử lý chính

```text
User
  | nhập Steam account / match token / auth code
  v
Web App
  | gửi request tạo tracking profile
  v
Backend API
  | Steam/Valve match history API hoặc GameCoordinator flow
  v
Match Fetcher Worker
  | tìm match mới, lấy demo URL
  v
Demo Downloader Worker
  | tải .dem / .dem.bz2 → object storage
  v
Demo Parser Worker
  | parse kills/deaths/damage/grenade/bomb/round/tick
  | stats + timeline markers
  v
Database
  | match, player stats, round stats, events, markers, reports
  v
Frontend Dashboard
  | match list, phân tích trận, video viewer + timeline marker
```
