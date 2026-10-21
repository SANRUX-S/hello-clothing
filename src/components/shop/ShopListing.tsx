'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { categories, products as fallbackProducts, money, type Product } from '@/lib/catalog';
import { useStore } from '@/store/store';
import { ProductCard } from './ProductCard';
import CategoryFeatureGrid from './CategoryFeatureGrid';

export default function ShopListing({
  category,
  newOnly = false,
  wishlist = false,
  search = false,
  initialProducts,
}: {
  category?: string;
  newOnly?: boolean;
  wishlist?: boolean;
  search?: boolean;
  initialProducts?: Product[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>(() =>
    initialProducts && initialProducts.length > 0 ? initialProducts : fallbackProducts
  );

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (d.products && Array.isArray(d.products) && d.products.length > 0) {
          setLiveProducts(d.products);
        }
      })
      .catch(() => {});
  }, []);

  const selectedCategory = category ?? params.get('category') ?? '';
  const size = params.get('size') ?? '';
  const color = params.get('color') ?? '';
  const sort = params.get('sort') ?? 'latest';
  const maxPrice = Number(params.get('max') ?? 10000);
  const query = params.get('q') ?? '';
  const edit = params.get('edit');
  const editTitle = edit === 'men' ? 'MEN’S EDIT.' : edit === 'women' ? 'WOMEN’S EDIT.' : '';

  function change(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    let result = liveProducts.filter(
      (p) =>
        p.status === 'published' &&
        (!selectedCategory || p.category === selectedCategory) &&
        (!size || p.sizes.includes(size)) &&
        (!color || p.colors.some((c) => c.name === color)) &&
        p.price <= maxPrice * 100 &&
        (!newOnly || p.tags.includes('new')) &&
        (!wishlist || store.wishlist.includes(p.id)) &&
        (!edit ||
          (edit === 'men'
            ? p.tags.includes('men') || p.gender === 'men' || p.gender === 'unisex'
            : edit === 'women'
            ? p.tags.includes('women') || p.gender === 'women' || p.gender === 'unisex'
            : true)) &&
        (!query ||
          `${p.name} ${p.description} ${p.category} ${p.tags.join(' ')}`
            .toLowerCase()
            .includes(query.toLowerCase()))
    );
    if (sort === 'price-asc') result = result.toSorted((a, b) => a.price - b.price);
    if (sort === 'price-desc') result = result.toSorted((a, b) => b.price - a.price);
    if (sort === 'name') result = result.toSorted((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [liveProducts, selectedCategory, size, color, maxPrice, newOnly, wishlist, store.wishlist, query, sort, edit]);

  const showCollections = !category && !newOnly && !wishlist && !search && !selectedCategory && !editTitle;
  const cat = categories.find((c) => c.slug === category);
  const title = wishlist
    ? 'YOUR WISHLIST'
    : search
    ? 'SEARCH RESULTS'
    : cat
    ? cat.name.toUpperCase()
    : newOnly
    ? 'NEW ARRIVALS.'
    : editTitle || 'ALL STREETWEAR.';

  const clear = () => router.replace('?', { scroll: false });

  const filters = (
    <>
      <div className="filter-heading">
        <h2>CATEGORIES</h2>
      </div>
      <div className="category-filter">
        <Link className={!selectedCategory ? 'chosen' : ''} href="/shop">
          All pieces <span>{liveProducts.length}</span>
        </Link>
        {categories.map((c) => (
          <Link
            className={selectedCategory === c.slug ? 'chosen' : ''}
            key={c.slug}
            href={`/collections/${c.slug}`}
          >
            {c.name}
            <span>{liveProducts.filter((p) => p.category === c.slug).length}</span>
          </Link>
        ))}
      </div>
      <div className="filter-heading">
        <h2>FILTER BY</h2>
        <SlidersHorizontal size={14} />
      </div>
      <fieldset className="filter-group">
        <legend>
          Size <ChevronDown size={13} />
        </legend>
        <div className="filter-size">
          {['S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((s) => (
            <button
              key={s}
              className={size === s ? 'selected' : ''}
              aria-pressed={size === s}
              onClick={() => change('size', size === s ? '' : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="filter-group">
        <legend>
          Color <ChevronDown size={13} />
        </legend>
        <div className="color-options">
          {[
            { name: 'Black', hex: '#181918' },
            { name: 'Ash', hex: '#85857f' },
            { name: 'Off White', hex: '#e7e3d9' },
          ].map((c) => (
            <button
              key={c.name}
              title={c.name}
              aria-label={`Filter ${c.name}`}
              aria-pressed={color === c.name}
              className={color === c.name ? 'selected' : ''}
              style={{ background: c.hex }}
              onClick={() => change('color', color === c.name ? '' : c.name)}
            />
          ))}
        </div>
      </fieldset>
      <fieldset className="filter-group">
        <legend>
          Price range <ChevronDown size={13} />
        </legend>
        <input
          type="range"
          min="2990"
          max="10000"
          step="10"
          value={maxPrice}
          aria-label="Maximum price"
          onChange={(e) => change('max', e.target.value)}
        />
        <div className="range-labels">
          <span>{money(299000)}</span>
          <span>{money(maxPrice * 100)}</span>
        </div>
      </fieldset>
      {(size || color || params.get('max') || edit) && (
        <button className="clear-filters" onClick={clear}>
          CLEAR FILTERS <X size={13} />
        </button>
      )}
      <div className="sidebar-note">
        <span>
          LESS NOISE.
          <br />
          MORE YOU.
        </span>
        <p>Find the pieces that feel like you.</p>
      </div>
    </>
  );

  return (
    <>
      {showCollections ? (
        <CategoryFeatureGrid showProductsLink />
      ) : (
        <section className="shop-banner">
          <img
            src={
              cat?.image ??
              (edit === 'men'
                ? '/campaign/real/man-black-hoodie.webp'
                : edit === 'women'
                ? '/campaign/real/woman-white-hoodie.webp'
                : '/hero/campaign.webp')
            }
            alt="Hello! collection campaign"
            width={1600}
            height={400}
          />
          <div />
          <div className="shop-banner-copy">
            <span className="eyebrow">
              HELLO! / {wishlist ? 'SAVED FOR LATER' : editTitle ? editTitle : 'THE COLLECTION'}
            </span>
            <h1>{title}</h1>
            <p>
              {cat?.caption ??
                (wishlist
                  ? 'ALL YOUR FAVORITES, IN ONE PLACE.'
                  : edit === 'men'
                  ? 'CLEAN. BOLD. YOURS. CURATED FOR MEN.'
                  : edit === 'women'
                  ? 'EFFORTLESS. EVERY DAY. CURATED FOR WOMEN.'
                  : 'PREMIUM ESSENTIALS. INDIVIDUAL EXPRESSION.')}
            </p>
          </div>
          <span className="banner-index">
            {cat ? '0' + (categories.indexOf(cat) + 1) : '01'} — 04
          </span>
        </section>
      )}
      <div id="all-pieces" className="catalog-layout page-gutter">
        <aside className="filter-sidebar">{filters}</aside>
        <section className="catalog-main" aria-label="Product catalog">
          <div className="catalog-top">
            <div>
              <p>
                {search && query
                  ? `Results for “${query}”`
                  : cat?.name ??
                    (newOnly
                      ? 'New arrivals'
                      : wishlist
                      ? 'Saved pieces'
                      : editTitle
                      ? editTitle
                      : 'All pieces')}{' '}
                <span>({filtered.length})</span>
              </p>
            </div>
            <div className="catalog-controls">
              <button
                className="filter-mobile-toggle text-link"
                onClick={() => setMobileFilters((v) => !v)}
              >
                <SlidersHorizontal size={15} /> FILTERS
              </button>
              <label className="sort-control">
                Sort by{' '}
                <select value={sort} onChange={(e) => change('sort', e.target.value)}>
                  <option value="latest">Latest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </label>
            </div>
          </div>
          {search && (
            <form className="catalog-search" action="/search">
              <Search size={18} />
              <input
                name="q"
                aria-label="Search pieces"
                defaultValue={query}
                placeholder="What are you looking for?"
              />
              <button className="icon-button" aria-label="Search">
                <ArrowRight size={18} />
              </button>
            </form>
          )}
          {mobileFilters && <div className="mobile-filters">{filters}</div>}
          {size || color ? (
            <div className="active-filters">
              {[size, color].filter(Boolean).map((v, i) => (
                <button key={v} onClick={() => change(i === 0 && size ? 'size' : 'color', '')}>
                  {v}
                  <X size={12} />
                </button>
              ))}
            </div>
          ) : null}
          {filtered.length ? (
            <div className="catalog-grid">
              {filtered.map((p, i) => (
                <ProductCard product={p} key={p.id} index={i} showSizes />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-script">Hello?</span>
              <h2>{wishlist ? 'Your favorites start here.' : 'A little too specific?'}</h2>
              <p>
                {wishlist
                  ? 'Tap the heart on a piece you love. We’ll save it here.'
                  : 'Try another search or give your filters a fresh start.'}
              </p>
              {wishlist ? (
                <Link className="button dark" href="/shop">
                  EXPLORE THE COLLECTION <ArrowRight size={17} />
                </Link>
              ) : (
                <button className="button dark" onClick={clear}>
                  CLEAR FILTERS <ArrowRight size={17} />
                </button>
              )}
            </div>
          )}
          <div className="catalog-end">
            <span>
              YOU’VE SEEN {filtered.length} OF {filtered.length} PIECES
            </span>
            <span>MAKE THEM YOUR OWN.</span>
          </div>
        </section>
      </div>
    </>
  );
}
