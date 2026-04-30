-- Nova SBE Alumni Club — Supabase schema
-- Paste this into the Supabase SQL editor (Project → SQL → New query → Run).
-- Safe to re-run; uses CREATE IF NOT EXISTS / OR REPLACE where possible.

-- 1. profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  headline         text,
  programme        text,
  grad_year        int,
  current_company  text,
  current_role     text,
  city             text,
  country          text,
  linkedin_url     text,
  avatar_url       text,
  offering         text,
  seeking          text,
  updated_at       timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by signed-in users" on public.profiles;
create policy "profiles are readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. trigger: create empty profile row on auth.users insert -----------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. connections ------------------------------------------------------------
create table if not exists public.connections (
  id          uuid primary key default gen_random_uuid(),
  requester   uuid not null references public.profiles(id) on delete cascade,
  addressee   uuid not null references public.profiles(id) on delete cascade,
  status      text not null check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz default now(),
  unique (requester, addressee)
);

alter table public.connections enable row level security;

drop policy if exists "users see their own connections" on public.connections;
create policy "users see their own connections"
  on public.connections for select
  to authenticated
  using (auth.uid() = requester or auth.uid() = addressee);

drop policy if exists "users create their own outgoing connections" on public.connections;
create policy "users create their own outgoing connections"
  on public.connections for insert
  to authenticated
  with check (auth.uid() = requester);

drop policy if exists "addressee can update connection status" on public.connections;
create policy "addressee can update connection status"
  on public.connections for update
  to authenticated
  using (auth.uid() = addressee)
  with check (auth.uid() = addressee);

-- 4. admin flag on profiles -------------------------------------------------
-- Flip your own row to is_admin=true in the Table Editor to manage events.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 5. events -----------------------------------------------------------------
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  starts_at    timestamptz,
  date_label   text,
  venue_label  text,
  city         text,
  rsvp_url     text,
  is_published boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.events enable row level security;

drop policy if exists "events readable by anyone" on public.events;
create policy "events readable by anyone"
  on public.events for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "admins can insert events" on public.events;
create policy "admins can insert events"
  on public.events for insert
  to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins can update events" on public.events;
create policy "admins can update events"
  on public.events for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins can delete events" on public.events;
create policy "admins can delete events"
  on public.events for delete
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
