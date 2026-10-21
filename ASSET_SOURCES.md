# HELLO! demo asset sources

Created for this local preview on 2026-10-17. Photography was generated with the built-in `image_gen` tool. These are original demo campaign and product concepts, not photographs of an existing store's stock. The two user-provided screenshots guided the visual style and page composition; they are not served as website images.

All photography is stored in this repository as optimized WebP. No external image host or generated-image working-directory path is required at runtime. Product files are 1000 × 1000; category files are 1200 × 600; the hero is 1942 × 809. Combined final photographs use 747,174 bytes (approximately 730 KiB).

## Files

- `public/hero/campaign.webp`: seated man in black and woman in white on warm concrete steps, with shaded space on the left for page copy.
- `public/categories/t-shirts.webp`: rear three-quarter portrait wearing a black graphic tee.
- `public/categories/pants.webp`: charcoal cargo trousers and offwhite sneakers on concrete.
- `public/categories/hoodies.webp`: gray hoodie, black beanie, and sunglasses against warm concrete.
- `public/categories/accessories.webp`: black cap, sunglasses, and sling bag still life.
- `public/demo-products/essential-tee.webp`: black oversized tee with small white chest lettering.
- `public/demo-products/signature-tee.webp`: white oversized graphic tee.
- `public/demo-products/cargo-pants.webp`: black wide-leg cargo trousers.
- `public/demo-products/oversized-hoodie.webp`: black oversized pullover hoodie.
- `public/demo-products/classic-cap.webp`: ivory embroidered cap.
- `public/demo-products/sling-bag.webp`: black nylon shoulder bag.

## Generation prompt set

Each photograph was generated separately. The reusable product and category instructions below were followed by the corresponding individual specification.

### Hero

Use case: photorealistic-natural. Ultra-wide premium streetwear campaign photograph, approximately 2.4:1 landscape. A stylish adult man with curly dark hair and rectangular black sunglasses wears an oversized black cotton tee with a tiny white handwritten “Hello!” chest logo, black wide-leg trousers, and a thin silver chain. Beside him, a stylish adult woman with long dark hair and rectangular black sunglasses wears an oversized offwhite cotton tee with a tiny black handwritten “Hello!” chest logo and black wide-leg trousers. Both sit naturally on broad brutalist concrete steps in late-afternoon sun. Reserve the far left 38% as deep charcoal shaded concrete for website copy. Place the man near 58% and woman near 82%; show upper bodies and knees. Warm raking sun from upper right, long shadows, inky blacks and warm stone, realistic skin and cotton, 35mm editorial photography, subtle grain. No text except tiny garment logos, no interface, headings, buttons, frames, watermarks, or additional people; anatomically natural hands.

### Catalog common prompt

Use case: product-mockup. Square luxury ecommerce catalog photograph for HELLO! streetwear. A single product centered and fully visible on a seamless warm ivory studio background (#ece9e2), natural soft shadow, premium detailed textile texture, realistic studio photography. Product fills approximately 78% of the square. No mannequin, human, hanger, collage, border, watermark, or text outside specified product lettering.

Individual product specifications:

- Essential tee: oversized heavyweight jet black short-sleeve cotton crewneck T-shirt, front facing, dimensional shoulders and relaxed sleeves, tiny white handwritten “Hello!” embroidered logo on left chest.
- Signature tee: oversized warm white heavyweight short-sleeve cotton crewneck T-shirt, front facing, large confident black brush-script “Hello!” chest graphic, subtle black star and crown accents beneath.
- Cargo pants: jet black relaxed wide-leg cargo trousers, front facing, legs slightly apart, elasticated waist and thin drawstring, large utilitarian side pockets, intricate stitch detail; full trousers visible.
- Oversized hoodie: heavyweight jet black pullover hoodie, ribbed hem, dropped shoulders, kangaroo pocket, hood neatly upright and sleeves down, small white handwritten “Hello!” embroidery on center chest.
- Classic cap: warm ivory six-panel washed cotton baseball cap at a three-quarter angle, curved brim toward lower left, black handwritten “Hello!” front embroidery, visible weave and seams.
- Sling bag: premium jet black compact nylon crossbody bag, three-quarter view, thick short strap arched above, silver-tone zipper, rounded rectangular body and small front pocket, white handwritten “Hello!” front embroidery.

### Categories common prompt

Use case: photorealistic-natural. Wide horizontal ecommerce category campaign photograph, 2:1 landscape. Warm beige brutalist concrete and rich dark charcoal palette, late-afternoon editorial photography, hard sidelight and real textile textures. Single adult subject toward the right two-thirds with low-detail space on the left. No captions, website interface, buttons, watermarks, or text except garment lettering.

Individual category specifications:

- T-shirts: waist-up rear three-quarter portrait of an adult man with curly dark hair and black sunglasses, oversized black tee with large expressive offwhite brush-script “Hello!” back graphic, looking slightly over one shoulder, beige concrete wall.
- Pants: low-angle waist-down crop of one adult wearing loose charcoal-black wide-leg cargo pants with chunky pockets and offwhite canvas sneakers, standing naturally on warm concrete.
- Hoodies: waist-up adult male model in a light heather-gray hoodie with tiny black handwritten “Hello!” chest logo, black knit beanie and rectangular sunglasses, leaning against beige concrete and looking slightly down.
- Accessories: black six-panel cotton cap with warm ivory handwritten “Hello!” embroidery on a stone plinth, folded rectangular sunglasses and compact black sling bag beside it, afternoon sun and realistic materials.

## Demo wordmark and font

`public/brand/logo-light.svg` and `public/brand/logo-dark.svg` contain outlined “Hello!” lettering derived from the Satisfy Regular typeface. They contain actual vector paths and do not depend on an installed font. This is replaceable demo lettering, not a claim to reproduce the brand's original logo artwork.

- Typeface source: [Google Fonts — Satisfy](https://github.com/google/fonts/tree/main/apache/satisfy).
- Source font: `public/brand/satisfy-regular.ttf`.
- License: Apache License 2.0, included at `public/brand/FONT-LICENSE.txt`.
- Runtime font loading is optional; the SVG wordmarks are self-contained.

For a real launch, replace the demo wordmark and generated merchandise photographs with approved brand artwork and actual inventory photography while keeping the same asset paths or updating their references.

## User-supplied campaign photographs — 2026-10-21

The homepage redesign also uses ten photographs supplied directly by the user. They are stored separately under `public/campaign/real/`; they are not generated images. Full provenance, dimensions, processing notes, and source mapping are in [REAL_CAMPAIGN_ASSETS.md](REAL_CAMPAIGN_ASSETS.md). The existing demo catalog photography remains separate.
