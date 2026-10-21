-- HELLO! production foundation. Apply to NEW staging first; app stays demo.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create table public.user_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','staff')),
 assigned_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create function private.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role in ('owner','staff'));
$$;
create function private.is_owner() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role='owner');
$$;
revoke all on function private.is_staff(), private.is_owner() from public, anon, authenticated;
grant execute on function private.is_staff(), private.is_owner() to anon, authenticated, service_role;
create policy own_role_read on public.user_roles for select to authenticated using(user_id=(select auth.uid()));

create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text check(length(display_name)<=120), phone text check(length(phone)<=25),
 preferences jsonb not null default '{}'::jsonb check(jsonb_typeof(preferences)='object'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.categories (
 id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
 description text not null default '', image_path text, sort_order integer not null default 0,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 is_demo boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.collections (
 id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
 intro text not null default '', hero_image_path text, featured boolean not null default false, sort_order integer not null default 0,
 status text not null default 'draft' check(status in ('draft','published','archived')), is_demo boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(), slug text not null unique,
 title text not null check(length(title) between 1 and 180), summary text not null default '', description text not null default '',
 category_id uuid not null references public.categories(id),
 price_minor bigint not null check(price_minor between 0 and 10000000000),
 currency text not null default 'LKR' check(currency='LKR'),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 is_demo boolean not null default false, tags text[] not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_variants (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 sku text not null unique, color_name text not null, color_hex text not null check(color_hex ~ '^#[0-9a-fA-F]{6}$'), size text not null,
 price_minor_override bigint check(price_minor_override between 0 and 10000000000),
 stock_on_hand integer not null default 0 check(stock_on_hand>=0), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(product_id,color_name,size)
);
create table public.product_images (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 variant_id uuid references public.product_variants(id) on delete set null, storage_path text not null,
 alt text not null, sort_order integer not null default 0,
 kind text not null default 'product' check(kind in ('product','detail','lifestyle'))
);
create table public.collection_products (
 collection_id uuid not null references public.collections(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade, sort_order integer not null default 0,
 primary key(collection_id,product_id)
);
create table public.site_settings (
 key text primary key, value jsonb not null, public_read boolean not null default false, updated_at timestamptz not null default now()
);
create table public.homepage_sections (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('hero','categories','featured_products','editorial','announcement')),
 content jsonb not null check(jsonb_typeof(content)='object'), sort_order integer not null default 0,
 status text not null default 'draft' check(status in ('draft','published','archived')), updated_at timestamptz not null default now()
);
create table public.shipping_zones (
 id uuid primary key default gen_random_uuid(), name text not null, country text not null default 'LK' check(country='LK'),
 districts text[] not null default '{}', active boolean not null default false
);
create table public.shipping_methods (
 id uuid primary key default gen_random_uuid(), name text not null, active boolean not null default false, cod_enabled boolean not null default false
);
create table public.shipping_rates (
 id uuid primary key default gen_random_uuid(), zone_id uuid not null references public.shipping_zones(id),
 method_id uuid not null references public.shipping_methods(id), amount_minor bigint not null check(amount_minor between 0 and 10000000000),
 free_above_minor bigint check(free_above_minor>=0), active boolean not null default false, unique(zone_id,method_id)
);
create table public.orders (
 id uuid primary key default gen_random_uuid(),
 public_ref text not null unique default ('HELLO-' || upper(replace(gen_random_uuid()::text,'-',''))),
 user_id uuid references auth.users(id) on delete set null,
 idempotency_key uuid not null unique, request_fingerprint text not null,
 contact_snapshot jsonb not null, shipping_snapshot jsonb not null, guest_token_hash text check(guest_token_hash ~ '^[a-f0-9]{64}$'),
 subtotal_minor bigint not null check(subtotal_minor>=0), shipping_minor bigint not null check(shipping_minor>=0),
 total_minor bigint not null check(total_minor=subtotal_minor+shipping_minor), currency text not null default 'LKR' check(currency='LKR'),
 shipping_rate_id uuid references public.shipping_rates(id),
 payment_method text not null check(payment_method in ('cod','bank_transfer','payhere_hosted')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','awaiting_verification','pending','paid','failed','refund_pending','refunded')),
 status text not null default 'placed' check(status in ('placed','confirmed','processing','shipped','delivered','cancelled')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
 title_snapshot text not null, sku_snapshot text not null, size_snapshot text not null, color_snapshot text not null,
 quantity integer not null check(quantity between 1 and 10), unit_price_minor bigint not null check(unit_price_minor>=0),
 line_total_minor bigint not null check(line_total_minor=quantity::bigint*unit_price_minor)
);
create table public.inventory_events (
 id uuid primary key default gen_random_uuid(), variant_id uuid not null references public.product_variants(id),
 order_id uuid references public.orders(id), actor_id uuid references auth.users(id) on delete set null,
 delta integer not null check(delta<>0), stock_after integer not null check(stock_after>=0),
 reason text not null check(length(reason) between 3 and 500), idempotency_key uuid not null unique, created_at timestamptz not null default now()
);
create table public.payment_attempts (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
 provider text not null, provider_reference text, provider_event_id text unique,
 amount_minor bigint not null check(amount_minor>=0), currency text not null default 'LKR' check(currency='LKR'),
 status text not null check(status in ('created','pending','verified','failed','refunded')),
 created_at timestamptz not null default now(), unique(provider,provider_reference)
);
create table public.order_status_history (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
 from_status text check(from_status in ('placed','confirmed','processing','shipped','delivered','cancelled')),
 to_status text not null check(to_status in ('placed','confirmed','processing','shipped','delivered','cancelled')),
 actor_id uuid references auth.users(id) on delete set null, note text check(length(note)<=1000), created_at timestamptz not null default now()
);
create table public.wishlist_items (
 user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,product_id)
);
create table public.admin_audit_log (
 id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text not null, entity_id text not null,
 detail jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index products_category_status_idx on public.products(category_id,status);
create index products_status_created_idx on public.products(status,created_at desc);
create index variants_product_idx on public.product_variants(product_id);
create index images_product_idx on public.product_images(product_id,sort_order);
create index orders_user_created_idx on public.orders(user_id,created_at desc);
create index orders_status_created_idx on public.orders(status,created_at desc);
create index order_items_order_idx on public.order_items(order_id);
create index inventory_variant_created_idx on public.inventory_events(variant_id,created_at desc);
create index history_order_idx on public.order_status_history(order_id,created_at);
create index payments_order_idx on public.payment_attempts(order_id);

-- Avoid reliance on project default privileges; every business table has RLS.
do $$ declare t text; begin
 foreach t in array array['profiles','categories','collections','products','product_variants','product_images','collection_products','site_settings','homepage_sections','shipping_zones','shipping_methods','shipping_rates','orders','order_items','inventory_events','payment_attempts','order_status_history','wishlist_items','admin_audit_log'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select on public.categories,public.collections,public.products,public.product_variants,public.product_images,public.collection_products,public.site_settings,public.homepage_sections,public.shipping_zones,public.shipping_methods,public.shipping_rates to anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert,delete on public.wishlist_items to authenticated;
grant select on public.orders,public.order_items,public.order_status_history,public.inventory_events,public.admin_audit_log to authenticated;
grant insert,update,delete on public.categories,public.collections,public.products,public.product_images,public.collection_products,public.homepage_sections,public.shipping_zones,public.shipping_methods,public.shipping_rates to authenticated;
grant insert,update on public.site_settings to authenticated;
-- No authenticated grant on stock_on_hand. New variants start at zero.
grant insert(id,product_id,sku,color_name,color_hex,size,price_minor_override,active) on public.product_variants to authenticated;
grant update(product_id,sku,color_name,color_hex,size,price_minor_override,active) on public.product_variants to authenticated;

create policy profile_read on public.profiles for select to authenticated using(user_id=(select auth.uid()));
create policy profile_insert on public.profiles for insert to authenticated with check(user_id=(select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy category_read on public.categories for select to anon,authenticated using(status='published' or (select private.is_staff()));
create policy collection_read on public.collections for select to anon,authenticated using(status='published' or (select private.is_staff()));
create policy product_read on public.products for select to anon,authenticated using((status='published' and exists(select 1 from public.categories c where c.id=category_id and c.status='published')) or (select private.is_staff()));
create policy variant_read on public.product_variants for select to anon,authenticated using((active and exists(select 1 from public.products p where p.id=product_id and p.status='published')) or (select private.is_staff()));
create policy image_read on public.product_images for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.status='published') or (select private.is_staff()));
create policy collection_product_read on public.collection_products for select to anon,authenticated using((exists(select 1 from public.collections c where c.id=collection_id and c.status='published') and exists(select 1 from public.products p where p.id=product_id and p.status='published')) or (select private.is_staff()));
create policy settings_read on public.site_settings for select to anon,authenticated using(public_read or (select private.is_owner()));
create policy sections_read on public.homepage_sections for select to anon,authenticated using(status='published' or (select private.is_staff()));
create policy zones_read on public.shipping_zones for select to anon,authenticated using(active or (select private.is_owner()));
create policy methods_read on public.shipping_methods for select to anon,authenticated using(active or (select private.is_owner()));
create policy rates_read on public.shipping_rates for select to anon,authenticated using((active and exists(select 1 from public.shipping_zones z where z.id=zone_id and z.active) and exists(select 1 from public.shipping_methods m where m.id=method_id and m.active)) or (select private.is_owner()));
do $$ declare t text; begin
 foreach t in array array['categories','collections','products','product_images','collection_products','homepage_sections'] loop
  execute format('create policy staff_catalog_write on public.%I for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()))',t);
 end loop;
 foreach t in array array['site_settings','shipping_zones','shipping_methods','shipping_rates'] loop
  execute format('create policy owner_settings_write on public.%I for all to authenticated using ((select private.is_owner())) with check ((select private.is_owner()))',t);
 end loop;
end $$;
create policy staff_variant_insert on public.product_variants for insert to authenticated with check((select private.is_staff()));
create policy staff_variant_update on public.product_variants for update to authenticated using((select private.is_staff())) with check((select private.is_staff()));
create policy orders_read on public.orders for select to authenticated using(user_id=(select auth.uid()) or (select private.is_staff()));
create policy items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or (select private.is_staff()))));
create policy history_read on public.order_status_history for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or (select private.is_staff()))));
create policy inventory_read on public.inventory_events for select to authenticated using((select private.is_staff()));
create policy audit_read on public.admin_audit_log for select to authenticated using((select private.is_owner()));
create policy wishlist_read on public.wishlist_items for select to authenticated using(user_id=(select auth.uid()));
create policy wishlist_insert on public.wishlist_items for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.products p where p.id=product_id and p.status='published'));
create policy wishlist_delete on public.wishlist_items for delete to authenticated using(user_id=(select auth.uid()));
-- No customer/public writes on orders, payments, inventory, audit, or roles.

