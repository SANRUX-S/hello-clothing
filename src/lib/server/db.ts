import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { products as fallbackProducts, categories as fallbackCategories, type Product } from '@/lib/catalog';

let cachedSql: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (cachedSql) return cachedSql;
  const url = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!url) return null;
  try {
    cachedSql = neon(url);
    return cachedSql;
  } catch (err) {
    console.error('Failed to create Neon client:', err);
    return null;
  }
}

export type DbProduct = Product & {
  created_at?: string;
  updated_at?: string;
};

export type DbOrder = {
  reference: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    image: string;
  }>;
  subtotal: number;
  delivery: number;
  total: number;
  payment_method: string;
  status: 'processing' | 'confirmed' | 'production' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';
  courier: string;
  tracking_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export async function getProductsFromDb(): Promise<Product[]> {
  const sql = getDb();
  if (!sql) return fallbackProducts;
  try {
    const rows = await sql`
      SELECT id, slug, name, price, category, image, gallery, colors,
             color_images, sizes, stock, description, tags, status, is_demo,
             gender, fabric_details
      FROM products
      ORDER BY created_at ASC
    `;
    if (!rows || rows.length === 0) return fallbackProducts;
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      price: Number(r.price),
      category: r.category,
      image: r.image,
      gallery: Array.isArray(r.gallery) ? r.gallery : (typeof r.gallery === 'string' ? JSON.parse(r.gallery) : []),
      colors: Array.isArray(r.colors) ? r.colors : (typeof r.colors === 'string' ? JSON.parse(r.colors) : []),
      colorImages: r.color_images && typeof r.color_images === 'object' ? r.color_images : {},
      sizes: Array.isArray(r.sizes) ? r.sizes : (typeof r.sizes === 'string' ? JSON.parse(r.sizes) : []),
      stock: Number(r.stock),
      description: r.description || '',
      tags: Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? JSON.parse(r.tags) : []),
      status: r.status || 'published',
      isDemo: Boolean(r.is_demo),
      gender: r.gender || 'unisex',
      fabricDetails: r.fabric_details && typeof r.fabric_details === 'object' ? r.fabric_details : undefined
    }));
  } catch (err) {
    console.error('getProductsFromDb error, falling back:', err);
    return fallbackProducts;
  }
}

