# HELLO! fit explorer upgrade

This is an in-place update to the existing Next.js 16 App Router storefront. React, strict TypeScript, Tailwind v4, GSAP, the original routes and trusted sample catalog are retained. No new rendering dependency or payment integration was installed. The complete supplied specification is preserved in `HELLO_STREETWEAR_ULTIMATE_CODEX_MASTER_PROMPT.txt`.

## Implementation plan and ownership

1. Inspect the existing hero, navigation, shop, assets, checkout and framework guides. Preserve the existing shopping data and business logic.
2. Extract the supplied exact logo pixels, animate only its exclamation, and remove the full-screen intro.
3. Add a custom metallic eight-spoke selector, shared look state and eight coordinated visual demos.
4. Move the full category imagery to Shop and Collections, retaining existing category routes and listing filters.
5. Check production compilation, types, lint, interaction math and the actual browser experience.

## Main files

| File | Purpose |
|---|---|
| `src/components/branding/AnimatedHelloLogo.tsx` | Centered original logo; only its separate exclamation layer hops. |
| `src/components/layout/SiteShell.tsx` | Keeps navigation, search, cart and footer; removes the blocking intro. |
| `src/components/hero/StreetwearFitExplorer.tsx` | Responsive hero and single shared `selectLook` handler. |
| `src/components/hero/OutfitWheel.tsx` | Actual eight-spoke geometry, interactive handles, drag, keyboard, pause and idle motion. |
| `src/lib/wheel-math.ts` | Normalization, angular deltas and deterministic 45-degree detents. |
| `src/components/hero/ModelOutfitShowcase.tsx` | Local visual loading, latest-selection wins, previous-frame continuity and 520ms reveal. |
| `src/components/hero/DemoFigures.tsx` | Independently layered two-figure clothing fallback, including different silhouettes, colors and garment details. |
| `src/data/helloLooks.ts` | All eight looks, predictable image paths, male/female configs, framing, palettes and safe category links. |
| `src/components/shop/CategoryFeatureGrid.tsx` | Spacious full-image category cards shared by Shop and Collections. |
| `src/components/shop/ShopListing.tsx` | New Shop opening above the preserved filtered product catalog. |
| `src/components/home/Home.tsx` | Integrates the new hero, removes the old category strip, preserves arrivals and campaign/story. |
| `tests/wheel-math.test.ts` | Selection and wrap-around regression checks. |

## Artwork and truthful demo scope

The existing hero is a flattened photograph. It cannot be re-dressed with animation code. It remains in the editorial section, About and other existing campaign uses. Existing category and catalog images are reused; no new product listings, stock or prices are invented for the looks.

The new eight generated look photographs are temporary styling studies. Both adult figures are anchored to a common reference composition. Generated photography can vary slightly in fine face, pose and fabric details; these are recorded looks, not real-time cloth simulation. A labeled local SVG garment scene covers missing/failed images, with eight genuinely different clothing configurations for both figures.

| Look | Visible wardrobe changes |
|---|---|
| 01 — Essential oversized tee | Relaxed black tees and dark trousers on both figures. |
| 02 — Graphic street tee | Cream/white graphic tees, black trousers and street accessories. |
| 03 — Cargo fit | Muted tops and olive/charcoal cargo silhouettes with utility pockets. |
| 04 — Hoodie drop | Gray and black hoodies with long sleeves, hoods and relaxed trousers. |
| 05 — Monochrome set | Coordinated black/charcoal layers and tonal trousers. |
| 06 — Relaxed denim | Off-white tops and loose washed denim. |
| 07 — Urban layers | Open overshirts, visible tees and baggy trousers. |
| 08 — HELLO! signature | A contrasting cream/black branded featured combination. |

## Original logo

The supplied raster file is retained unmodified at `public/branding/hello-original.png`. `hello-light.webp` is the full transparent derivative. `hello-word.webp` and `hello-mark.webp` preserve the same canvas; the latter contains the original exclamation stem and dot only. Superimposing the two gives the original complete mark, without a stationary duplicate. This is exact raster extraction, not a font substitute or a claim of vector reconstruction.

## Interaction rules

- Tap/click one of eight ball handles to select its numbered look.
- Drag around the wheel center and release. A bounded angular gesture snaps to a 45-degree detent and selects once.
- Arrow keys and previous/next buttons step through looks; native Enter/Space activates focused handles.
- Idle rotation takes roughly 28 seconds per revolution and never selects a look. Selection and the decorative angle are separate.
- Hover, focus, active gestures, hidden documents, reduced motion and leaving the viewport stop idle movement. The user can also pause it.
- The selected caption updates immediately. Image loading is cancellable: only the latest requested look can become current. The previous ready frame stays visible while the next image loads, then the new recorded look softly reveals. An image failure uses actual local garment layers instead of a broken icon.
- Explore the Pieces links to an existing category or Shop. No outfit is presented as a guaranteed in-stock bundle.

## Replace temporary looks

1. Supply eight approved photos of the same adult pair with matched camera, lighting, pose, placement and dimensions. Keep heads and shoes inside the canvas with margin.
2. Export optimized WebP images as `public/demo/looks/look-01.webp` through `look-08.webp`, or set the eight `image` URLs in `src/data/helloLooks.ts`.
3. Adjust each look's `imagePosition` if necessary. The showcase uses `object-fit: contain` so full framing is preserved.
4. Update names, descriptions and palettes. Add only verified catalog IDs and truthful shopping associations. Replace the generated-demo disclosure only when the images and claims have been approved.
5. For registered garment masks or rigged 3D assets, replace `ModelOutfitShowcase` behind the same `activeLook` contract; the wheel and selection state do not need rewriting. Clothing masks should be supplied alongside the real photos; the current photographed figures are not claimed to have editable cloth meshes.

## Categories and existing commerce

Home proceeds directly from the fit explorer to New Arrivals, then the retained campaign/story. The four categories now appear on `/shop` and `/collections` as full-framed editorial images with accessible links to `/collections/t-shirts`, `/collections/pants`, `/collections/hoodies` and `/collections/accessories`. Original source cropping cannot reveal pixels that were never in a photo, so images are contained without introducing additional clipping.

The existing demo cart, wishlist, checkout validation, prices, account configuration states, admin sandbox and server routes remain in place. No live orders, payments, credentials or customer data are changed.

## Verification and local preview

Run `npm run dev` and visit http://localhost:3000. This is a local preview, not a deployment. Final verification results are recorded in `IMPLEMENTATION_STATUS.md`.

On this machine, C: ran out of space. Regenerable package caches and Next.js source maps were moved into `D:\CodexScratch\hello-clothing-20261017`; project source remains here. The source-map backup is reversible and the ordinary install commands work on a machine with sufficient free disk space.
