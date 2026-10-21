# HELLO! homepage revision — 21 October 2026

The latest reference replaces the wheel-led homepage with five scrolling chapters. Existing wheel source and prior assets are retained, but the wheel is not mounted on the homepage.

1. Full-screen three-slide campaign with the requested translation: **ONE DAY, EVEN THE DEVIL WILL SAY HELLO.** The original transparent logo finishes the headline. Manual slide buttons, previous/next, keyboard arrows, automatic crossfades and pause are implemented. Motion pauses while interacting, offscreen, in hidden tabs or with reduced-motion preferences.
2. Shop by Category and New Arrivals together. Four category links, horizontal product rail, wishlist buttons and working product links.
3. Built Different and Best Sellers together. Existing product data/prices remain unchanged; Best Sellers is labelled as a preview edit rather than verified sales data.
4. Men's and Women's editorial cards plus a smaller Customer reviews heading and sideways review slideshow. Both edit links open the shared preview collection with the appropriate title. Reviews are explicitly samples, since no actual customer testimonials were supplied.
5. Stay in the Loop, service information and dark footer together. Newsletter validates email and shows an honest preview response without sending or saving an address. Shipping & delivery wording was confirmed by the owner; no free-shipping threshold is invented.

The black navbar uses New Arrivals, T-shirts, Hoodies, Pants and Accessories, with the original centered animated logo and retained search/account/cart controls. The newly attached logo is a photographed treatment of the brand; the existing clean original logo is retained for sharp rendering.

## Source and imagery

- `src/components/home/Home.tsx`, `editorial-home.css`: chapter structure, category/product rails, editorial cards and responsive layouts.
- `src/components/hero/Hero.tsx`: three-slide campaign.
- `src/components/home/CommunityReviews.tsx`, `Newsletter.tsx`, `community.css`: review carousel, newsletter and service links.
- `src/components/layout/SiteShell.tsx`, `site-shell.css`: navigation and reusable footer.
- `src/components/shop/ShopListing.tsx`: titles for `?edit=men` and `?edit=women` entry points.
- `public/campaign/real/`: ten optimized, full-frame supplied photographs. See `REAL_CAMPAIGN_ASSETS.md` and `manifest.json` for exact source mappings. No generated alteration was made to these photos.

The landscape campaign and product cutouts are retained demo assets. Supplied portraits appear in slides, categories, editorial cards, sample review cards and newsletter. Advertising posters/prices were not converted into inventory; replacing catalog entries remains a separate step requiring product mappings.

## Verification

- Production build and TypeScript passed; ESLint passed; 31 existing tests passed across four files.
- Fifteen representative homepage, shopping, edit, category, cart, checkout, search, wishlist and admin routes returned HTTP 200.
- Browser verified all three hero selections, category navigation, product rail movement, review pause/manual movement, newsletter feedback, mobile drawer, product size selection and cart quantity/removal. Test cart item was removed.
- Checked widths 390, 430, 768, 1024, 1366 and 1440. No document horizontal overflow or broken image loads. Desktop/tablet chapter groups fit the available viewport. Short screens and phones expand naturally rather than hiding text or controls.
- Reduced motion handling is source-reviewed; an actual touch device and OS-level preference change were not tested.
- Preview: http://localhost:3000. Screenshots are in `artifacts/editorial-home-mobile.png` and `artifacts/editorial-home-desktop.png`.

This remains the existing local demo store. Real payments, customer accounts and mailing-list delivery have not been activated.
