-- OPTIONAL DEVELOPMENT DATA. Explicitly import only into an isolated demo DB.
-- Never run automatically in a production environment. No customer data.
begin;
insert into public.categories(slug, name, status, is_demo, sort_order) values
 ('t-shirts', 'T-Shirts', 'published', true, 1), ('pants', 'Pants', 'published', true, 2),
 ('hoodies', 'Hoodies', 'published', true, 3), ('accessories', 'Accessories', 'published', true, 4)
on conflict (slug) do nothing;

with examples(slug, title, category, price_minor) as (values
 ('essential-tee','Essential Tee','t-shirts',349000::bigint),
 ('signature-tee','Signature Tee','t-shirts',399000::bigint),
 ('cargo-pants','Cargo Pants','pants',599000::bigint),
 ('oversized-hoodie','Oversized Hoodie','hoodies',699000::bigint),
 ('classic-cap','Classic Cap','accessories',299000::bigint),
 ('sling-bag','Sling Bag','accessories',499000::bigint)
)
insert into public.products(slug, title, category_id, price_minor, status, is_demo, description, tags)
select e.slug, e.title, c.id, e.price_minor, 'published', true,
 'Demonstration product. Name, price, description and stock require owner approval.', array['demo','new-arrival']
from examples e join public.categories c on c.slug = e.category
on conflict (slug) do nothing;

insert into public.product_variants(product_id, sku, color_name, color_hex, size, stock_on_hand)
select p.id, 'DEMO-' || upper(p.slug) || '-' || upper(s.size), 'Black', '#171717', s.size, 20
from public.products p cross join lateral unnest(case when p.slug in ('classic-cap','sling-bag') then array['One Size'] else array['S','M','L','XL'] end) s(size)
where p.is_demo and p.slug in ('essential-tee','signature-tee','cargo-pants','oversized-hoodie','classic-cap','sling-bag')
on conflict (sku) do nothing;

-- Seed stock is explicitly audited as a development import.
insert into public.inventory_events(variant_id, delta, stock_after, reason, idempotency_key)
select v.id, v.stock_on_hand, v.stock_on_hand, 'Explicit development demo seed', v.id
from public.product_variants v join public.products p on p.id = v.product_id
where p.is_demo and v.sku like 'DEMO-%' and v.stock_on_hand > 0
on conflict (idempotency_key) do nothing;
commit;
