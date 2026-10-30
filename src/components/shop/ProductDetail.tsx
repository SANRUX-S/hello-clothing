'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Heart, Minus, Plus, ArrowUpRight, Maximize2, Check, Share2, Clock } from 'lucide-react';
import { type Product, categories, products, money } from '@/lib/catalog';
import { useStore } from '@/store/store';
import { Modal } from '@/components/ui/Modal';
import { ProductCard } from './ProductCard';

export default function ProductDetail({ product: p, allProducts }: { product: Product; allProducts?: Product[] }) {
  const store = useStore();
  const router = useRouter();
  const [size, setSize] = useState(p.sizes && p.sizes.length === 1 ? p.sizes[0] : '');
  const [color, setColor] = useState(p.colors && p.colors[0] ? p.colors[0].name : 'Default');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(false);
  const [guide, setGuide] = useState(false);
  const [guideUnit, setGuideUnit] = useState<'inches' | 'cm'>('inches');
  const [view, setView] = useState(0);

  const cat = categories.find((c) => c.slug === p.category) || {
    slug: p.category || 'all',
    name: p.category ? p.category.toUpperCase() : 'COLLECTION',
    image: p.image || '/branding/hello-word.webp',
    caption: 'HELLO! Colombo',
    description: ''
  };

  // Clean gallery strictly showing only this product's actual uploaded images
  const gallery = useMemo(() => {
    const raw = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.image];
    const isCustom = p.image?.startsWith('/api/media/') || p.image?.startsWith('/uploads/') || !p.isDemo;
    const filtered = raw.filter((img) => {
      if (!img || typeof img !== 'string') return false;
      if (isCustom && (img.includes('/campaign/real/') || img.includes('/categories/') || img.includes('/hero/') || img.includes('/demo-products/'))) {
        return false;
      }
      return true;
    });
    const unique = Array.from(new Set([p.image, ...filtered])).filter(Boolean);
    return unique.length > 0 ? unique : [p.image];
  }, [p.gallery, p.image, p.isDemo]);

  // Use real products from database for related items instead of stale static demo products
  const related = useMemo(() => {
    const source = (allProducts && allProducts.length > 0) ? allProducts : products;
    return source.filter((x) => x.id !== p.id).slice(0, 4);
  }, [allProducts, p.id]);

  const saved = store.wishlist.includes(p.id);

  function handleColorSelect(colorName: string) {
    setColor(colorName);
    if (p.colorImages && p.colorImages[colorName]) {
      const targetImg = p.colorImages[colorName];
      const foundIndex = gallery.indexOf(targetImg);
      if (foundIndex !== -1) {
        setView(foundIndex);
      }
    }
  }

  function add(buy = false) {
    if (!size) {
      setError('Choose your size to find your fit.');
      return;
    }
    setError('');
    if (store.add({ productId: p.id, size, color, quantity: qty })) {
      if (buy) router.push('/checkout');
      else store.setCartOpen(true);
    }
  }

  const activeImage = gallery[view] ?? p.image;

  return (
    <>
      <div className="product-page page-gutter">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/collections/${p.category}`}>{cat.name}</Link>
          <span>/</span>
          <span>{p.name}</span>
        </nav>

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="gallery-thumbs">
              {gallery.map((image, i) => (
                <button
                  key={image + i}
                  className={view === i ? 'active' : ''}
                  onClick={() => setView(i)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={image} alt={`${p.name} view ${i + 1}`} width={80} height={100} />
                </button>
              ))}
            </div>
            <div className="gallery-main">
              <img
                src={activeImage}
                alt={`${p.name} — ${color} preview`}
                width={800}
                height={1000}
                fetchPriority="high"
              />
              <span className="gallery-label">{`VIEW 0${view + 1} / 0${gallery.length}`}</span>
              <button
                className="icon-button gallery-zoom"
                aria-label="Enlarge product image"
                onClick={() => setZoom(true)}
              >
                <Maximize2 size={19} />
              </button>
            </div>
          </div>

          <div className="product-information">
            <span className="eyebrow">HELLO! STREETWEAR · SRI LANKA</span>
            <div className="product-title-row">
              <h1>{p.name}</h1>
              <button
                className="icon-button"
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={saved}
                onClick={() => store.toggleWish(p.id)}
              >
                <Heart size={23} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.2} />
              </button>
            </div>

            <p className="product-price">{money(p.price)}</p>
            <p className="product-description">{p.description}</p>

            <div className="variant-section">
              <span className="variant-label">
                COLOR: <strong>{color}</strong>
              </span>
              <div className="color-options">
                {p.colors.map((c) => (
                  <button
                    key={c.name}
                    aria-label={`Choose ${c.name}`}
                    aria-pressed={color === c.name}
                    className={color === c.name ? 'selected' : ''}
                    onClick={() => handleColorSelect(c.name)}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="variant-section">
              <div className="size-label">
                <span className="variant-label">
                  SIZE: <strong>{size || 'SELECT YOUR FIT'}</strong>
                </span>
                <button className="text-link" onClick={() => setGuide(true)}>
                  SIZE GUIDE <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="size-options">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    className={size === s ? 'selected' : ''}
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s);
                      setError('');
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {error && <p role="alert" className="field-error">{error}</p>}
            </div>

            <div className="product-purchase">
              <div className="quantity">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1 || p.stock <= 0}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span>{p.stock > 0 ? qty : 0}</span>
                <button
                  onClick={() => setQty(Math.min(10, p.stock, qty + 1))}
                  disabled={p.stock <= 0 || qty >= Math.min(10, p.stock)}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                className="button dark"
                disabled={p.stock <= 0}
                onClick={() => add()}
              >
                {p.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'} <ArrowRight size={17} />
              </button>
            </div>

            {p.stock > 0 && (
              <button className="button outline buy-now" onClick={() => add(true)}>
                BUY NOW <ArrowUpRight size={17} />
              </button>
            )}

            {p.stock > 0 ? (
              <div className="product-demo-note" style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#16a34a" />
                <span><strong>In Stock ({p.stock} available)</strong> · Dispatched within 24 hours from Colombo Hub</span>
              </div>
            ) : (
              <div className="product-demo-note" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} color="#dc2626" />
                <span><strong>Temporarily Out of Stock</strong> · Next batch dropping soon</span>
              </div>
            )}

            <div className="product-accordions">
              {p.fabricDetails && (
                <details open>
                  <summary>
                    FABRIC & SPECIFICATIONS <Plus size={14} />
                  </summary>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                    <p><strong>Composition:</strong> {p.fabricDetails.composition}</p>
                    <p><strong>Weight:</strong> {p.fabricDetails.gsm}</p>
                    <p><strong>Cut & Fit:</strong> {p.fabricDetails.fit}</p>
                    <p><strong>Care Instructions:</strong> {p.fabricDetails.care}</p>
                  </div>
                </details>
              )}

              <details>
                <summary>
                  SHIPPING & GUARANTEE <Plus size={14} />
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  <p>
                    <strong>Islandwide Delivery:</strong> LKR 500 flat fee. <strong>FREE islandwide delivery</strong> automatically applied on orders over LKR 10,000.
                  </p>
                  <p>
                    <strong>Timelines:</strong> 1–2 business days in Colombo & suburbs; 2–4 business days outstation islandwide. Next-day Express available in Western Province (LKR 750).
                  </p>
                  <p>
                    <strong>Courier Partners & Tracking:</strong> Handed over to PromptX Logistics or Domex Courier in sealed branded dust bags. Live SMS waybill tracking sent upon dispatch.
                  </p>
                  <p>
                    <strong>Payment Methods:</strong> Cash on Delivery (COD) across all 25 districts with parcel inspection, or Direct Bank Transfer (Commercial Bank / Sampath Bank).
                  </p>
                  <p>
                    <strong>7-Day Doorstep Size Exchange:</strong> Unworn pieces with original swing tags can be swapped for another size. WhatsApp concierge: <strong>+94 78 619 1260</strong>.
                  </p>
                </div>
              </details>
            </div>

            <button
              className="text-link product-share"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  store.toast('Product link copied to clipboard.');
                } catch {
                  store.toast('Copy the browser URL to share this piece.');
                }
              }}
            >
              <Share2 size={13} /> SHARE THIS PIECE
            </button>
          </div>
        </div>
      </div>

      <section className="related-section page-gutter">
        <div className="section-heading">
          <h2>GOOD COMPANY.</h2>
          <Link href="/shop" className="text-link">
            ALL PIECES <ArrowRight size={17} />
          </Link>
        </div>
        <div className="related-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <Modal open={zoom} onClose={() => setZoom(false)} title={p.name}>
        <div className="zoom-image">
          <img src={activeImage} alt={p.name} width={900} height={1050} />
        </div>
      </Modal>

      <Modal open={guide} onClose={() => setGuide(false)} title="Garment Size Guide">
        <div className="info-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="eyebrow" style={{ margin: 0 }}>HELLO! STREETWEAR SIZING</span>
            <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--line)', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setGuideUnit('inches')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: guideUnit === 'inches' ? 'var(--fg)' : 'transparent',
                  color: guideUnit === 'inches' ? 'var(--bg)' : 'var(--muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                INCHES
              </button>
              <button
                type="button"
                onClick={() => setGuideUnit('cm')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: guideUnit === 'cm' ? 'var(--fg)' : 'transparent',
                  color: guideUnit === 'cm' ? 'var(--bg)' : 'var(--muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                CENTIMETERS
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Our garments feature a modern oversized, drop-shoulder streetwear silhouette. If you prefer a regular tailored fit, consider sizing down one size.
          </p>

          {p.category === 'pants' ? (
            <table style={{ width: '100%', fontSize: '0.85rem', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '8px 4px' }}>SIZE</th>
                  <th style={{ padding: '8px 4px' }}>WAIST ({guideUnit === 'inches' ? 'IN' : 'CM'})</th>
                  <th style={{ padding: '8px 4px' }}>LENGTH</th>
                  <th style={{ padding: '8px 4px' }}>INSEAM</th>
                  <th style={{ padding: '8px 4px' }}>THIGH</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: 'S', w: guideUnit === 'inches' ? '28 - 30' : '71 - 76', l: guideUnit === 'inches' ? '40' : '101', i: guideUnit === 'inches' ? '29' : '74', t: guideUnit === 'inches' ? '24' : '61' },
                  { s: 'M', w: guideUnit === 'inches' ? '31 - 33' : '79 - 84', l: guideUnit === 'inches' ? '41' : '104', i: guideUnit === 'inches' ? '30' : '76', t: guideUnit === 'inches' ? '25' : '64' },
                  { s: 'L', w: guideUnit === 'inches' ? '34 - 36' : '86 - 91', l: guideUnit === 'inches' ? '42' : '107', i: guideUnit === 'inches' ? '31' : '79', t: guideUnit === 'inches' ? '26' : '66' },
                  { s: 'XL', w: guideUnit === 'inches' ? '37 - 39' : '94 - 99', l: guideUnit === 'inches' ? '43' : '109', i: guideUnit === 'inches' ? '31.5' : '80', t: guideUnit === 'inches' ? '27' : '69' },
                ].map((row) => (
                  <tr key={row.s} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: 600 }}>{row.s}</td>
                    <td style={{ padding: '8px 4px' }}>{row.w}</td>
                    <td style={{ padding: '8px 4px' }}>{row.l}</td>
                    <td style={{ padding: '8px 4px' }}>{row.i}</td>
                    <td style={{ padding: '8px 4px' }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : p.category === 'accessories' ? (
            <div style={{ padding: '1rem', background: 'var(--panel)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <p><strong>One Size Fits All:</strong></p>
              <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>
                Caps feature an adjustable rear strap with a brass buckle clasp (fitting head circumferences 54 cm – 62 cm / 21.2 in – 24.4 in). Bags feature an adjustable webbing strap up to 130 cm.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', fontSize: '0.85rem', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '8px 4px' }}>SIZE</th>
                  <th style={{ padding: '8px 4px' }}>CHEST ({guideUnit === 'inches' ? 'IN' : 'CM'})</th>
                  <th style={{ padding: '8px 4px' }}>LENGTH</th>
                  <th style={{ padding: '8px 4px' }}>SHOULDER</th>
                  <th style={{ padding: '8px 4px' }}>SLEEVE</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: 'S', c: guideUnit === 'inches' ? '42' : '106', l: guideUnit === 'inches' ? '28' : '71', sh: guideUnit === 'inches' ? '20' : '51', sl: guideUnit === 'inches' ? '9.0' : '23' },
                  { s: 'M', c: guideUnit === 'inches' ? '44' : '112', l: guideUnit === 'inches' ? '29' : '74', sh: guideUnit === 'inches' ? '21' : '53', sl: guideUnit === 'inches' ? '9.5' : '24' },
                  { s: 'L', c: guideUnit === 'inches' ? '46' : '117', l: guideUnit === 'inches' ? '30' : '76', sh: guideUnit === 'inches' ? '22' : '56', sl: guideUnit === 'inches' ? '10.0' : '25' },
                  { s: 'XL', c: guideUnit === 'inches' ? '48' : '122', l: guideUnit === 'inches' ? '31' : '79', sh: guideUnit === 'inches' ? '23' : '58', sl: guideUnit === 'inches' ? '10.5' : '27' },
                  { s: 'XXL', c: guideUnit === 'inches' ? '50' : '127', l: guideUnit === 'inches' ? '32' : '81', sh: guideUnit === 'inches' ? '24' : '61', sl: guideUnit === 'inches' ? '11.0' : '28' },
                ].map((row) => (
                  <tr key={row.s} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: 600 }}>{row.s}</td>
                    <td style={{ padding: '8px 4px' }}>{row.c}</td>
                    <td style={{ padding: '8px 4px' }}>{row.l}</td>
                    <td style={{ padding: '8px 4px' }}>{row.sh}</td>
                    <td style={{ padding: '8px 4px' }}>{row.sl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ background: 'var(--panel)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--fg)', display: 'block', marginBottom: '4px' }}>How to measure your fit:</strong>
            <p><strong>Chest:</strong> Measure across the fullest part of your chest, keeping the tape horizontal under the arms.</p>
            <p><strong>Length:</strong> Measure from the highest point of the shoulder seam straight down to the bottom hem.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}

