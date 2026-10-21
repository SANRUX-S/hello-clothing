-- Service-role-only foundation; there is no production HTTP order adapter.
begin;

create function public.create_cod_order(
  p_idempotency_key uuid, p_items jsonb, p_customer jsonb,
  p_shipping_rate_id uuid, p_user_id uuid default null, p_guest_token_hash text default null
) returns table (order_id uuid, public_ref text, total_minor bigint, currency text, payment_status text, idempotent boolean)
language plpgsql security invoker set search_path = '' as $$
declare
  fingerprint text;
  prior public.orders%rowtype;
  created public.orders%rowtype;
  selected_rate record;
  line record;
  variant record;
  snapshot jsonb;
  snapshots jsonb := '[]'::jsonb;
  subtotal bigint := 0;
  shipping bigint;
  unit_price bigint;
  line_total bigint;
  new_order_id uuid := gen_random_uuid();
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Trusted server required' using errcode = '42501'; end if;
  if p_idempotency_key is null or p_shipping_rate_id is null then raise exception 'Required checkout parameters missing' using errcode = '22023'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Invalid order items' using errcode = '22023'; end if;
  if p_customer is null or jsonb_typeof(p_customer) <> 'object' or octet_length(p_customer::text) > 5000 then raise exception 'Invalid delivery data' using errcode = '22023'; end if;
  if coalesce(length(trim(p_customer->>'name')), 0) not between 2 and 120
    or coalesce(length(p_customer->>'email'), 0) not between 3 and 254
    or coalesce(p_customer->>'email', '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or coalesce(length(p_customer->>'phone'), 0) not between 7 and 25
    or coalesce(p_customer->>'phone', '') !~ '^[+0-9 ()-]+$'
    or coalesce(length(trim(p_customer->>'address')), 0) not between 5 and 300
    or coalesce(length(trim(p_customer->>'city')), 0) not between 2 and 100
    or coalesce(length(trim(p_customer->>'district')), 0) not between 2 and 100
    or coalesce(p_customer->>'country', '') <> 'LK'
    or coalesce(length(p_customer->>'postalCode'), 0) > 12 then raise exception 'Invalid delivery fields' using errcode = '22023'; end if;
  if p_user_id is null and coalesce(p_guest_token_hash, '') !~ '^[a-f0-9]{64}$' then raise exception 'Guest access token hash required'; end if;
  if exists (select 1 from jsonb_array_elements(p_items) x where jsonb_typeof(x) <> 'object'
    or coalesce(x->>'variant_id', '') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    or coalesce(jsonb_typeof(x->'quantity'), '') <> 'number'
    or coalesce(x->>'quantity', '') !~ '^[1-9][0-9]?$') then raise exception 'Invalid item fields' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_items) x, lateral jsonb_object_keys(x) k where k not in ('variant_id', 'quantity')) then raise exception 'Unexpected item fields' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_items) x where (x->>'quantity')::int > 10) then raise exception 'Item quantity exceeds limit' using errcode = '22023'; end if;

  fingerprint := encode(sha256(convert_to(jsonb_build_object('items', p_items, 'customer', p_customer, 'rate', p_shipping_rate_id, 'user', p_user_id, 'guest_hash', p_guest_token_hash)::text, 'UTF8')), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select * into prior from public.orders o where o.idempotency_key = p_idempotency_key;
  if found then
    if prior.request_fingerprint <> fingerprint or prior.user_id is distinct from p_user_id then raise exception 'Idempotency key reused for a different request'; end if;
    return query select prior.id, prior.public_ref, prior.total_minor, prior.currency, prior.payment_status, true;
    return;
  end if;
  perform 1 from public.site_settings s where s.key = 'live_commerce_enabled' and s.value = 'true'::jsonb for share;
  if not found then raise exception 'Live commerce is disabled' using errcode = '55000'; end if;
  select r.*, m.cod_enabled, z.country, z.districts into selected_rate
    from public.shipping_rates r join public.shipping_methods m on m.id = r.method_id join public.shipping_zones z on z.id = r.zone_id
    where r.id = p_shipping_rate_id and r.active and m.active and z.active and m.cod_enabled for share of r, m, z;
  if not found then raise exception 'Approved cash-on-delivery shipping is unavailable'; end if;
  if not coalesce((p_customer->>'district') = any(selected_rate.districts), false) or selected_rate.country is distinct from (p_customer->>'country') then raise exception 'Shipping is unavailable for this destination'; end if;

  -- Acquire complete variant set before catalog locks. Ordered exclusive stock
  -- locks plus shared catalog locks avoid competing basket lock inversions.
  perform v.id from public.product_variants v
    where v.id in (select (x->>'variant_id')::uuid from jsonb_array_elements(p_items) x) order by v.id for update;
  perform p.id from public.products p where p.id in (
    select v.product_id from public.product_variants v where v.id in (select (x->>'variant_id')::uuid from jsonb_array_elements(p_items) x)
  ) order by p.id for share;
  perform c.id from public.categories c where c.id in (
    select p.category_id from public.products p join public.product_variants v on v.product_id = p.id
    where v.id in (select (x->>'variant_id')::uuid from jsonb_array_elements(p_items) x)
  ) order by c.id for share;

  for line in
    select (x->>'variant_id')::uuid as variant_id, sum((x->>'quantity')::int)::int as quantity
    from jsonb_array_elements(p_items) x group by (x->>'variant_id')::uuid order by (x->>'variant_id')::uuid
  loop
    if line.quantity > 10 then raise exception 'Merged item quantity exceeds limit'; end if;
    select v.*, p.title, p.price_minor, p.status as product_status, p.is_demo, c.status as category_status into variant
      from public.product_variants v join public.products p on p.id = v.product_id join public.categories c on c.id = p.category_id where v.id = line.variant_id;
    if not found then raise exception 'Variant unavailable'; end if;
    if not variant.active or variant.product_status <> 'published' or variant.category_status <> 'published' or variant.is_demo then raise exception 'Variant is not available for live checkout'; end if;
    if variant.stock_on_hand < line.quantity then raise exception 'Insufficient stock'; end if;
    unit_price := coalesce(variant.price_minor_override, variant.price_minor);
    line_total := unit_price * line.quantity;
    subtotal := subtotal + line_total;
    snapshots := snapshots || jsonb_build_array(jsonb_build_object(
      'variant_id', variant.id, 'product_id', variant.product_id, 'title', variant.title,
      'sku', variant.sku, 'size', variant.size, 'color', variant.color_name,
      'quantity', line.quantity, 'unit_price', unit_price, 'line_total', line_total,
      'stock_after', variant.stock_on_hand - line.quantity));
  end loop;
  shipping := case when selected_rate.free_above_minor is not null and subtotal >= selected_rate.free_above_minor then 0 else selected_rate.amount_minor end;
  insert into public.orders(id, user_id, idempotency_key, request_fingerprint, contact_snapshot, shipping_snapshot, guest_token_hash,
    subtotal_minor, shipping_minor, total_minor, shipping_rate_id, payment_method, payment_status)
  values (new_order_id, p_user_id, p_idempotency_key, fingerprint,
    jsonb_build_object('name', p_customer->>'name', 'email', p_customer->>'email', 'phone', p_customer->>'phone'),
    jsonb_build_object('address', p_customer->>'address', 'city', p_customer->>'city', 'district', p_customer->>'district', 'country', p_customer->>'country', 'postalCode', p_customer->>'postalCode'),
    case when p_user_id is null then p_guest_token_hash else null end,
    subtotal, shipping, subtotal + shipping, p_shipping_rate_id, 'cod', 'unpaid') returning * into created;
  for snapshot in select value from jsonb_array_elements(snapshots)
  loop
    update public.product_variants set stock_on_hand = stock_on_hand - (snapshot->>'quantity')::int
      where id = (snapshot->>'variant_id')::uuid and stock_on_hand >= (snapshot->>'quantity')::int;
    if not found then raise exception 'Stock changed during checkout'; end if;
    insert into public.order_items(order_id, product_id, variant_id, title_snapshot, sku_snapshot, size_snapshot, color_snapshot, quantity, unit_price_minor, line_total_minor)
    values (new_order_id, (snapshot->>'product_id')::uuid, (snapshot->>'variant_id')::uuid, snapshot->>'title', snapshot->>'sku', snapshot->>'size', snapshot->>'color', (snapshot->>'quantity')::int, (snapshot->>'unit_price')::bigint, (snapshot->>'line_total')::bigint);
    insert into public.inventory_events(variant_id, order_id, delta, stock_after, reason, idempotency_key)
    values ((snapshot->>'variant_id')::uuid, new_order_id, -(snapshot->>'quantity')::int, (snapshot->>'stock_after')::int, 'Order placed', gen_random_uuid());
  end loop;
  insert into public.order_status_history(order_id, to_status, note) values (new_order_id, 'placed', 'Cash on delivery; payment remains unpaid.');
  return query select created.id, created.public_ref, created.total_minor, created.currency, created.payment_status, false;
end $$;

revoke all on function public.create_cod_order(uuid, jsonb, jsonb, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.create_cod_order(uuid, jsonb, jsonb, uuid, uuid, text) to service_role;
commit;
