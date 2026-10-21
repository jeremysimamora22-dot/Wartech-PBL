-- WarTech Fase 1: tabel, RLS, dan fungsi (RPC). Jalankan sekali di Supabase SQL Editor.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer','staff','admin')),
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_popular boolean not null default false,
  created_at timestamptz not null default now()
);
create sequence public.order_seq;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  track_token uuid not null unique default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text,
  pickup text,
  notes text,
  payment_method text not null default 'cash' check (payment_method in ('cash','qris')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending_verification','paid','failed','refunded')),
  paid_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','accepted','preparing','ready','completed','rejected','cancelled')),
  reject_reason text,
  total integer not null check (total >= 0),
  stock_restored boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
create index orders_created_idx on public.orders(created_at desc);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,           -- snapshot nama
  unit_price integer not null,          -- snapshot harga
  qty integer not null check (qty > 0),
  note text
);
create index order_items_order_idx on public.order_items(order_id);
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  delta integer not null,
  reason text not null,                 -- order | restore | adjustment
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null,                   -- status | payment
  from_value text,
  to_value text not null,
  note text,
  actor uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ===== Fungsi bantu (security definer agar policy tidak rekursif) =====
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','staff') from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Row Level Security =====
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.order_events enable row level security;

create policy "profil: milik sendiri atau staf" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profil: ubah nama sendiri" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "kategori: publik baca" on public.categories for select using (true);
create policy "kategori: staf kelola" on public.categories for all using (public.is_staff()) with check (public.is_staff());
create policy "produk: publik baca yang aktif" on public.products for select using (is_active or public.is_staff());
create policy "produk: staf kelola" on public.products for all using (public.is_staff()) with check (public.is_staff());
create policy "pesanan: milik sendiri atau staf" on public.orders for select using (user_id = auth.uid() or public.is_staff());
create policy "item: milik sendiri atau staf" on public.order_items for select using (
  public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "stok: staf baca" on public.stock_movements for select using (public.is_staff());
create policy "event: staf baca" on public.order_events for select using (public.is_staff());

-- ===== Hak akses: tulis hanya lewat fungsi di bawah =====
revoke insert, update, delete on public.orders, public.order_items, public.stock_movements, public.order_events from anon, authenticated;
revoke insert, update, delete on public.products, public.categories from anon;
revoke insert, update, delete on public.profiles from anon;
revoke insert, delete on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
revoke insert, update on public.products from authenticated;   -- stok hanya via set_stock()
grant insert (category_id, name, description, price, image_url, is_active, is_popular) on public.products to authenticated;
grant update (category_id, name, description, price, image_url, is_active, is_popular) on public.products to authenticated;

-- ===== Pelanggan: buat pesanan (harga & stok divalidasi di server, atomik) =====
create or replace function public.create_order(
  p_name text, p_phone text, p_pickup text, p_notes text, p_payment text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_no text; v_token uuid; v_total integer := 0;
  r record; v_prod public.products%rowtype;
begin
  if p_name is null or length(btrim(p_name)) < 2 or length(p_name) > 80 then raise exception 'DATA_TIDAK_VALID: nama'; end if;
  if p_payment is distinct from 'cash' then raise exception 'DATA_TIDAK_VALID: metode pembayaran'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then
    raise exception 'DATA_TIDAK_VALID: item';
  end if;

  v_no := 'WT-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD') || '-' || lpad(nextval('public.order_seq')::text, 4, '0');
  insert into public.orders (order_no, user_id, customer_name, phone, pickup, notes, payment_method, total)
  values (v_no, auth.uid(), btrim(p_name), nullif(btrim(p_phone), ''), nullif(btrim(p_pickup), ''), nullif(btrim(p_notes), ''), p_payment, 0)
  returning id, track_token into v_id, v_token;

  for r in
    select (x->>'product_id')::uuid as product_id, sum((x->>'qty')::int)::int as qty, max(x->>'note') as note
    from jsonb_array_elements(p_items) x
    group by 1 order by 1                       -- urutan tetap = tanpa deadlock
  loop
    if r.qty < 1 or r.qty > 50 then raise exception 'DATA_TIDAK_VALID: jumlah'; end if;
    select * into v_prod from public.products where id = r.product_id and is_active for update;
    if not found then raise exception 'PRODUK_TIDAK_TERSEDIA'; end if;
    if v_prod.stock < r.qty then raise exception 'STOK_TIDAK_CUKUP: %', v_prod.name; end if;
    update public.products set stock = stock - r.qty where id = v_prod.id;   -- stok dikurangi saat pesanan dibuat
    insert into public.order_items (order_id, product_id, product_name, unit_price, qty, note)
    values (v_id, v_prod.id, v_prod.name, v_prod.price, r.qty, left(r.note, 120));
    insert into public.stock_movements (product_id, delta, reason, order_id) values (v_prod.id, -r.qty, 'order', v_id);
    v_total := v_total + v_prod.price * r.qty;
  end loop;

  update public.orders set total = v_total where id = v_id;
  insert into public.order_events (order_id, kind, to_value, actor) values (v_id, 'status', 'pending', auth.uid());
  return jsonb_build_object('order_no', v_no, 'track_token', v_token, 'total', v_total);
end $$;

-- ===== Pelacakan aman: hanya yang memegang token acak yang bisa melihat =====
create or replace function public.get_order_by_token(p_token uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'order_no', o.order_no, 'status', o.status, 'payment_status', o.payment_status, 'payment_method', o.payment_method,
    'customer_name', o.customer_name, 'pickup', o.pickup, 'notes', o.notes, 'total', o.total,
    'reject_reason', o.reject_reason, 'created_at', o.created_at, 'updated_at', o.updated_at,
    'items', coalesce((select jsonb_agg(jsonb_build_object('product_id', i.product_id, 'name', i.product_name,
        'unit_price', i.unit_price, 'qty', i.qty, 'note', i.note) order by i.product_name)
      from public.order_items i where i.order_id = o.id), '[]'::jsonb))
  from public.orders o where o.track_token = p_token
$$;

-- ===== Staf: ubah status (transisi divalidasi; stok dikembalikan SEKALI saat ditolak/dibatalkan) =====
create or replace function public.set_order_status(p_order uuid, p_status text, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype; r record;
begin
  if not public.is_staff() then raise exception 'AKSES_DITOLAK'; end if;
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'PESANAN_TIDAK_DITEMUKAN'; end if;
  if not (
    (o.status = 'pending'   and p_status in ('accepted','rejected')) or
    (o.status = 'accepted'  and p_status in ('preparing','cancelled')) or
    (o.status = 'preparing' and p_status in ('ready','cancelled')) or
    (o.status = 'ready'     and p_status in ('completed','cancelled'))
  ) then raise exception 'TRANSISI_TIDAK_VALID: % -> %', o.status, p_status; end if;
  if p_status = 'completed' and o.payment_status <> 'paid' then raise exception 'PEMBAYARAN_BELUM_LUNAS'; end if;
  if p_status in ('rejected','cancelled') then
    if coalesce(btrim(p_reason), '') = '' then raise exception 'ALASAN_WAJIB'; end if;
    if not o.stock_restored then
      for r in select product_id, qty from public.order_items where order_id = o.id and product_id is not null loop
        update public.products set stock = stock + r.qty where id = r.product_id;
        insert into public.stock_movements (product_id, delta, reason, order_id, created_by)
        values (r.product_id, r.qty, 'restore', o.id, auth.uid());
      end loop;
    end if;
  end if;
  update public.orders set status = p_status,
    reject_reason = case when p_status in ('rejected','cancelled') then btrim(p_reason) else reject_reason end,
    stock_restored = stock_restored or p_status in ('rejected','cancelled'),
    updated_at = now()
  where id = o.id;
  insert into public.order_events (order_id, kind, from_value, to_value, note, actor)
  values (o.id, 'status', o.status, p_status, nullif(btrim(p_reason), ''), auth.uid());
end $$;

create or replace function public.set_payment_status(p_order uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_staff() then raise exception 'AKSES_DITOLAK'; end if;
  if p_status not in ('paid','failed') then raise exception 'STATUS_TIDAK_VALID'; end if;
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'PESANAN_TIDAK_DITEMUKAN'; end if;
  if o.status in ('rejected','cancelled') then raise exception 'PESANAN_SUDAH_DITUTUP'; end if;
  update public.orders set payment_status = p_status,
    paid_at = case when p_status = 'paid' then now() else null end,
    verified_by = auth.uid(), updated_at = now() where id = o.id;
  insert into public.order_events (order_id, kind, from_value, to_value, actor)
  values (o.id, 'payment', o.payment_status, p_status, auth.uid());
end $$;

create or replace function public.set_stock(p_product uuid, p_stock integer)
returns void language plpgsql security definer set search_path = public as $$
declare cur integer;
begin
  if not public.is_staff() then raise exception 'AKSES_DITOLAK'; end if;
  if p_stock is null or p_stock < 0 then raise exception 'DATA_TIDAK_VALID: stok'; end if;
  select stock into cur from public.products where id = p_product for update;
  if not found then raise exception 'PRODUK_TIDAK_DITEMUKAN'; end if;
  if cur = p_stock then return; end if;
  update public.products set stock = p_stock where id = p_product;
  insert into public.stock_movements (product_id, delta, reason, created_by)
  values (p_product, p_stock - cur, 'adjustment', auth.uid());
end $$;

revoke all on function public.set_order_status(uuid,text,text), public.set_payment_status(uuid,text), public.set_stock(uuid,integer) from public, anon;
grant execute on function public.set_order_status(uuid,text,text), public.set_payment_status(uuid,text), public.set_stock(uuid,integer) to authenticated;
grant execute on function public.create_order(text,text,text,text,text,jsonb), public.get_order_by_token(uuid) to anon, authenticated;

-- ===== Realtime untuk dashboard admin =====
do $$ begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end $$;

-- ===== Data contoh (tanpa foto). Ubah/hapus lewat dashboard. Label "populer" di sini hanya contoh. =====
insert into public.categories (name, sort_order) values
  ('Makanan Berat', 1), ('Mi', 2), ('Camilan', 3), ('Minuman', 4)
on conflict (name) do nothing;
insert into public.products (category_id, name, description, price, stock, is_popular)
select c.id, v.name, v.descr, v.price, v.stock, v.pop
from (values
  ('Makanan Berat', 'Nasi Goreng', 'Nasi goreng dengan telur.', 15000, 20, true),
  ('Makanan Berat', 'Ayam Geprek', 'Ayam krispi sambal geprek.', 17000, 15, false),
  ('Mi', 'Mie Goreng', 'Mie goreng bumbu spesial.', 14000, 20, false),
  ('Camilan', 'Pisang Goreng', 'Pisang goreng renyah.', 8000, 25, false),
  ('Minuman', 'Es Teh', 'Teh manis dingin.', 5000, 40, true),
  ('Minuman', 'Kopi Susu', 'Kopi susu dingin.', 10000, 30, true)
) as v(cat, name, descr, price, stock, pop)
join public.categories c on c.name = v.cat;