create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function private.touch_updated_at() from public,anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['profiles','categories','collections','products','product_variants','site_settings','homepage_sections','orders'] loop
  execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
 end loop;
end $$;
-- Audit identifiers only: never copy whole customer rows into a second log.
create function private.audit_catalog_change() returns trigger language plpgsql security definer set search_path='' as $$
declare row_id text;
begin
 if tg_op='DELETE' then row_id:=coalesce(to_jsonb(old)->>'id',to_jsonb(old)->>'user_id',to_jsonb(old)->>'key');
 else row_id:=coalesce(to_jsonb(new)->>'id',to_jsonb(new)->>'user_id',to_jsonb(new)->>'key'); end if;
 insert into public.admin_audit_log(actor_id,action,entity_type,entity_id) values(auth.uid(),lower(tg_op),tg_table_name,coalesce(row_id,'setting'));
 if tg_op='DELETE' then return old; end if; return new;
end $$;
revoke all on function private.audit_catalog_change() from public,anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['categories','collections','products','product_variants','product_images','site_settings','homepage_sections','shipping_zones','shipping_methods','shipping_rates','user_roles'] loop
  execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function private.audit_catalog_change()',t);
 end loop;
end $$;

create function public.adjust_inventory(p_variant_id uuid,p_delta integer,p_reason text,p_idempotency_key uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare prior public.inventory_events%rowtype; new_stock integer;
begin
 if not (select private.is_staff()) then raise exception 'Staff access required' using errcode='42501'; end if;
 if p_variant_id is null or p_delta is null or p_delta=0 or abs(p_delta::bigint)>1000000 or coalesce(length(trim(p_reason)),0) not between 3 and 500 or p_idempotency_key is null then
  raise exception 'Invalid inventory adjustment' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text,0));
 select * into prior from public.inventory_events where idempotency_key=p_idempotency_key;
 if found then
  if prior.variant_id is distinct from p_variant_id or prior.delta<>p_delta or prior.actor_id is distinct from auth.uid() or prior.reason<>trim(p_reason) then raise exception 'Idempotency key mismatch'; end if;
  return prior.stock_after;
 end if;
 update public.product_variants set stock_on_hand=stock_on_hand+p_delta
  where id=p_variant_id and stock_on_hand::bigint+p_delta between 0 and 2147483647 returning stock_on_hand into new_stock;
 if not found then raise exception 'Variant missing or insufficient stock'; end if;
 insert into public.inventory_events(variant_id,actor_id,delta,stock_after,reason,idempotency_key)
  values(p_variant_id,auth.uid(),p_delta,new_stock,trim(p_reason),p_idempotency_key);
 return new_stock;
end $$;
revoke all on function public.adjust_inventory(uuid,integer,text,uuid) from public,anon,authenticated;
grant execute on function public.adjust_inventory(uuid,integer,text,uuid) to authenticated;
insert into public.site_settings(key,value,public_read) values('live_commerce_enabled','false'::jsonb,false);
commit;
