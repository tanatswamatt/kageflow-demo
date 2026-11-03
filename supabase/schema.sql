-- Kageflow demo dealership: full schema.
-- Run once in a NEW Supabase project: SQL Editor → paste all → Run.
-- Then run supabase/seed.sql for the demo stock.

-- ───────────────────────── Profiles and roles ─────────────────────────
-- role: 'none' (signed up, no access), 'sales' (stock + enquiries), 'admin' (everything).
-- Nobody can change their own role from the app. Promote staff in the SQL editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'none' check (role in ('none', 'sales', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('sales', 'admin')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_staff());
-- No insert/update/delete policies: profiles are created by the trigger below
-- and roles are changed only from the SQL editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Vehicles ─────────────────────────

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  stock_no text,
  make text not null,
  model text not null,
  variant text,
  year int not null check (year between 1950 and 2100),
  body text not null default 'sedan'
    check (body in ('hatchback', 'sedan', 'suv', 'bakkie', 'coupe', 'mpv', 'other')),
  fuel text not null default 'petrol' check (fuel in ('petrol', 'diesel', 'hybrid', 'electric')),
  transmission text not null default 'manual' check (transmission in ('manual', 'auto')),
  drivetrain text check (drivetrain in ('2wd', '4x4', 'awd')),
  mileage_km int check (mileage_km >= 0),
  colour text,
  price_zar numeric(12, 2) check (price_zar >= 0),
  status text not null default 'in_stock' check (status in ('draft', 'in_stock', 'reserved', 'sold')),
  featured boolean not null default false,
  description text,
  features text[] not null default '{}',
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_status_idx on public.vehicles (status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.status = 'sold' and (old.status is distinct from 'sold') then
    new.sold_at = now();
  elsif new.status <> 'sold' then
    new.sold_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists vehicles_touch on public.vehicles;
create trigger vehicles_touch before update on public.vehicles
  for each row execute function public.touch_updated_at();

alter table public.vehicles enable row level security;

-- The public sees only cars on sale. Drafts and sold cars can't be reached by URL.
drop policy if exists "vehicles public read" on public.vehicles;
create policy "vehicles public read" on public.vehicles
  for select to anon, authenticated using (status in ('in_stock', 'reserved') or public.is_staff());

drop policy if exists "vehicles staff insert" on public.vehicles;
create policy "vehicles staff insert" on public.vehicles for insert to authenticated with check (public.is_staff());
drop policy if exists "vehicles staff update" on public.vehicles;
create policy "vehicles staff update" on public.vehicles for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "vehicles staff delete" on public.vehicles;
create policy "vehicles staff delete" on public.vehicles for delete to authenticated using (public.is_staff());

-- ───────────────────────── Vehicle photos ─────────────────────────

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  storage_path text not null,
  position int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists vehicle_images_vehicle_idx on public.vehicle_images (vehicle_id);

alter table public.vehicle_images enable row level security;

drop policy if exists "images public read" on public.vehicle_images;
create policy "images public read" on public.vehicle_images
  for select to anon, authenticated using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and (v.status in ('in_stock', 'reserved') or public.is_staff())
    )
  );

drop policy if exists "images staff insert" on public.vehicle_images;
create policy "images staff insert" on public.vehicle_images for insert to authenticated with check (public.is_staff());
drop policy if exists "images staff update" on public.vehicle_images;
create policy "images staff update" on public.vehicle_images for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "images staff delete" on public.vehicle_images;
create policy "images staff delete" on public.vehicle_images for delete to authenticated using (public.is_staff());

-- ───────────────────────── Enquiries (leads) ─────────────────────────
-- Every form on the site lands here: enquiry, test drive, reservation, finance, trade-in, contact.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  kind text not null default 'enquiry'
    check (kind in ('enquiry', 'test_drive', 'reserve', 'finance', 'trade_in', 'contact')),
  name text not null check (char_length(name) between 1 and 120),
  email text check (char_length(email) <= 200),
  phone text check (char_length(phone) <= 40),
  message text check (char_length(message) <= 4000),
  preferred_date date,
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_vehicle_idx on public.enquiries (vehicle_id);

alter table public.enquiries enable row level security;

-- Visitors may submit, never read. New rows always start as 'new'.
drop policy if exists "enquiries public insert" on public.enquiries;
create policy "enquiries public insert" on public.enquiries
  for insert to anon, authenticated with check (status = 'new' and char_length(name) > 0 and (email is not null or phone is not null));

drop policy if exists "enquiries staff read" on public.enquiries;
create policy "enquiries staff read" on public.enquiries
  for select to authenticated using (public.is_staff());

drop policy if exists "enquiries staff update" on public.enquiries;
create policy "enquiries staff update" on public.enquiries
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "enquiries staff delete" on public.enquiries;
create policy "enquiries staff delete" on public.enquiries
  for delete to authenticated using (public.is_staff());

-- ───────────────────────── Photo storage ─────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 6291456, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 6291456, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "vehicle images staff insert" on storage.objects;
create policy "vehicle images staff insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'vehicle-images' and public.is_staff());

drop policy if exists "vehicle images staff update" on storage.objects;
create policy "vehicle images staff update" on storage.objects
  for update to authenticated using (bucket_id = 'vehicle-images' and public.is_staff());

drop policy if exists "vehicle images staff delete" on storage.objects;
create policy "vehicle images staff delete" on storage.objects
  for delete to authenticated using (bucket_id = 'vehicle-images' and public.is_staff());
-- Public bucket: photos are served by URL, so no select policy is needed (and
-- leaving it out stops anyone listing every file in the bucket).
