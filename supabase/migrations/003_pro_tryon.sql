-- =============================================================
-- Rack Share Pro + virtual try-on.
-- Safe to run on a database that already has schema.sql + 002 applied.
-- Paste into Supabase Dashboard → SQL Editor → Run.
-- =============================================================


-- -------------------------------------------------------------
-- Pro flag
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists is_pro boolean not null default false;

comment on column public.profiles.is_pro is 'Rack Share Pro. Only the server (service role / SQL Editor) may change it.';

-- RLS lets users update and insert their own row, so without this a user could
-- set is_pro = true on themselves from the browser. Column-level grants limit
-- which columns signed-in users can write; is_pro is left out on purpose.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, username, title, bio, avatar_url) on public.profiles to authenticated;
grant update (username, title, bio, avatar_url)     on public.profiles to authenticated;

-- To make someone Pro by hand (until Stripe is wired up):
--   update public.profiles set is_pro = true where username = 'their_username';


-- -------------------------------------------------------------
-- "My Photo": private full-body photos, one folder per user
-- Path: user-photos/<user id>/full-body.jpg
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-photos', 'user-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can view their own photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can replace their own photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);


-- -------------------------------------------------------------
-- Try-on log: daily limit + proves a prediction belongs to its caller.
-- RLS on with no policies → only the try-on Edge Function (service role) can touch it.
-- -------------------------------------------------------------
create table if not exists public.tryon_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  prediction_id  text unique,
  created_at     timestamptz not null default now()
);

create index if not exists tryon_requests_user_id_created_at_idx
  on public.tryon_requests (user_id, created_at desc);

alter table public.tryon_requests enable row level security;
