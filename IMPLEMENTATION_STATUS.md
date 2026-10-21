# Implementation status

## Implemented

- Responsive fit-explorer homepage with an eight-look visual styling demo, new arrivals and retained campaign/story. Full-framed category cards are relocated to Shop and Collections.
- Immediate homepage rendering, with the original centered logo and a short exclamation-only navbar hop. The former full-screen intro is removed.
- Catalog routes and categories, URL search/filter/sort state, empty states and breadcrumbs.
- Product options, gallery enlargement, size information, quantity controls, add to bag, buy-now path, wishlist and share link.
- Validated guest bag and wishlist persistence; shared bag drawer/full bag and exact minor-unit totals.
- Accessible modal keyboard traps, focus restoration, mobile navigation, labeled controls, live toasts and reduced-motion styles.
- Server-validated demo checkout and same-tab order preview. No payment collection or PII persistence.
- Support/editorial routes, explicit draft legal/measurement information and honest unconfigured contact/account/tracking states.
- Browser-local admin studio with products, color/size inventory demonstration, categories, media validation, content previews and local settings. No fictitious sales or customers.
- Supabase migration files, published-only catalog RLS, protected roles and customer records, privileged atomic order/idempotency and audited inventory functions, storage policies, opt-in seed and security assertions.

## Demo-only / needs configuration

- Product concepts, sample prices, sample aggregate product stock and AI campaign imagery are demonstrative. Per-variant stock in the studio is a local demonstration, not a connected production inventory source.
- The original supplied raster logo is integrated with exact transparent word/exclamation layers. Generated look photographs are temporary demos; fine pose/face details may vary between renders.
- Admin product/category/media/settings modifications stay in the browser studio. Homepage text can be previewed on the same-browser storefront. No live catalog publication occurs.
- The trusted public catalog is the version-controlled sample catalog. A production catalog adapter, authenticated staff CRUD and account session integration remain to be wired to Supabase.
- Checkout produces a preview only. Live order RPC exists in migrations but is not connected to the HTTP checkout endpoint. Real stock reservations/deductions and fulfillment are disabled.
- COD, bank transfer and PayHere/hosted card payments need approved business configuration and tested production adapters; no gateway signatures or callback handlers are claimed complete.
- Email/contact/newsletter delivery, verified order tracking, real customer accounts and order history require providers and production integration.
- Legal policies, approved shipping rates, real contact channels, garment specifications and copy require client content and approval.
- Deployment/domain/live SEO remain unconfigured. The local preview is noindex.

## Baseline verification (before fit explorer upgrade)

Verified locally on 17 October 2026:

- `npm run build`: passed, including TypeScript, prerendering and production build traces. Build workers are limited to two for this machine's memory capacity.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 23 tests passed across cart validation, currency/totals, server checkout and origin protection.
- Production server (`npm start`) returns 200 for all 30 tested storefront/admin routes. An unknown product returns 404, the admin API returns 401, foreign-origin checkout returns 403 and a submitted browser price is rejected with 400.
- Browser shopping flow verified: select a size, add an Essential Tee, increase quantity to two, preview checkout, confirm exact LKR 6,980 subtotal + LKR 500 demo delivery = LKR 7,480. Confirmation explicitly says no order/payment occurred.
- Search finds accessories; a saved Classic Cap survives reload in the wishlist. Test bag and wishlist data were removed through the UI afterward.
- Mobile menu/category navigation, mobile filters and admin overview/product controls inspected in the browser.
- Homepage widths 360, 390, 768, 1024 and 1536 checked with no document overflow. Desktop/mobile screenshots saved under `artifacts/`.
- The former intro and search Escape dismissal were verified in the baseline. Intro behavior is superseded by the fit explorer upgrade.
- Generated WebP images decode, no zero-byte source/assets remain, and all visible homepage images load.

Supabase migration execution, multi-user RLS and database concurrency tests require a configured development database and remain unverified. The local browser admin is a sandbox; production authentication/authorization and provider integration are not claimed complete.

## Homepage revision — 21 October 2026

The latest user reference supersedes the wheel-led homepage. See EDITORIAL_HOME_UPDATE.md for the five chapter groups, supplied photography, exact tagline and current implementation.

Final production build and TypeScript passed. ESLint passed. All 31 tests across four files passed. Fifteen representative routes returned 200. Browser checks covered three hero slides, category navigation, product/review carousel controls, newsletter preview feedback, mobile menu, product size selection, cart quantity/removal and Men's Edit navigation. No browser errors/warnings were recorded during those checks. Temporary cart data was removed through the UI.

Responsive checks at 390, 430, 768, 1024, 1366 and 1440 pixels showed no document horizontal overflow or broken loaded images. The five groups fit one available screen each at normal desktop/tablet sizes, with natural expansion on phones and short screens to preserve content. Desktop native scroll snapping aligned chapter starts below the sticky navbar.

Shipping & delivery wording is owner-approved. Product inventory/prices remain demo catalog data; reviews are labelled samples and newsletter submission does not save or send emails. User-supplied photos are documented in REAL_CAMPAIGN_ASSETS.md.
