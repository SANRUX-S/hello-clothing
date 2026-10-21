-- Public assets must already be owner-approved. Never put order/identity files
-- in the public bucket; public bucket URLs remain public regardless of RLS.
begin;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('hello-media', 'hello-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('hello-media-private', 'hello-media-private', false, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy hello_public_media_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'hello-media');
create policy hello_draft_media_read on storage.objects for select to authenticated
  using (bucket_id = 'hello-media-private' and (select private.is_staff()));
create policy hello_media_upload on storage.objects for insert to authenticated
  with check (
    ((bucket_id = 'hello-media' and (select private.is_owner())) or (bucket_id = 'hello-media-private' and (select private.is_staff())))
    and name ~ '^products/[a-f0-9-]{36}/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|avif)$'
  );
create policy hello_media_update on storage.objects for update to authenticated
  using ((bucket_id = 'hello-media' and (select private.is_owner())) or (bucket_id = 'hello-media-private' and (select private.is_staff())))
  with check (
    ((bucket_id = 'hello-media' and (select private.is_owner())) or (bucket_id = 'hello-media-private' and (select private.is_staff())))
    and name ~ '^products/[a-f0-9-]{36}/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|avif)$'
  );
create policy hello_media_delete on storage.objects for delete to authenticated
  using ((bucket_id = 'hello-media' and (select private.is_owner())) or (bucket_id = 'hello-media-private' and (select private.is_staff())));
commit;
