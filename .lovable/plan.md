## Goal
Make the entire site scale down cleanly on phone widths (≤640px) and ensure hero images are fully visible instead of being cropped.

## 1. Global mobile scaling
In `src/styles.css`, add a small base font-size step-down for `<640px` so all `rem`-based typography, paddings, and gaps proportionally shrink without touching every component:
- `html { font-size: 14px }` at `≤480px`, `15px` at `≤640px`, default `16px` above.
- Add a `@utility hero-img-contain` helper for hero images that need to be fully visible.

## 2. Hero images — show the whole photo on mobile
Currently hero images use `object-cover` with fixed `object-position`, which crops on narrow viewports. Change hero image behavior so the full image is visible on phones:

- `src/components/site/SiteLayout.tsx` (`PageHeader`): on mobile, render the image with `object-contain` + a solid brand-blue backdrop; switch to `object-cover` from `sm:` upward. Reduce hero vertical padding on mobile (`py-10`) so the contained image isn't dwarfed by empty space.
- `src/routes/index.tsx` homepage hero: same treatment — mobile shows the full photo (`object-contain` on a brand-blue background), desktop keeps the current full-bleed `object-cover` look. Also reduce hero min-height on mobile so it fits one screen.
- `src/routes/donate.tsx` hero background: constrain min-height on mobile and use `object-contain` fallback so the background photo isn't cropped to a sliver.

## 3. Nav — tighter phone layout
In `src/components/site/SiteNav.tsx`:
- Shrink logo tile to `size-8` and brand text to `text-xs` under 400px so brand + Donate + language + menu all fit at 360–390px.
- Reduce Donate button padding on mobile (`px-2.5 py-2`, `text-[10px]`).
- Collapse the language button to just the globe icon (hide `EN` text and chevron) below `sm:`.
- Ensure the whole nav row uses `gap-1` on mobile.

## 4. Section/typography polish across pages
Sweep the main routes (`index`, `about`, `projects`, `gallery`, `stories`, `news`, `contact`, `faq`, `donate`) for elements that overflow on 360–390px:
- Cap oversized display text (`text-6xl`/`text-7xl`) with a smaller mobile base (`text-3xl sm:text-4xl md:text-6xl`).
- Reduce section vertical padding on mobile (`py-12 sm:py-16 md:py-24`).
- Force grids to single column below `sm` where currently `grid-cols-2` cramps content (impact stats, founders, program pillars).
- Add `min-w-0` / `truncate` on flex rows containing long titles + badges so text can shrink instead of pushing siblings offscreen.

## 5. Verification
Run Playwright at 390×844 and 360×640 against `/`, `/about`, `/donate`, `/projects`, `/gallery`, `/stories`, `/news`, `/contact`, capture screenshots, and fix any remaining overflow or cropped-hero cases before finishing.

## Files touched
- `src/styles.css`
- `src/components/site/SiteLayout.tsx`
- `src/components/site/SiteNav.tsx`
- `src/routes/index.tsx`, `donate.tsx`, and any page flagged by the Playwright audit.
