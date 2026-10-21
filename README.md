# HELLO! Clothing

A responsive, editorial streetwear store built with Next.js App Router, React, TypeScript, Tailwind CSS, GSAP and Lucide. The workspace starts in **demo mode** without credentials.

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000. The homepage renders immediately with a three-slide campaign and five grouped editorial sections. The navbar retains the original animated exclamation mark. Reduced motion disables automatic animation. See `EDITORIAL_HOME_UPDATE.md` for the 21 October homepage revision.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Explore

- `/`: full-screen campaign, Categories + New Arrivals, Built Different + Best Sellers, Men's/Women's Edit + sample reviews, then newsletter + service information + footer. Desktop scroll snapping keeps chapter groups together; phone content expands naturally.
- `/shop`, `/new-arrivals`, `/collections`, `/collections/t-shirts`, `/collections/pants`, `/collections/hoodies`, `/collections/accessories`: browsing, URL-backed filters and sorting.
- `/products/essential-tee` and the other catalog slugs: product gallery, options, quantity, bag and wishlist.
- `/search?q=hoodie`, `/wishlist`, `/cart`, `/checkout`: the complete demo shopping journey.
- `/order-confirmation/[preview-reference]`: server-validated order preview, available in the same browser tab. No actual order or payment.
- `/account`, `/account/orders`, `/track-order`: honest configuration states; no pretend authentication or tracking.
- `/about`, `/contact`, `/faq`, `/size-guide`, `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/terms`: editable concept content and clearly marked draft policies.
- `/admin`: an explicitly labeled browser-local demonstration of product, variant inventory, category, media and content management. It contains no real customer records and is disabled in live mode. It is **not** a production admin login.

## Data and demo behavior

All money is integer LKR minor units: `349000` means LKR 3,490. The shared catalog is `src/lib/catalog.ts`. Bag and wishlist store only product identifiers, selected options and quantities in browser storage. Saved browser data is validated before use.

`POST /api/checkout` ignores browser prices, validates products and options, merges quantities, checks sample stock and computes totals. The LKR 500 delivery fee is explicitly a demo value. The endpoint returns an order preview without storing delivery details or creating orders. No payment provider, mailing service, tracking provider or customer authentication is active.

The admin studio saves to this browser. Product/inventory edits demonstrate management and do not publish new merchandise to the trusted storefront catalog. The revised homepage uses the requested tagline in `Hero.tsx`; previously saved demo headline fields do not override it. Shipping, support and other business settings remain draft setup values. The former full-screen intro has been removed.

## Production setup

Read `PRODUCTION_SETUP.md`, `IMPLEMENTATION_STATUS.md` and `CLIENT_ASSET_CHECKLIST.md`. Supabase migrations, row-level security, service-only order and inventory functions and an opt-in demo seed are provided. The database migrations and policies require verification against a real development Supabase project before activation. Live storefront/auth/admin/payment adapters are not activated by entering keys.

Do not enable commercial checkout until real inventory, shipping, policies, merchant integration and staff authorization have been implemented, tested and approved. `NEXT_PUBLIC_APP_MODE=live` and/or `STORE_MODE=live` fail closed for checkout; this is intentional.

## Replace the brand assets

`public/branding/hello-original.png` is the exact uploaded logo. Transparent full, word-only and exclamation-only derivatives preserve its pixels and alignment. The old font-derived assets remain archived in `public/brand/` and are no longer the storefront logo. See `FIT_EXPLORER_UPGRADE.md` for the animation, look configuration, asset replacement and verification details.

Replace `public/hero/campaign.webp`, `public/categories/*.webp` and `public/demo-products/*.webp` with approved campaign/catalog photography, preserving names or updating the catalog. See `ASSET_SOURCES.md` for provenance. Do not use generated concept photos as proof of real merchandise specifications.

All prototype routes are marked `noindex`; `robots.ts` disallows crawling until a real domain and approved live content are configured. No analytics or marketing subscriptions are embedded.

## Local disk arrangement

During setup, C: filled up. Regenerable dependencies and build cache may be placed under `D:\CodexScratch\hello-clothing-20261017` and linked through local directory junctions. These are ignored and are not part of the source project. On another computer, run `npm install` normally.

Framework reference: [official Next.js App Router documentation](https://nextjs.org/docs/app/getting-started/installation).
