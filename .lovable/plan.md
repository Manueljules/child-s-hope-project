## Goal
Replace the current "M" text placeholder logo with the uploaded SVG (Masembe Childcare Foundation Uganda official mark) everywhere it appears.

## Steps

1. **Add the SVG to the project**
   - Copy `user-uploads://Untitled-3_Recovered.svg` into `public/logo.svg` so it can be referenced as `/logo.svg` from anywhere (nav, footer, favicon, og fallback).

2. **Create a reusable `<Logo />` component** at `src/components/site/Logo.tsx`
   - Renders `<img src="/logo.svg" alt="The Saint's Childcare Foundation Uganda" />` with a `className` prop for sizing.
   - Keeps the mark crisp at any size and one single source of truth.

3. **Replace the "M" placeholder blocks**
   - `src/components/site/SiteNav.tsx`: swap the `size-8 sm:size-10 bg-brand-blue … M` div for `<Logo className="size-8 sm:size-10" />`.
   - `src/components/site/SiteFooter.tsx`: same swap for the footer brand mark.

4. **Favicon + head links** in `src/routes/__root.tsx`
   - Add `{ rel: "icon", type: "image/svg+xml", href: "/logo.svg" }` to `head().links`.
   - Delete the template's default `public/favicon.ico` so the new SVG favicon is served consistently.
   - Add `{ rel: "apple-touch-icon", href: "/logo.svg" }`.

5. **Verify**
   - Run `bun run build`; on success call `restart_dev_server` so the preview picks up the new favicon and layout.
   - Visually confirm nav + footer show the crest on desktop and mobile.

## Notes / Not changing
- Brand wordmark text ("Masembe" / "Childcare Foundation") stays as-is next to the logo.
- No admin/DB changes — this is purely presentational.
- Not touching `og:image` since the SVG isn't a good social preview; hosting continues to inject the preview screenshot.
