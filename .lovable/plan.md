# Plan

## 1. Upload the 6 real photos as CDN assets
Upload each `/mnt/user-uploads/*.jpg` via `lovable-assets` into `src/assets/` as `.asset.json` pointers:
- `hero-home.jpg` — image 2 (selfie with 3 kids in village) → **Homepage hero**
- `hero-donate-bg.jpg` — image 6 (founder with group of ~10 children) → **Donate page background**
- `hero-about.jpg` — image 1 (founder with 3 smiling children) → **About page hero**
- `hero-projects.jpg` — image 5 (row of children against brick wall — emotive) → **Projects page hero**
- `hero-stories.jpg` — image 3 (three kids in field) → **Stories page hero**
- `hero-gallery.jpg` — image 4 (three kids close-up) → **Gallery page hero**

Suggested placement rationale:
- Image 5 (barefoot children) is the most emotionally powerful — best on Projects to drive donations to specific needs.
- Image 1 (founder + kids smiling) humanizes About.
- Images 3 & 4 are joyful — fit Stories/Gallery.

Confirm this mapping or swap before I build.

## 2. Remove AI hero images
Delete these AI-generated hero assets and their `.asset.json` pointers, replacing every hero-section reference with the new real photos:
- `src/assets/hero-children.jpg` (currently on homepage + used as og:image)
- Any other AI hero used at top of About/Projects/Stories/Gallery/Donate

Program/story thumbnails deeper in pages (education/health/nutrition/sarah/water) stay — user said "hero section" only.

Homepage `og:image` will be updated to the new `hero-home.jpg`.

## 3. Donate page background
Replace the current donate hero background with `hero-donate-bg.jpg`, keep the floating white wizard card, add a darker gradient overlay so the card stays readable over the busier photo.

## 4. Fix "Agnes" spelling
Global rename `Agness` → `Agnes` (Agness Claire Namisango → Agnes Claire Namisango):
- `src/routes/about.tsx`, `src/routes/leadership.tsx`, DB `site_content` row for cofounder, any other references (search whole repo).

## 5. Fix language switcher — trim to 6 & make it reliable

**Trim the list** in `SiteNav.tsx` to only:
English (en), Deutsch (de), Italiano (it), Français (fr), Русский (ru), Kiswahili (sw).

**Fix the lag / missed words on the homepage.** Root causes in current `src/lib/translator.ts`:
- Counters animate every frame → constantly rewrites text nodes → translator races against React and misses updates.
- Route changes re-render before translator re-walks the DOM.
- MyMemory/Google free endpoint is called per text-node chunk → homepage has many nodes → some requests fail silently.

Fix:
- Batch ALL untranslated strings on the page into a single request (chunk to endpoint limit), translate, then apply — one pass instead of dozens.
- Cache translations per (lang + source string) in `localStorage`; skip network for cached strings so re-walks are instant.
- Use a `MutationObserver` that debounces (250 ms) and re-translates only newly added/changed text nodes — so counters ticking don't spam translations, and dynamic content (Featured Child, admin data) still gets translated.
- Skip nodes inside the counter (`<Counter>` component) by marking the count span `translate="no"` — numbers don't need translating and this stops the observer churn.
- Skip the language dropdown itself (already done) and any element with `data-no-translate`.
- Re-apply on TanStack route change via a router subscription so the new page translates immediately, not after user interaction.

## Technical notes
- `lovable-assets create --file /mnt/user-uploads/<name> --filename hero-*.jpg > src/assets/hero-*.jpg.asset.json` for each photo.
- Import pointers as `import heroHome from "@/assets/hero-home.jpg.asset.json"` then `<img src={heroHome.url} />`.
- Delete removed AI assets with `lovable-assets delete --file <pointer>`.
- DB update: `UPDATE site_content SET value = jsonb_set(value, '{name}', '"Agnes Claire Namisango"') WHERE key = 'cofounder_message'` (exact key confirmed at build time).

## Question before I build
Is the image→page mapping above correct, or do you want to reassign any of images 1/3/4/5 to different tabs?