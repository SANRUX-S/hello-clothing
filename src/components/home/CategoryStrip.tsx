import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { categories } from '@/lib/catalog';

export default function CategoryStrip() {
  return (
    <section className="category-strip page-gutter" aria-label="Product categories">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/collections/${c.slug}`}
          className={`category-card category-${c.slug}`}
        >
          <img
            src={c.image}
            alt={c.name}
            width={600}
            height={400}
            loading="eager"
          />
          <div>
            <h2>{c.name}</h2>
            <span>
              SHOP NOW <ArrowRight size={13} />
            </span>
          </div>
          <ArrowUpRight className="category-corner" size={18} />
        </Link>
      ))}
    </section>
  );
}
