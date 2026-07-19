## What I'll do

### 1. Delete pages
- Remove route files: `src/routes/founder.tsx`, `src/routes/leadership.tsx`, `src/routes/terms.tsx`, `src/routes/privacy.tsx`.
- Remove all references/links to them in `src/routes/about.tsx`, `src/components/site/SiteFooter.tsx`, `src/routes/__root.tsx`, `src/routes/sitemap[.]xml.ts`, and any admin links.
- The route tree regenerates automatically.

### 2. Trim admin tabs
In `src/routes/_authenticated/admin.tsx`:
- Remove the **Hero & About** tab (the `hero` tab entry + its `ContentJsonEditor` render).
- Remove the **Payment Accounts** tab (`accounts` entry + `AccountsPinGate` render). The `AccountsPinGate`/`AccountsEditor` components and PIN logic will be deleted as dead code.
- Remove `"hero"` and `"accounts"` from the tab-type union.

### 3. Mobile responsiveness & image polish
Sweep the site for phone-mode issues without changing desktop design:
- **Nav (`SiteNav.tsx`)**: verify mobile menu handles the language dropdown + donate button without overflow; tighten paddings.
- **PageHeader (`SiteLayout.tsx`)**: reduce hero title from `text-5xl` baseline so it doesn't wrap awkwardly on ~375px screens; add `md:` breakpoints for py.
- **Hero images**: ensure all `<img>` in hero sections use `object-cover` + a mobile-friendly `object-position` (they already do — I'll audit each hero on `index`, `about`, `donate`, `gallery`, `projects`, `stories`, `news`, `contact`, `volunteer`, `auth` and fix any that crop faces).
- **Grid layouts**: audit `grid-cols-*` on homepage impact stats, program pillars, project cards, gallery, stories, news, founders section in About — ensure they collapse to 1–2 cols on mobile with proper gap.
- **Donation wizard (`donate.tsx`)**: verify the floating card + vertical step-tab stack correctly on mobile (side-tab should move to top or horizontal scroll).
- **MediaCarousel**: verify nav buttons + dots don't overlap content on small viewports.
- **Typography**: reduce oversized `text-7xl`/`text-6xl` to `text-4xl` at base with `md:` scaling where they overflow.
- **Horizontal overflow**: add `overflow-x-hidden` guardrail on `main` or root; find any fixed-width elements.

I'll test at 375px via Playwright screenshots on the key routes (`/`, `/about`, `/donate`, `/projects`, `/gallery`, `/stories`, `/news`, `/contact`) and fix anything visibly broken.

### 4. Cleanup
- Update `SiteFooter` legal column (currently links to `/privacy`, `/terms`) — replace with `/contact` or remove the column.
- Update About page's "Meet leadership" link/section if present.

### Files touched
- Delete: `src/routes/founder.tsx`, `src/routes/leadership.tsx`, `src/routes/terms.tsx`, `src/routes/privacy.tsx`
- Edit: `src/routes/_authenticated/admin.tsx`, `src/routes/about.tsx`, `src/components/site/SiteFooter.tsx`, `src/components/site/SiteLayout.tsx`, `src/components/site/SiteNav.tsx`, `src/routes/__root.tsx`, `src/routes/sitemap[.]xml.ts`, plus targeted mobile-fix edits on pages flagged during the Playwright audit.
