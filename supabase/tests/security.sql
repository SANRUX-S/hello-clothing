-- Run ONLY against disposable staging/local Supabase as database owner:
-- psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security.sql
-- Every fixture is rolled back. This script has not been run without a DB.
begin;
update public.site_settings set value = 'false'::jsonb where key = 'live_commerce_enabled';

do $$ declare missing text; begin
  select string_agg(c.relname, ', ') into missing
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
      and c.relname in ('profiles','user_roles','categories','collections','products','product_variants','product_images','collection_products','site_settings','homepage_sections','shipping_zones','shipping_methods','shipping_rates','orders','order_items','inventory_events','payment_attempts','order_status_history','wishlist_items','admin_audit_log');
  if missing is not null then raise exception 'RLS missing: %', missing; end if;
  if has_function_privilege('anon', 'public.create_cod_order(uuid,jsonb,jsonb,uuid,uuid,text)', 'EXECUTE') or has_function_privilege('authenticated', 'public.create_cod_order(uuid,jsonb,jsonb,uuid,uuid,text)', 'EXECUTE') then raise exception 'Checkout RPC is public'; end if;
end $$;

insert into auth.users(id) values
 ('10000000-0000-4000-8000-000000000001'), ('10000000-0000-4000-8000-000000000002'), ('10000000-0000-4000-8000-000000000003');
insert into public.user_roles(user_id, role) values ('10000000-0000-4000-8000-000000000003','staff');
insert into public.categories(id,slug,name,status) values ('20000000-0000-4000-8000-000000000001','security-fixture','Security fixture','published');
insert into public.products(id,slug,title,category_id,price_minor,status) values
 ('30000000-0000-4000-8000-000000000001','security-published','Published fixture','20000000-0000-4000-8000-000000000001',10000,'published'),
 ('30000000-0000-4000-8000-000000000002','security-draft','Draft fixture','20000000-0000-4000-8000-000000000001',10000,'draft');
insert into public.product_variants(id,product_id,sku,color_name,color_hex,size,stock_on_hand) values
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','SECURITY-FIXTURE','Black','#111111','M',2);
insert into public.orders(id,user_id,idempotency_key,request_fingerprint,contact_snapshot,shipping_snapshot,subtotal_minor,shipping_minor,total_minor,payment_method) values
 ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','fixture-a','{}','{}',10000,0,10000,'cod'),
 ('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','60000000-0000-4000-8000-000000000002','fixture-b','{}','{}',10000,0,10000,'cod');

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$ begin
  if exists(select 1 from public.products where slug = 'security-draft') then raise exception 'Anonymous visitor sees draft'; end if;
  if not exists(select 1 from public.products where slug = 'security-published') then raise exception 'Published product missing'; end if;
  begin perform 1 from public.orders; raise exception 'Anonymous visitor can read orders'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"10000000-0000-4000-8000-000000000001"}';
do $$ begin
  if not exists(select 1 from public.orders where id = '50000000-0000-4000-8000-000000000001') then raise exception 'Customer cannot read own order'; end if;
  if exists(select 1 from public.orders where id = '50000000-0000-4000-8000-000000000002') then raise exception 'Customer A can read B order'; end if;
  if (select private.is_staff()) then raise exception 'Customer is staff'; end if;
  begin insert into public.user_roles(user_id,role) values (auth.uid(),'owner'); raise exception 'Customer can promote self'; exception when insufficient_privilege then null; end;
  begin update public.orders set payment_status = 'paid' where id = '50000000-0000-4000-8000-000000000001'; raise exception 'Customer can mark paid'; exception when insufficient_privilege then null; end;
  begin perform public.adjust_inventory('40000000-0000-4000-8000-000000000001',1,'Illegal customer adjustment','70000000-0000-4000-8000-000000000001'); raise exception 'Customer adjusted inventory'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"10000000-0000-4000-8000-000000000003"}';
do $$ declare stock integer; begin
  begin update public.product_variants set stock_on_hand = 100 where id = '40000000-0000-4000-8000-000000000001'; raise exception 'Staff bypassed stock audit'; exception when insufficient_privilege then null; end;
  stock := public.adjust_inventory('40000000-0000-4000-8000-000000000001',1,'Fixture stock import','70000000-0000-4000-8000-000000000002');
  stock := public.adjust_inventory('40000000-0000-4000-8000-000000000001',1,'Fixture stock import','70000000-0000-4000-8000-000000000002');
  if stock <> 3 then raise exception 'Stock adjustment replay was not idempotent'; end if;
  begin
    perform public.adjust_inventory(null,1,'Fixture stock import','70000000-0000-4000-8000-000000000002');
    raise exception 'Null variant accepted on replay';
  exception when invalid_parameter_value then null; end;
  if (select count(*) from public.inventory_events where idempotency_key = '70000000-0000-4000-8000-000000000002') <> 1 then raise exception 'Duplicate inventory event'; end if;
end $$;
reset role;

-- The live switch stays disabled in normal fixtures. Verify the RPC gate.
set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';
do $$ begin
  begin
    perform * from public.create_cod_order('80000000-0000-4000-8000-000000000001',
      '[{"variant_id":"40000000-0000-4000-8000-000000000001","quantity":1}]',
      '{"name":"Test fixture","email":"fixture@example.test","phone":"0700000000","address":"Fixture address","city":"Fixture city","district":"Fixture district","country":"LK"}',
      '90000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001');
    raise exception 'Live gate unexpectedly open';
  exception when object_not_in_prerequisite_state then null; end;
end $$;
reset role;
-- A NULL in configured district arrays must never admit an unapproved address.
insert into public.shipping_zones(id,name,districts,active) values
 ('90000000-0000-4000-8000-000000000001','Fixture zone',array['Fixture district',null],true);
insert into public.shipping_methods(id,name,active,cod_enabled) values
 ('90000000-0000-4000-8000-000000000002','Fixture COD',true,true);
insert into public.shipping_rates(id,zone_id,method_id,amount_minor,active) values
 ('90000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000002',0,true);
update public.site_settings set value='true'::jsonb where key='live_commerce_enabled';
set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';
do $$ begin
  begin
    perform * from public.create_cod_order('80000000-0000-4000-8000-000000000002',
      '[{"variant_id":"40000000-0000-4000-8000-000000000001","quantity":1}]',
      '{"name":"Test fixture","email":"fixture@example.test","phone":"0700000000","address":"Fixture address","city":"Fixture city","district":"Unapproved district","country":"LK"}',
      '90000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001');
    raise exception 'District guard accepted nonmember';
  exception when raise_exception then
    if sqlerrm <> 'Shipping is unavailable for this destination' then raise; end if;
  end;
end $$;
reset role;
rollback;
