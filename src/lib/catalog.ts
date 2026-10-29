export type CategorySlug = 't-shirts' | 'pants' | 'hoodies' | 'accessories';
export type Product = {
  id: string; slug: string; name: string; price: number; category: CategorySlug;
  image: string; gallery?: string[]; colors: {name: string; hex: string}[];
  colorImages?: Record<string, string>;
  sizes: string[]; stock: number; description: string; tags: string[];
  status: 'published' | 'draft' | 'archived'; isDemo: boolean;
  gender?: 'men' | 'women' | 'unisex';
  fabricDetails?: { composition: string; gsm: string; fit: string; care: string };
};
export const categories = [
  { slug: 't-shirts', name: 'T-Shirts', image: '/categories/t-shirts.webp', caption: 'Heavyweight 240+ GSM boxy cuts.' },
  { slug: 'pants', name: 'Pants', image: '/categories/pants.webp', caption: 'Wide-leg stacks and utility pockets.' },
  { slug: 'hoodies', name: 'Hoodies', image: '/categories/hoodies.webp', caption: '380 GSM brushed fleece layers.' },
  { slug: 'accessories', name: 'Accessories', image: '/categories/accessories.webp', caption: 'Everyday carry and street essentials.' }
] as const;
const black = { name: 'Black', hex: '#181918' };
const white = { name: 'Off White', hex: '#e7e3d9' };
const gray = { name: 'Ash', hex: '#85857f' };
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
export const products: Product[] = [
  {
    id: 'essential-tee', slug: 'essential-tee', name: 'Essential Tee', price: 349000, category: 't-shirts',
    image: '/demo-products/essential-tee.webp',
    colors: [black, white, gray],
    colorImages: {},
    gallery: [
      '/demo-products/essential-tee.webp'
    ],
    sizes, stock: 24,
    description: 'Our core staple in 240 GSM heavy combed cotton. Cut boxy with relaxed drop shoulders and a snug ribbed collar that won’t lose shape after washing.',
    tags: ['new', 'essential', 'oversized', 'cotton', 'men', 'women'],
    status: 'published', isDemo: true, gender: 'unisex',
    fabricDetails: {
      composition: '100% Combed Compact Cotton',
      gsm: '240 GSM Heavyweight',
      fit: 'Relaxed Drop-Shoulder Oversized',
      care: 'Machine wash cold (30°C) with like colors. Do not bleach. Hang dry inside out. Do not iron directly on graphics.'
    }
  },
  {
    id: 'signature-tee', slug: 'signature-tee', name: 'Signature Tee', price: 399000, category: 't-shirts',
    image: '/demo-products/signature-tee.webp',
    colors: [white, black],
    colorImages: {},
    gallery: [
      '/demo-products/signature-tee.webp'
    ],
    sizes, stock: 18,
    description: 'Heavyweight 260 GSM jersey featuring our high-density screen-printed HELLO! graphic. A relaxed boxy cut that drapes cleanly without clinging in the humidity.',
    tags: ['new', 'graphic', 'oversized', 'men', 'women'],
    status: 'published', isDemo: true, gender: 'unisex',
    fabricDetails: {
      composition: '100% Ring-Spun Cotton',
      gsm: '260 GSM Ultra-Density Jersey',
      fit: 'Boxy Streetwear Fit with Ribbed Collar',
      care: 'Gentle cycle, cold water. Air dry recommended. Low-heat iron on reverse.'
    }
  },
  {
    id: 'cargo-pants', slug: 'cargo-pants', name: 'Cargo Pants', price: 599000, category: 'pants',
    image: '/demo-products/cargo-pants.webp',
    colors: [black, gray],
    colorImages: {},
    gallery: [
      '/demo-products/cargo-pants.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'], stock: 16,
    description: 'Wide-leg utility cargos cut from durable 290 GSM stretch-cotton twill. Finished with deep gusset cargo pockets, an elasticated waistband, and adjustable hem drawcords to toggle your stack.',
    tags: ['new', 'utility', 'relaxed', 'men'],
    status: 'published', isDemo: true, gender: 'men',
    fabricDetails: {
      composition: 'Cotton-Twill Blend with Stretch Spandex',
      gsm: '290 GSM Heavy Twill',
      fit: 'Wide-Leg Ergonomic Cargo with Adjustable Hem Cords',
      care: 'Wash inside-out with cold water. Tumble dry low or line dry in shade.'
    }
  },
  {
    id: 'oversized-hoodie', slug: 'oversized-hoodie', name: 'Oversized Hoodie', price: 699000, category: 'hoodies',
    image: '/demo-products/oversized-hoodie.webp',
    colors: [black, gray],
    colorImages: {},
    gallery: [
      '/demo-products/oversized-hoodie.webp'
    ],
    sizes, stock: 12,
    description: 'Heavy 380 GSM brushed fleece with a structured double-layer hood that actually stays up. Dropped shoulders, seamless kangaroo pocket, and thick ribbed cuffs built for cool evenings and AC chill.',
    tags: ['new', 'oversized', 'layer', 'men', 'women'],
    status: 'published', isDemo: true, gender: 'unisex',
    fabricDetails: {
      composition: '80% Premium Cotton, 20% Polyester Brushed Fleece',
      gsm: '380 GSM Heavyweight Terry',
      fit: 'Double-Layered Hood with Kangaroo Pouch & Dropped Shoulders',
      care: 'Cold gentle machine wash. Do not dry clean. Flat dry to preserve structural fleece.'
    }
  },
  {
    id: 'classic-cap', slug: 'classic-cap', name: 'Classic Cap', price: 299000, category: 'accessories',
    image: '/demo-products/classic-cap.webp',
    colors: [white, black],
    colorImages: {},
    gallery: [
      '/demo-products/classic-cap.webp'
    ],
    sizes: ['One Size'], stock: 30,
    description: 'Low-profile 6-panel dad cap made from washed cotton chino twill. Features clean raised HELLO! 3D embroidery on the front and an adjustable brass buckle strap at the back.',
    tags: ['new', 'headwear', 'essential', 'men', 'women'],
    status: 'published', isDemo: true, gender: 'unisex',
    fabricDetails: {
      composition: '100% Washed Cotton Chino Twill',
      gsm: 'Structured 6-Panel Crown',
      fit: 'Unstructured Crown with Antiqued Brass Slider Clasp',
      care: 'Spot clean with damp cloth and mild detergent. Do not machine wash.'
    }
  },
  {
    id: 'sling-bag', slug: 'sling-bag', name: 'Sling Bag', price: 499000, category: 'accessories',
    image: '/demo-products/sling-bag.webp',
    colors: [black],
    colorImages: {},
    gallery: [
      '/demo-products/sling-bag.webp'
    ],
    sizes: ['One Size'], stock: 14,
    description: 'Weather-resistant 600D Cordura crossbody bag with dual zip compartments, quick-release seatbelt strap, and internal mesh organizers sized for your phone, keys, wallet, and charger.',
    tags: ['new', 'utility', 'bag', 'men', 'women'],
    status: 'published', isDemo: true, gender: 'unisex',
    fabricDetails: {
      composition: '600D Waterproof Cordura Nylon',
      gsm: 'Weather-Resistant Dual-Compartment Shell',
      fit: 'Adjustable Seatbelt-Webbing Strap with Heavy-Duty Buckle',
      care: 'Wipe clean with a damp microfiber cloth.'
    }
  }
];
export const siteConfig = { name: 'HELLO!', mode: process.env.NEXT_PUBLIC_APP_MODE === 'live' ? 'live' : 'demo', currency: 'LKR' };
export function money(minor: number) { return `LKR ${new Intl.NumberFormat('en-LK', {maximumFractionDigits: 0}).format(minor / 100)}`; }
export function getProduct(slug: string) { return products.find(p => p.slug === slug && p.status === 'published'); }
export function searchProducts(query: string) { const q=query.toLowerCase().trim(); return products.filter(p=>p.status==='published' && `${p.name} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q)); }

