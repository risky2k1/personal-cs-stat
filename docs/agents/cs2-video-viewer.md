Source: `.cursor/rules/cs2-video-viewer.mdc`

# CS2 — Video viewer & video pipeline

## Mục tiêu viewer

Xem lại trận / demo đã render; thấy mốc quan trọng trên timeline. **Không** minimap 2D trong MVP.

## UI layout

```text
+------------------------------------------------------+
|                    Video Player                      |
+------------------------------------------------------+
| 00:00 ━━━━x━━━━☠━━━━🎯━━━━★━━━━💣━━━━━━ 35:20       |
|       kill death kill highlight plant                |
+------------------------------------------------------+
| Round 1 | Round 2 | Round 3 | ...                    |
+------------------------------------------------------+
| Event list / Analysis panel                          |
+------------------------------------------------------+
```

## Thành phần

1. Video player
2. Custom progress bar
3. Timeline marker layer
4. Marker tooltip
5. Event list
6. Round selector
7. Highlight filter
8. Jump tới event
9. Export/cut highlight — phase sau

## Marker behavior

**Hover tooltip:**

```text
Round 8 - 01:24
Kill: PlayerA killed PlayerB
Weapon: AK-47
Headshot: yes
```

**Click:**

```ts
video.currentTime = marker.time_seconds
video.play()
```

**Filter:** All | Kills | Deaths | Highlights | Bomb | Clutches

## Rendering position

```ts
const leftPercent = (marker.time_seconds / videoDurationSeconds) * 100
```

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

## Marker clustering

Nếu nhiều marker cách nhau **< 3 giây** → gom cluster; click mở popover list event.

```json
{
  "type": "cluster",
  "time_seconds": 542.3,
  "count": 4,
  "markers": ["kill", "kill", "death", "assist"]
}
```

## Video phases (không bắt buộc MVP)

**Giai đoạn 1 (MVP):** lưu demo + timeline + markers + highlight candidates; user xem local hoặc placeholder player.

**Giai đoạn 2 — full match video:**

```text
Demo → CS2 client/render env → record → MP4/HLS → storage → markers by time_seconds
```

Phụ thuộc CS2 client, GPU, automation — khó.

**Giai đoạn 3 — FFmpeg clip** (khi đã có full video):

```bash
ffmpeg -ss 120.5 -to 145.0 -i full_match.mp4 -c copy highlight.mp4
```

Chính xác keyframe hơn:

```bash
ffmpeg -ss 120.5 -to 145.0 -i full_match.mp4 -c:v libx264 -c:a aac highlight.mp4
```