export async function getProductBySlugFromDb(slug: string): Promise<Product | null> {
  const sql = getDb();
  if (!sql) return fallbackProducts.find(p => p.slug === slug) || null;
  try {
    const rows = await sql`
      SELECT id, slug, name, price, category, image, gallery, colors,
             color_images, sizes, stock, description, tags, status, is_demo,
             gender, fabric_details
      FROM products
      WHERE slug = ${slug}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return fallbackProducts.find(p => p.slug === slug) || null;
    const r: any = rows[0];
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      price: Number(r.price),
      category: r.category,
      image: r.image,
      gallery: Array.isArray(r.gallery) ? r.gallery : [],
      colors: Array.isArray(r.colors) ? r.colors : [],
      colorImages: r.color_images || {},
      sizes: Array.isArray(r.sizes) ? r.sizes : [],
      stock: Number(r.stock),
      description: r.description || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
      status: r.status || 'published',
      isDemo: Boolean(r.is_demo),
      gender: r.gender || 'unisex',
      fabricDetails: r.fabric_details || undefined
    };
  } catch (err) {
    console.error('getProductBySlugFromDb error:', err);
    return fallbackProducts.find(p => p.slug === slug) || null;
  }
}

export async function saveProductToDb(p: Partial<Product> & { id: string; name: string }): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');

  const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const gallery = JSON.stringify(p.gallery || [p.image || '']);
  const colors = JSON.stringify(p.colors || [{ name: 'Black', hex: '#181918' }]);
  const colorImages = JSON.stringify(p.colorImages || {});
  const sizes = JSON.stringify(p.sizes || ['S', 'M', 'L', 'XL']);
  const tags = JSON.stringify(p.tags || ['essential']);
  const fabricDetails = JSON.stringify(p.fabricDetails || {});

  await sql`
    INSERT INTO products (
      id, slug, name, price, category, image, gallery, colors, color_images,
      sizes, stock, description, tags, status, is_demo, gender, fabric_details, updated_at
    )
    VALUES (
      ${p.id}, ${slug}, ${p.name}, ${p.price ?? 349000}, ${p.category || 't-shirts'}, ${p.image || '/demo-products/essential-tee.webp'},
      ${gallery}, ${colors}, ${colorImages}, ${sizes}, ${p.stock ?? 0}, ${p.description || ''},
      ${tags}, ${p.status || 'published'}, ${Boolean(p.isDemo)}, ${p.gender || 'unisex'}, ${fabricDetails}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      category = EXCLUDED.category,
      image = EXCLUDED.image,
      gallery = EXCLUDED.gallery,
      colors = EXCLUDED.colors,
      color_images = EXCLUDED.color_images,
      sizes = EXCLUDED.sizes,
      stock = EXCLUDED.stock,
      description = EXCLUDED.description,
      tags = EXCLUDED.tags,
      status = EXCLUDED.status,
      gender = EXCLUDED.gender,
      fabric_details = EXCLUDED.fabric_details,
      updated_at = NOW();
  `;
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function updateProductStockInDb(id: string, stock: number): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`UPDATE products SET stock = ${stock}, updated_at = NOW() WHERE id = ${id}`;
}

export async function getCategoriesFromDb() {
  const sql = getDb();
  if (!sql) return fallbackCategories;
  try {
    const rows = await sql`SELECT slug, name, image, caption, description FROM categories ORDER BY name ASC`;
    if (!rows || rows.length === 0) return fallbackCategories;
    return rows.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      image: r.image || '',
      caption: r.caption || '',
      description: r.description || ''
    }));
  } catch (err) {
    console.error('getCategoriesFromDb error:', err);
    return fallbackCategories;
  }
}

export async function saveCategoryToDb(cat: { slug: string; name: string; description?: string; image?: string; caption?: string }) {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`
    INSERT INTO categories (slug, name, image, caption, description)
    VALUES (${cat.slug}, ${cat.name}, ${cat.image || ''}, ${cat.caption || ''}, ${cat.description || ''})
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      image = EXCLUDED.image,
      caption = EXCLUDED.caption,
      description = EXCLUDED.description;
  `;
}

export async function deleteCategoryFromDb(slug: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM categories WHERE slug = ${slug}`;
}

export async function getOrdersFromDb(): Promise<DbOrder[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT reference, customer, items, subtotal, delivery, total,
             payment_method, status, courier, tracking_number, notes,
             created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `;
    return rows.map((r: any) => ({
      reference: r.reference,
      customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      subtotal: Number(r.subtotal),
      delivery: Number(r.delivery),
      total: Number(r.total),
      payment_method: r.payment_method,
      status: r.status,
      courier: r.courier || 'PromptX Logistics',
      tracking_number: r.tracking_number || '',
      notes: r.notes || '',
      created_at: r.created_at,
      updated_at: r.updated_at
    }));
  } catch (err) {
    console.error('getOrdersFromDb error:', err);
    return [];
  }
}

export async function getOrderFromDb(reference: string): Promise<DbOrder | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const cleanRef = reference.trim().toUpperCase();
    const rows = await sql`
      SELECT reference, customer, items, subtotal, delivery, total,
             payment_method, status, courier, tracking_number, notes,
             created_at, updated_at
      FROM orders
      WHERE UPPER(reference) = ${cleanRef}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    const r: any = rows[0];
    return {
      reference: r.reference,
      customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      subtotal: Number(r.subtotal),
      delivery: Number(r.delivery),
      total: Number(r.total),
      payment_method: r.payment_method,
      status: r.status,
      courier: r.courier || 'PromptX Logistics',
      tracking_number: r.tracking_number || '',
      notes: r.notes || '',
      created_at: r.created_at,
      updated_at: r.updated_at
    };
  } catch (err) {
    console.error('getOrderFromDb error:', err);
    return null;
  }
}

export async function createOrderInDb(order: Omit<DbOrder, 'created_at' | 'updated_at'>): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`
    INSERT INTO orders (
      reference, customer, items, subtotal, delivery, total,
      payment_method, status, courier, tracking_number, notes, created_at, updated_at
    )
    VALUES (
      ${order.reference},
      ${JSON.stringify(order.customer)},
      ${JSON.stringify(order.items)},
      ${order.subtotal},
      ${order.delivery},
      ${order.total},
      ${order.payment_method},
      ${order.status || 'processing'},
      ${order.courier || 'PromptX Logistics'},
      ${order.tracking_number || ''},
      ${order.notes || ''},
      NOW(),
      NOW()
    )
    ON CONFLICT (reference) DO UPDATE SET
      customer = EXCLUDED.customer,
      items = EXCLUDED.items,
      subtotal = EXCLUDED.subtotal,
      delivery = EXCLUDED.delivery,
      total = EXCLUDED.total,
      payment_method = EXCLUDED.payment_method,
      status = EXCLUDED.status,
      courier = EXCLUDED.courier,
      tracking_number = EXCLUDED.tracking_number,
      notes = EXCLUDED.notes,
      updated_at = NOW();
  `;
}

export async function updateOrderStatusInDb(reference: string, status: string, courier?: string, trackingNumber?: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`
    UPDATE orders
    SET status = ${status},
        courier = COALESCE(${courier || null}, courier),
        tracking_number = COALESCE(${trackingNumber || null}, tracking_number),
        updated_at = NOW()
    WHERE reference = ${reference};
  `;
}
