"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CheckCircle2, Copy, ExternalLink, ImagePlus, Images, LayoutDashboard, Menu, Package, PackageCheck, Plus, Search, Settings2, ShoppingBag, SlidersHorizontal, Tags, Trash2, Type, X, Pencil, Save, RotateCcw, ShieldCheck, Boxes, MessageCircle, Truck, UserRound, Eye, MapPin, Mail, Printer, RefreshCw, AlertCircle, Phone, CreditCard, Sparkles, PlusCircle, Users, LogOut, KeyRound, ShieldAlert, Send, Star } from "lucide-react";
import { products as catalogProducts } from "@/lib/catalog";
import AdminLogin, { type AdminUserSession } from "./AdminLogin";
import AdminTeamSection from "./AdminTeamSection";
import { logOut as firebaseLogOut } from "@/lib/firebase";

type Color = { name: string; hex: string };
type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  gallery?: string[];
  stock: number;
  colors: Color[];
  sizes: string[];
  description: string;
  status: string;
  isDemo: boolean;
  gender?: string;
  fabricDetails?: {
    fit?: string;
    gsm?: string;
    care?: string;
    composition?: string;
  };
};
type Category = { slug: string; name: string; description: string };
type Content = { announcement: string; heroTitle: string; heroSubtitle: string; aboutText: string };
type Settings = { storeName: string; email: string; currency: string; deliveryFee: number; logoMotion: boolean };
type MediaItem = { id: string; src: string; name: string; uploaded?: boolean };
type Activity = { id: string; label: string; time: number };
type AdminOrder = {
  reference: string;
  createdAt: string;
  customer?: { name?: string; phone?: string; email?: string; address?: string; city?: string; postalCode?: string };
  items?: { productId?: string; name?: string; color?: string; size?: string; quantity?: number; unitPrice?: number; lineTotal?: number; image?: string }[];
  paymentMethod?: string;
  total?: number;
  subtotal?: number;
  delivery?: number;
  status?: string;
  courier?: string;
  tracking_number?: string;
  notes?: string;
};

export const ORDER_STAGES = [
  {
    key: 'order_placed',
    aliases: ['confirmed', 'placed', 'order_placed'],
    label: 'Order Placed',
    stageNumber: 1,
    color: '#38bdf8',
    bg: '#0c2d48',
    border: '#0284c7',
    badgeText: '1. ORDER PLACED',
    description: 'Order placed & confirmed in atelier',
  },
  {
    key: 'in_progress',
    aliases: ['processing', 'production', 'in_progress'],
    label: 'In Progress',
    stageNumber: 2,
    color: '#fbbf24',
    bg: '#422006',
    border: '#d97706',
    badgeText: '2. IN PROGRESS',
    description: 'QC checking & hand-packing in dust bag',
  },
  {
    key: 'ready_to_dispatch',
    aliases: ['dispatched', 'ready_to_dispatch'],
    label: 'Ready to Dispatch',
    stageNumber: 3,
    color: '#c084fc',
    bg: '#3b0764',
    border: '#9333ea',
    badgeText: '3. READY TO DISPATCH',
    description: 'Sealed & handed to courier partner',
  },
  {
    key: 'out_for_delivery',
    aliases: ['out_for_delivery'],
    label: 'Out for Delivery',
    stageNumber: 4,
    color: '#60a5fa',
    bg: '#172554',
    border: '#2563eb',
    badgeText: '4. OUT FOR DELIVERY',
    description: 'Rider is out for doorstep delivery today',
  },
  {
    key: 'delivered',
    aliases: ['delivered', 'order_received'],
    label: 'Order Received',
    stageNumber: 5,
    color: '#4ade80',
    bg: '#052e16',
    border: '#16a34a',
    badgeText: '5. ORDER RECEIVED',
    description: 'Delivered safely to customer',
  },
] as const;

export function getOrderStageInfo(status?: string) {
  const norm = (status || 'order_placed').toLowerCase().trim();
  const found = ORDER_STAGES.find(s => s.key === norm || (s.aliases as readonly string[]).includes(norm));
  if (found) return found;
  if (norm === 'cancelled') {
    return {
      key: 'cancelled',
      aliases: ['cancelled'],
      label: 'Cancelled',
      stageNumber: 0,
      color: '#f87171',
      bg: '#450a0a',
      border: '#dc2626',
      badgeText: 'CANCELLED',
      description: 'Order has been cancelled',
    };
  }
  return ORDER_STAGES[0];
}

export function formatSriLankanPhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  const cleaned = rawPhone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '94' + cleaned.slice(1);
  }
  if (cleaned.startsWith('94')) {
    return cleaned;
  }
  if (cleaned.length === 9) {
    return '94' + cleaned;
  }
  return cleaned;
}

export function getOrderWhatsAppMessage(order: AdminOrder, targetStageKey?: string): string {
  const stage = getOrderStageInfo(targetStageKey || order.status);
  const customerName = order.customer?.name || 'Customer';
  const ref = order.reference;
  const courier = order.courier || 'PromptX Logistics';
  const waybill = order.tracking_number ? ` (Waybill #${order.tracking_number})` : '';
  const trackUrl = `https://www.helloclothing.store/track-order?ref=${encodeURIComponent(ref)}`;
  const isCod = order.paymentMethod === 'cod';

  switch (stage.key) {
    case 'order_placed':
      return `Hello ${customerName}! 👋\n\nYour order *${ref}* has been *PLACED & CONFIRMED* with HELLO! Clothing. Total: Rs. ${(order.total || 0).toLocaleString()}.\n\nOur Colombo fulfillment atelier is preparing your streetwear parcel. You can track your order live anytime:\n🔗 ${trackUrl}\n\nThank you for shopping with HELLO! 🖤`;

    case 'in_progress':
      return `Hello ${customerName}! ⚡\n\nOrder Update: Your HELLO! Clothing order *${ref}* is now *IN PROGRESS*! Each piece is undergoing quality inspection and being hand-packed into our atelier dust bag.\n\nTrack your live progress here:\n🔗 ${trackUrl}\n\nWe will update you as soon as your parcel is ready for dispatch! 👕`;

    case 'ready_to_dispatch':
      return `Hello ${customerName}! 📦\n\nGreat news! Your HELLO! Clothing order *${ref}* is *READY TO DISPATCH* and handed over to our delivery partner *${courier}*${waybill}.\n\nIslandwide delivery typically takes 1–3 business days. Track your courier rider live:\n🔗 ${trackUrl}\n\nThank you for choosing HELLO! 🚀`;

    case 'out_for_delivery':
      return `Hello ${customerName}! 🚀\n\nYour HELLO! Clothing order *${ref}* is *OUT FOR DELIVERY TODAY* with your ${courier} delivery rider! 🛵\n\nPlease ensure your phone is reachable.${isCod ? ` If you chose Cash on Delivery, kindly have the exact cash amount (Rs. ${(order.total || 0).toLocaleString()}) ready for the rider.` : ''}\n\nTrack parcel:\n🔗 ${trackUrl}`;

    case 'delivered':
      return `Hello ${customerName}! 🎉\n\nYour HELLO! Clothing order *${ref}* has been *DELIVERED & RECEIVED*! 🖤\n\nWe hope you love the heavyweight fit and combed cotton craftsmanship. Tag us on Instagram *@hello.streetwear* to be featured!\n\nIf you need any sizing or styling assistance, reply to this message anytime. Enjoy your HELLO! pieces! ✨`;

    default:
      return `Hello ${customerName}! This is HELLO! Clothing regarding your order ${ref}. Track your parcel live here: ${trackUrl}`;
  }
}

export function getOrderWhatsAppUrl(order: AdminOrder, targetStageKey?: string): string {
  const phone = formatSriLankanPhone(order.customer?.phone);
  const message = getOrderWhatsAppMessage(order, targetStageKey);
  if (!phone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
export type AdminSection = "overview" | "products" | "inventory" | "orders" | "reviews" | "categories" | "content" | "media" | "settings" | "team";

const NAV: { id: AdminSection; label: string; icon: typeof Package; minRole?: "admin" | "co_admin" | "super_admin" }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: ShoppingBag, minRole: "co_admin" },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "orders", label: "Orders", icon: Package },
  { id: "reviews", label: "Reviews", icon: Star, minRole: "co_admin" },
  { id: "categories", label: "Categories", icon: Tags, minRole: "co_admin" },
  { id: "content", label: "Store content", icon: Type, minRole: "co_admin" },
  { id: "media", label: "Media library", icon: Images },
  { id: "settings", label: "Settings", icon: Settings2, minRole: "super_admin" },
  { id: "team", label: "Staff & Admins", icon: Users, minRole: "super_admin" },
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

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const PRESET_COLORS = [
  { name: 'Black', hex: '#181918' },
  { name: 'Off White', hex: '#e7e3d9' },
  { name: 'Ash', hex: '#85857f' },
  { name: 'Beige', hex: '#d4c5b3' },
  { name: 'Olive', hex: '#4b5320' },
  { name: 'Navy', hex: '#1b263b' },
  { name: 'Brown', hex: '#5c4033' },
];

async function compressImage(file: File, maxDim = 1920, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file format"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(e.target?.result));
          return;
        }

        const isTransparent = file.type === "image/png" || file.type === "image/webp" || /\.png$/i.test(file.name) || /\.webp$/i.test(file.name);
        if (!isTransparent) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);

        if (isTransparent) {
          try {
            const webp = canvas.toDataURL("image/webp", quality);
            if (webp.startsWith("data:image/webp")) {
              resolve(webp);
              return;
            }
          } catch {}
          try {
            const png = canvas.toDataURL("image/png");
            resolve(png);
            return;
          } catch {}
        }

        try {
          const webp = canvas.toDataURL("image/webp", quality);
          if (webp.startsWith("data:image/webp")) {
            resolve(webp);
            return;
          }
        } catch {}
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(e.target?.result);
    };
    reader.readAsDataURL(file);
  });
}

async function uploadOrCompressImage(file: File): Promise<string> {
  // Fast FormData upload to /api/admin/upload
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (err) {
    console.warn('Direct upload failed, trying fallback:', err);
  }

  // Client-side high-fidelity WebP compression (1920px HD @ 0.92 quality)
  const clientOptimized = await compressImage(file, 1920, 0.92);

  // Fallback to sending base64 to upload endpoint
  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: clientOptimized, filename: file.name }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch {
    // Ignore and fallback to clientOptimized
  }

  return clientOptimized;
}

