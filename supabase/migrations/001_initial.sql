-- TOPAZ 2.0 — Phase 3 schema, RLS, storage, auth sync
-- Run in Supabase SQL Editor (or supabase db push) after creating the project.

-- ── Helpers ───────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') ilike 'topaz2.0@yahoo.com',
    false
  );
$$;

create or replace function public.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select m.is_approved
      from public.members m
      where m.id = auth.uid()
    ),
    false
  );
$$;

-- ── Tables ────────────────────────────────────────────────────────────────
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contestant_name text not null,
  age integer not null,
  studio_name text not null,
  teacher_name text not null,
  routine_name text not null,
  soloist_address text,
  city text,
  state text,
  zip text,
  phone text not null,
  email text not null,
  years_of_training integer not null,
  studio_address text,
  studio_city text,
  studio_state text,
  studio_zip text,
  category text not null,
  age_division text not null,
  ability_level text not null,
  group_size text not null,
  payment_method text not null,
  status text not null default 'pending',
  notes text,
  participants_json jsonb not null default '[]'::jsonb,
  contestant_count integer not null default 1,
  total_fee numeric(10, 2) not null default 0,
  disclaimer_accepted boolean not null default false
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  filename text,
  url text not null,
  section text not null check (section in ('history', 'topaz2')),
  caption text,
  is_visible boolean not null default true,
  is_members_only boolean not null default false
);

create table if not exists public.gallery_videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  url text not null,
  section text not null check (section in ('history', 'topaz2')),
  is_visible boolean not null default true
);

create table if not exists public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  email text not null unique,
  full_name text,
  studio_name text,
  role text not null default 'member',
  is_approved boolean not null default false
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  date date not null,
  location text not null,
  description text,
  is_active boolean not null default true
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  body text not null,
  is_active boolean not null default true
);

-- Seed default event (admin can edit in dashboard)
insert into public.events (name, date, location, description, is_active)
select
  'The Return of TOPAZ 2.0',
  '2026-08-22'::date,
  'Seaside Convention Center, 415 1st Ave, Seaside, OR 97138',
  'Registration opens April 1, 2026. Registration closes July 30, 2026, 12:00 AM. Competition day: August 22, 2026.',
  true
where not exists (select 1 from public.events limit 1);

-- ── Sync new auth users → members ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, email, full_name, studio_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(trim(new.raw_user_meta_data ->> 'studio_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.registrations enable row level security;
alter table public.gallery_images enable row level security;
alter table public.gallery_videos enable row level security;
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;

-- registrations: public insert only; admin full access
create policy registrations_insert_anon
  on public.registrations for insert
  to anon, authenticated
  with check (true);

create policy registrations_all_admin
  on public.registrations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- gallery_images
create policy gallery_images_select_public
  on public.gallery_images for select
  to anon, authenticated
  using (
    is_visible = true
    and is_members_only = false
  );

create policy gallery_images_select_members
  on public.gallery_images for select
  to authenticated
  using (
    is_visible = true
    and (
      is_members_only = false
      or public.is_approved_member()
    )
  );

create policy gallery_images_all_admin
  on public.gallery_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- gallery_videos (same pattern; no members_only column — public vs member uses section + visibility only)
-- Public sees visible non–members-only: we use only is_visible for public; member-only videos: add flag
-- Spec did not include is_members_only on videos; announcements are member-only instead.
-- For videos, all visible videos are public if is_visible. Member-only videos would need a column.
-- User asked member gallery for photos; videos not specified for members-only. Keep videos public when visible.

create policy gallery_videos_select_public
  on public.gallery_videos for select
  to anon, authenticated
  using (is_visible = true);

create policy gallery_videos_all_admin
  on public.gallery_videos for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- members
create policy members_select_own
  on public.members for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy members_update_admin
  on public.members for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy members_delete_admin
  on public.members for delete
  to authenticated
  using (public.is_admin());

-- events: public read active; admin all
create policy events_select_public
  on public.events for select
  to anon, authenticated
  using (is_active = true);

create policy events_select_admin
  on public.events for select
  to authenticated
  using (public.is_admin());

create policy events_all_admin
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- announcements: approved members (active only); admin sees all (second policy)
create policy announcements_select_members
  on public.announcements for select
  to authenticated
  using (is_active = true and public.is_approved_member());

create policy announcements_select_admin
  on public.announcements for select
  to authenticated
  using (public.is_admin());

create policy announcements_all_admin
  on public.announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Storage: gallery bucket ────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy gallery_storage_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy gallery_storage_write_admin
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

create policy gallery_storage_update_admin
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

create policy gallery_storage_delete_admin
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());
