'use client';
import Link from 'next/link';
import { Heart, ArrowUpRight } from 'lucide-react';
import { type Product, money } from '@/lib/catalog';
import { useStore } from '@/store/store';

export function ProductCard({
  product: p,
  index = 0,
  showSizes = false,
  showSwatches = false,
}: {
  product: Product;
  index?: number;
  showSizes?: boolean;
  showSwatches?: boolean;
}) {
  const store = useStore();
  const saved = store.wishlist.includes(p.id);

  return (
    <article className="product-card" style={{ animationDelay: `${index * 45}ms` }}>
      <div className="product-visual">
        <Link href={`/products/${p.slug}`} aria-label={`View ${p.name}`}>
          <img
            src={p.image}
            alt={`${p.name}, ${p.colors[0].name}, conceptual product photo`}
            width={600}
            height={700}
            loading="lazy"
          />
        </Link>
        <button
          type="button"
          className={`wish-button ${saved ? 'saved' : ''}`}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          aria-pressed={saved}
          onClick={() => store.toggleWish(p.id)}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.3} />
        </button>
        <Link className="quick-add" href={`/products/${p.slug}`}>
          CHOOSE YOUR FIT <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="product-meta">
        <Link href={`/products/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <p>{money(p.price)}</p>
        {showSizes && (
          <p className="product-card-sizes" aria-label={`Available sizes: ${p.sizes.join(', ')}`}>
            {p.sizes.join(' · ')}
          </p>
        )}
        {showSwatches && (
          <div className="mini-swatches" aria-label={`Available colors: ${p.colors.map((c) => c.name).join(', ')}`}>
            {p.colors.map((c) => (
              <span key={c.name} style={{ background: c.hex }} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
