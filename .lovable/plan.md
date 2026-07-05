
This is a big scope, so I'll ship it in **4 phases**. Each phase leaves the site working. Confirm and I'll start with Phase 1.

## Phase 1 — Data model + Admin foundation
Move projects, stories, news, events, gallery, sponsored children, contact/volunteer messages, newsletter, and donation accounts out of hardcoded arrays and into the database.

New tables (with RLS: public can read published rows, only admins can write; messages/subscribers/accounts admin-only):
- `projects` — title, short_description, district, status, budget, raised, beneficiaries, cover_image
- `project_media` — project_id, url, type (image/video), sort (max 50 enforced in UI)
- `sponsored_children` — project_id, name, photo, story
- `news_posts` — title, body, video_url, published_at
- `news_media` — news_id, url, sort (max 5)
- `events` — title, date, location
- `stories` (already exists — extend with photo_url, edit UI)
- `contact_messages` — name, email, phone, subject, message, read
- `volunteer_applications` — name, email, phone, country, skills, availability, interest, cv_url, read
- `newsletter_subscribers` — email, subscribed_at
- `newsletter_template` — single row (subject, html body with `{{title}}` `{{excerpt}}` merge tags)
- `donation_accounts` (already exists — gate the edit UI behind an admin PIN stored as hashed secret)
- `donations` (already exists — add `project_id`, `frequency` [once/weekly/monthly])
- `admin_pin` — hashed PIN for the "Payment Accounts" sub-tab

A DB trigger increments `projects.raised` when a `donations` row is marked `confirmed`, so progress bars update automatically. Admin can also manually adjust `raised` (for cash / in-kind donations).

New admin tabs (inside `/admin`): Projects, Stories, News, Events, Sponsored Children, Messages (Contact + Volunteer, separated), Newsletter (subscribers list + template editor), Payment Accounts (PIN-gated).

## Phase 2 — Public pages wired to the DB
- **Home**: pillars section merged visually with the images below it (single unified block, no gap). Sponsored-children strip reads from DB.
- **Projects list**: reads DB. Click a card → **full-screen modal overlay** (not new route) with title, description, district, image/video slider (swipe on mobile), live progress bar, "Donate to this project" CTA. Admin gets Edit/Delete buttons on cards when signed in as admin.
- **Story page**: reads DB, admin inline edit (name, story, one photo).
- **Gallery**: auto-aggregates all `project_media` images — filter chips removed.
- **News**: reads DB, 5-image slider per post, video autoplays with sound (muted fallback for browsers that block sound-on autoplay — required by Chrome/Safari policy; I'll add an unmute button).
- **Events**: reads DB.

## Phase 3 — Donations, receipts, newsletter, forms
- **Donate page**: frequency selector (Once / Weekly / Monthly), project dropdown (from DB), amount presets. On success → in-page receipt with Download PDF button (reuses existing `receipt.ts`). Confirmed donation updates the chosen project's progress bar via trigger.
- **Sponsorship** on home: same flow, tied to a sponsored child.
- **Contact & Volunteer forms**: on submit → insert into DB + show "Successfully submitted" state. Admin sees them in Messages tab, split into two sub-lists.
- **Newsletter**: subscribe form inserts email. When admin publishes a news post, a server function sends the templated email to all subscribers via Lovable Emails (I'll set up the email domain in this phase). Admin can edit the template and remove subscribers.
- **FAQ page** at `/faq`: static Q&A covering volunteering, donating, sponsorship, tax receipts, contact — linked from nav and volunteer page.

## Phase 4 — Mobile polish
Audit every page at 375px and 747px widths (your current viewport). Fix nav, hero, pillars, project cards, modal slider, admin tables. No design language changes — same tokens, better breakpoints.

## Technical notes
- Storage bucket `project-media` (public read) for images/videos; `story-photos` and `news-media` buckets too.
- Admin PIN: stored as bcrypt hash in `admin_pin` table, verified in a `requireSupabaseAuth` + `has_role('admin')` server function before returning account details.
- Email sending uses Lovable Emails (built-in). I'll run the domain setup when we reach Phase 3.
- Video autoplay-with-sound: browsers block this globally; industry-standard fallback is muted autoplay + prominent unmute button. I'll implement that.

## Open questions before I start
1. **Admin PIN** — should I generate a random one and show it to you once, or do you want to set it yourself in the UI on first visit?
2. **Payment confirmation** — right now donations aren't tied to a real payment processor. Should confirmed = admin marks it confirmed manually in the dashboard, or do you want me to enable Stripe/Paddle now so confirmation is automatic?
3. **Email domain** — for the newsletter to actually send, we need to set up an email sender domain. Do you have a domain (e.g. thesaintschildcare.org) you can add DNS records to, or should the newsletter stay draft-only until you do?

Answer those three and I'll start Phase 1.
