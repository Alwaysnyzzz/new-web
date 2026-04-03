-- ╔══════════════════════════════════════════════════╗
-- ║         DzzStore – Supabase SQL Schema           ║
-- ║  Jalankan di: Supabase → SQL Editor → New query  ║
-- ╚══════════════════════════════════════════════════╝

-- ── 1. PROFILES (data user setelah register) ────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  created_at  timestamptz default now()
);

-- Auto-create profile saat user register
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. PANEL USERS (user pterodactyl per buyer) ─────
create table if not exists public.panel_users (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references public.profiles(id) on delete cascade,
  username     text not null,
  email        text not null,
  panel_id     integer,           -- ID user di Pterodactyl panel
  created_at   timestamptz default now(),
  unique(owner_id, username)
);

-- ── 3. ORDERS (riwayat pembelian) ───────────────────
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid references public.profiles(id) on delete set null,
  panel_user_id uuid references public.panel_users(id) on delete set null,
  pkg           text not null,     -- contoh: "3GB-15hari"
  ram_gb        integer,
  cpu_pct       integer,
  mem_mb        integer,
  disk_mb       integer,
  price         text,              -- contoh: "Rp 4.000 /15 Hari"
  status        text default 'aktif' check (status in ('aktif','expired','pending')),
  server_id     text,              -- UUID server di Pterodactyl
  server_id_num integer,           -- numeric ID server di Pterodactyl
  expires_at    timestamptz,
  created_at    timestamptz default now()
);

-- ── 4. PANEL CREDENTIALS (tersimpan per order) ──────
-- Disimpan terpisah supaya bisa di-show di riwayat
create table if not exists public.panel_credentials (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references public.orders(id) on delete cascade,
  buyer_id    uuid references public.profiles(id) on delete cascade,
  username    text not null,
  email       text not null,
  -- password TIDAK disimpan di sini karena alasan keamanan
  -- user lihat password saat pertama beli, setelah itu reset sendiri
  panel_url   text,
  server_uuid text,
  created_at  timestamptz default now()
);

-- ── 5. ROW LEVEL SECURITY (RLS) ─────────────────────
-- Aktifkan RLS agar user hanya bisa lihat data sendiri

alter table public.profiles          enable row level security;
alter table public.panel_users       enable row level security;
alter table public.orders            enable row level security;
alter table public.panel_credentials enable row level security;

-- profiles: user hanya lihat/edit profil sendiri
create policy "profiles: lihat sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update sendiri"
  on public.profiles for update
  using (auth.uid() = id);

-- panel_users: user hanya lihat punyanya
create policy "panel_users: lihat sendiri"
  on public.panel_users for select
  using (auth.uid() = owner_id);

create policy "panel_users: insert sendiri"
  on public.panel_users for insert
  with check (auth.uid() = owner_id);

-- orders: user hanya lihat ordernya sendiri
create policy "orders: lihat sendiri"
  on public.orders for select
  using (auth.uid() = buyer_id);

create policy "orders: insert sendiri"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- panel_credentials: user hanya lihat punyanya
create policy "creds: lihat sendiri"
  on public.panel_credentials for select
  using (auth.uid() = buyer_id);

create policy "creds: insert sendiri"
  on public.panel_credentials for insert
  with check (auth.uid() = buyer_id);

-- ── 6. INDEX (biar query cepat) ─────────────────────
create index if not exists idx_orders_buyer      on public.orders(buyer_id);
create index if not exists idx_orders_status     on public.orders(status);
create index if not exists idx_panel_users_owner on public.panel_users(owner_id);

-- ── SELESAI ──────────────────────────────────────────
-- Cara pakai:
-- 1. Buka Supabase → SQL Editor → New query
-- 2. Paste semua kode ini
-- 3. Klik Run
-- 4. Pastikan tidak ada error merah
-- 5. Copy Project URL & anon key ke config.js
