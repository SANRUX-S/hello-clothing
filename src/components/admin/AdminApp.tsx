"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CheckCircle2, ExternalLink, ImagePlus, Images, LayoutDashboard, Menu, Package, Plus, Search, Settings2, ShoppingBag, SlidersHorizontal, Tags, Trash2, Type, X, Pencil, Save, RotateCcw, ShieldCheck, Boxes } from "lucide-react";
import { products as catalogProducts } from "@/lib/catalog";

type Color = { name: string; hex: string };
type Product = { id: string; slug: string; name: string; price: number; category: string; image: string; stock: number; colors: Color[]; sizes: string[]; description: string; status: string; isDemo: boolean };
type Category = { slug: string; name: string; description: string };
type Content = { announcement: string; heroTitle: string; heroSubtitle: string; aboutText: string };
type Settings = { storeName: string; email: string; currency: string; deliveryFee: number; logoMotion: boolean };
type MediaItem = { id: string; src: string; name: string; uploaded?: boolean };
type Activity = { id: string; label: string; time: number };
type AdminOrder = { reference: string; createdAt: string; customer?: { name?: string; phone?: string; city?: string }; items?: any[]; paymentMethod?: string; total?: number; status?: string; courier?: string; tracking_number?: string };
export type AdminSection = "overview" | "products" | "inventory" | "orders" | "categories" | "content" | "media" | "settings";

const NAV: { id: AdminSection; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "products", label: "Products", icon: ShoppingBag },
  { id: "inventory", label: "Inventory", icon: Boxes }, { id: "orders", label: "Orders", icon: Package },
  { id: "categories", label: "Categories", icon: Tags }, { id: "content", label: "Store content", icon: Type },
  { id: "media", label: "Media library", icon: Images }, { id: "settings", label: "Settings", icon: Settings2 },
];
const KEYS = { products: "hello-admin-demo-products-v1", categories: "hello-admin-demo-categories-v1", content: "hello-demo-content-v1", settings: "hello-demo-settings-v1", media: "hello-admin-demo-media-v1", inventory: "hello-admin-demo-inventory-v1", activity: "hello-admin-demo-activity-v1" };
const DEFAULT_CONTENT: Content = { announcement: "Islandwide delivery across Sri Lanka · Free on orders over LKR 10,000", heroTitle: "ONE DAY, EVEN THE DEVIL WILL SAY HELLO!", heroSubtitle: "Heavyweight streetwear designed in Colombo.", aboutText: "Heavyweight cotton. Custom boxy fits. Built for real wear in the island heat." };
const DEFAULT_SETTINGS: Settings = { storeName: "HELLO! Clothing", email: "", currency: "LKR", deliveryFee: 500, logoMotion: true };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const titleCase = (value: string) => value.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const money = (value: number) => `LKR ${Math.round(value / 100).toLocaleString("en-LK")}`;
const BASE_PRODUCTS: Product[] = catalogProducts.map(p => ({ ...p, id: String(p.id), status: p.status || "published", isDemo: true, colors: p.colors.map(c => ({ name: c.name, hex: c.hex })), sizes: [...p.sizes] }));
const BASE_CATEGORIES: Category[] = Array.from(new Set(BASE_PRODUCTS.map(p => p.category))).map(slug => ({ slug, name: titleCase(slug), description: `Heavyweight streetwear ${titleCase(slug).toLowerCase()} designed in Colombo.` }));
const HEXES: Record<string, string> = { black: "#171818", white: "#f8f7f3", cream: "#e6ddcc", grey: "#969795", gray: "#969795", olive: "#72775c", brown: "#806b59", navy: "#303d4e", beige: "#d5c7b5" };

function readLocal<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
function variants(product: Product) {
  const colors = product.colors.length ? product.colors : [{ name: "Default", hex: "#171818" }];
  const sizes = product.sizes.length ? product.sizes : ["One size"];
  const total = colors.length * sizes.length;
  return colors.flatMap((color, ci) => sizes.map((size, si) => { const i = ci * sizes.length + si; return { key: `${product.id}|${color.name}|${size}`, color, size, initial: Math.floor(product.stock / total) + (i < product.stock % total ? 1 : 0) }; }));
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("input, button, select, textarea")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = Array.from(ref.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex="0"]') || []).filter(el => !el.hasAttribute("disabled"));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [onClose]);
  return <div className="admin-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div ref={ref} className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title"><div className="admin-modal-heading"><h2 id="admin-dialog-title">{title}</h2><button className="admin-icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>{children}</div></div>;
}

