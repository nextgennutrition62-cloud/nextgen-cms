-- ============================================
-- STORAGE BUCKET за слики на производи
-- ============================================
-- Изврши го ова во Supabase SQL Editor

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Дозволи на сите да ГЛЕДААТ слики (јавен bucket)
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Дозволи само на најавени админи да КАЧУВААТ слики
create policy "Admins can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.uid() in (select id from admin_users)
);

-- Дозволи само на најавени админи да БРИШАТ слики
create policy "Admins can delete product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.uid() in (select id from admin_users)
);