function ProductEditor({ product, categories, onSave, onClose }: { product: Product | null; categories: Category[]; onSave: (p: Product) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Product>(() => product || {
    id: `prod-${Date.now()}`,
    slug: "",
    name: "",
    price: 349000,
    category: categories[0]?.slug || "t-shirts",
    image: "",
    gallery: [],
    stock: 20,
    colors: [{ name: "Black", hex: "#181918" }],
    sizes: ["S", "M", "L", "XL"],
    description: "",
    status: "published",
    isDemo: false,
    gender: "unisex",
    fabricDetails: {
      fit: "Relaxed Boxy Drop-Shoulder",
      gsm: "240 GSM Heavyweight",
      care: "Machine wash cold with like colors. Hang dry.",
      composition: "100% Combed Cotton"
    }
  });

  const [priceRupees, setPriceRupees] = useState<string>(() => String(Math.round((product?.price ?? 349000) / 100)));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(() => draft.gallery?.length ? draft.gallery : (draft.image ? [draft.image] : []));
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => draft.sizes && draft.sizes.length ? draft.sizes : ['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<Color[]>(() => draft.colors && draft.colors.length ? draft.colors : [{ name: 'Black', hex: '#181918' }]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#333333");

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  // Toggle size
  const toggleSize = (sz: string) => {
    setSelectedSizes(prev => prev.includes(sz) ? (prev.length > 1 ? prev.filter(s => s !== sz) : prev) : [...prev, sz]);
  };

  // Toggle color
  const toggleColor = (c: Color) => {
    setSelectedColors(prev => {
      const exists = prev.some(col => col.name.toLowerCase() === c.name.toLowerCase());
      if (exists) {
        return prev.length > 1 ? prev.filter(col => col.name.toLowerCase() !== c.name.toLowerCase()) : prev;
      }
      return [...prev, c];
    });
  };

  // Add custom color
  const addCustomColor = () => {
    if (!customColorName.trim()) return;
    const newCol = { name: customColorName.trim(), hex: customColorHex };
    if (!selectedColors.some(c => c.name.toLowerCase() === newCol.name.toLowerCase())) {
      setSelectedColors([...selectedColors, newCol]);
    }
    setCustomColorName("");
  };

  // Handle main image file upload with instant optimistic preview + fast background processing
  const handleMainPhotoUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus("⚡ Optimizing photo...");

    // Instant optimistic preview in 0ms
    const localPreview = URL.createObjectURL(file);
    setDraft(d => ({ ...d, image: localPreview }));

    try {
      const permanentUrl = await uploadOrCompressImage(file);
      setDraft(d => ({ ...d, image: permanentUrl }));
      setGalleryImages(g => {
        const withoutLocal = g.filter(src => src !== localPreview);
        return withoutLocal.length > 0 ? [permanentUrl, ...withoutLocal.slice(1)] : [permanentUrl];
      });
      setUploadStatus("✓ Photo attached & optimized");
    } catch (err: any) {
      alert("Could not process image: " + (err.message || 'Unknown error'));
      setUploadStatus("Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 4000);
    }
  };

  // Handle gallery photo upload (single or multiple)
  const handleGalleryPhotoUpload = async (files: FileList | File[] | null | undefined) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatus(`⚡ Optimizing ${files.length} gallery image${files.length > 1 ? 's' : ''}...`);

    try {
      const fileList = Array.from(files);
      const uploadedUrls = await Promise.all(fileList.map(f => uploadOrCompressImage(f)));
      setGalleryImages(g => [...g, ...uploadedUrls]);
      if (!draft.image && uploadedUrls[0]) {
        setDraft(d => ({ ...d, image: uploadedUrls[0] }));
      }
      setUploadStatus(`✓ ${uploadedUrls.length} angle photo${uploadedUrls.length > 1 ? 's' : ''} added`);
    } catch (err: any) {
      alert("Could not process gallery image: " + (err.message || 'Unknown error'));
      setUploadStatus("Gallery upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 4000);
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages(g => {
      const next = g.filter((_, i) => i !== idx);
      if (draft.image === g[idx]) {
        setDraft(d => ({ ...d, image: next[0] || "" }));
      }
      return next;
    });
  };

  const setAsPrimary = (imgSrc: string) => {
    setDraft(d => ({ ...d, image: imgSrc }));
    setGalleryImages(g => [imgSrc, ...g.filter(x => x !== imgSrc)]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          void handleMainPhotoUpload(file);
          break;
        }
      }
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const finalSlug = draft.slug ? slugify(draft.slug) : slugify(draft.name);
    const parsedPrice = Math.round((Number(priceRupees) || (draft.price / 100)) * 100);
    const finalImage = draft.image || galleryImages[0] || "/demo-products/essential-tee.webp";
    const finalGallery = galleryImages.length > 0 ? galleryImages : [finalImage];

    onSave({
      ...draft,
      id: draft.id || `prod-${Date.now()}`,
      slug: finalSlug,
      name: draft.name.trim(),
      price: parsedPrice,
      image: finalImage,
      gallery: finalGallery,
      colors: selectedColors,
      sizes: selectedSizes,
      isDemo: false
    });
  };

  return (
    <Modal title={product ? `Edit "${product.name}"` : "Add New Streetwear Essential"} onClose={onClose}>
      <form onSubmit={submit} className="admin-edit-form" onPaste={handlePaste}>
        {/* Live sync banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#052e16', border: '1px solid #166534', borderRadius: '4px', color: '#86efac', fontSize: '10px' }}>
          <ShieldCheck size={16} color="#4ade80" />
          <span><strong>LIVE PENETIX SYNC:</strong> Saving here publishes immediately to www.helloclothing.store</span>
        </div>

        {/* Product photo upload section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0, fontWeight: 600 }}>Primary Product Photo</label>
            {(isUploading || uploadStatus) && (
              <span style={{ color: isUploading ? '#38bdf8' : '#4ade80', fontSize: '10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {uploadStatus || '⚡ Processing...'}
              </span>
            )}
          </div>
          <div className="admin-photo-uploader">
            <div
              className="admin-photo-preview-wrap"
              style={{
                border: isDragging ? '2px dashed #4ade80' : undefined,
                background: isDragging ? '#064e3b' : undefined,
                cursor: 'pointer',
                position: 'relative'
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void handleMainPhotoUpload(file);
              }}
              onClick={() => mainImageInputRef.current?.click()}
              title="Click or drag image file here"
            >
              {draft.image ? (
                <img src={draft.image} alt={draft.name || "Preview"} style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '4px' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '10px', textAlign: 'center', padding: '12px', gap: '4px' }}>
                  <ImagePlus size={22} color="#71717a" />
                  <span>Click to upload or drag photo here</span>
                  <small style={{ color: '#52525b', fontSize: '9px' }}>JPG, PNG, WebP · Auto-optimized</small>
                </div>
              )}
            </div>
            <div className="admin-photo-upload-actions">
              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { void handleMainPhotoUpload(e.target.files?.[0]); e.target.value = ""; }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-button"
                  style={{ minHeight: '32px', padding: '6px 12px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <ImagePlus size={14} /> {isUploading ? 'Optimizing...' : 'Upload photo from device'}
                </button>
              </div>
              <input
                placeholder="Or paste image URL (e.g. /demo-products/essential-tee.webp or https://...)"
                value={draft.image}
                onChange={e => {
                  const val = e.target.value;
                  setDraft({ ...draft, image: val });
                  if (val && !galleryImages.includes(val)) {
                    setGalleryImages(g => g.length > 0 ? [val, ...g.slice(1)] : [val]);
                  }
                }}
                style={{ fontSize: '11px', height: '34px' }}
              />
            </div>
          </div>
        </div>

        {/* Gallery photos */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Additional Angle Photos ({galleryImages.length})</label>
            <button
              type="button"
              className="admin-button admin-button-quiet"
              style={{ minHeight: '26px', padding: '3px 8px', fontSize: '9px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => galleryImageInputRef.current?.click()}
              disabled={isUploading}
            >
              <Plus size={12} /> Add Angles
            </button>
            <input
              ref={galleryImageInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => { void handleGalleryPhotoUpload(e.target.files); e.target.value = ""; }}
            />
          </div>
          <div className="admin-gallery-editor-strip" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {galleryImages.map((src, idx) => (
              <div key={idx} className="admin-gallery-thumb" style={{ position: 'relative' }}>
                <img src={src} alt={`Angle ${idx + 1}`} style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '2px' }} />
                {draft.image === src && (
                  <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: '#22c55e', color: '#000', fontSize: '8px', fontWeight: 800, padding: '1px 3px', borderRadius: '2px' }}>
                    PRIMARY
                  </span>
                )}
                <div style={{ position: 'absolute', top: '2px', right: '2px', display: 'flex', gap: '2px' }}>
                  {draft.image !== src && (
                    <button
                      type="button"
                      title="Set as primary photo"
                      onClick={() => setAsPrimary(src)}
                      style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '2px', cursor: 'pointer', borderRadius: '2px', fontSize: '8px' }}
                    >
                      ★
                    </button>
                  )}
                  {galleryImages.length > 1 && (
                    <button type="button" onClick={() => removeGalleryImage(idx)} title="Remove photo">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {galleryImages.length === 0 && (
              <span style={{ fontSize: '10px', color: '#71717a' }}>No additional photos yet. Primary photo will be used.</span>
            )}
          </div>
        </div>

        {/* Product Name */}
        <label>
          Product Name
          <input
            required
            maxLength={100}
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Acid Wash Heavyweight Oversized Tee"
          />
        </label>

        {/* Price & Stock Grid */}
        <div className="admin-form-grid">
          <label>
            Price in Sri Lankan Rupees (LKR)
            <input
              required
              min="1"
              step="1"
              type="number"
              value={priceRupees}
              onChange={e => {
                const val = e.target.value;
                setPriceRupees(val);
                const num = Number(val);
                if (!isNaN(num) && num >= 0) {
                  setDraft(d => ({ ...d, price: Math.round(num * 100) }));
                }
              }}
              placeholder="e.g. 3490"
            />
            <small>Displayed on storefront as {money(Math.round((Number(priceRupees) || 0) * 100))}</small>
          </label>

          <label>
            Available Stock Units
            <input
              required
              min="0"
              step="1"
              type="number"
              value={draft.stock}
              onChange={e => setDraft({ ...draft, stock: Math.max(0, Math.floor(Number(e.target.value))) })}
            />
            <div className="admin-stock-helpers">
              <span style={{ fontSize: '8px', color: '#888', alignSelf: 'center' }}>Quick add:</span>
              <button type="button" className="admin-stock-helper-btn" onClick={() => setDraft(d => ({ ...d, stock: d.stock + 5 }))}>+5</button>
              <button type="button" className="admin-stock-helper-btn" onClick={() => setDraft(d => ({ ...d, stock: d.stock + 10 }))}>+10</button>
              <button type="button" className="admin-stock-helper-btn" onClick={() => setDraft(d => ({ ...d, stock: d.stock + 25 }))}>+25</button>
              <button type="button" className="admin-stock-helper-btn" onClick={() => setDraft(d => ({ ...d, stock: d.stock + 50 }))}>+50</button>
            </div>
          </label>

          <label>
            Category
            <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>

          <label>
            Status
            <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
              <option value="published">Active & Published (Live in Store)</option>
              <option value="draft">Draft (Hidden from Store)</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        {/* Quick Sizes Selector */}
        <div>
          <label>Available Sizes (Click to toggle)</label>
          <div className="admin-chip-group">
            {PRESET_SIZES.map(sz => {
              const active = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  className={`admin-size-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleSize(sz)}
                >
                  {sz} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Colors Selector */}
        <div>
          <label>Available Streetwear Colors (Click to toggle)</label>
          <div className="admin-chip-group">
            {PRESET_COLORS.map(c => {
              const active = selectedColors.some(col => col.name.toLowerCase() === c.name.toLowerCase());
              return (
                <button
                  key={c.name}
                  type="button"
                  className={`admin-color-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleColor(c)}
                >
                  <span className="admin-color-dot" style={{ backgroundColor: c.hex }} />
                  {c.name} {active && '✓'}
                </button>
              );
            })}
          </div>
          {/* Custom color input */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <input
              type="color"
              value={customColorHex}
              onChange={e => setCustomColorHex(e.target.value)}
              style={{ width: '32px', height: '32px', padding: 0, border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              placeholder="Or enter custom color name (e.g. Sage Green)"
              value={customColorName}
              onChange={e => setCustomColorName(e.target.value)}
              style={{ flex: 1, height: '32px', fontSize: '10px' }}
            />
            <button
              type="button"
              className="admin-button admin-button-quiet"
              style={{ minHeight: '32px', padding: '4px 10px', fontSize: '9px' }}
              onClick={addCustomColor}
            >
              Add Color
            </button>
          </div>
        </div>

        {/* Description */}
        <label>
          Product Description
          <textarea
            rows={3}
            maxLength={2000}
            value={draft.description}
            onChange={e => setDraft({ ...draft, description: e.target.value })}
            placeholder="Details about cut, weight, and Colombo streetwear inspiration..."
          />
        </label>

        {/* Fabric & Fit Details */}
        <div style={{ background: '#f5f7f0', padding: '14px', borderRadius: '6px', border: '1px solid #e2ebd8' }}>
          <strong style={{ display: 'block', fontSize: '10px', color: '#445b37', marginBottom: '8px' }}>
            Garment Specifications & Streetwear Fit
          </strong>
          <div className="admin-form-grid">
            <label>
              GSM / Fabric Weight
              <input
                value={draft.fabricDetails?.gsm || ""}
                onChange={e => setDraft({ ...draft, fabricDetails: { ...draft.fabricDetails, gsm: e.target.value, fit: draft.fabricDetails?.fit || "", care: draft.fabricDetails?.care || "", composition: draft.fabricDetails?.composition || "" } })}
                placeholder="e.g. 240 GSM Heavyweight"
              />
            </label>
            <label>
              Silhouette & Cut
              <input
                value={draft.fabricDetails?.fit || ""}
                onChange={e => setDraft({ ...draft, fabricDetails: { ...draft.fabricDetails, fit: e.target.value, gsm: draft.fabricDetails?.gsm || "", care: draft.fabricDetails?.care || "", composition: draft.fabricDetails?.composition || "" } })}
                placeholder="e.g. Relaxed Drop-Shoulder Boxy Fit"
              />
            </label>
            <label>
              Composition
              <input
                value={draft.fabricDetails?.composition || ""}
                onChange={e => setDraft({ ...draft, fabricDetails: { ...draft.fabricDetails, composition: e.target.value, gsm: draft.fabricDetails?.gsm || "", fit: draft.fabricDetails?.fit || "", care: draft.fabricDetails?.care || "" } })}
                placeholder="e.g. 100% Combed Compact Cotton"
              />
            </label>
            <label>
              Gender
              <select value={draft.gender || "unisex"} onChange={e => setDraft({ ...draft, gender: e.target.value })}>
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="admin-modal-actions">
          <button type="button" className="admin-button admin-button-quiet" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-button" type="submit" style={{ background: '#1e3a15' }}>
            <Check size={16} /> Save & Publish to Store (Penetix)
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReviewEditorModal({
  review,
  onClose,
  onSave
}: {
  review: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [author, setAuthor] = useState(review?.author || "");
  const [location, setLocation] = useState(review?.location || "Colombo 07");
  const [rating, setRating] = useState(review?.rating || 5);
  const [title, setTitle] = useState(review?.title || "");
  const [body, setBody] = useState(review?.body || "");
  const [image, setImage] = useState(review?.image || "/campaign/real/couple-graphic-tees.webp");
  const [status, setStatus] = useState(review?.status || "published");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imagesList = [
    { label: 'Graphic Tees Pair', src: '/campaign/real/couple-graphic-tees.webp' },
    { label: 'Black Tee Woman', src: '/campaign/real/woman-black-tee.webp' },
    { label: 'Black Hoodie Man', src: '/campaign/real/man-black-hoodie.webp' },
    { label: 'White Hoodie Woman', src: '/campaign/real/woman-white-hoodie.webp' },
    { label: 'White Tee Man', src: '/campaign/real/man-white-tee.webp' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !title.trim() || !body.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        id: review?.id,
        author: author.trim(),
        location: location.trim(),
        rating,
        title: title.trim(),
        body: body.trim(),
        image,
        status
      });
      onClose();
    } catch (err: any) {
      alert("Error saving review: " + (err?.message || 'Failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={review ? "Edit Customer Review" : "Add Customer Review"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="admin-fields" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <span>Customer name</span>
            <input required placeholder="e.g. Kasun Perera" value={author} onChange={e => setAuthor(e.target.value)} />
          </label>
          <label>
            <span>Location / City</span>
            <input required placeholder="e.g. Colombo 07" value={location} onChange={e => setLocation(e.target.value)} />
          </label>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Star Rating</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                type="button"
                key={num}
                onClick={() => setRating(num)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                aria-label={`${num} stars`}
              >
                <Star
                  size={24}
                  fill={num <= rating ? "#eab308" : "none"}
                  color={num <= rating ? "#eab308" : "#52525b"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        <label>
          <span>Review Headline</span>
          <input required placeholder="e.g. Collar stays completely flat after multiple washes." value={title} onChange={e => setTitle(e.target.value)} />
        </label>

        <label>
          <span>Review Body</span>
          <textarea required rows={4} placeholder="What did the customer say about the heavyweight cotton, sizing, or delivery..." value={body} onChange={e => setBody(e.target.value)} />
        </label>

        <div>
          <span style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attached Photo</span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {imagesList.map(img => (
              <button
                type="button"
                key={img.src}
                onClick={() => setImage(img.src)}
                style={{
                  border: image === img.src ? '2px solid #eab308' : '1px solid #3f3f46',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: '#18181b',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <img src={img.src} alt={img.label} style={{ width: '56px', height: '44px', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <span>Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="published">Published (Visible on storefront)</option>
              <option value="hidden">Hidden (Draft / Archive)</option>
            </select>
          </label>
        </div>

        <div className="admin-modal-actions" style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="admin-button admin-button-quiet" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="admin-button" disabled={isSubmitting}>
            <Check size={16} /> {isSubmitting ? "Saving..." : review ? "Update Review" : "Publish Review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminDisabled() {
  return (
    <div className="admin-locked">
      <div className="admin-brand">
        <img src="/branding/hello-light.webp" alt="HELLO!" style={{ height: "30px", width: "auto", marginBottom: "14px", objectFit: "contain" }} />
      </div>
      <ShieldCheck size={36} strokeWidth={1.3} />
      <h1>Admin access is unavailable.</h1>
      <p>This workspace is disabled in public view. Connect your authenticated management service to manage your store.</p>
      <Link href="/" className="admin-button">Back to store <ArrowRight size={16} /></Link>
    </div>
  );
}

export default function AdminApp({ initialSection = "overview" }: { initialSection?: AdminSection }) {
  const [section, setSection] = useState<AdminSection>(initialSection);
  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);
  const [session, setSession] = useState<AdminUserSession | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>(BASE_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(BASE_CATEGORIES);
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<Activity[]>([]);
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [isFetchingReviews, setIsFetchingReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [reviewEditor, setReviewEditor] = useState<any | "new" | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);
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

  // Authentication check on mount
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/\/admin(?:\/([a-z0-9_-]+))?/i);
      const targetSec = (match && match[1]) ? match[1] : 'overview';
      if (NAV.some(n => n.id === targetSec)) {
        setSection(targetSec as AdminSection);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let isMounted = true;
    try {
      const cached = localStorage.getItem('hello-admin-session');
      if (cached) {
        const parsed: AdminUserSession = JSON.parse(cached);
        if (parsed && parsed.email) {
          setSession(parsed);
          // Verify against Penetix to ensure account is still active
          fetch(`/api/admin/auth?email=${encodeURIComponent(parsed.email)}`)
            .then(r => r.json())
            .then(data => {
              if (!isMounted) return;
              if (data.authorized && data.user) {
                setSession(data.user);
                try {
                  localStorage.setItem('hello-admin-session', JSON.stringify(data.user));
                } catch {}
              } else {
                try {
                  localStorage.removeItem('hello-admin-session');
                } catch {}
                setSession(null);
              }
            })
            .catch(() => {})
            .finally(() => {
              if (isMounted) setAuthChecking(false);
            });
          return;
        }
      }
    } catch {}
    if (isMounted) setAuthChecking(false);
    return () => { isMounted = false; };
  }, []);

  const handleSignOut = async () => {
    try {
      await firebaseLogOut();
    } catch {}
    try {
      localStorage.removeItem('hello-admin-session');
    } catch {}
    setSession(null);
    setNotice("Signed out of admin portal.");
  };

  const visibleNav = useMemo(() => {
    if (!session) return [];
    if (session.role === 'super_admin') return NAV;
    if (session.role === 'co_admin') return NAV.filter(n => n.id !== 'settings' && n.id !== 'team');
    // Admin staff: orders, inventory, media, overview
    return NAV.filter(n => ['overview', 'orders', 'inventory', 'media'].includes(n.id));
  }, [session]);

  const activeNav = NAV.find(item => item.id === section) || NAV[0];

  const fetchOrders = async () => {
    setIsFetchingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        setCustomerOrders(data.orders.map((o: any) => ({
          reference: o.reference,
          createdAt: o.created_at || o.createdAt,
          customer: o.customer,
          items: o.items,
          paymentMethod: o.payment_method || o.paymentMethod,
          total: o.total,
          subtotal: o.subtotal,
          delivery: o.delivery,
          status: o.status || 'processing',
          courier: o.courier || 'PromptX Logistics',
          tracking_number: o.tracking_number || o.trackingNumber,
          notes: o.notes || '',
        })));
      }
    } catch (err: any) {
      console.error('Failed to load orders from Penetix:', err);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const deleteOrder = async (reference: string) => {
    setCustomerOrders(prev => prev.filter(o => o.reference !== reference));
    if (selectedOrder?.reference === reference) setSelectedOrder(null);
    setOrderToDelete(null);
    setNotice(`Deleting order ${reference} from Penetix…`);
    try {
      const res = await fetch(`/api/admin/orders?reference=${encodeURIComponent(reference)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotice(`Order ${reference} permanently deleted from Penetix.`);
        log(`Deleted order ${reference}`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setNotice(`Failed to delete order: ${errJson.error || res.statusText}`);
      }
    } catch (err: any) {
      setNotice(`Network error deleting order: ${err.message}`);
    }
  };

  const purgeDemoOrders = async () => {
    setNotice("Clearing test orders from Penetix…");
    try {
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_demo' }),
      });
      try {
        localStorage.removeItem('hello-order-history');
        sessionStorage.removeItem('hello-order-preview');
      } catch {}
      await fetchOrders();
      setNotice("Test orders cleared from Penetix successfully.");
      log("Cleared test orders from Penetix");
    } catch {
      setNotice("Failed to clear test orders.");
    }
  };

  const fetchReviews = async () => {
    setIsFetchingReviews(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data && Array.isArray(data.reviews)) {
        setAdminReviews(data.reviews);
      }
    } catch (err: any) {
      console.error('Failed to load reviews from Penetix:', err);
    } finally {
      setIsFetchingReviews(false);
    }
  };

  const saveReviewItem = async (revData: any) => {
    setNotice("Saving review to Penetix Cloud…");
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revData),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotice(`Review by "${revData.author}" saved successfully.`);
        log(`Saved review by ${revData.author}`);
        await fetchReviews();
      } else {
        setNotice(`Failed to save review: ${json.error || 'Server error'}`);
      }
    } catch (err: any) {
      setNotice(`Network error saving review: ${err.message}`);
    }
  };

  const deleteReviewItem = async (id: string) => {
    setAdminReviews(prev => prev.filter(r => r.id !== id));
    setReviewToDelete(null);
    setNotice("Deleting review from Penetix Cloud…");
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotice("Review deleted successfully.");
        log(`Deleted review ${id}`);
        await fetchReviews();
      } else {
        setNotice("Failed to delete review.");
      }
    } catch (err: any) {
      setNotice(`Error deleting review: ${err.message}`);
    }
  };

  const toggleReviewStatus = async (rev: any) => {
    const nextStatus = rev.status === 'published' ? 'hidden' : 'published';
    setAdminReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: nextStatus } : r));
    try {
      await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rev, status: nextStatus }),
      });
      setNotice(`Review status updated to ${nextStatus}.`);
    } catch {
      setNotice("Failed to update review status.");
    }
  };

  const filteredReviews = useMemo(() => {
    return adminReviews.filter(r => {
      if (reviewStatusFilter !== "all" && r.status !== reviewStatusFilter) return false;
      if (reviewSearch.trim()) {
        const q = reviewSearch.toLowerCase();
        return (
          (r.author && r.author.toLowerCase().includes(q)) ||
          (r.location && r.location.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.body && r.body.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [adminReviews, reviewStatusFilter, reviewSearch]);

  const saveStoreContent = async (e: FormEvent) => {
    e.preventDefault();
    setNotice("Saving content to Penetix…");
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'store_content', value: content }),
      });
      localStorage.setItem(KEYS.content, JSON.stringify(content));
      window.dispatchEvent(new Event("hello:demo-settings"));
      setNotice("Store content saved to Penetix Cloud!");
      log("Saved store content to Penetix Cloud");
    } catch {
      localStorage.setItem(KEYS.content, JSON.stringify(content));
      setNotice("Content saved locally.");
    }
  };

  const saveStoreSettings = async (e: FormEvent) => {
    e.preventDefault();
    setNotice("Saving settings to Penetix…");
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'store_settings', value: settings }),
      });
      localStorage.setItem(KEYS.settings, JSON.stringify(settings));
      window.dispatchEvent(new Event("hello:demo-settings"));
      setNotice("Settings saved to Penetix Cloud!");
      log("Saved store settings to Penetix Cloud");
    } catch {
      localStorage.setItem(KEYS.settings, JSON.stringify(settings));
      setNotice("Settings saved locally.");
    }
  };

  useEffect(() => {
    let active = true;
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
      setReady(true);

      // Fetch live products from Penetix Cloud
      fetch('/api/admin/products')
        .then(r => r.json())
        .then(d => {
          if (active && d.products && Array.isArray(d.products) && d.products.length > 0) {
            setProducts(d.products);
          }
        })
        .catch(() => {});

      // Fetch live orders directly from Penetix Cloud
      fetch('/api/admin/orders')
        .then(r => r.json())
        .then(d => {
          if (active && d && Array.isArray(d.orders)) {
            setCustomerOrders(d.orders.map((o: any) => ({
              reference: o.reference,
              createdAt: o.created_at || o.createdAt,
              customer: o.customer,
              items: o.items,
              paymentMethod: o.payment_method || o.paymentMethod,
              total: o.total,
              subtotal: o.subtotal,
              delivery: o.delivery,
              status: o.status || 'processing',
              courier: o.courier || 'PromptX Logistics',
              tracking_number: o.tracking_number || o.trackingNumber,
              notes: o.notes || '',
            })));
          }
        })
        .catch(() => {});

      // Fetch live categories from Penetix Cloud
      fetch('/api/admin/categories')
        .then(r => r.json())
        .then(d => {
          if (active && d.categories && Array.isArray(d.categories) && d.categories.length > 0) {
            setCategories(d.categories);
          }
        })
        .catch(() => {});

      // Fetch live settings and content from Penetix Cloud
      fetch('/api/admin/settings')
        .then(r => r.json())
        .then(d => {
          if (active && d) {
            if (d.settings) setSettings(prev => ({ ...prev, ...d.settings }));
            if (d.content) setContent(prev => ({ ...prev, ...d.content }));
          }
        })
        .catch(() => {});

      // Fetch live customer reviews from Penetix Cloud / Neon DB
      fetch('/api/admin/reviews')
        .then(r => r.json())
        .then(d => {
          if (active && d && Array.isArray(d.reviews)) {
            setAdminReviews(d.reviews);
          }
        })
        .catch(() => {});
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let errorTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      localStorage.setItem(KEYS.products, JSON.stringify(products));
      localStorage.setItem(KEYS.categories, JSON.stringify(categories));
      localStorage.setItem(KEYS.inventory, JSON.stringify(inventory));
      localStorage.setItem(KEYS.activity, JSON.stringify(activity));
    } catch {
      // Gracefully prevent QuotaExceededError
    }
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

  const filteredCustomerOrders = useMemo(() => {
    return customerOrders.filter(o => {
      let matchesStatus = false;
      if (orderStatus === 'all') {
        matchesStatus = true;
      } else {
        const stage = getOrderStageInfo(o.status);
        matchesStatus = stage.key === orderStatus || o.status === orderStatus;
      }
      if (!matchesStatus) return false;
      if (!orderSearch.trim()) return true;
      const q = orderSearch.toLowerCase();
      const ref = (o.reference || '').toLowerCase();
      const name = (o.customer?.name || '').toLowerCase();
      const phone = (o.customer?.phone || '').toLowerCase();
      const city = (o.customer?.city || '').toLowerCase();
      const email = (o.customer?.email || '').toLowerCase();
      return ref.includes(q) || name.includes(q) || phone.includes(q) || city.includes(q) || email.includes(q);
    });
  }, [customerOrders, orderSearch, orderStatus]);

  const saveProduct = async (product: Product) => {
    const previous = products.find(p => p.id === product.id);
    setProducts(current => previous ? current.map(p => p.id === product.id ? product : p) : [...current, product]);
    if (!previous || previous.stock !== product.stock || JSON.stringify(previous.colors) !== JSON.stringify(product.colors) || JSON.stringify(previous.sizes) !== JSON.stringify(product.sizes)) {
      setInventory(current => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${product.id}|`))));
    }
    setEditor(null);
    setNotice("Syncing with Penetix Cloud…");
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        setNotice(previous ? `"${product.name}" updated in Penetix & Live Storefront!` : `"${product.name}" published to Penetix & Live Storefront!`);
        log(`${previous ? "Updated" : "Added"} ${product.name} (Penetix)`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setNotice(`Save failed: ${errJson.error || res.statusText || 'Database error'}`);
      }
    } catch (err: any) {
      setNotice(`Network error: ${err.message || 'Could not connect to database'}`);
    }
  };

  const duplicateProduct = async (product: Product) => {
    const cloneName = `${product.name} (Copy)`;
    const cloneSlug = `${product.slug}-copy-${Date.now().toString().slice(-4)}`;
    const cloned: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      name: cloneName,
      slug: cloneSlug,
      isDemo: false,
    };
    await saveProduct(cloned);
  };

  const updateOrderStatus = async (reference: string, newStatus: string, courier?: string, trackingNumber?: string) => {
    setCustomerOrders(current => current.map(o => o.reference === reference ? {
      ...o,
      status: newStatus,
      courier: courier !== undefined ? courier : o.courier,
      tracking_number: trackingNumber !== undefined ? trackingNumber : o.tracking_number,
    } : o));
    setSelectedOrder(prev => (prev && prev.reference === reference ? {
      ...prev,
      status: newStatus,
      courier: courier !== undefined ? courier : prev.courier,
      tracking_number: trackingNumber !== undefined ? trackingNumber : prev.tracking_number,
    } : prev));
    setNotice(`Updating order ${reference} in Penetix…`);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, status: newStatus, courier, trackingNumber })
      });
      if (res.ok) {
        setNotice(`Order ${reference} updated in Penetix.`);
        log(`Order ${reference}: ${newStatus}`);
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
    setNotice("Uploading image to media library…");
    try {
      const permanentUrl = await uploadOrCompressImage(file);
      const next = [{ id: `upload-${Date.now()}`, src: permanentUrl, name: file.name, uploaded: true }, ...media];
      try {
        localStorage.setItem(KEYS.media, JSON.stringify(next));
      } catch {}
      setMedia(next);
      setNotice("Image added to media library.");
      log(`Added image ${file.name}`);
    } catch (err: any) {
      setMediaError(err.message || "Failed to upload image.");
    }
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fff', gap: '16px' }}>
        <img src="/branding/hello-light.webp" alt="HELLO!" style={{ height: "32px", width: "auto" }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '13px' }}>
          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Verifying administrator credentials…</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onSuccess={(user) => setSession(user)} />;
  }

  // Permission access check for active section
  const isSectionRestricted =
    ((section === "team" || section === "settings") && session.role !== "super_admin") ||
    (["products", "categories", "content"].includes(section) && session.role === "admin");

  return (
    <div className="admin-app">
      {menuOpen && <button className="admin-sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`admin-sidebar ${menuOpen ? "admin-sidebar-open" : ""}`}>
        <Link className="admin-brand" href="/" aria-label="Hello clothing home" style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
          <img src="/branding/hello-light.webp" alt="HELLO!" style={{ height: "26px", width: "auto", objectFit: "contain" }} />
        </Link>
        <div className="admin-workspace-label">
          <span className="admin-workspace-dot" style={{ background: '#16a34a' }} /> STORE WORKSPACE <span style={{ color: '#4ade80' }}>PENETIX</span>
        </div>
        <nav aria-label="Admin navigation">
          {visibleNav.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={id === "overview" ? "/admin" : `/admin/${id}`}
              aria-current={section === id ? "page" : undefined}
              className={section === id ? "admin-nav-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setSection(id as AdminSection);
                window.history.pushState(null, '', id === "overview" ? "/admin" : `/admin/${id}`);
                setMenuOpen(false);
              }}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
              {id === "orders" && <span className="admin-nav-count">{customerOrders.length}</span>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-store-status"><span style={{ background: '#16a34a' }} /> Penetix Cloud Connected</div>
          <Link href="/">View storefront <ArrowUpRight size={16} /></Link>
          <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: session.role === 'super_admin' ? '#7c3aed' : session.role === 'co_admin' ? '#0284c7' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#fff', flexShrink: 0 }}>
                {session.name ? session.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {session.name}
                </p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: session.role === 'super_admin' ? '#fde047' : session.role === 'co_admin' ? '#93c5fd' : '#86efac',
                  textTransform: 'uppercase'
                }}>
                  {session.role === 'super_admin' ? 'Super Admin' : session.role === 'co_admin' ? 'Co-Admin' : 'Staff'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign out of admin portal"
              style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <button className="admin-icon-button admin-mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{activeNav.label}</strong>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-demo-badge">
              <span /> Penetix Cloud · Connected
            </span>
            <span className="admin-user-badge">
              <span className="admin-user-dot" style={{ background: session.role === 'super_admin' ? '#a855f7' : session.role === 'co_admin' ? '#38bdf8' : '#4ade80' }} />
              <strong>{session.name}</strong>
              <small>{session.role === 'super_admin' ? 'Super Admin' : session.role === 'co_admin' ? 'Co-Admin' : 'Staff'}</small>
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="admin-signout-btn"
              title="Sign Out"
            >
              <LogOut size={13} /> Sign Out
            </button>
            <Link href="/" className="admin-topbar-store" target="_blank">Visit store <ExternalLink size={13} /></Link>
          </div>
        </header>
        <main className="admin-content">
          <div className="admin-page-title">
            <div>
              <span className="admin-eyebrow">HELLO! CLOTHING · {section === "overview" ? "EXECUTIVE STUDIO & ANALYTICS" : section === "team" ? "STAFF & ACCESS CONTROL" : "STORE OPERATIONS"}</span>
              <h1>{section === "overview" ? "Store Studio & Analytics" : activeNav.label}</h1>
              <p>{({
                overview: "Live operations hub for inventory, customer fulfillment, and catalog performance.",
                products: "Good essentials. Great first impressions. Your collection starts here.",
                inventory: "Keep every color and size ready for their next everyday.",
                orders: "Every great brand starts with its first order.",
                reviews: "Real customer reviews, testimonials and wear-test ratings synced with Penetix Cloud.",
                categories: "A place for every piece in your collection.",
                content: "A few words. A whole lot of personality.",
                media: "The images that bring your brand to life.",
                settings: "The details that make this store yours.",
                team: "Hierarchical staff permissions and store administrator access."
              })[section]}</p>
            </div>
            {section === "products" && <button className="admin-button" onClick={() => setEditor("new")}><Plus size={17} /> Add product</button>}
            {section === "reviews" && <button className="admin-button" onClick={() => setReviewEditor("new")}><Plus size={17} /> Add review</button>}
            {section === "categories" && <button className="admin-button" onClick={() => setCategoryEditor("new")}><Plus size={17} /> Add category</button>}
            {section === "media" && <button className="admin-button" onClick={() => uploadRef.current?.click()}><ImagePlus size={17} /> Upload image</button>}
          </div>

          <div className="admin-sandbox-notice">
            <ShieldCheck size={16} strokeWidth={2} />
            <span>PENETIX CLOUD CONNECTED · Live store operations, products, stock, and customer orders.</span>
          </div>

          {isSectionRestricted && (
            <section className="admin-panel" style={{ padding: '32px 20px', textAlign: 'center', margin: '20px 0' }}>
              <ShieldAlert size={44} color="#eab308" style={{ margin: '0 auto 12px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>Access Restricted</h3>
              <p style={{ color: '#a1a1aa', fontSize: '13px', maxWidth: '440px', margin: '0 auto 16px' }}>
                Your assigned role ({session.role.replace('_', ' ').toUpperCase()}) does not have permission to access the <strong>{activeNav.label}</strong> module.
              </p>
              <Link href="/admin/orders" className="admin-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Switch to Orders <ArrowRight size={14} />
              </Link>
            </section>
          )}
    {section === "overview" && <>
      <div className="admin-metrics">{[{ title: "TOTAL REVENUE", value: customerOrders.length > 0 ? money(totalRevenue) : "LKR 0", icon: ArrowUpRight, note: customerOrders.length > 0 ? `${customerOrders.length} customer order${customerOrders.length === 1 ? '' : 's'}` : "Real-time order volume" }, { title: "ORDERS", value: String(customerOrders.length), icon: Package, note: customerOrders.length > 0 ? "Synced with Penetix Cloud" : "Live in Penetix Cloud" }, { title: "CATALOG PIECES", value: String(products.length).padStart(2, "0"), icon: ShoppingBag, note: `${categories.length} curated categories` }, { title: "AVAILABLE UNITS", value: String(totalStock), icon: Boxes, note: `${products.filter(p => p.stock <= 5).length} products with low stock` }].map(item => <div className="admin-metric" key={item.title}><div><span>{item.title}</span><item.icon size={18} strokeWidth={1.4} /></div><strong>{item.value}</strong><small>{item.note}</small></div>)}</div>
      <div className="admin-overview-row"><section className="admin-panel admin-inventory-panel"><div className="admin-panel-heading"><div><h2>Your collection, at a glance.</h2><p>Available stock across your categories</p></div><Link href="/admin/inventory" className="admin-text-link">Manage <ArrowUpRight size={15} /></Link></div><div className="admin-stock-chart">{categories.map(category => { const units = products.filter(p => p.category === category.slug).reduce((sum, p) => sum + p.stock, 0); return <div key={category.slug}><div><span>{category.name}</span><strong>{units}<small> units</small></strong></div><div className="admin-stock-track"><span style={{ width: `${totalStock ? Math.max(2, units / totalStock * 100) : 0}%` }} /></div></div>; })}</div><div className="admin-panel-foot"><span className="admin-status-dot" style={{ background: '#16a34a' }} /> Collection inventory <span style={{ color: '#4ade80' }}>Synced live with Penetix Cloud</span></div></section><section className="admin-brand-panel"><div className="admin-brand-image">{products[0]?.image && <img src={products[0].image} alt="Hello clothing collection" />}<span className="admin-eyebrow">THE EVERYDAY COLLECTION</span><h2>Good clothes.<br />Better energy.</h2></div><div className="admin-brand-panel-bottom"><p>Your next chapter<br />starts with a simple Hello!</p><Link href="/" aria-label="Open your store"><ArrowUpRight size={24} /></Link></div></section></div>
      <div className="admin-overview-bottom"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Recent activity</h2><p>The latest changes in your store</p></div><span className="admin-small-pill" style={{ background: '#052e16', color: '#4ade80', borderColor: '#166534' }}>PENETIX</span></div>{activity.length ? <div className="admin-activity-list">{activity.slice(0, 4).map(item => <div key={item.id}><span><Check size={15} /></span><p>{item.label}<small>{new Date(item.time).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })}</small></p></div>)}</div> : <div className="admin-activity-empty"><span><CheckCircle2 size={25} strokeWidth={1.3} /></span><p>A clean slate.<small>Your product and store updates will appear here.</small></p></div>}</section><section className="admin-panel admin-quick-actions"><div className="admin-panel-heading"><div><h2>A few good next steps.</h2><p>Build your store, one detail at a time.</p></div></div>{[{ label: "Add your next essential", subtitle: "Create a product in your store catalog", to: "/admin/products", icon: ShoppingBag }, { label: "Make it sound like you", subtitle: "Edit your homepage copy", to: "/admin/content", icon: Type }, { label: "A little logo personality", subtitle: "Choose the navbar logo motion", to: "/admin/settings", icon: SlidersHorizontal }].map(action => <Link href={action.to} key={action.to}><action.icon size={19} strokeWidth={1.4} /><span>{action.label}<small>{action.subtitle}</small></span><ArrowRight size={17} /></Link>)}</section></div>
    </>}

    {section === "products" && <section className="admin-panel"><div className="admin-list-toolbar"><div className="admin-filter-tabs"><button className={statusFilter === "all" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("all")}>All products <span>{products.length}</span></button><button className={statusFilter === "published" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("published")}>Active</button><button className={statusFilter === "draft" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("draft")}>Draft</button><button className={statusFilter === "low" ? "admin-filter-active" : ""} onClick={() => setStatusFilter("low")}>Low stock</button></div><label className="admin-search"><Search size={17} /><span className="admin-sr-only">Search products</span><input placeholder="Search your products…" value={query} onChange={event => setQuery(event.target.value)} /></label></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>STATUS</th><th>INVENTORY <ArrowDown size={12} /></th><th>CATEGORY</th><th>PRICE</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>{filteredProducts.map(product => <tr key={product.id}><td><button className="admin-product-cell" onClick={() => setEditor(product)}><img src={product.image} alt="" /><span>{product.name}<small>{product.sizes.join(" / ") || "One size"}</small></span></button></td><td><span className={`admin-status-pill admin-status-${product.status}`}><span />{titleCase(product.status)}</span></td><td><span className={product.stock <= 5 ? "admin-low-stock" : ""}>{product.stock} in stock</span></td><td>{categories.find(c => c.slug === product.category)?.name || titleCase(product.category)}</td><td className="admin-price-cell">{money(product.price)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => setEditor(product)} title="Edit product" aria-label={`Edit ${product.name}`}><Pencil size={15} /></button><button className="admin-icon-button" onClick={() => duplicateProduct(product)} title="Duplicate / Copy this product" aria-label={`Duplicate ${product.name}`}><Copy size={15} /></button><button className="admin-icon-button" onClick={() => setDeleteProduct(product)} title="Delete product" aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{!filteredProducts.length && <div className="admin-empty"><Search size={30} strokeWidth={1.2} /><h3>No matching essentials.</h3><p>Try another name, category, or filter.</p><button className="admin-button admin-button-quiet" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Clear filters</button></div>}<div className="admin-table-footer">{filteredProducts.length} of {products.length} products <span style={{ color: '#4ade80' }}>Synced live with Penetix Cloud</span></div></section>}

    {section === "inventory" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Every variant, accounted for.</h2><p>Quantities are split across colors and sizes. Save to update the product’s total.</p></div><span className="admin-small-pill">{totalStock} UNITS</span></div><div className="admin-inventory-picker"><label>Choose a product<select value={selectedProduct?.id || ""} onChange={event => { setSelectedProductId(event.target.value); setVariantDrafts({}); }}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>{selectedProduct && <div className="admin-inventory-selected"><img src={selectedProduct.image} alt="" /><div>{selectedProduct.name}<small>{selectedVariants.length} color and size variants</small></div></div>}</div>{selectedProduct ? <><div className="admin-table-scroll"><table className="admin-table admin-variant-table"><thead><tr><th>COLOR</th><th>SIZE</th><th>SKU</th><th>AVAILABLE UNITS</th></tr></thead><tbody>{selectedVariants.map(variant => <tr key={variant.key}><td><span className="admin-color-name"><span style={{ backgroundColor: variant.color.hex }} />{variant.color.name}</span></td><td>{variant.size}</td><td className="admin-muted">{selectedProduct.slug.slice(0, 16).toUpperCase()}-{variant.color.name.slice(0, 2).toUpperCase()}-{variant.size}</td><td><input type="number" aria-label={`${selectedProduct.name}, ${variant.color.name}, ${variant.size} stock`} className="admin-stock-input" min="0" max="100000" step="1" value={variantDrafts[variant.key] ?? inventory[variant.key] ?? variant.initial} onChange={event => setVariantDrafts(current => ({ ...current, [variant.key]: Math.max(0, Math.floor(Number(event.target.value))) }))} /></td></tr>)}</tbody></table></div><div className="admin-form-footer"><p>Total: <strong>{selectedVariants.reduce((sum, v) => sum + (variantDrafts[v.key] ?? inventory[v.key] ?? v.initial), 0)} units</strong></p><button className="admin-button" onClick={async () => { const next = Object.fromEntries(selectedVariants.map(v => [v.key, variantDrafts[v.key] ?? inventory[v.key] ?? v.initial])); setInventory(current => ({ ...current, ...next })); const updatedStock = Object.values(next).reduce((sum, value) => sum + value, 0); const updatedProd = { ...selectedProduct, stock: updatedStock }; setProducts(current => current.map(p => p.id === selectedProduct.id ? updatedProd : p)); setVariantDrafts({}); setNotice("Saving inventory to Penetix…"); try { await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProd) }); setNotice(`Inventory saved: ${updatedStock} units in Penetix.`); log(`Updated inventory for ${selectedProduct.name} to ${updatedStock} units`); } catch { setNotice("Inventory saved locally."); } }}><Save size={16} /> Save inventory</button></div></> : <div className="admin-empty"><Boxes size={34} strokeWidth={1.2} /><h3>Add an essential first.</h3><p>Your product variants will appear here.</p><Link href="/admin/products" className="admin-button">Go to products <ArrowRight size={15} /></Link></div>}</section>}

    {section === "orders" && <>
      <div className="admin-order-metrics">
        {[
          { label: "ALL ORDERS", val: String(customerOrders.length), note: customerOrders.length ? "Saved in Penetix Cloud" : "No live orders yet" },
          { label: "PENDING DISPATCH", val: String(customerOrders.filter(o => o.status === 'processing' || o.status === 'confirmed').length), note: "Ready for courier pickup & dispatch" },
          { label: "COMPLETED", val: String(customerOrders.filter(o => o.status === 'delivered').length), note: "Successfully delivered" },
          { label: "TOTAL REVENUE", val: money(totalRevenue), note: customerOrders.length ? "Gross order volume" : "No orders yet" }
        ].map(item => (
          <div className="admin-metric" key={item.label}>
            <div><span>{item.label}</span><Package size={18} strokeWidth={1.4} /></div>
            <strong>{item.val}</strong>
            <small>{item.note}</small>
          </div>
        ))}
      </div>

      <section className="admin-panel">
        <div className="admin-list-toolbar" style={{ flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div className="admin-filter-tabs" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <button className={orderStatus === "all" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("all")}>
              All <span>{customerOrders.length}</span>
            </button>
            <button className={orderStatus === "order_placed" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("order_placed")}>
              1. Placed <span>{customerOrders.filter(o => getOrderStageInfo(o.status).key === 'order_placed').length}</span>
            </button>
            <button className={orderStatus === "in_progress" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("in_progress")}>
              2. In Progress <span>{customerOrders.filter(o => getOrderStageInfo(o.status).key === 'in_progress').length}</span>
            </button>
            <button className={orderStatus === "ready_to_dispatch" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("ready_to_dispatch")}>
              3. Ready to Dispatch <span>{customerOrders.filter(o => getOrderStageInfo(o.status).key === 'ready_to_dispatch').length}</span>
            </button>
            <button className={orderStatus === "out_for_delivery" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("out_for_delivery")}>
              4. Out for Delivery <span>{customerOrders.filter(o => getOrderStageInfo(o.status).key === 'out_for_delivery').length}</span>
            </button>
            <button className={orderStatus === "delivered" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("delivered")}>
              5. Order Received <span>{customerOrders.filter(o => getOrderStageInfo(o.status).key === 'delivered').length}</span>
            </button>
            <button className={orderStatus === "cancelled" ? "admin-filter-active" : ""} onClick={() => setOrderStatus("cancelled")}>
              Cancelled <span>{customerOrders.filter(o => o.status === 'cancelled').length}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <label className="admin-search" style={{ minWidth: '240px' }}>
              <Search size={16} />
              <input
                placeholder="Search ref, customer, phone, city…"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
              />
              {orderSearch && (
                <button
                  type="button"
                  onClick={() => setOrderSearch("")}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '0 4px' }}
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <button
              type="button"
              className="admin-button admin-button-quiet"
              style={{ minHeight: '34px', padding: '0 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={fetchOrders}
              disabled={isFetchingOrders}
              title="Refresh orders from Penetix"
            >
              <RefreshCw size={13} className={isFetchingOrders ? "admin-spin" : ""} />
              {isFetchingOrders ? "Syncing…" : "Refresh"}
            </button>

            <button
              type="button"
              className="admin-button"
              style={{ minHeight: '34px', padding: '0 12px', fontSize: '11px', background: '#22c55e', color: '#000', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setCreateOrderModalOpen(true)}
            >
              <Plus size={15} /> Create Order
            </button>

            {customerOrders.length > 0 && (
              <button
                type="button"
                className="admin-button admin-button-quiet"
                style={{ minHeight: '34px', padding: '0 8px', fontSize: '10px', color: '#ef4444' }}
                onClick={purgeDemoOrders}
                title="Clear any test order records from Penetix"
              >
                Clear Test Orders
              </button>
            )}
          </div>
        </div>

        {customerOrders.length > 0 ? (
          filteredCustomerOrders.length > 0 ? (
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
                  {filteredCustomerOrders.map(order => (
                    <tr key={order.reference}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0, textAlign: "left" }}
                          title="Click to view full order details"
                        >
                          <strong style={{ letterSpacing: "0.5px", color: "#4ade80", textDecoration: "underline" }}>{order.reference}</strong>
                        </button>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })}</td>
                      <td>
                        <div onClick={() => setSelectedOrder(order)} style={{ cursor: "pointer" }}>
                          <strong style={{ display: "block", fontSize: "11px" }}>{order.customer?.name || "Customer"}</strong>
                          <small style={{ color: "#888", fontSize: "9px" }}>{order.customer?.phone || ""}</small>
                        </div>
                      </td>
                      <td>{order.customer?.city || "Islandwide"}</td>
                      <td>{order.items?.length || 1} item(s)</td>
                      <td>
                        <span className="admin-status-pill admin-status-active">
                          <span />
                          {order.paymentMethod === "cod" ? "COD" : order.paymentMethod === "bank" ? "Bank" : "Card"}
                        </span>
                      </td>
                      <td className="admin-price-cell">{money(order.total || 0)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <select
                            aria-label={`Status for ${order.reference}`}
                            value={getOrderStageInfo(order.status).key}
                            onChange={e => updateOrderStatus(order.reference, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: '6px',
                              background: getOrderStageInfo(order.status).bg,
                              color: getOrderStageInfo(order.status).color,
                              border: `1px solid ${getOrderStageInfo(order.status).border}`,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="order_placed">1. Order Placed</option>
                            <option value="in_progress">2. In Progress</option>
                            <option value="ready_to_dispatch">3. Ready to Dispatch</option>
                            <option value="out_for_delivery">4. Out for Delivery</option>
                            <option value="delivered">5. Order Received</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {order.customer?.phone && (
                            <a
                              href={getOrderWhatsAppUrl(order, order.status)}
                              target="_blank"
                              rel="noreferrer"
                              title={`Open WhatsApp for ${order.customer?.name || 'Customer'} (${order.customer?.phone})`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                background: '#052e16',
                                border: '1px solid #166534',
                                borderRadius: '6px',
                                color: '#4ade80',
                                textDecoration: 'none',
                                flexShrink: 0,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <MessageCircle size={15} color="#25D366" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-text-link"
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              font: "inherit",
                              color: "#4ade80",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            View <Eye size={13} />
                          </button>
                          <Link href={`/order-confirmation/${order.reference}`} className="admin-text-link" target="_blank" style={{ color: '#38bdf8' }}>
                            Receipt <Printer size={13} />
                          </Link>
                          <Link href={`/track-order?ref=${order.reference}`} className="admin-text-link" target="_blank">
                            Track <ArrowUpRight size={13} />
                          </Link>
                          <button
                            type="button"
                            className="admin-icon-button"
                            onClick={() => setOrderToDelete(order)}
                            title="Delete order from Penetix"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <Search size={32} strokeWidth={1.2} />
              <h3>No matching orders.</h3>
              <p>No orders matched your current search query or status filter.</p>
              <button
                type="button"
                className="admin-button admin-button-quiet"
                onClick={() => { setOrderSearch(""); setOrderStatus("all"); }}
              >
                Clear filters
              </button>
            </div>
          )
        ) : (
          <div className="admin-empty" style={{ padding: '40px 20px' }}>
            <ShoppingBag size={44} strokeWidth={1} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>No orders in database yet</h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 16px', color: '#a1a1aa', fontSize: '13px' }}>
              Real customer checkouts and manual orders will appear here automatically from Penetix Cloud.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="admin-button"
                style={{ background: '#22c55e', color: '#000', fontWeight: 700 }}
                onClick={() => setCreateOrderModalOpen(true)}
              >
                <Plus size={15} /> Create Manual Order
              </button>
              <Link href="/shop" className="admin-button admin-button-quiet" target="_blank">
                Visit Storefront <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        )}

        <div className="admin-table-footer">
          Showing {filteredCustomerOrders.length} of {customerOrders.length} order(s)
          <span style={{ color: '#4ade80' }}>Synced live with Penetix Cloud</span>
        </div>
      </section>
    </>}

    {section === "reviews" && (
      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div className="admin-filter-tabs">
            <button className={reviewStatusFilter === "all" ? "admin-filter-active" : ""} onClick={() => setReviewStatusFilter("all")}>
              All reviews <span>{adminReviews.length}</span>
            </button>
            <button className={reviewStatusFilter === "published" ? "admin-filter-active" : ""} onClick={() => setReviewStatusFilter("published")}>
              Published <span>{adminReviews.filter(r => r.status === "published").length}</span>
            </button>
            <button className={reviewStatusFilter === "hidden" ? "admin-filter-active" : ""} onClick={() => setReviewStatusFilter("hidden")}>
              Hidden <span>{adminReviews.filter(r => r.status === "hidden").length}</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-button admin-button-quiet"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', height: '36px' }}
              onClick={fetchReviews}
              disabled={isFetchingReviews}
            >
              <RefreshCw size={13} className={isFetchingReviews ? "admin-spin" : ""} />
              {isFetchingReviews ? "Syncing…" : "Refresh"}
            </button>
            <label className="admin-search">
              <Search size={17} />
              <span className="admin-sr-only">Search reviews</span>
              <input placeholder="Search by author, city, text…" value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>RATING</th>
                <th>HEADLINE &amp; REVIEW</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th><span className="admin-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={r.image || '/campaign/real/couple-graphic-tees.webp'} alt="" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ color: '#fff', fontSize: '13px' }}>{r.author}</strong>
                        <small style={{ display: 'block', color: '#a1a1aa', fontSize: '11px' }}>{r.location || 'Sri Lanka'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                      {Array.from({ length: r.rating || 5 }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '340px' }}>
                    <strong style={{ color: '#e4e4e7', fontSize: '12px', display: 'block', marginBottom: '2px' }}>{r.title}</strong>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '11px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {r.body}
                    </p>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleReviewStatus(r)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title="Click to toggle status"
                    >
                      <span className={`admin-status-pill admin-status-${r.status === 'published' ? 'published' : 'draft'}`}>
                        <span />{r.status === 'published' ? 'Published' : 'Hidden'}
                      </span>
                    </button>
                  </td>
                  <td style={{ fontSize: '11px', color: '#71717a', whiteSpace: 'nowrap' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-icon-button" onClick={() => setReviewEditor(r)} title="Edit review">
                        <Pencil size={15} />
                      </button>
                      <button className="admin-icon-button" onClick={() => setReviewToDelete(r)} title="Delete review">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredReviews.length && (
          <div className="admin-empty">
            <Star size={32} strokeWidth={1.2} />
            <h3>No reviews found.</h3>
            <p>Add real customer wear tests and verified reviews to display on the storefront.</p>
            <button className="admin-button" onClick={() => setReviewEditor("new")}>
              <Plus size={16} /> Add first review
            </button>
          </div>
        )}

        <div className="admin-table-footer">
          {filteredReviews.length} of {adminReviews.length} review(s) <span style={{ color: '#4ade80' }}>Synced live with Neon PostgreSQL</span>
        </div>
      </section>
    )}

    {section === "categories" && <div className="admin-category-grid">{categories.map(category => { const members = products.filter(p => p.category === category.slug); return <section className="admin-panel admin-category-card" key={category.slug}><div className="admin-category-image">{members[0]?.image ? <img src={members[0].image} alt={category.name} /> : <Tags size={40} strokeWidth={1} />}<span>{String(members.length).padStart(2, "0")} PRODUCTS</span></div><div className="admin-category-copy"><h2>{category.name}</h2><p>{category.description}</p><div><code>/{category.slug}</code><button className="admin-icon-button" aria-label={`Edit ${category.name}`} onClick={() => setCategoryEditor(category)}><Pencil size={16} /></button><button className="admin-icon-button" aria-label={`Delete ${category.name}`} disabled={members.length > 0} title={members.length ? "Move products out of this category before deleting it" : "Delete empty category"} onClick={async () => { setCategories(current => current.filter(c => c.slug !== category.slug)); setNotice("Removing category from Penetix…"); try { await fetch(`/api/admin/categories?slug=${encodeURIComponent(category.slug)}`, { method: 'DELETE' }); setNotice("Category removed from Penetix."); log(`Removed category ${category.name}`); } catch { setNotice("Removed locally."); } }}><Trash2 size={16} /></button></div></div></section>; })}<button className="admin-category-add" onClick={() => setCategoryEditor("new")}><Plus size={26} strokeWidth={1.2} /><strong>Make room for more.</strong><span>Add a category</span></button></div>}

    {section === "content" && <form onSubmit={saveStoreContent} className="admin-content-editor"><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>The words behind the wardrobe.</h2><p>Customize your storefront copy synced with Penetix Cloud.</p></div></div><div className="admin-fields"><label>Announcement bar<input maxLength={140} value={content.announcement} onChange={e => setContent({ ...content, announcement: e.target.value })} /><small>A short note for the top of your store.</small></label><label>Hero headline<input maxLength={100} required value={content.heroTitle} onChange={e => setContent({ ...content, heroTitle: e.target.value })} /></label><label>Hero supporting line<textarea rows={2} maxLength={200} value={content.heroSubtitle} onChange={e => setContent({ ...content, heroSubtitle: e.target.value })} /></label><label>Brand story<textarea rows={5} maxLength={1200} value={content.aboutText} onChange={e => setContent({ ...content, aboutText: e.target.value })} /></label></div><div className="admin-form-footer"><span className="admin-muted" style={{ color: '#4ade80' }}>Synced with Penetix Cloud</span><button className="admin-button"><Check size={16} /> Save content</button></div></section><aside className="admin-content-preview"><span className="admin-eyebrow">LIVE COPY PREVIEW</span><div className="admin-mini-store"><div className="admin-mini-announcement">{content.announcement}</div><div className="admin-mini-nav"><span>SHOP</span><strong className="admin-brand"><img src="/branding/hello-light.webp" alt="HELLO!" style={{ height: "14px", width: "auto", verticalAlign: "middle" }} /></strong><ShoppingBag size={14} /></div><div className="admin-mini-hero"><span className="admin-eyebrow">THE EVERYDAY COLLECTION</span><h2>{content.heroTitle}</h2><p>{content.heroSubtitle}</p><span className="admin-mini-cta">SHOP NOW <ArrowRight size={13} /></span></div><div className="admin-mini-story"><h3>Built for real people.</h3><p>{content.aboutText}</p></div></div><p className="admin-preview-hint">The preview updates as you type. Save to keep your words.</p></aside></form>}

    {section === "media" && <><input ref={uploadRef} className="admin-sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload a local image" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} /><div className="admin-media-note"><Images size={18} strokeWidth={1.5} /><p>{allMedia.length} images in your library <span>JPG, PNG & WebP · up to 2 MB · local browser previews</span></p></div>{mediaError && <p className="admin-error" role="alert">{mediaError}</p>}<div className="admin-media-grid"><button className="admin-media-upload" onClick={() => uploadRef.current?.click()}><ImagePlus size={28} strokeWidth={1.2} /><strong>Drop a little personality.</strong><span>Choose an image</span></button>{allMedia.map(item => <figure className="admin-media-card" key={item.id}><div><img src={item.src} alt={item.name} />{item.uploaded && <button className="admin-icon-button" aria-label={`Remove local image ${item.name}`} onClick={() => { const next = media.filter(m => m.id !== item.id); try { localStorage.setItem(KEYS.media, JSON.stringify(next)); setMedia(next); setNotice("Local image removed."); } catch { setNotice("Could not update browser storage."); } }}><Trash2 size={16} /></button>}</div><figcaption><strong>{item.name}</strong><span>{item.uploaded ? "LOCAL UPLOAD" : "CATALOG IMAGE"}</span></figcaption></figure>)}</div></>}

    {section === "settings" && <form onSubmit={saveStoreSettings} className="admin-settings-layout"><div><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>Domain Email Channels</h2><p>Automated Resend transactional identities configured for helloclothing.store</p></div><span className="admin-small-pill" style={{ background: '#052e16', color: '#4ade80', border: '1px solid #166534' }}>VERIFIED DOMAIN</span></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}><div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#121215', padding: '12px 14px', borderRadius: '8px', border: '1px solid #27272a' }}><Mail size={18} color="#4ade80" style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>orders@helloclothing.store</strong><p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a1a1aa', lineHeight: 1.5 }}>Automated customer receipts, fulfillment status updates (confirmed, courier tracking #, delivered), and admin new-order alerts.</p></div></div><div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#121215', padding: '12px 14px', borderRadius: '8px', border: '1px solid #27272a' }}><Mail size={18} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>support@helloclothing.store</strong><p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a1a1aa', lineHeight: 1.5 }}>Storefront customer inquiries, support concierge auto-replies, and forward to management team.</p></div></div><div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#121215', padding: '12px 14px', borderRadius: '8px', border: '1px solid #27272a' }}><Mail size={18} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>drops@helloclothing.store</strong><p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a1a1aa', lineHeight: 1.5 }}>VIP drop announcements, exclusive member early access, secret restocks, and welcome discount code (HELLO10).</p></div></div></div></section><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>The everyday details.</h2><p>Your store’s name, contact, and preferences synced with Penetix Cloud.</p></div></div><div className="admin-fields"><label>Store name<input maxLength={100} required value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} /></label><label>Public contact email <span>(optional)</span><input type="email" maxLength={150} placeholder="orders@helloclothing.store" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /><small>Business address for customer receipts and notifications.</small></label><div className="admin-form-grid"><label>Currency<select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}><option value="LKR">LKR — Sri Lankan Rupee</option></select></label><label>Planning delivery fee (LKR)<input required type="number" min="0" step="1" value={settings.deliveryFee} onChange={e => setSettings({ ...settings, deliveryFee: Math.max(0, Math.round(Number(e.target.value))) })} /><small>Planning only. Standard checkout uses LKR 500 islandwide fee (Free over LKR 10,000).</small></label></div></div></section><section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><h2>A playful little Hello!</h2><p>Only the original logo’s exclamation mark moves. The store opens directly.</p></div><span className="admin-small-pill">LOGO MOTION</span></div><div className="admin-radio-options"><label className={settings.logoMotion ? "admin-radio-selected" : ""}><input type="radio" name="logo-motion" checked={settings.logoMotion} onChange={()=>setSettings({...settings,logoMotion:true})}/><span><strong>A little personality</strong><small>Play a short navbar hop, with a calm cooldown on hover or keyboard focus.</small></span></label><label className={!settings.logoMotion ? "admin-radio-selected" : ""}><input type="radio" name="logo-motion" checked={!settings.logoMotion} onChange={()=>setSettings({...settings,logoMotion:false})}/><span><strong>Keep it still</strong><small>Show the exact original logo without animation.</small></span></label></div><p className="admin-reduced-motion-note">Reduced-motion preferences always keep the logo still. This setting affects only this browser.</p></section><div className="admin-settings-save"><button className="admin-button" type="submit"><Check size={17} /> Save settings</button></div></div><aside><section className="admin-panel admin-mode-card"><ShieldCheck size={26} strokeWidth={1.2} /><h2>A little room to experiment.</h2><p>This is a live management workspace connected to Penetix Cloud.</p><div><span>Store mode</span><strong><span className="admin-status-dot" style={{ background: '#16a34a' }} /> LIVE PENETIX ENGINE</strong></div><div><span>Payment processing</span><strong>Cash on Delivery (COD) & Bank Transfer</strong></div><div><span>Database engine</span><strong>Penetix Engine v2.4</strong></div><div><span>Resend Email</span><strong>Active Domain</strong></div></section><section className="admin-panel admin-reset-card"><h3>A fresh start?</h3><p>Reset admin products, uploads, and preferences to the sample collection.</p><button type="button" className="admin-button admin-button-quiet" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Reset local workspace</button></section></aside></form>}

    {section === "team" && (
      <AdminTeamSection
        currentAdmin={session}
        onNotice={(msg) => setNotice(msg)}
      />
    )}

    <footer className="admin-footer"><span className="admin-brand"><img src="/branding/hello-light.webp" alt="HELLO!" style={{ height: "20px", width: "auto", verticalAlign: "middle" }} /></span><p>Heavyweight streetwear · Colombo</p><span>HELLO! CLOTHING · ALL-IN-ONE ADMIN PANEL · {new Date().getFullYear()}</span></footer>
    </main></div>
    {notice && <div className="admin-toast" role="status"><CheckCircle2 size={18} />{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15} /></button></div>}
    {editor && <ProductEditor product={editor === "new" ? null : editor} categories={categories} onSave={saveProduct} onClose={() => setEditor(null)} />}
    {deleteProduct && <Modal title="Remove this essential?" onClose={() => setDeleteProduct(null)}><div className="admin-confirm-content"><p><strong>{deleteProduct.name}</strong> will be removed from your catalog and database.</p><div className="admin-modal-actions"><button className="admin-button admin-button-quiet" onClick={() => setDeleteProduct(null)}>Keep product</button><button className="admin-button admin-button-danger" onClick={async () => { const prodToDelete = deleteProduct; setProducts(current => current.filter(p => p.id !== prodToDelete.id)); log(`Removed ${prodToDelete.name}`); setDeleteProduct(null); setNotice("Deleting from Penetix…"); try { await fetch(`/api/admin/products?id=${encodeURIComponent(prodToDelete.id)}`, { method: 'DELETE' }); setNotice(`"${prodToDelete.name}" deleted from Penetix.`); } catch { setNotice("Product removed locally."); } }}>Remove product</button></div></div></Modal>}
    {categoryEditor && <CategoryEditor category={categoryEditor === "new" ? null : categoryEditor} existing={categories} onClose={() => setCategoryEditor(null)} onSave={async category => { const previous = categoryEditor === "new" ? null : categoryEditor; setCategories(current => previous ? current.map(c => c.slug === previous.slug ? category : c) : [...current, category]); if (previous && previous.slug !== category.slug) setProducts(current => current.map(p => p.category === previous.slug ? { ...p, category: category.slug } : p)); setCategoryEditor(null); setNotice("Saving category to Penetix…"); try { await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) }); setNotice(`Category "${category.name}" saved to Penetix.`); log(`Saved category ${category.name}`); } catch { setNotice("Category saved locally."); } }} />}
    {resetOpen && <Modal title="Say Hello! to a fresh start." onClose={() => setResetOpen(false)}><div className="admin-confirm-content"><p>This removes this browser’s admin edits and local media uploads, and restores the sample catalog and settings.</p><div className="admin-modal-actions"><button className="admin-button admin-button-quiet" onClick={() => setResetOpen(false)}>Keep my changes</button><button className="admin-button" onClick={() => { try { Object.values(KEYS).forEach(key => localStorage.removeItem(key)); setProducts(BASE_PRODUCTS); setCategories(BASE_CATEGORIES); setContent(DEFAULT_CONTENT); setSettings(DEFAULT_SETTINGS); setMedia([]); setInventory({}); setActivity([]); setVariantDrafts({}); setResetOpen(false); setNotice("Fresh start. Your workspace preferences have been reset."); window.dispatchEvent(new Event("hello:demo-settings")); } catch { setNotice("Could not reset browser storage."); } }}>Reset workspace</button></div></div></Modal>}
    {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateOrderStatus} />}
    {orderToDelete && (
      <Modal title="Permanently Delete Order?" onClose={() => setOrderToDelete(null)}>
        <div className="admin-confirm-content">
          <p>Are you sure you want to delete order <strong style={{ color: '#ef4444' }}>{orderToDelete.reference}</strong> ({orderToDelete.customer?.name || 'Customer'} · {money(orderToDelete.total || 0)})?</p>
          <p style={{ fontSize: '11px', color: '#a1a1aa' }}>This order will be permanently erased from Penetix Cloud. This action cannot be undone.</p>
          <div className="admin-modal-actions">
            <button className="admin-button admin-button-quiet" onClick={() => setOrderToDelete(null)}>Cancel</button>
            <button className="admin-button admin-button-danger" onClick={() => deleteOrder(orderToDelete.reference)}>
              <Trash2 size={15} /> Permanently Delete
            </button>
          </div>
        </div>
      </Modal>
    )}
    {createOrderModalOpen && (
      <OrderCreateModal
        products={products}
        onClose={() => setCreateOrderModalOpen(false)}
        onCreated={() => {
          setCreateOrderModalOpen(false);
          fetchOrders();
          setNotice("Order created and saved to Penetix Cloud!");
        }}
      />
    )}
    {reviewEditor && (
      <ReviewEditorModal
        review={reviewEditor === "new" ? null : reviewEditor}
        onClose={() => setReviewEditor(null)}
        onSave={saveReviewItem}
      />
    )}
    {reviewToDelete && (
      <Modal title="Delete Customer Review?" onClose={() => setReviewToDelete(null)}>
        <div className="admin-confirm-content">
          <p>Are you sure you want to delete the review by <strong style={{ color: '#ef4444' }}>{reviewToDelete.author}</strong> ({reviewToDelete.location})?</p>
          <p style={{ fontSize: '11px', color: '#a1a1aa' }}>This review will be permanently erased from Neon PostgreSQL. This action cannot be undone.</p>
          <div className="admin-modal-actions">
            <button className="admin-button admin-button-quiet" onClick={() => setReviewToDelete(null)}>Cancel</button>
            <button className="admin-button admin-button-danger" onClick={() => deleteReviewItem(reviewToDelete.id)}>
              <Trash2 size={15} /> Permanently Delete
            </button>
          </div>
        </div>
      </Modal>
    )}
    </div>
  );
}

function CategoryEditor({ category, existing, onClose, onSave }: { category: Category | null; existing: Category[]; onClose: () => void; onSave: (category: Category) => void }) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [error, setError] = useState("");
  return <Modal title={category ? "Edit category" : "A new way to explore."} onClose={onClose}><form className="admin-edit-form" onSubmit={event => { event.preventDefault(); const slug = slugify(name); if (!slug) { setError("Choose a name with letters or numbers."); return; } if (existing.some(c => c.slug === slug && c.slug !== category?.slug)) { setError("That category already exists. Choose another name."); return; } onSave({ name: name.trim(), description: description.trim(), slug }); }}><label>Category name<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Everyday essentials" /></label><label>Description<textarea rows={3} maxLength={250} value={description} onChange={e => setDescription(e.target.value)} placeholder="A few words about this collection." /></label><span className="admin-muted">Category path: /{slugify(name) || "your-category"}</span>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-modal-actions"><button type="button" className="admin-button admin-button-quiet" onClick={onClose}>Cancel</button><button className="admin-button"><Check size={16} /> Save category</button></div></form></Modal>;
}

function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: AdminOrder;
  onClose: () => void;
  onUpdateStatus: (reference: string, newStatus: string, courier?: string, trackingNumber?: string) => void;
}) {
  const [status, setStatus] = useState(order.status || 'order_placed');
  const [courier, setCourier] = useState(order.courier || 'PromptX Logistics');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [saved, setSaved] = useState(false);
  const [savedStage, setSavedStage] = useState('');
  const [copiedWp, setCopiedWp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  const currentOrderSnapshot: AdminOrder = {
    ...order,
    status,
    courier,
    tracking_number: trackingNumber,
  };

  const whatsappMessage = getOrderWhatsAppMessage(currentOrderSnapshot, status);
  const whatsappUrl = getOrderWhatsAppUrl(currentOrderSnapshot, status);

  const handleTransitionStage = (stageKey: string) => {
    setStatus(stageKey);
    onUpdateStatus(order.reference, stageKey, courier, trackingNumber);
    const stageInfo = getOrderStageInfo(stageKey);
    setSavedStage(stageInfo.label);
    setTimeout(() => setSavedStage(''), 4500);
  };

  const handleSave = () => {
    onUpdateStatus(order.reference, status, courier, trackingNumber);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResendReceipt = async () => {
    setIsResending(true);
    setResendNotice('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: order.reference, action: 'resend_confirmation' }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendNotice(`Confirmation sent to ${order.customer?.email || 'customer'} via orders@helloclothing.store`);
      } else {
        setResendNotice(data.error || 'Failed to dispatch email.');
      }
    } catch {
      setResendNotice('Delivery request failed');
    } finally {
      setIsResending(false);
      setTimeout(() => setResendNotice(''), 6000);
    }
  };

  const activeStageInfo = getOrderStageInfo(status);

  return (
    <Modal title={`Order Details: ${order.reference}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '78vh', overflowY: 'auto', paddingRight: '4px' }}>
        {/* Status & Placement banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#09090b', padding: '12px 14px', borderRadius: '8px', border: '1px solid #27272a', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>PLACED ON</span>
            <strong style={{ fontSize: '13px' }}>{new Date(order.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>PAYMENT METHOD</span>
              <strong style={{ fontSize: '13px', color: '#4ade80' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card'}
              </strong>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
              background: activeStageInfo.bg,
              color: activeStageInfo.color,
              border: `1px solid ${activeStageInfo.border}`,
              letterSpacing: '0.5px'
            }}>
              {activeStageInfo.badgeText}
            </span>
          </div>
        </div>

        {/* 5-Stage Interactive Fulfillment Stepper */}
        <div style={{ background: '#0d0e11', border: '1px solid #27272a', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, display: 'block' }}>
                FULFILLMENT PIPELINE (5 STAGES)
              </span>
              <span style={{ fontSize: '12px', color: '#e4e4e7' }}>
                Click any stage button to transition order status &amp; send customer email via <strong style={{ color: '#fff' }}>orders@helloclothing.store</strong>:
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {ORDER_STAGES.map((s) => {
              const isCurrent = activeStageInfo.key === s.key;
              const isPassed = activeStageInfo.stageNumber > s.stageNumber;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleTransitionStage(s.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isCurrent ? s.bg : isPassed ? '#18181b' : '#121215',
                    border: isCurrent ? `2px solid ${s.color}` : isPassed ? '1px solid #27272a' : '1px solid #222',
                    color: isCurrent ? '#fff' : isPassed ? '#a1a1aa' : '#71717a',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Transition to ${s.label} & auto-send notification email`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isCurrent ? s.color : isPassed ? '#4ade80' : '#71717a' }}>
                      STAGE 0{s.stageNumber}
                    </span>
                    {isPassed && <Check size={12} color="#4ade80" />}
                    {isCurrent && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color }} />}
                  </div>
                  <strong style={{ fontSize: '12px', color: isCurrent ? '#fff' : isPassed ? '#e4e4e7' : '#a1a1aa' }}>
                    {s.label}
                  </strong>
                  <span style={{ fontSize: '10px', color: isCurrent ? s.color : '#71717a', lineHeight: 1.2 }}>
                    {isCurrent ? '● Active Now' : isPassed ? '✓ Completed' : 'Click to Set'}
                  </span>
                </button>
              );
            })}
          </div>

          {savedStage && (
            <div style={{ marginTop: '10px', background: '#052e16', border: '1px solid #166534', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>Status updated to <strong>{savedStage}</strong>! Branded notification email dispatched via <strong>orders@helloclothing.store</strong></span>
            </div>
          )}
        </div>

        {/* WhatsApp Customer Messaging Station */}
        <div style={{ background: '#0a1610', border: '1px solid #164e2e', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0 }}>
                <MessageCircle size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>
                  WhatsApp Customer Station ({order.customer?.phone || 'No phone'})
                </strong>
                <span style={{ fontSize: '11px', color: '#86efac' }}>
                  Customized for stage: <strong style={{ color: '#fff' }}>{activeStageInfo.label}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(whatsappMessage);
                  setCopiedWp(true);
                  setTimeout(() => setCopiedWp(false), 3000);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#162e21',
                  color: '#86efac',
                  border: '1px solid #166534',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Copy size={13} /> {copiedWp ? 'Copied!' : 'Copy WhatsApp Text'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#000',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                }}
              >
                <Send size={13} /> Open in WhatsApp
              </a>
            </div>
          </div>

          <div style={{ background: '#06130b', border: '1px solid #143521', borderRadius: '6px', padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#dcfce7', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '130px', overflowY: 'auto' }}>
            {whatsappMessage}
          </div>
        </div>

        {/* Customer Information Card */}
        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserRound size={15} color="#4ade80" /> Customer Information
            </strong>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleResendReceipt}
                disabled={isResending}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#1c1d1d',
                  color: '#fff',
                  border: '1px solid #333',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: isResending ? 'not-allowed' : 'pointer',
                }}
              >
                <Mail size={13} color="#4ade80" /> {isResending ? 'Sending…' : 'Resend Receipt Email'}
              </button>
            </div>
          </div>

          {resendNotice && (
            <div style={{ background: '#052e16', border: '1px solid #166534', color: '#4ade80', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', marginBottom: '10px' }}>
              ✓ {resendNotice}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12px' }}>
            <div><span style={{ color: '#71717a', display: 'block', fontSize: '11px' }}>Full Name</span><strong>{order.customer?.name || 'N/A'}</strong></div>
            <div><span style={{ color: '#71717a', display: 'block', fontSize: '11px' }}>Contact Phone</span><strong>{order.customer?.phone || 'N/A'}</strong></div>
            <div><span style={{ color: '#71717a', display: 'block', fontSize: '11px' }}>Email Address</span><span>{order.customer?.email || 'N/A'}</span></div>
            <div><span style={{ color: '#71717a', display: 'block', fontSize: '11px' }}>Destination City</span><strong>{order.customer?.city || 'N/A'}</strong></div>
            <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#71717a', display: 'block', fontSize: '11px' }}>Street Delivery Address</span><strong>{order.customer?.address || 'N/A'}</strong></div>
          </div>
        </div>

        {/* Purchased Items Breakdown */}
        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
          <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <ShoppingBag size={15} color="#4ade80" /> Purchased Items ({(order.items || []).length})
          </strong>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(order.items || []).map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < (order.items?.length || 0) - 1 ? '1px solid #27272a' : 'none', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', background: '#222' }} />
                  ) : (
                    <div style={{ width: '38px', height: '38px', background: '#222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} /></div>
                  )}
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px' }}>{item.name}</strong>
                    <span style={{ color: '#a1a1aa', fontSize: '11px' }}>
                      Color: {item.color} · Size: {item.size} · Quantity: {item.quantity}
                    </span>
                  </div>
                </div>
                <strong style={{ fontSize: '12px' }}>{money(item.lineTotal || (item.unitPrice * item.quantity))}</strong>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #27272a', marginTop: '12px', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
              <span>Subtotal</span>
              <span>{money(order.subtotal || ((order.total || 0) - (order.delivery || 50000)))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
              <span>Delivery Fee</span>
              <span>{order.delivery === 0 ? 'FREE' : money(order.delivery || 50000)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
              <span>Order Total</span>
              <span style={{ color: '#4ade80' }}>{money(order.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment & Courier Controls */}
        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
          <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Truck size={15} color="#4ade80" /> Courier & Fulfillment Management
          </strong>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 12px 0' }}>
            Saving automatically dispatches a branded email notification with tracking link to the customer via <strong style={{ color: '#fff' }}>orders@helloclothing.store</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Order Status
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="order_placed">1. Order Placed (Confirmation email)</option>
                <option value="in_progress">2. In Progress (QC & Packing email)</option>
                <option value="ready_to_dispatch">3. Ready to Dispatch (Handed to Courier)</option>
                <option value="out_for_delivery">4. Out for Delivery (Rider dispatched today)</option>
                <option value="delivered">5. Order Received / Delivered (Thank-you email)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Courier Partner
              <input
                type="text"
                list="sl-couriers-list"
                value={courier}
                onChange={e => setCourier(e.target.value)}
                placeholder="e.g. PromptX Logistics"
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              />
              <datalist id="sl-couriers-list">
                <option value="PromptX Logistics" />
                <option value="Domex Courier" />
                <option value="Pronto Lanka" />
                <option value="Koombiyo Delivery" />
                <option value="In-House Messenger (Colombo)" />
              </datalist>
            </label>

            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Waybill / Tracking No
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. PX-849201"
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              className="admin-button"
              onClick={handleSave}
              style={{ background: saved ? '#16a34a' : '#fff', color: saved ? '#fff' : '#000', fontSize: '12px', padding: '6px 14px' }}
            >
              <Save size={14} /> {saved ? 'Updated & Email Sent!' : 'Save Fulfillment & Notify Customer'}
            </button>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-button admin-button-quiet" onClick={onClose}>
            Close
          </button>
          <Link
            href={`/track-order?ref=${order.reference}`}
            target="_blank"
            className="admin-button admin-button-quiet"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            Live Tracking View <ExternalLink size={13} />
          </Link>
          <Link
            href={`/order-confirmation/${order.reference}`}
            target="_blank"
            className="admin-button"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: '#22c55e', color: '#000', fontWeight: 700 }}
          >
            View / Print Receipt <Printer size={13} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}

function OrderCreateModal({
  products,
  onClose,
  onCreated,
}: {
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Colombo");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderStatus, setOrderStatus] = useState("order_placed");
  const [courier, setCourier] = useState("PromptX Logistics");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  type OrderItemDraft = {
    productId: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
  };

  const defaultProduct = products[0];
  const [items, setItems] = useState<OrderItemDraft[]>([
    {
      productId: defaultProduct?.id || "",
      color: defaultProduct?.colors[0]?.name || "Black",
      size: defaultProduct?.sizes[0] || "M",
      quantity: 1,
      unitPrice: defaultProduct?.price || 550000,
    },
  ]);

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    setItems(curr =>
      curr.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: prod.id,
              color: prod.colors[0]?.name || "Black",
              size: prod.sizes[0] || "M",
              unitPrice: prod.price,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    const prod = products[0];
    if (!prod) return;
    setItems(curr => [
      ...curr,
      {
        productId: prod.id,
        color: prod.colors[0]?.name || "Black",
        size: prod.sizes[0] || "M",
        quantity: 1,
        unitPrice: prod.price,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(curr => curr.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const delivery = subtotal >= 1000000 ? 0 : 50000;
  const total = subtotal + delivery;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Please provide customer name.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Please provide customer phone number.");
      return;
    }
    if (!customerAddress.trim()) {
      setError("Please provide delivery street address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItems = items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          name: prod?.name || "Apparel Essential",
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
          image: prod?.image || "",
        };
      });

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || 'customer@helloclothing.store',
            address: customerAddress.trim(),
            city: customerCity.trim() || 'Colombo',
          },
          items: formattedItems,
          subtotal,
          delivery,
          total,
          paymentMethod,
          status: orderStatus,
          courier,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Create New Order (Penetix)" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78vh', overflowY: 'auto', paddingRight: '4px' }}>
        {error && (
          <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
          <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#fff' }}>
            <UserRound size={15} color="#4ade80" /> Customer Information
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Full Name *
              <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Kasun Fernando" style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }} />
            </label>
            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Phone Number *
              <input required type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. 077 123 4567" style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }} />
            </label>
            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Email Address
              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="customer@gmail.com" style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }} />
            </label>
            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              City / District *
              <input required type="text" value={customerCity} onChange={e => setCustomerCity(e.target.value)} placeholder="e.g. Colombo, Kandy, Galle" style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }} />
            </label>
            <label style={{ gridColumn: '1 / -1', fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Street Delivery Address *
              <textarea required rows={2} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="No. 45/2, Galle Road, Colombo 03" style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }} />
            </label>
          </div>
        </div>

        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
              <ShoppingBag size={15} color="#4ade80" /> Items & Variants ({items.length})
            </strong>
            <button
              type="button"
              onClick={handleAddItem}
              className="admin-button admin-button-quiet"
              style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={13} /> Add Product
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, idx) => {
              const currentProd = products.find(p => p.id === item.productId);
              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 2fr) minmax(90px, 1fr) minmax(70px, 1fr) minmax(60px, 1fr) minmax(90px, 1fr) auto', gap: '8px', alignItems: 'flex-end', background: '#1a1a1e', padding: '10px', borderRadius: '6px' }}>
                  <label style={{ fontSize: '10px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    Product
                    <select
                      value={item.productId}
                      onChange={e => handleProductChange(idx, e.target.value)}
                      style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '11px' }}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </label>

                  <label style={{ fontSize: '10px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    Color
                    <select
                      value={item.color}
                      onChange={e => setItems(curr => curr.map((it, i) => i === idx ? { ...it, color: e.target.value } : it))}
                      style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '11px' }}
                    >
                      {(currentProd?.colors || [{ name: 'Default', hex: '#000' }]).map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </label>

                  <label style={{ fontSize: '10px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    Size
                    <select
                      value={item.size}
                      onChange={e => setItems(curr => curr.map((it, i) => i === idx ? { ...it, size: e.target.value } : it))}
                      style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '11px' }}
                    >
                      {(currentProd?.sizes || ['M']).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label style={{ fontSize: '10px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    Qty
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => setItems(curr => curr.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, parseInt(e.target.value) || 1) } : it))}
                      style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '11px' }}
                    />
                  </label>

                  <label style={{ fontSize: '10px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    Price (LKR)
                    <input
                      type="number"
                      step="100"
                      value={item.unitPrice / 100}
                      onChange={e => setItems(curr => curr.map((it, i) => i === idx ? { ...it, unitPrice: Math.round(Number(e.target.value) * 100) } : it))}
                      style={{ padding: '6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '11px' }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="admin-icon-button"
                    style={{ height: '32px', color: items.length <= 1 ? '#555' : '#ef4444' }}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
              <span>Subtotal:</span>
              <span>{money(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
              <span>Islandwide Delivery:</span>
              <span>{delivery === 0 ? 'FREE (Over LKR 10,000)' : money(delivery)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>
              <span>Total Payable:</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
          <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#fff' }}>
            <Truck size={15} color="#4ade80" /> Payment & Fulfillment Details
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Payment Method
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card Payment</option>
              </select>
            </label>

            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Initial Status
              <select
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value)}
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="order_placed">1. Order Placed</option>
                <option value="in_progress">2. In Progress</option>
                <option value="ready_to_dispatch">3. Ready to Dispatch</option>
                <option value="out_for_delivery">4. Out for Delivery</option>
                <option value="delivered">5. Order Received</option>
              </select>
            </label>

            <label style={{ fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Courier Partner
              <input
                type="text"
                value={courier}
                onChange={e => setCourier(e.target.value)}
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              />
            </label>

            <label style={{ gridColumn: '1 / -1', fontSize: '11px', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Admin Internal Notes
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Requested urgent weekend delivery, or VIP customer"
                style={{ padding: '8px 10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '12px' }}
              />
            </label>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-button admin-button-quiet" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="admin-button"
            disabled={isSubmitting}
            style={{ background: '#22c55e', color: '#000', fontWeight: 700 }}
          >
            {isSubmitting ? "Creating…" : "Save Order to Penetix"}
          </button>
        </div>
      </form>
    </Modal>
  );
}



