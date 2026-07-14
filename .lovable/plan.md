## Goal
1. Replace the "Video URL" text field in the admin News editor with a proper video **upload**.
2. Let the admin add a mix of **photos or videos** (up to 5) per news post — the public news page shows them in the gallery and plays videos inline when tapped.
3. Make the WhatsApp floating button open the user's WhatsApp app (chat with +256 700 339 231) with a single tap instead of opening the in-page chat panel first.
4. **Auto-advance the media carousel** on both the News page and the Projects page so photos/videos slide through automatically for each post/project.

## Changes

### 1. Admin News editor (`src/routes/_authenticated/admin.tsx`)
- Remove the "Video URL (autoplays)" text input from the post editor.
- Rename the "Photos" button to "Media".
- In `NewsMediaManager`:
  - Accept `image/*,video/*` in the upload input.
  - Render a small `<video>` thumbnail with a play-icon overlay for video items.
  - Keep the 5-item limit and delete behavior.
- Detect type by file extension (`.mp4/.webm/.mov` → video, else image). No schema change required.

### 2. Public news page (`src/routes/news.tsx`)
- Drop the separate `video_url` autoplay block.
- The existing per-post carousel renders each media item; videos render with a large play button and play inline with controls when tapped.
- **Auto-slide**: advance to the next slide every ~5 seconds. Pause auto-advance while a video is playing on the current slide, or while the user is interacting (hover on desktop, manual arrow/dot tap).

### 3. Public projects page (`src/routes/projects.tsx`)
- Apply the same **auto-sliding carousel** behavior to each project's media strip (list cards and the detail modal). Same ~5s interval, same pause-on-interaction and pause-on-video-playing rules.

### 4. WhatsApp widget (`src/components/site/WhatsAppWidget.tsx`)
- Floating action button becomes a direct link to `https://wa.me/256700339231?text=...` (opens WhatsApp app on mobile, WhatsApp Web on desktop) in a new tab.
- Remove the in-page chat panel, the "1" badge, and the nudge bubble that led to it.
- Contact page "Chat on WhatsApp" button already uses `wa.me` — leave as-is.

## Notes
- No donation, receipt, or database-schema changes.
- `news-media` and `project-media` buckets already exist and accept both images and videos.