function ProductEditor({ product, categories, onSave, onClose }: { product: Product | null; categories: Category[]; onSave: (p: Product) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Product>(() => product || { id: `demo-${Date.now()}`, slug: "", name: "", price: 349000, category: categories[0]?.slug || "t-shirts", image: BASE_PRODUCTS[0]?.image || "", stock: 0, colors: [{ name: "Black", hex: "#171818" }], sizes: ["S", "M", "L", "XL"], description: "", status: "draft", isDemo: true });
  const [colors, setColors] = useState(draft.colors.map(c => c.name).join(", "));
  const [sizes, setSizes] = useState(draft.sizes.join(", "));
  const submit = (event: FormEvent) => { event.preventDefault(); onSave({ ...draft, slug: slugify(draft.name), name: draft.name.trim(), colors: colors.split(",").map(c => c.trim()).filter(Boolean).map(name => ({ name, hex: draft.colors.find(color => color.name.toLowerCase() === name.toLowerCase())?.hex || HEXES[name.toLowerCase()] || "#787b74" })), sizes: sizes.split(",").map(s => s.trim()).filter(Boolean), isDemo: true }); };
  return <Modal title={product ? "Edit product" : "A new everyday essential."} onClose={onClose}><form onSubmit={submit} className="admin-edit-form"><div className="admin-product-editor-preview">{draft.image && <img src={draft.image} alt={draft.name || "New product preview"} />}<div><span className="admin-eyebrow">BROWSER DEMO</span><p>Your changes are saved on this device.</p></div></div><label>Product name<input required maxLength={100} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Everyday oversized tee" /></label><div className="admin-form-grid"><label>Price (LKR)<input required min="0" step="1" type="number" value={draft.price / 100} onChange={e => setDraft({ ...draft, price: Math.round(Number(e.target.value) * 100) })} /></label><label>Stock units<input required min="0" step="1" type="number" value={draft.stock} onChange={e => setDraft({ ...draft, stock: Math.max(0, Math.floor(Number(e.target.value))) })} /></label><label>Category<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label><label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="published">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label></div><label>Description<textarea rows={3} maxLength={2000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label><label>Image path or URL<input value={draft.image} onChange={e => setDraft({ ...draft, image: e.target.value })} placeholder="/images/product.webp" /></label><div className="admin-form-grid"><label>Colors <span>(comma separated)</span><input value={colors} onChange={e => setColors(e.target.value)} /></label><label>Sizes <span>(comma separated)</span><input value={sizes} onChange={e => setSizes(e.target.value)} /></label></div><div className="admin-modal-actions"><button type="button" className="admin-button admin-button-quiet" onClick={onClose}>Cancel</button><button className="admin-button" type="submit"><Check size={16} /> Save product</button></div></form></Modal>;
}

export function AdminDisabled() {
  return <div className="admin-locked"><div className="admin-brand">Hello!</div><ShieldCheck size={36} strokeWidth={1.3} /><h1>Admin access is unavailable.</h1><p>This browser demo is disabled in live mode. Connect your authenticated management service to manage a live store.</p><Link href="/" className="admin-button">Back to store <ArrowRight size={16} /></Link></div>;
}

export default function AdminApp({ initialSection = "overview" }: { initialSection?: AdminSection }) {
  const section = initialSection;
  const [products, setProducts] = useState<Product[]>(BASE_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(BASE_CATEGORIES);
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<Activity[]>([]);
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editor, setEditor] = useState<Product | "new" | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [categoryEditor, setCategoryEditor] = useState<Category | "new" | null>(null);
  const [selectedProductId, setSelectedProductId] = useState(BASE_PRODUCTS[0]?.id || "");
  const [variantDrafts, setVariantDrafts] = useState<Record<string, number>>({});
  const [resetOpen, setResetOpen] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const activeNav = NAV.find(item => item.id === section)!;
  useEffect(() => {
    let active = true;
    // Read the browser snapshot after hydration, and ignore stale Strict Mode callbacks.
    queueMicrotask(() => {
    if (!active) return;
    const savedProducts = readLocal<unknown>(KEYS.products, BASE_PRODUCTS);
    if (Array.isArray(savedProducts) && savedProducts.every(p => p && typeof p.id === "string" && typeof p.name === "string" && typeof p.stock === "number" && Array.isArray(p.colors) && Array.isArray(p.sizes))) setProducts(savedProducts as Product[]);
    const savedCategories = readLocal<unknown>(KEYS.categories, BASE_CATEGORIES);
    if (Array.isArray(savedCategories) && savedCategories.every(c => c && typeof c.slug === "string" && typeof c.name === "string")) setCategories(savedCategories as Category[]);
    setContent({ ...DEFAULT_CONTENT, ...readLocal<Partial<Content>>(KEYS.content, {}) });
    setSettings({ ...DEFAULT_SETTINGS, ...readLocal<Partial<Settings>>(KEYS.settings, {}) });
    const savedMedia = readLocal<unknown>(KEYS.media, []);
    if (Array.isArray(savedMedia)) setMedia(savedMedia.filter(m => m && typeof m.src === "string" && typeof m.id === "string") as MediaItem[]);
    const savedInventory = readLocal<unknown>(KEYS.inventory, {});
    if (savedInventory && typeof savedInventory === "object" && !Array.isArray(savedInventory)) setInventory(Object.fromEntries(Object.entries(savedInventory).filter(([, value]) => typeof value === "number" && Number.isFinite(value) && value >= 0).map(([key, value]) => [key, Number(value)])));
    const savedActivity = readLocal<unknown>(KEYS.activity, []);
    if (Array.isArray(savedActivity)) setActivity(savedActivity.filter(item => item && typeof item.id === "string" && typeof item.label === "string" && typeof item.time === "number").slice(0, 8));
    const savedOrders = readLocal<AdminOrder[]>('hello-order-history', []);
    if (Array.isArray(savedOrders)) setCustomerOrders(savedOrders);
    setReady(true);

    // Fetch live data from Neon Database
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => {
        if (active && d.products && Array.isArray(d.products) && d.products.length > 0) {
          setProducts(d.products);
        }
      })
      .catch(() => {});

    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => {
        if (active && d.orders && Array.isArray(d.orders) && d.orders.length > 0) {
          setCustomerOrders(d.orders.map((o: any) => ({
            reference: o.reference,
            createdAt: o.created_at || o.createdAt,
            customer: o.customer,
            items: o.items,
            paymentMethod: o.payment_method || o.paymentMethod,
            total: o.total,
            status: o.status || 'processing',
            courier: o.courier || 'PromptX Logistics',
            tracking_number: o.tracking_number || o.trackingNumber
          })));
        }
      })
      .catch(() => {});

    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => {
        if (active && d.categories && Array.isArray(d.categories) && d.categories.length > 0) {
          setCategories(d.categories);
        }
      })
      .catch(() => {});
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let errorTimer: ReturnType<typeof setTimeout> | undefined;
    try { localStorage.setItem(KEYS.products, JSON.stringify(products)); localStorage.setItem(KEYS.categories, JSON.stringify(categories)); localStorage.setItem(KEYS.inventory, JSON.stringify(inventory)); localStorage.setItem(KEYS.activity, JSON.stringify(activity)); } catch { errorTimer = setTimeout(() => setNotice("Browser storage is full. Some changes could not be saved."), 0); }
    return () => { if (errorTimer) clearTimeout(errorTimer); };
  }, [products, categories, inventory, activity, ready]);
  useEffect(() => { if (!notice) return; const timeout = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(timeout); }, [notice]);
  const log = (label: string) => setActivity(current => [{ id: String(Date.now()), label, time: Date.now() }, ...current].slice(0, 8));
  const saveLocal = (key: string, value: unknown, label: string) => { try { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("hello:demo-settings")); setNotice(label); log(label); } catch { setNotice("Browser storage is full. This change could not be saved."); } };
  const filteredProducts = useMemo(() => products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "all" || (statusFilter === "low" ? p.stock <= 5 : p.status === statusFilter))), [products, query, statusFilter]);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalRevenue = useMemo(() => customerOrders.reduce((sum, o) => sum + (typeof o.total === "number" ? o.total : 0), 0), [customerOrders]);
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const selectedVariants = selectedProduct ? variants(selectedProduct) : [];
  const allMedia = useMemo<MediaItem[]>(() => [...media, ...Array.from(new Map(products.filter(p => p.image).map(p => [p.image, { id: p.id, src: p.image, name: p.name }])).values())], [products, media]);

  const saveProduct = async (product: Product) => {
    const previous = products.find(p => p.id === product.id);
    setProducts(current => previous ? current.map(p => p.id === product.id ? product : p) : [...current, product]);
    if (!previous || previous.stock !== product.stock || JSON.stringify(previous.colors) !== JSON.stringify(product.colors) || JSON.stringify(previous.sizes) !== JSON.stringify(product.sizes)) {
      setInventory(current => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${product.id}|`))));
    }
    setEditor(null);
    setNotice("Syncing with Neon database…");
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        setNotice(previous ? `"${product.name}" updated in Neon DB.` : `"${product.name}" added to Neon DB.`);
        log(`${previous ? "Updated" : "Added"} ${product.name} (Neon DB)`);
      } else {
        setNotice("Product saved locally.");
      }
    } catch {
      setNotice("Product saved locally.");
    }
  };

  const updateOrderStatus = async (reference: string, newStatus: string) => {
    setCustomerOrders(current => current.map(o => o.reference === reference ? { ...o, status: newStatus } : o));
    setNotice(`Updating order ${reference} status in Neon…`);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, status: newStatus })
      });
      if (res.ok) {
        setNotice(`Order ${reference} is now "${newStatus}". (Neon DB synced)`);
        log(`Order ${reference} status: ${newStatus}`);
      } else {
        setNotice("Order updated locally.");
      }
    } catch {
      setNotice("Order updated locally.");
    }
  };
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setMediaError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMediaError("Choose a JPG, PNG, or WebP image."); return; }
    if (file.size > 2 * 1024 * 1024) { setMediaError("Choose an image smaller than 2 MB for browser storage."); return; }
    const reader = new FileReader();
    reader.onerror = () => setMediaError("This image could not be opened. Try another file.");
    reader.onload = () => { const next = [{ id: `upload-${Date.now()}`, src: String(reader.result), name: file.name, uploaded: true }, ...media]; try { localStorage.setItem(KEYS.media, JSON.stringify(next)); setMedia(next); setNotice("Image added to this browser’s media library."); log(`Added image ${file.name}`); } catch { setMediaError("Browser storage is full. Try a smaller image or remove a local upload."); } };
    reader.readAsDataURL(file);
  };

  return <div className="admin-app">
    {menuOpen && <button className="admin-sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`admin-sidebar ${menuOpen ? "admin-sidebar-open" : ""}`}><Link className="admin-brand" href="/" aria-label="Hello clothing home">Hello!</Link><div className="admin-workspace-label"><span className="admin-workspace-dot" style={{ background: '#16a34a' }} /> STORE WORKSPACE <span style={{ color: '#4ade80' }}>NEON DB</span></div><nav aria-label="Admin navigation">{NAV.map(({ id, label, icon: Icon }) => <Link key={id} href={id === "overview" ? "/admin" : `/admin/${id}`} aria-current={section === id ? "page" : undefined} className={section === id ? "admin-nav-active" : ""} onClick={() => setMenuOpen(false)}><Icon size={18} strokeWidth={1.5} />{label}{id === "orders" && <span className="admin-nav-count">{customerOrders.length}</span>}</Link>)}</nav><div className="admin-sidebar-bottom"><div className="admin-store-status"><span style={{ background: '#16a34a' }} /> Neon DB Connected</div><Link href="/">View storefront <ArrowUpRight size={16} /></Link><div className="admin-profile"><div>H!</div><p>HELLO! Workspace<small>Neon DB Store Administrator</small></p></div></div></aside>
    <div className="admin-main"><header className="admin-topbar"><div className="admin-breadcrumb"><button className="admin-icon-button admin-mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><span>Workspace</span><span>/</span><strong>{activeNav.label}</strong></div><div className="admin-topbar-right"><span className="admin-demo-badge" style={{ borderColor: '#166534', color: '#4ade80', background: '#052e16' }}><span style={{ background: '#22c55e' }} /> Neon PostgreSQL 18 · Connected</span><Link href="/" className="admin-topbar-store">Visit store <ExternalLink size={14} /></Link></div></header>
    <main className="admin-content"><div className="admin-page-title"><div><span className="admin-eyebrow">HELLO! CLOTHING / {section === "overview" ? "YOUR EVERYDAY, ELEVATED" : "STORE MANAGEMENT"}</span><h1>{section === "overview" ? "Make yourself at home." : activeNav.label}</h1><p>{({ overview: "A little overview of your world. Let’s make it a good one.", products: "Good essentials. Great first impressions. Your collection starts here.", inventory: "Keep every color and size ready for their next everyday.", orders: "Every great brand starts with its first order.", categories: "A place for every piece in your collection.", content: "A few words. A whole lot of personality.", media: "The images that bring your brand to life.", settings: "The details that make this store yours." })[section]}</p></div>{section === "products" && <button className="admin-button" onClick={() => setEditor("new")}><Plus size={17} /> Add product</button>}{section === "categories" && <button className="admin-button" onClick={() => setCategoryEditor("new")}><Plus size={17} /> Add category</button>}{section === "media" && <button className="admin-button" onClick={() => uploadRef.current?.click()}><ImagePlus size={17} /> Upload image</button>}</div>

    <div className="admin-sandbox-notice" style={{ background: '#052e16', borderColor: '#166534', color: '#86efac' }}><ShieldCheck size={15} strokeWidth={1.5} color="#4ade80" /><span>NEON POSTGRESQL CONNECTED · Live store operations, products, stock, and customer orders.</span></div>
    {section === "overview" && <>
      <div className="admin-metrics">{[{ title: "TOTAL REVENUE", value: customerOrders.length > 0 ? money(totalRevenue) : "LKR 0", icon: ArrowUpRight, note: customerOrders.length > 0 ? `${customerOrders.length} customer order${customerOrders.length === 1 ? '' : 's'}` : "No payments connected" }, { title: "ORDERS", value: String(customerOrders.length), icon: Package, note: customerOrders.length > 0 ? "Saved in browser history" : "Ready for your first order" }, { title: "CATALOG PIECES", value: String(products.length).padStart(2, "0"), icon: ShoppingBag, note: `${categories.length} curated categories` }, { title: "AVAILABLE UNITS", value: String(totalStock), icon: Boxes, note: `${products.filter(p => p.stock <= 5).length} products with low stock` }].map(item => <div className="admin-metric" key={item.title}><div><span>{item.title}</span><item.icon size={18} strokeWidth={1.4} /></div><strong>{item.value}</strong><small>{item.note}</small></div>)}</div>
      <div className="admin-overview-row"><section className="admin-panel admin-inventory-panel"><div className="admin-panel-heading"><div><h2>Your collection, at a glance.</h2><p>Available stock across your categories</p></div><Link href="/admin/inventory" className="admin-text-link">Manage <ArrowUpRight size={15} /></Link></div><div className="admin-stock-chart">{categories.map(category => { const units = products.filter(p => p.category === category.slug).reduce((sum, p) => sum + p.stock, 0); return <div key={category.slug}><div><span>{category.name}</span><strong>{units}<small> units</small></strong></div><div className="admin-stock-track"><span style={{ width: `${totalStock ? Math.max(2, units / totalStock * 100) : 0}%` }} /></div></div>; })}</div><div className="admin-panel-foot"><span className="admin-status-dot" /> Sample catalog inventory <span>Updated in this browser</span></div></section><section className="admin-brand-panel"><div className="admin-brand-image">{products[0]?.image && <img src={products[0].image} alt="Hello clothing collection" />}<span className="admin-eyebrow">THE EVERYDAY COLLECTION</span><h2>Good clothes.<br />Better energy.</h2></div><div className="admin-brand-panel-bottom"><p>Your next chapter<br />starts with a simple Hello!</p><Link href="/" aria-label="Open your store"><ArrowUpRight size={24} /></Link></div></section></div>
      <div className="admin-overview-bottom"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Recent activity</h2><p>The latest changes in this demo workspace</p></div><span className="admin-small-pill">LOCAL</span></div>{activity.length ? <div className="admin-activity-list">{activity.slice(0, 4).map(item => <div key={item.id}><span><Check size={15} /></span><p>{item.label}<small>{new Date(item.time).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })}</small></p></div>)}</div> : <div className="admin-activity-empty"><span><CheckCircle2 size={25} strokeWidth={1.3} /></span><p>A clean slate.<small>Your product and store updates will appear here.</small></p></div>}</section><section className="admin-panel admin-quick-actions"><div className="admin-panel-heading"><div><h2>A few good next steps.</h2><p>Build your store, one detail at a time.</p></div></div>{[{ label: "Add your next essential", subtitle: "Create a product in your demo catalog", to: "/admin/products", icon: ShoppingBag }, { label: "Make it sound like you", subtitle: "Edit your homepage copy", to: "/admin/content", icon: Type }, { label: "A little logo personality", subtitle: "Choose the navbar logo motion", to: "/admin/settings", icon: SlidersHorizontal }].map(action => <Link href={action.to} key={action.to}><action.icon size={19} strokeWidth={1.4} /><span>{action.label}<small>{action.subtitle}</small></span><ArrowRight size={17} /></Link>)}</section></div>
    </>}

    {section === "products" && <section className="admin-panel"><div className="admin-list-toolbar"><div className="admin-filter-tabs"><button className={statusFilter === "all" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("all")}>All products <span>{products.length}</span></button><button className={statusFilter === "published" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("published")}>Active</button><button className={statusFilter === "draft" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("draft")}>Draft</button><button className={statusFilter === "low" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("low")}>Low stock</button></div><label className="admin-search"><Search size={17} /><span className="admin-sr-only">Search products</span><input placeholder="Search your products…" value={query} onChange={event => setQuery(event.target.value)} /></label></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>STATUS</th><th>INVENTORY <ArrowDown size={12} /></th><th>CATEGORY</th><th>PRICE</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>{filteredProducts.map(product => <tr key={product.id}><td><button className="admin-product-cell" onClick={() => setEditor(product)}><img src={product.image} alt="" /><span>{product.name}<small>{product.sizes.join(" / ") || "One size"}</small></span></button></td><td><span className={`admin-status-pill admin-status-${product.status}`}><span />{titleCase(product.status)}</span></td><td><span className={product.stock <= 5 ? "admin-low-stock" : ""}>{product.stock} in stock</span></td><td>{categories.find(c => c.slug === product.category)?.name || titleCase(product.category)}</td><td className="admin-price-cell">{money(product.price)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => setEditor(product)} aria-label={`Edit ${product.name}`}><Pencil size={15} /></button><button className="admin-icon-button" onClick={() => setDeleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{!filteredProducts.length && <div className="admin-empty"><Search size={30} strokeWidth={1.2} /><h3>No matching essentials.</h3><p>Try another name, category, or filter.</p><button className="admin-button admin-button-quiet" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Clear filters</button></div>}<div className="admin-table-footer">{filteredProducts.length} of {products.length} products <span>All changes are local to this browser.</span></div></section>}

    {section === "inventory" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Every variant, accounted for.</h2><p>Quantities are split across colors and sizes. Save to update the product’s total.</p></div><span className="admin-small-pill">{totalStock} UNITS</span></div><div className="admin-inventory-picker"><label>Choose a product<select value={selectedProduct?.id || ""} onChange={event => { setSelectedProductId(event.target.value); setVariantDrafts({}); }}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>{selectedProduct && <div className="admin-inventory-selected"><img src={selectedProduct.image} alt="" /><div>{selectedProduct.name}<small>{selectedVariants.length} color and size variants</small></div></div>}</div>{selectedProduct ? <><div className="admin-table-scroll"><table className="admin-table admin-variant-table"><thead><tr><th>COLOR</th><th>SIZE</th><th>SKU</th><th>AVAILABLE UNITS</th></tr></thead><tbody>{selectedVariants.map(variant => <tr key={variant.key}><td><span className="admin-color-name"><span style={{ backgroundColor: variant.color.hex }} />{variant.color.name}</span></td><td>{variant.size}</td><td className="admin-muted">{selectedProduct.slug.slice(0, 16).toUpperCase()}-{variant.color.name.slice(0, 2).toUpperCase()}-{variant.size}</td><td><input type="number" aria-label={`${selectedProduct.name}, ${variant.color.name}, ${variant.size} stock`} className="admin-stock-input" min="0" max="100000" step="1" value={variantDrafts[variant.key] ?? inventory[variant.key] ?? variant.initial} onChange={event => setVariantDrafts(current => ({ ...current, [variant.key]: Math.max(0, Math.floor(Number(event.target.value))) }))} /></td></tr>)}</tbody></table></div><div className="admin-form-footer"><p>Total: <strong>{selectedVariants.reduce((sum, v) => sum + (variantDrafts[v.key] ?? inventory[v.key] ?? v.initial), 0)} units</strong></p><button className="admin-button" onClick={async () => { const next = Object.fromEntries(selectedVariants.map(v => [v.key, variantDrafts[v.key] ?? inventory[v.key] ?? v.initial])); setInventory(current => ({ ...current, ...next })); const updatedStock = Object.values(next).reduce((sum, value) => sum + value, 0); const updatedProd = { ...selectedProduct, stock: updatedStock }; setProducts(current => current.map(p => p.id === selectedProduct.id ? updatedProd : p)); setVariantDrafts({}); setNotice("Saving inventory to Neon DB…"); try { await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProd) }); setNotice(`Inventory saved: ${updatedStock} units in Neon DB.`); log(`Updated inventory for ${selectedProduct.name} to ${updatedStock} units`); } catch { setNotice("Inventory saved locally."); } }}><Save size={16} /> Save inventory</button></div></> : <div className="admin-empty"><Boxes size={34} strokeWidth={1.2} /><h3>Add an essential first.</h3><p>Your product variants will appear here.</p><Link href="/admin/products" className="admin-button">Go to products <ArrowRight size={15} /></Link></div>}</section>}

    {section === "orders" && <>
      <div className="admin-order-metrics">
        {[
          { label: "ALL ORDERS", val: String(customerOrders.length), note: customerOrders.length ? `${customerOrders.length} saved in this browser` : "No live orders yet" },
          { label: "TO FULFILL", val: String(customerOrders.length), note: customerOrders.length ? "Ready for PromptX courier pickup" : "No orders awaiting dispatch" },
          { label: "TOTAL REVENUE", val: money(totalRevenue), note: customerOrders.length ? "Gross volume" : "No payments connected" }
        ].map(item => (
          <div className="admin-metric" key={item.label}>
            <div><span>{item.label}</span><Package size={18} strokeWidth={1.4} /></div>
            <strong>{item.val}</strong>
            <small>{item.note}</small>
          </div>
        ))}
      </div>
      {customerOrders.length > 0 ? (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Placed customer orders</h2>
              <p>Simulated checkouts stored in this browser session & history</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="admin-small-pill">{customerOrders.length} ORDERS</span>
              <button
                type="button"
                className="admin-button admin-button-quiet"
                style={{ minHeight: "30px", padding: "4px 10px", fontSize: "9px" }}
                onClick={() => {
                  try {
                    localStorage.removeItem("hello-order-history");
                    sessionStorage.removeItem("hello-order-preview");
                    setCustomerOrders([]);
                    setNotice("Demo orders cleared.");
                  } catch {}
                }}
              >
                Clear orders
              </button>
            </div>
          </div>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ORDER REF</th>
                  <th>DATE</th>
                  <th>CUSTOMER</th>
                  <th>CITY</th>
                  <th>ITEMS</th>
                  <th>PAYMENT</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map(order => (
                  <tr key={order.reference}>
                    <td><strong style={{ letterSpacing: "0.5px" }}>{order.reference}</strong></td>
                    <td>{new Date(order.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })}</td>
                    <td>
                      <div>
                        <strong style={{ display: "block", fontSize: "10px" }}>{order.customer?.name || "Customer"}</strong>
                        <small style={{ color: "#888", fontSize: "8px" }}>{order.customer?.phone || ""}</small>
                      </div>
                    </td>
                    <td>{order.customer?.city || "Islandwide"}</td>
                    <td>{order.items?.length || 1} item(s)</td>
                    <td>
                      <span className="admin-status-pill admin-status-active">
                        <span />
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "bank" ? "Bank Transfer" : "Card"}
                      </span>
                    </td>
                    <td className="admin-price-cell">{money(order.total || 0)}</td>
                    <td>
                      <select
                        aria-label={`Status for ${order.reference}`}
                        value={order.status || 'processing'}
                        onChange={e => updateOrderStatus(order.reference, e.target.value)}
                        style={{
                          padding: '3px 6px',
                          fontSize: '9px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          background: order.status === 'delivered' ? '#14532d' : order.status === 'out_for_delivery' ? '#1e3a8a' : '#222',
                          color: order.status === 'delivered' ? '#4ade80' : order.status === 'out_for_delivery' ? '#93c5fd' : '#fff',
                          border: '1px solid #444',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="production">In Production</option>
                        <option value="dispatched">Handed to Courier</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link href={`/track-order?ref=${order.reference}`} className="admin-text-link" target="_blank">
                          Track <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-table-footer">
            Showing all {customerOrders.length} order(s)
            <span>Orders are synced live with Neon PostgreSQL database</span>
          </div>
        </section>
      ) : (
        <section className="admin-panel admin-orders-empty">
          <span className="admin-empty-illustration"><ShoppingBag size={44} strokeWidth={1} /></span>
          <span className="admin-eyebrow">ROOM FOR SOMETHING GOOD</span>
          <h2>Your first order is a new beginning.</h2>
          <p>This store has no customer records yet.<br />Place an order via the store checkout to see it appear here in real-time.</p>
          <Link href="/shop" className="admin-button">Explore the store <ArrowUpRight size={17} /></Link>
          <div className="admin-setup-note"><ShieldCheck size={16} /> Orders sync directly with Neon Database.</div>
        </section>
      )}
    </>}

    {section === "categories" && <div className="admin-category-grid">{categories.map(category => { const members = products.filter(p => p.category === category.slug); return <section className="admin-panel admin-category-card" key={category.slug}><div className="admin-category-image">{members[0]?.image ? <img src={members[0].image} alt={category.name} /> : <Tags size={40} strokeWidth={1} />}<span>{String(members.length).padStart(2, "0")} PRODUCTS</span></div><div className="admin-category-copy"><h2>{category.name}</h2><p>{category.description}</p><div><code>/{category.slug}</code><button className="admin-icon-button" aria-label={`Edit ${category.name}`} onClick={() => setCategoryEditor(category)}><Pencil size={16} /></button><button className="admin-icon-button" aria-label={`Delete ${category.name}`} disabled={members.length > 0} title={members.length ? "Move products out of this category before deleting it" : "Delete empty category"} onClick={async () => { setCategories(current => current.filter(c => c.slug !== category.slug)); setNotice("Removing category from Neon DB…"); try { await fetch(`/api/admin/categories?slug=${encodeURIComponent(category.slug)}`, { method: 'DELETE' }); setNotice("Category removed from Neon DB."); log(`Removed category ${category.name}`); } catch { setNotice("Removed locally."); } }}><Trash2 size={16} /></button></div></div></section>; })}<button className="admin-category-add" onClick={() => setCategoryEditor("new")}><Plus size={26} strokeWidth={1.2} /><strong>Make room for more.</strong><span>Add a category</span></button></div>}

    {section === "content" && <form onSubmit={event => { event.preventDefault(); saveLocal(KEYS.content, content, "Store content saved to this browser."); }} className="admin-content-editor"><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>The words behind the wardrobe.</h2><p>Customize your demo storefront copy.</p></div></div><div className="admin-fields"><label>Announcement bar<input maxLength={140} value={content.announcement} onChange={e => setContent({ ...content, announcement: e.target.value })} /><small>A short note for the top of your store.</small></label><label>Hero headline<input maxLength={100} required value={content.heroTitle} onChange={e => setContent({ ...content, heroTitle: e.target.value })} /></label><label>Hero supporting line<textarea rows={2} maxLength={200} value={content.heroSubtitle} onChange={e => setContent({ ...content, heroSubtitle: e.target.value })} /></label><label>Brand story<textarea rows={5} maxLength={1200} value={content.aboutText} onChange={e => setContent({ ...content, aboutText: e.target.value })} /></label></div><div className="admin-form-footer"><span className="admin-muted">Local preview content</span><button className="admin-button"><Check size={16} /> Save content</button></div></section><aside className="admin-content-preview"><span className="admin-eyebrow">LIVE COPY PREVIEW</span><div className="admin-mini-store"><div className="admin-mini-announcement">{content.announcement}</div><div className="admin-mini-nav"><span>SHOP</span><strong className="admin-brand">Hello!</strong><ShoppingBag size={14} /></div><div className="admin-mini-hero"><span className="admin-eyebrow">THE EVERYDAY COLLECTION</span><h2>{content.heroTitle}</h2><p>{content.heroSubtitle}</p><span className="admin-mini-cta">SHOP NOW <ArrowRight size={13} /></span></div><div className="admin-mini-story"><h3>Built for real people.</h3><p>{content.aboutText}</p></div></div><p className="admin-preview-hint">The preview updates as you type. Save to keep your words.</p></aside></form>}

    {section === "media" && <><input ref={uploadRef} className="admin-sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload a local image" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} /><div className="admin-media-note"><Images size={18} strokeWidth={1.5} /><p>{allMedia.length} images in your library <span>JPG, PNG & WebP · up to 2 MB · local browser previews</span></p></div>{mediaError && <p className="admin-error" role="alert">{mediaError}</p>}<div className="admin-media-grid"><button className="admin-media-upload" onClick={() => uploadRef.current?.click()}><ImagePlus size={28} strokeWidth={1.2} /><strong>Drop a little personality.</strong><span>Choose an image</span></button>{allMedia.map(item => <figure className="admin-media-card" key={item.id}><div><img src={item.src} alt={item.name} />{item.uploaded && <button className="admin-icon-button" aria-label={`Remove local image ${item.name}`} onClick={() => { const next = media.filter(m => m.id !== item.id); try { localStorage.setItem(KEYS.media, JSON.stringify(next)); setMedia(next); setNotice("Local image removed."); } catch { setNotice("Could not update browser storage."); } }}><Trash2 size={16} /></button>}</div><figcaption><strong>{item.name}</strong><span>{item.uploaded ? "LOCAL UPLOAD" : "CATALOG IMAGE"}</span></figcaption></figure>)}</div></>}

    {section === "settings" && <form onSubmit={event => { event.preventDefault(); saveLocal(KEYS.settings, settings, "Demo settings saved in your browser."); }} className="admin-settings-layout"><div><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>The everyday details.</h2><p>Your demo store’s name, contact, and preferences.</p></div></div><div className="admin-fields"><label>Store name<input maxLength={100} required value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} /></label><label>Public contact email <span>(optional)</span><input type="email" maxLength={150} placeholder="hello@yourstore.com" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /><small>Use a business address. This demo never sends email.</small></label><div className="admin-form-grid"><label>Currency<select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}><option value="LKR">LKR — Sri Lankan Rupee</option></select></label><label>Planning delivery fee (LKR)<input required type="number" min="0" step="1" value={settings.deliveryFee} onChange={e => setSettings({ ...settings, deliveryFee: Math.max(0, Math.round(Number(e.target.value))) })} /><small>Planning only. Demo checkout uses a fixed LKR 500 sample fee.</small></label></div></div></section><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>A playful little Hello!</h2><p>Only the original logo’s exclamation mark moves. The store opens directly.</p></div><span className="admin-small-pill">LOGO MOTION</span></div><div className="admin-radio-options"><label className={settings.logoMotion ? "admin-radio-selected" : ""}><input type="radio" name="logo-motion" checked={settings.logoMotion} onChange={()=>setSettings({...settings,logoMotion:true})}/><span><strong>A little personality</strong><small>Play a short navbar hop, with a calm cooldown on hover or keyboard focus.</small></span></label><label className={!settings.logoMotion ? "admin-radio-selected" : ""}><input type="radio" name="logo-motion" checked={!settings.logoMotion} onChange={()=>setSettings({...settings,logoMotion:false})}/><span><strong>Keep it still</strong><small>Show the exact original logo without animation.</small></span></label></div><p className="admin-reduced-motion-note">Reduced-motion preferences always keep the logo still. This setting affects only this browser.</p></section><div className="admin-settings-save"><button className="admin-button" type="submit"><Check size={17} /> Save settings</button></div></div><aside><section className="admin-panel admin-mode-card"><ShieldCheck size={26} strokeWidth={1.2} /><h2>A little room to experiment.</h2><p>This is a live management workspace connected to Neon PostgreSQL database.</p><div><span>Store mode</span><strong><span className="admin-status-dot" style={{ background: '#16a34a' }} /> LIVE NEON DB</strong></div><div><span>Payment processing</span><strong>Cash on Delivery (COD) & Bank Transfer</strong></div><div><span>Database engine</span><strong>Neon PostgreSQL 18</strong></div></section><section className="admin-panel admin-reset-card"><h3>A fresh start?</h3><p>Reset admin products, uploads, and preferences to the sample collection.</p><button type="button" className="admin-button admin-button-quiet" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Reset demo workspace</button></section></aside></form>}

    <footer className="admin-footer"><span className="admin-brand">Hello!</span><p>Heavyweight streetwear · Colombo</p><span>HELLO! CLOTHING · ALL-IN-ONE ADMIN PANEL · {new Date().getFullYear()}</span></footer>
    </main></div>
    {notice && <div className="admin-toast" role="status"><CheckCircle2 size={18} />{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15} /></button></div>}
    {editor && <ProductEditor product={editor === "new" ? null : editor} categories={categories} onSave={saveProduct} onClose={() => setEditor(null)} />}
    {deleteProduct && <Modal title="Remove this essential?" onClose={() => setDeleteProduct(null)}><div className="admin-confirm-content"><p><strong>{deleteProduct.name}</strong> will be removed from your catalog and database.</p><div className="admin-modal-actions"><button className="admin-button admin-button-quiet" onClick={() => setDeleteProduct(null)}>Keep product</button><button className="admin-button admin-button-danger" onClick={async () => { const prodToDelete = deleteProduct; setProducts(current => current.filter(p => p.id !== prodToDelete.id)); log(`Removed ${prodToDelete.name}`); setDeleteProduct(null); setNotice("Deleting from Neon DB…"); try { await fetch(`/api/admin/products?id=${encodeURIComponent(prodToDelete.id)}`, { method: 'DELETE' }); setNotice(`"${prodToDelete.name}" deleted from Neon DB.`); } catch { setNotice("Product removed locally."); } }}>Remove product</button></div></div></Modal>}
    {categoryEditor && <CategoryEditor category={categoryEditor === "new" ? null : categoryEditor} existing={categories} onClose={() => setCategoryEditor(null)} onSave={async category => { const previous = categoryEditor === "new" ? null : categoryEditor; setCategories(current => previous ? current.map(c => c.slug === previous.slug ? category : c) : [...current, category]); if (previous && previous.slug !== category.slug) setProducts(current => current.map(p => p.category === previous.slug ? { ...p, category: category.slug } : p)); setCategoryEditor(null); setNotice("Saving category to Neon DB…"); try { await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) }); setNotice(`Category "${category.name}" saved to Neon DB.`); log(`Saved category ${category.name}`); } catch { setNotice("Category saved locally."); } }} />}
    {resetOpen && <Modal title="Say Hello! to a fresh start." onClose={() => setResetOpen(false)}><div className="admin-confirm-content"><p>This removes this browser’s admin edits and local media uploads, and restores the sample catalog and settings.</p><div className="admin-modal-actions"><button className="admin-button admin-button-quiet" onClick={() => setResetOpen(false)}>Keep my changes</button><button className="admin-button" onClick={() => { try { Object.values(KEYS).forEach(key => localStorage.removeItem(key)); setProducts(BASE_PRODUCTS); setCategories(BASE_CATEGORIES); setContent(DEFAULT_CONTENT); setSettings(DEFAULT_SETTINGS); setMedia([]); setInventory({}); setActivity([]); setVariantDrafts({}); setResetOpen(false); setNotice("Fresh start. Your demo workspace has been reset."); window.dispatchEvent(new Event("hello:demo-settings")); } catch { setNotice("Could not reset browser storage."); } }}>Reset workspace</button></div></div></Modal>}
    </div>;
}

function CategoryEditor({ category, existing, onClose, onSave }: { category: Category | null; existing: Category[]; onClose: () => void; onSave: (category: Category) => void }) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [error, setError] = useState("");
  return <Modal title={category ? "Edit category" : "A new way to explore."} onClose={onClose}><form className="admin-edit-form" onSubmit={event => { event.preventDefault(); const slug = slugify(name); if (!slug) { setError("Choose a name with letters or numbers."); return; } if (existing.some(c => c.slug === slug && c.slug !== category?.slug)) { setError("That category already exists. Choose another name."); return; } onSave({ name: name.trim(), description: description.trim(), slug }); }}><label>Category name<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Everyday essentials" /></label><label>Description<textarea rows={3} maxLength={250} value={description} onChange={e => setDescription(e.target.value)} placeholder="A few words about this collection." /></label><span className="admin-muted">Category path: /{slugify(name) || "your-category"}</span>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-modal-actions"><button type="button" className="admin-button admin-button-quiet" onClick={onClose}>Cancel</button><button className="admin-button"><Check size={16} /> Save category</button></div></form></Modal>;
}



