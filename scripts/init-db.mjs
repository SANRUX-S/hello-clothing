import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required to run migrations.');
}
const sql = neon(databaseUrl);

export async function initDb() {
  console.log('Connecting to Neon database...');

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT DEFAULT '',
      caption TEXT DEFAULT '',
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      gallery JSONB DEFAULT '[]'::jsonb,
      colors JSONB DEFAULT '[]'::jsonb,
      color_images JSONB DEFAULT '{}'::jsonb,
      sizes JSONB DEFAULT '[]'::jsonb,
      stock INTEGER NOT NULL DEFAULT 0,
      description TEXT DEFAULT '',
      tags JSONB DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'published',
      is_demo BOOLEAN DEFAULT false,
      gender TEXT DEFAULT 'unisex',
      fabric_details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      reference TEXT PRIMARY KEY,
      customer JSONB NOT NULL,
      items JSONB NOT NULL,
      subtotal INTEGER NOT NULL,
      delivery INTEGER NOT NULL,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cod',
      status TEXT NOT NULL DEFAULT 'processing',
      courier TEXT DEFAULT 'PromptX Logistics',
      tracking_number TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('Tables created or verified.');

  // Check if categories exist, if not seed default categories
  const existingCats = await sql`SELECT count(*)::int as count FROM categories`;
  if (existingCats[0].count === 0) {
    console.log('Seeding initial categories...');
    const defaultCats = [
      { slug: 't-shirts', name: 'T-Shirts', image: '/categories/t-shirts.webp', caption: 'Heavyweight 240+ GSM boxy cuts.', description: 'Heavyweight streetwear t-shirts designed in Colombo.' },
      { slug: 'pants', name: 'Pants', image: '/categories/pants.webp', caption: 'Wide-leg stacks and utility pockets.', description: 'Wide-leg utility pants designed in Colombo.' },
      { slug: 'hoodies', name: 'Hoodies', image: '/categories/hoodies.webp', caption: '380 GSM brushed fleece layers.', description: 'Heavy brushed fleece hoodies designed in Colombo.' },
      { slug: 'accessories', name: 'Accessories', image: '/categories/accessories.webp', caption: 'Everyday carry and street essentials.', description: 'Everyday carry and street accessories designed in Colombo.' }
    ];
    for (const c of defaultCats) {
      await sql`
        INSERT INTO categories (slug, name, image, caption, description)
        VALUES (${c.slug}, ${c.name}, ${c.image}, ${c.caption}, ${c.description})
        ON CONFLICT (slug) DO NOTHING
      `;
    }
  }

  // Check if products exist, if not seed initial catalog
  const existingProds = await sql`SELECT count(*)::int as count FROM products`;
  if (existingProds[0].count === 0) {
    console.log('Seeding initial products into Neon...');
    const defaultProducts = [
      {
        id: 'essential-tee', slug: 'essential-tee', name: 'Essential Tee', price: 349000, category: 't-shirts',
        image: '/demo-products/essential-tee.webp',
        colors: [{ name: 'Black', hex: '#181918' }, { name: 'Off White', hex: '#e7e3d9' }, { name: 'Ash', hex: '#85857f' }],
        color_images: {
          'Black': '/demo-products/essential-tee.webp',
          'Off White': '/campaign/real/man-white-tee.webp',
          'Ash': '/campaign/real/woman-black-tee.webp'
        },
        gallery: [
          '/demo-products/essential-tee.webp',
          '/campaign/real/man-white-tee.webp',
          '/campaign/real/woman-black-tee.webp',
          '/categories/t-shirts.webp'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 24,
        description: 'Our core staple in 240 GSM heavy combed cotton. Cut boxy with relaxed drop shoulders and a snug ribbed collar that won’t lose shape after washing.',
        tags: ['new', 'essential', 'oversized', 'cotton', 'men', 'women'],
        status: 'published', is_demo: false, gender: 'unisex',
        fabric_details: {
          composition: '100% Combed Compact Cotton',
          gsm: '240 GSM Heavyweight',
          fit: 'Relaxed Drop-Shoulder Oversized',
          care: 'Machine wash cold (30°C) with like colors. Do not bleach. Hang dry inside out. Do not iron directly on graphics.'
        }
      },
      {
        id: 'signature-tee', slug: 'signature-tee', name: 'Signature Tee', price: 399000, category: 't-shirts',
        image: '/demo-products/signature-tee.webp',
        colors: [{ name: 'Off White', hex: '#e7e3d9' }, { name: 'Black', hex: '#181918' }],
        color_images: {
          'Off White': '/demo-products/signature-tee.webp',
          'Black': '/campaign/real/man-graphic-tee-back.webp'
        },
        gallery: [
          '/demo-products/signature-tee.webp',
          '/campaign/real/man-graphic-tee-back.webp',
          '/campaign/real/man-graphic-tee-side.webp',
          '/campaign/real/couple-graphic-tees.webp'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 18,
        description: 'Heavyweight 260 GSM jersey featuring our high-density screen-printed HELLO! graphic. A relaxed boxy cut that drapes cleanly without clinging in the humidity.',
        tags: ['new', 'graphic', 'oversized', 'men', 'women'],
        status: 'published', is_demo: false, gender: 'unisex',
        fabric_details: {
          composition: '100% Ring-Spun Cotton',
          gsm: '260 GSM Ultra-Density Jersey',
          fit: 'Boxy Streetwear Fit with Ribbed Collar',
          care: 'Gentle cycle, cold water. Air dry recommended. Low-heat iron on reverse.'
        }
      },
      {
        id: 'cargo-pants', slug: 'cargo-pants', name: 'Cargo Pants', price: 599000, category: 'pants',
        image: '/demo-products/cargo-pants.webp',
        colors: [{ name: 'Black', hex: '#181918' }, { name: 'Ash', hex: '#85857f' }],
        color_images: {
          'Black': '/demo-products/cargo-pants.webp',
          'Ash': '/categories/pants.webp'
        },
        gallery: [
          '/demo-products/cargo-pants.webp',
          '/categories/pants.webp',
          '/hero/campaign.webp'
        ],
        sizes: ['S', 'M', 'L', 'XL'], stock: 16,
        description: 'Wide-leg utility cargos cut from durable 290 GSM stretch-cotton twill. Finished with deep gusset cargo pockets, an elasticated waistband, and adjustable hem drawcords to toggle your stack.',
        tags: ['new', 'utility', 'relaxed', 'men'],
        status: 'published', is_demo: false, gender: 'men',
        fabric_details: {
          composition: 'Cotton-Twill Blend with Stretch Spandex',
          gsm: '290 GSM Heavy Twill',
          fit: 'Wide-Leg Ergonomic Cargo with Adjustable Hem Cords',
          care: 'Wash inside-out with cold water. Tumble dry low or line dry in shade.'
        }
      },
      {
        id: 'oversized-hoodie', slug: 'oversized-hoodie', name: 'Oversized Hoodie', price: 699000, category: 'hoodies',
        image: '/demo-products/oversized-hoodie.webp',
        colors: [{ name: 'Black', hex: '#181918' }, { name: 'Ash', hex: '#85857f' }],
        color_images: {
          'Black': '/campaign/real/man-black-hoodie.webp',
          'Ash': '/campaign/real/man-charcoal-hoodie.webp'
        },
        gallery: [
          '/demo-products/oversized-hoodie.webp',
          '/campaign/real/man-black-hoodie.webp',
          '/campaign/real/man-charcoal-hoodie.webp',
          '/campaign/real/woman-white-hoodie.webp',
          '/campaign/real/woman-white-hoodie-profile.webp'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 12,
        description: 'Heavy 380 GSM brushed fleece with a structured double-layer hood that actually stays up. Dropped shoulders, seamless kangaroo pocket, and thick ribbed cuffs built for cool evenings and AC chill.',
        tags: ['new', 'oversized', 'layer', 'men', 'women'],
        status: 'published', is_demo: false, gender: 'unisex',
        fabric_details: {
          composition: '80% Premium Cotton, 20% Polyester Brushed Fleece',
          gsm: '380 GSM Heavyweight Terry',
          fit: 'Double-Layered Hood with Kangaroo Pouch & Dropped Shoulders',
          care: 'Cold gentle machine wash. Do not dry clean. Flat dry to preserve structural fleece.'
        }
      },
      {
        id: 'classic-cap', slug: 'classic-cap', name: 'Classic Cap', price: 299000, category: 'accessories',
        image: '/demo-products/classic-cap.webp',
        colors: [{ name: 'Off White', hex: '#e7e3d9' }, { name: 'Black', hex: '#181918' }],
        color_images: {
          'Off White': '/demo-products/classic-cap.webp',
          'Black': '/categories/accessories.webp'
        },
        gallery: [
          '/demo-products/classic-cap.webp',
          '/categories/accessories.webp'
        ],
        sizes: ['One Size'], stock: 30,
        description: 'Low-profile 6-panel dad cap made from washed cotton chino twill. Features clean raised HELLO! 3D embroidery on the front and an adjustable brass buckle strap at the back.',
        tags: ['new', 'headwear', 'essential', 'men', 'women'],
        status: 'published', is_demo: false, gender: 'unisex',
        fabric_details: {
          composition: '100% Washed Cotton Chino Twill',
          gsm: 'Structured 6-Panel Crown',
          fit: 'Unstructured Crown with Antiqued Brass Slider Clasp',
          care: 'Spot clean with damp cloth and mild detergent. Do not machine wash.'
        }
      },
      {
        id: 'sling-bag', slug: 'sling-bag', name: 'Sling Bag', price: 499000, category: 'accessories',
        image: '/demo-products/sling-bag.webp',
        colors: [{ name: 'Black', hex: '#181918' }],
        color_images: {
          'Black': '/demo-products/sling-bag.webp'
        },
        gallery: [
          '/demo-products/sling-bag.webp',
          '/categories/accessories.webp'
        ],
        sizes: ['One Size'], stock: 14,
        description: 'Weather-resistant 600D Cordura crossbody bag with dual zip compartments, quick-release seatbelt strap, and internal mesh organizers sized for your phone, keys, wallet, and charger.',
        tags: ['new', 'utility', 'bag', 'men', 'women'],
        status: 'published', is_demo: false, gender: 'unisex',
        fabric_details: {
          composition: '600D Waterproof Cordura Nylon',
          gsm: 'Weather-Resistant Dual-Compartment Shell',
          fit: 'Adjustable Seatbelt-Webbing Strap with Heavy-Duty Buckle',
          care: 'Wipe clean with a damp microfiber cloth.'
        }
      }
    ];

    for (const p of defaultProducts) {
      await sql`
        INSERT INTO products (
          id, slug, name, price, category, image, gallery, colors, color_images,
          sizes, stock, description, tags, status, is_demo, gender, fabric_details
        )
        VALUES (
          ${p.id}, ${p.slug}, ${p.name}, ${p.price}, ${p.category}, ${p.image},
          ${JSON.stringify(p.gallery)}, ${JSON.stringify(p.colors)}, ${JSON.stringify(p.color_images)},
          ${JSON.stringify(p.sizes)}, ${p.stock}, ${p.description}, ${JSON.stringify(p.tags)},
          ${p.status}, ${p.is_demo}, ${p.gender}, ${JSON.stringify(p.fabric_details)}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  // Check sample orders
  const existingOrders = await sql`SELECT count(*)::int as count FROM orders`;
  if (existingOrders[0].count === 0) {
    console.log('Seeding initial sample order for demonstration...');
    const sampleOrder = {
      reference: 'HL-782914',
      customer: {
        name: 'Kasun Perera',
        email: 'kasun.p@gmail.com',
        phone: '077 849 2011',
        address: 'No 45/2, Ward Place',
        city: 'Colombo 07',
        postalCode: '00700'
      },
      items: [
        {
          productId: 'essential-tee',
          slug: 'essential-tee',
          name: 'Essential Tee',
          size: 'L',
          color: 'Black',
          quantity: 2,
          unitPrice: 349000,
          lineTotal: 698000,
          image: '/demo-products/essential-tee.webp'
        }
      ],
      subtotal: 698000,
      delivery: 50000,
      total: 748000,
      payment_method: 'cod',
      status: 'out_for_delivery',
      courier: 'PromptX Logistics',
      tracking_number: 'PX-849201',
      notes: 'Please call before delivery'
    };

    await sql`
      INSERT INTO orders (
        reference, customer, items, subtotal, delivery, total,
        payment_method, status, courier, tracking_number, notes
      )
      VALUES (
        ${sampleOrder.reference},
        ${JSON.stringify(sampleOrder.customer)},
        ${JSON.stringify(sampleOrder.items)},
        ${sampleOrder.subtotal},
        ${sampleOrder.delivery},
        ${sampleOrder.total},
        ${sampleOrder.payment_method},
        ${sampleOrder.status},
        ${sampleOrder.courier},
        ${sampleOrder.tracking_number},
        ${sampleOrder.notes}
      )
      ON CONFLICT (reference) DO NOTHING
    `;
  }

  console.log('Neon database initialized & seeded successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('init-db.mjs')) {
  initDb().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}
