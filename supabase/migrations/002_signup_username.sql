-- =============================================================
-- Use the username chosen on the signup form for the new profile.
-- Safe to run on a database that already has schema.sql applied
-- (replaces the function; the existing trigger keeps pointing at it).
-- =============================================================

create or replace function public.handle_new_user()
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
    -- Username was taken between the form's check and now: never block signup over it.
    insert into public.profiles (id, username) values (new.id, fallback)
    on conflict (id) do nothing;
  end;

  return new;
end;
$$;
