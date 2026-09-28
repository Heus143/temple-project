# PRD — Sri Annapurnamma Temple Website + Admin CMS

## Original Problem Statement
Production-quality, responsive website for SRI ANNAPURNAMMA TEMPLE (శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిరము), Avvaru Vari Street, Chirala, Bapatla District, Andhra Pradesh – 523155. Real temple site — no invented content. Public site + secure single-admin CMS. Preserve original assets (deity photo, Telugu title artwork, committee banner). Unified sacred hero, seamless mantra ticker, box-style navigation, full content management for all sections.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). JWT auth (httpOnly cookies, bcrypt), single admin seeded from env. Generic content API: singletons (`/api/content/{key}`) + collections (`/api/collection/{name}` public published-only, `/api/admin/collection/{name}` admin CRUD + reorder). Media stored as base64 data URLs in Mongo. Contact messages. Password reset flow (Emergent email).
- **Frontend**: React 19 + react-router 7, Tailwind, sonner toasts, lucide icons. Public palette: deep maroon / antique gold / ivory. Cinzel + Cormorant + Noto Serif Telugu fonts. `EntityManager` (generic CRUD) + `SingletonEditor` power the admin.
- **Assets**: `/assets/deity.png`, `/assets/title_artwork.png` (originals, static). `/assets/committee/member_1..17.jpg` (17 portraits cropped from the original banner).

## User Personas
- **Visitor**: reads published temple info, events, gallery, committee, previous years, sends contact messages.
- **Temple Administrator** (templeadmin2026@gmail.com): manages all content via /admin, no code needed.

## Core Requirements (static)
- Unified hero (title artwork above deity, one gold frame, no black bars, object-fit contain).
- Seamless CSS mantra ticker, separate from nav.
- Box-style nav below hero (3-col desktop / 2-col mobile), active + hover states.
- Every committee member from banner gets an individual card; admin fills verified names/positions and can replace with HD photos.
- Dynamic Events + Previous Years (any year, no hard-coding), publish/unpublish, multi-photo upload.
- Admin-only writes enforced server-side; /admin redirects to /admin/login when unauthenticated.
- No invented factual content; clean empty states everywhere.

## Implemented (2026-06)
- ✅ All 9 public pages + 14 admin pages, full routing.
- ✅ JWT auth, brute-force lockout (X-Forwarded-For aware), forgot/reset password.
- ✅ Singletons: website_settings, home_content, about_content, temple_info, location_info, contact_info.
- ✅ Collections: events, previous_years, gallery, gallery_categories, committee_members (17 seeded), vamshavali, announcements, media_library.
- ✅ Media Library (upload/search/copy), Contact messages (read/delete), Dashboard stats.
- ✅ Gallery lightbox + categories, announcements date-window filtering.
- ✅ Responsive, SEO title/meta/OG, accessibility (alt text, focus states, semantic HTML), no Lovable branding.
- ✅ Tested: 20/21 backend (then brute-force fixed → passing), 100% frontend flows.
- ✅ Bug fix (2026-06): Admin login email corrected to templeadmin2026@gmail.com (was seeded as kumardivvelaa@gmail.com). Logout hardened: token_version bump invalidates retained JWTs server-side. Verified by testing agent (iteration_2, 100%).

## Backlog / Remaining
- **P1**: Admin explicit "replace protected hero asset" upload control (currently hero images are fixed static files).
- **P2**: Image server-side optimization/thumbnails (media stored raw base64).
- **P2**: Ongoing/Completed/Archived event filtering UI on public Events page.

## Next Tasks
- Await admin to populate real content (About/History/Contact/Timings/committee names).
- Optional: seed initial About/Contact text when temple provides verified copy.
