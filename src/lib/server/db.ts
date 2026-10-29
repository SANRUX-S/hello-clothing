import crypto from 'crypto';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { products as fallbackProducts, categories as fallbackCategories, type Product } from '@/lib/catalog';

let cachedSql: NeonQueryFunction<false, false> | null = null;

// High-Performance In-Memory cache for all entities to eliminate transatlantic latency
let cachedProducts: { data: Product[]; timestamp: number } | null = null;
let cachedCategories: { data: any[]; timestamp: number } | null = null;
let cachedOrders: { data: any[]; timestamp: number } | null = null;
let cachedPublishedReviews: { data: any[]; timestamp: number } | null = null;
let cachedAllReviews: { data: any[]; timestamp: number } | null = null;
let cachedSettings: { data: Record<string, any>; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000;
const FAST_CACHE_TTL_MS = 20_000;

export function invalidateProductsCache() {
  cachedProducts = null;
}

export function invalidateCategoriesCache() {
  cachedCategories = null;
}

export function invalidateOrdersCache() {
  cachedOrders = null;
}

export function invalidateReviewsCache() {
  cachedPublishedReviews = null;
  cachedAllReviews = null;
}

export function invalidateSettingsCache() {
  cachedSettings = null;
}

export function getDb() {
  if (cachedSql) return cachedSql;
  const rawUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!rawUrl) return null;
  const url = rawUrl.trim().replace(/^["']|["']$/g, '');
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

export async function getProductsFromDb(forceFresh = false): Promise<Product[]> {
  const now = Date.now();
  if (!forceFresh && cachedProducts && (now - cachedProducts.timestamp) < CACHE_TTL_MS) {
    return cachedProducts.data;
  }
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
    const mapped = rows.map((r: any) => ({
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
    cachedProducts = { data: mapped, timestamp: now };
    return mapped;
  } catch (err) {
    console.error('getProductsFromDb error, falling back:', err);
    if (cachedProducts) return cachedProducts.data;
    return fallbackProducts;
  }
}

export async function getProductBySlugFromDb(slug: string): Promise<Product | null> {
  // Instant resolution from cache if available
  if (cachedProducts && (Date.now() - cachedProducts.timestamp) < CACHE_TTL_MS) {
    const found = cachedProducts.data.find(p => p.slug === slug);
    if (found) return found;
  }
  const all = await getProductsFromDb();
  return all.find(p => p.slug === slug) || null;
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
  invalidateProductsCache();
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM products WHERE id = ${id}`;
  invalidateProductsCache();
}

export async function updateProductStockInDb(id: string, stock: number): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`UPDATE products SET stock = ${stock}, updated_at = NOW() WHERE id = ${id}`;
  invalidateProductsCache();
}

export async function getCategoriesFromDb(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && cachedCategories && (now - cachedCategories.timestamp) < CACHE_TTL_MS) {
    return cachedCategories.data;
  }
  const sql = getDb();
  if (!sql) return fallbackCategories;
  try {
    const rows = await sql`SELECT slug, name, image, caption, description FROM categories ORDER BY name ASC`;
    if (!rows || rows.length === 0) return fallbackCategories;
    const mapped = rows.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      image: r.image || '',
      caption: r.caption || '',
      description: r.description || ''
    }));
    cachedCategories = { data: mapped, timestamp: now };
    return mapped;
  } catch (err) {
    console.error('getCategoriesFromDb error:', err);
    if (cachedCategories) return cachedCategories.data;
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
  invalidateCategoriesCache();
}

export async function deleteCategoryFromDb(slug: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM categories WHERE slug = ${slug}`;
  invalidateCategoriesCache();
}

export async function getOrdersFromDb(forceFresh = false): Promise<DbOrder[]> {
  const now = Date.now();
  if (!forceFresh && cachedOrders && (now - cachedOrders.timestamp) < FAST_CACHE_TTL_MS) {
    return cachedOrders.data;
  }
  const sql = getDb();
  if (!sql) return cachedOrders ? cachedOrders.data : [];
  try {
    const rows = await sql`
      SELECT reference, customer, items, subtotal, delivery, total,
             payment_method, status, courier, tracking_number, notes,
             created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `;
    const res = rows.map((r: any) => ({
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
    cachedOrders = { data: res, timestamp: now };
    return res;
  } catch (err) {
    console.error('getOrdersFromDb error:', err);
    return cachedOrders ? cachedOrders.data : [];
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
  invalidateOrdersCache();
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
  invalidateOrdersCache();
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

export async function deleteOrderFromDb(reference: string): Promise<void> {
  invalidateOrdersCache();
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM orders WHERE UPPER(reference) = ${reference.trim().toUpperCase()}`;
}

export async function deleteAllOrdersFromDb(): Promise<void> {
  invalidateOrdersCache();
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM orders`;
}

export async function getStoreSettingFromDb(key: string): Promise<any> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT value FROM store_settings WHERE key = ${key} LIMIT 1`;
    if (!rows || rows.length === 0) return null;
    const val = rows[0].value;
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch (err) {
    console.error(`getStoreSettingFromDb error for ${key}:`, err);
    return null;
  }
}

export async function saveStoreSettingToDb(key: string, value: any): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  const valJson = JSON.stringify(value);
  await sql`
    INSERT INTO store_settings (key, value, updated_at)
    VALUES (${key}, ${valJson}, NOW())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW();
  `;
}

export type DbAdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'co_admin' | 'admin';
  status: 'active' | 'suspended';
  created_at?: string;
  last_login?: string | null;
  password_hash?: string | null;
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash) return false;
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return password === storedHash;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(email: string, password: string): Promise<DbAdminUser | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const rows = await sql`
      SELECT id, email, name, role, status, password_hash, created_at, last_login
      FROM admin_users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    const user = rows[0] as DbAdminUser;
    if (user.status !== 'active') return null;

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      last_login: user.last_login,
    };
  } catch (err) {
    console.error('verifyAdminCredentials error:', err);
    return null;
  }
}

export async function getAdminUserByEmail(email: string): Promise<DbAdminUser | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const rows = await sql`
      SELECT id, email, name, role, status, created_at, last_login
      FROM admin_users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    return rows[0] as DbAdminUser;
  } catch (err) {
    console.error('getAdminUserByEmail error:', err);
    return null;
  }
}

export async function getAllAdminUsers(): Promise<DbAdminUser[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT id, email, name, role, status, created_at, last_login
      FROM admin_users
      ORDER BY 
        CASE role 
          WHEN 'super_admin' THEN 1 
          WHEN 'co_admin' THEN 2 
          ELSE 3 
        END, created_at ASC;
    `;
    return (rows || []) as DbAdminUser[];
  } catch (err) {
    console.error('getAllAdminUsers error:', err);
    return [];
  }
}

export async function saveAdminUser(user: { id?: string; email: string; name: string; role: string; status?: string; password?: string }): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  const id = user.id || `admin-${Date.now()}`;
  const cleanEmail = user.email.trim().toLowerCase();
  const passwordHash = user.password ? hashPassword(user.password) : null;

  if (passwordHash) {
    await sql`
      INSERT INTO admin_users (id, email, name, role, status, password_hash, created_at)
      VALUES (${id}, ${cleanEmail}, ${user.name.trim()}, ${user.role}, ${user.status || 'active'}, ${passwordHash}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        password_hash = ${passwordHash};
    `;
  } else {
    await sql`
      INSERT INTO admin_users (id, email, name, role, status, created_at)
      VALUES (${id}, ${cleanEmail}, ${user.name.trim()}, ${user.role}, ${user.status || 'active'}, NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        status = EXCLUDED.status;
    `;
  }
}

export async function deleteAdminUser(email: string): Promise<void> {
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM admin_users WHERE LOWER(email) = ${email.trim().toLowerCase()}`;
}

export async function updateAdminLastLogin(email: string): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await sql`UPDATE admin_users SET last_login = NOW() WHERE LOWER(email) = ${email.trim().toLowerCase()}`;
  } catch {}
}

export type DbReview = {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  image: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export async function getPublishedReviews(): Promise<DbReview[]> {
  const now = Date.now();
  if (cachedPublishedReviews && (now - cachedPublishedReviews.timestamp) < FAST_CACHE_TTL_MS) {
    return cachedPublishedReviews.data;
  }
  const sql = getDb();
  if (!sql) return cachedPublishedReviews ? cachedPublishedReviews.data : [];
  try {
    const rows = await sql`
      SELECT id, author, location, rating, title, body, image, status, created_at
      FROM reviews
      WHERE status = 'published'
      ORDER BY created_at DESC;
    `;
    const res = (rows || []) as DbReview[];
    cachedPublishedReviews = { data: res, timestamp: now };
    return res;
  } catch (err) {
    console.error('getPublishedReviews error:', err);
    return cachedPublishedReviews ? cachedPublishedReviews.data : [];
  }
}

export async function getAllReviews(): Promise<DbReview[]> {
  const now = Date.now();
  if (cachedAllReviews && (now - cachedAllReviews.timestamp) < FAST_CACHE_TTL_MS) {
    return cachedAllReviews.data;
  }
  const sql = getDb();
  if (!sql) return cachedAllReviews ? cachedAllReviews.data : [];
  try {
    const rows = await sql`
      SELECT id, author, location, rating, title, body, image, status, created_at, updated_at
      FROM reviews
      ORDER BY created_at DESC;
    `;
    const res = (rows || []) as DbReview[];
    cachedAllReviews = { data: res, timestamp: now };
    return res;
  } catch (err) {
    console.error('getAllReviews error:', err);
    return cachedAllReviews ? cachedAllReviews.data : [];
  }
}

export async function saveReview(review: {
  id?: string;
  author: string;
  location?: string;
  rating?: number;
  title: string;
  body: string;
  image?: string;
  status?: string;
}): Promise<void> {
  invalidateReviewsCache();
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  const id = review.id || `rev-${Date.now()}`;
  await sql`
    INSERT INTO reviews (id, author, location, rating, title, body, image, status, created_at, updated_at)
    VALUES (
      ${id},
      ${review.author.trim()},
      ${review.location?.trim() || 'Sri Lanka'},
      ${Number(review.rating) || 5},
      ${review.title.trim()},
      ${review.body.trim()},
      ${review.image?.trim() || '/campaign/real/couple-graphic-tees.webp'},
      ${review.status || 'published'},
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      author = EXCLUDED.author,
      location = EXCLUDED.location,
      rating = EXCLUDED.rating,
      title = EXCLUDED.title,
      body = EXCLUDED.body,
      image = EXCLUDED.image,
      status = EXCLUDED.status,
      updated_at = NOW();
  `;
}

export async function deleteReview(id: string): Promise<void> {
  invalidateReviewsCache();
  const sql = getDb();
  if (!sql) throw new Error('Database connection is not configured.');
  await sql`DELETE FROM reviews WHERE id = ${id}`;
}

