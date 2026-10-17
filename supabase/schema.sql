-- =============================================================
-- Rack Share — database schema
-- Paste into Supabase Dashboard → SQL Editor → Run.
-- Intended for a fresh project (run once).
-- =============================================================


-- -------------------------------------------------------------
-- Categories
-- Values match CategoryId in src/types.ts:
--   tops        → Tops
--   outerwear   → Hoodies / Outerwear
--   bottoms     → Pants / Bottoms
--   shoes       → Shoes
--   headwear    → Headwear
--   accessories → Glasses / Accessories
-- -------------------------------------------------------------
create type public.item_category as enum (
  'tops',
  'outerwear',
  'bottoms',
  'shoes',
  'headwear',
  'accessories'
);


-- -------------------------------------------------------------
-- Profiles (one per auth user)
-- -------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique
              check (username ~ '^[a-z0-9._]{3,30}$'),
  title       text check (char_length(title) <= 80),
  bio         text check (char_length(bio) <= 300),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public profile for each user; their "rack" is the items they own.';


-- -------------------------------------------------------------
-- Items (clothing pieces on a user's rack)
-- -------------------------------------------------------------
create table public.items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  image_url    text,
  category     public.item_category not null,
  name         text not null check (char_length(name) between 1 and 100),
  description  text check (char_length(description) <= 500),
  created_at   timestamptz not null default now()
);

comment on table public.items is 'Clothing pieces. Belongs to a profile (the owner''s rack).';

-- Profile page: a user's rack, newest first
create index items_user_id_created_at_idx on public.items (user_id, created_at desc);
-- Feed: newest items across everyone
create index items_created_at_idx on public.items (created_at desc);
-- Feed category filter
create index items_category_created_at_idx on public.items (category, created_at desc);


-- -------------------------------------------------------------
-- Row Level Security
-- Anyone (signed in or not) can read; only the owner can write.
-- (select auth.uid()) is wrapped so Postgres evaluates it once per query.
-- -------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.items    enable row level security;

-- profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- items
create policy "Items are viewable by everyone"
  on public.items for select
  to anon, authenticated
  using (true);

create policy "Users can add items to their own rack"
  on public.items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own items"
  on public.items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own items"
  on public.items for delete
  to authenticated
  using ((select auth.uid()) = user_id);


-- -------------------------------------------------------------
-- Auto-create a profile when someone signs up
-- Uses the username from the signup form (auth metadata) when it's valid
-- and free; otherwise "<email prefix>_<6 chars of id>". Never blocks signup.
-- -------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested text := lower(trim(new.raw_user_meta_data ->> 'username'));
  fallback  text := left(regexp_replace(lower(split_part(coalesce(new.email, 'user'), '@', 1)), '[^a-z0-9._]', '', 'g'), 20)
                    || '_' || left(replace(new.id::text, '-', ''), 6);
begin
  if requested is null or requested !~ '^[a-z0-9._]{3,30}$' then
    requested := fallback;
  end if;

  begin
    insert into public.profiles (id, username) values (new.id, requested)
    on conflict (id) do nothing;
  exception when unique_violation then
    insert into public.profiles (id, username) values (new.id, fallback)
    on conflict (id) do nothing;
  end;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
